const Stripe = require('stripe');
const db = require('../config/db');

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// UUID v4 Regex Validator
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (id) => typeof id === 'string' && UUID_REGEX.test(id);

// =========================================================================
// 1. CREATE ORDER (Uses DB Transaction with Row-Level Locking & Stripe)
// =========================================================================
exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const {
    items,
    shipping_address_line1,
    shipping_address_line2,
    city,
    parish_or_state,
    country,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Cart items are required.' });
  }

  if (!shipping_address_line1 || !city || !parish_or_state) {
    return res.status(400).json({ status: 'fail', message: 'Shipping address fields are required.' });
  }

  // Pre-validate UUIDs to avoid database crashes on invalid strings
  for (const item of items) {
    if (!item.variant_id || !isUuid(item.variant_id)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid variant ID format: "${item.variant_id}". Expected a valid UUID.`,
      });
    }
    if (!item.quantity || item.quantity <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Item quantity must be greater than 0.' });
    }
  }

  const client = typeof db.connect === 'function' ? await db.connect() : await db.pool.connect();

  try {
    await client.query('BEGIN');

    let calculatedTotal = 0;
    const validatedItems = [];
    const lineItemsForStripe = [];

    // 1. Check stock & Lock rows to prevent race conditions during concurrent checkouts
    for (const item of items) {
      const { variant_id, quantity } = item;

      // Lock row with FOR UPDATE
      const variantQuery = `
        SELECT pv.id, pv.stock_quantity, pv.size, p.title, p.base_price, p.image_url
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        WHERE pv.id = $1
        FOR UPDATE
      `;
      const variantResult = await client.query(variantQuery, [variant_id]);

      if (variantResult.rows.length === 0) {
        throw { statusCode: 404, message: `Variant ID ${variant_id} not found.` };
      }

      const variant = variantResult.rows[0];

      if (variant.stock_quantity < quantity) {
        throw {
          statusCode: 400,
          message: `Insufficient stock for '${variant.title}'. Only ${variant.stock_quantity} available.`,
        };
      }

      const itemPrice = Number(variant.base_price);
      calculatedTotal += itemPrice * quantity;

      validatedItems.push({
        variant_id: variant.id,
        quantity,
        price_at_purchase: itemPrice,
      });

      // Validate image URL: Stripe rejects relative or malformed URLs
      const hasValidImageUrl =
        typeof variant.image_url === 'string' &&
        (variant.image_url.startsWith('http://') || variant.image_url.startsWith('https://'));

      // Structure line item payload for Stripe Checkout Session
      lineItemsForStripe.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${variant.title}${variant.size ? ` (${variant.size})` : ''}`,
            ...(hasValidImageUrl ? { images: [variant.image_url] } : {}),
          },
          unit_amount: Math.round(itemPrice * 100), // Stripe expects amounts in cents
        },
        quantity,
      });

      // Deduct stock from inventory
      await client.query(
        `UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [quantity, variant.id]
      );
    }

    // 2. Insert master Order record (Status defaults to 'pending')
    const createOrderQuery = `
      INSERT INTO orders (
        user_id, 
        total_amount, 
        shipping_address_line1, 
        shipping_address_line2, 
        city, 
        parish_or_state, 
        country, 
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING id, status, total_amount, created_at
    `;
    const orderValues = [
      userId,
      calculatedTotal,
      shipping_address_line1,
      shipping_address_line2 || null,
      city,
      parish_or_state,
      country || 'Jamaica',
    ];
    const orderResult = await client.query(createOrderQuery, orderValues);
    const newOrder = orderResult.rows[0];

    // 3. Insert individual Line Items into order_items table
    for (const lineItem of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [newOrder.id, lineItem.variant_id, lineItem.quantity, lineItem.price_at_purchase]
      );
    }

    // 4. Create Stripe Checkout Session safely checking environment variables
    const rawClientUrl = process.env.CLIENT_URL || process.env.CLIENT_APP_URL || 'http://localhost:5173';
    const clientAppUrl = rawClientUrl.replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItemsForStripe,
      client_reference_id: newOrder.id,
      metadata: {
        order_id: newOrder.id,
        user_id: userId,
      },
      success_url: `${clientAppUrl}/orders?orderSuccess=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientAppUrl}/checkout?canceled=true`,
    });

    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order Creation Error:', error);

    res.status(error.statusCode || 400).json({
      status: 'fail',
      message: error.message || 'Failed to process order.',
    });
  } finally {
    client.release();
  }
};

// =========================================================================
// 2. GET USER ORDERS (Returns user's order history with line items)
// =========================================================================
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const queryText = `
      SELECT 
        o.id, 
        o.status, 
        o.total_amount, 
        o.shipping_address_line1,
        o.city,
        o.parish_or_state,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'item_id', oi.id,
              'variant_id', oi.variant_id,
              'title', p.title,
              'size', pv.size,
              'image_url', p.image_url,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      LEFT JOIN products p ON pv.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const { rows } = await db.query(queryText, [userId]);

    res.status(200).json({
      status: 'success',
      results: rows.length,
      data: { orders: rows },
    });
  } catch (error) {
    console.error('Fetch User Orders Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve orders.' });
  }
};

// =========================================================================
// 3. GET SINGLE ORDER BY ID
// =========================================================================
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!isUuid(id)) {
    return res.status(400).json({ status: 'fail', message: `Invalid Order ID format: "${id}".` });
  }

  try {
    const queryText = `
      SELECT 
        o.id, 
        o.status, 
        o.total_amount, 
        o.shipping_address_line1,
        o.shipping_address_line2,
        o.city,
        o.parish_or_state,
        o.country,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'item_id', oi.id,
              'title', p.title,
              'size', pv.size,
              'image_url', p.image_url,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      LEFT JOIN products p ON pv.product_id = p.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id
    `;

    const { rows } = await db.query(queryText, [id, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { order: rows[0] },
    });
  } catch (error) {
    console.error('Fetch Order By ID Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve order details.' });
  }
};

// =========================================================================
// 4. CANCEL ORDER (Restocks Variant Inventory and Updates Status)
// =========================================================================
exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!isUuid(id)) {
    return res.status(400).json({ status: 'fail', message: `Invalid Order ID format: "${id}".` });
  }

  const client = typeof db.connect === 'function' ? await db.connect() : await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Lock the order row to prevent concurrent status updates
    const orderQuery = `
      SELECT id, status 
      FROM orders 
      WHERE id = $1 AND user_id = $2 
      FOR UPDATE
    `;
    const { rows: orderRows } = await client.query(orderQuery, [id, userId]);

    if (orderRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    const order = orderRows[0];

    // 2. Only allow cancellation if order is in 'pending' status
    if (order.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'fail',
        message: `Cannot cancel an order with status '${order.status}'. Only pending orders can be cancelled.`,
      });
    }

    // 3. Restock inventory for all items in this order
    const restockQuery = `
      UPDATE product_variants pv
      SET stock_quantity = pv.stock_quantity + oi.quantity
      FROM order_items oi
      WHERE oi.order_id = $1 AND oi.variant_id = pv.id
    `;
    await client.query(restockQuery, [id]);

    // 4. Mark order status as 'cancelled'
    const updateOrderQuery = `
      UPDATE orders 
      SET status = 'cancelled', updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, status, total_amount, updated_at
    `;
    const { rows: updatedRows } = await client.query(updateOrderQuery, [id]);

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully and inventory restored.',
      data: { order: updatedRows[0] },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel Order Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to cancel order.' });
  } finally {
    client.release();
  }
};