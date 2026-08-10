const db = require('../config/db');

// =========================================================================
// 1. CREATE ORDER (Uses DB Transaction with Row-Level Locking)
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

  const client = typeof db.connect === 'function' ? await db.connect() : await db.pool.connect();

  try {
    await client.query('BEGIN');

    let calculatedTotal = 0;
    const validatedItems = [];

    // 1. Check stock & Lock rows to prevent race conditions during concurrent checkouts
    for (const item of items) {
      const { variant_id, quantity } = item;

      if (!variant_id || !quantity || quantity <= 0) {
        throw { statusCode: 400, message: 'Invalid item parameters in cart.' };
      }

      // Lock row with FOR UPDATE
      const variantQuery = `
        SELECT pv.id, pv.stock_quantity, p.title, p.base_price
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

    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order Creation Error:', error.message);

    res.status(error.statusCode || 500).json({
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