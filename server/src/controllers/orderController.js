const db = require('../config/db');

// 1. CREATE ORDER WITH ATOMIC STOCK RESERVATION
exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, shipping_address_line1, shipping_address_line2, city, parish_or_state, country } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Order must contain at least one item.' });
  }

  if (!shipping_address_line1 || !city || !parish_or_state) {
    return res.status(400).json({ status: 'fail', message: 'Shipping address (Line 1, City, and Parish) is required.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { variant_id, quantity } = item;

      if (!variant_id || !quantity || quantity <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ status: 'fail', message: 'Invalid item variant or quantity.' });
      }

      const variantCheck = await client.query(
        `SELECT pv.id AS variant_id, pv.stock_quantity, pv.size, p.title, p.base_price 
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.id = $1
         FOR UPDATE`,
        [variant_id]
      );

      if (variantCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ status: 'fail', message: `Product variant ID ${variant_id} not found.` });
      }

      const variant = variantCheck.rows[0];

      if (variant.stock_quantity < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          status: 'fail',
          message: `Insufficient stock for ${variant.title} (Size ${variant.size}). Available: ${variant.stock_quantity}`,
        });
      }

      const itemTotal = Number(variant.base_price) * quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        variant_id: variant.variant_id,
        price_at_purchase: variant.base_price,
        quantity,
      });
    }

    for (const item of validatedItems) {
      await client.query(
        `UPDATE product_variants 
         SET stock_quantity = stock_quantity - $1 
         WHERE id = $2`,
        [item.quantity, item.variant_id]
      );
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address_line1, shipping_address_line2, city, parish_or_state, country, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING id, status, total_amount, created_at`,
      [
        userId,
        calculatedTotal,
        shipping_address_line1,
        shipping_address_line2 || null,
        city,
        parish_or_state,
        country || 'Jamaica',
      ]
    );

    const newOrder = orderResult.rows[0];

    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, price_at_purchase, quantity)
         VALUES ($1, $2, $3, $4)`,
        [newOrder.id, item.variant_id, item.price_at_purchase, item.quantity]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      data: {
        order: {
          id: newOrder.id,
          totalAmount: newOrder.total_amount,
          status: newOrder.status,
          createdAt: newOrder.created_at,
          itemCount: validatedItems.length,
        },
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order Creation Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to process order.' });
  } finally {
    client.release();
  }
};

// 2. GET USER ORDER HISTORY
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const queryText = `
      SELECT 
        o.id, 
        o.status, 
        o.total_amount AS "totalAmount", 
        o.created_at AS "createdAt",
        json_build_object(
          'streetAddress', o.shipping_address_line1,
          'apartment', o.shipping_address_line2,
          'city', o.city,
          'state', o.parish_or_state,
          'country', o.country
        ) AS "shippingAddress",
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'title', p.title,
              'size', pv.size,
              'quantity', oi.quantity,
              'price', oi.price_at_purchase,
              'imageUrl', (
                SELECT image_url FROM product_images 
                WHERE product_id = p.id LIMIT 1
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      LEFT JOIN products p ON pv.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `;

    // Access via pool to match your db module setup
    const result = await db.pool.query(queryText, [userId]);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { orders: result.rows },
    });
  } catch (error) {
    console.error('Fetch Orders Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve order history.' });
  }
};