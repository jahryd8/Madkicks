const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// UUID v4 Regex Validator
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (id) => typeof id === 'string' && UUID_REGEX.test(id);

// =========================================================================
// 1. CREATE STRIPE CHECKOUT SESSION
// =========================================================================
exports.createCheckoutSession = async (req, res) => {
  const userId = req.user.id;
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ status: 'fail', message: 'Order ID is required.' });
  }

  if (!isUuid(order_id)) {
    return res.status(400).json({ status: 'fail', message: `Invalid Order ID format: "${order_id}".` });
  }

  try {
    const orderQuery = `
      SELECT 
        o.id, 
        o.status, 
        o.total_amount, 
        COALESCE(
          json_agg(
            json_build_object(
              'title', p.title,
              'size', pv.size,
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

    const { rows } = await db.query(orderQuery, [order_id, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    const order = rows[0];

    if (order.status !== 'pending') {
      return res.status(400).json({
        status: 'fail',
        message: `Order is already marked as '${order.status}'.`,
      });
    }

    // Construct Stripe line items
    const lineItems = order.items.length > 0 
      ? order.items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title,
              description: `Size: ${item.size}`,
            },
            unit_amount: Math.round(Number(item.price_at_purchase) * 100),
          },
          quantity: item.quantity,
        }))
      : [{
          price_data: {
            currency: 'usd',
            product_data: { name: `MadKicks Order #${order.id}` },
            unit_amount: Math.round(Number(order.total_amount) * 100),
          },
          quantity: 1,
        }];

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: req.user.email,
      client_reference_id: order.id.toString(),
      metadata: {
        order_id: order.id.toString(),
        user_id: userId.toString(),
      },
      success_url: `${clientUrl}/checkout/success?order_id=${order.id}`,
      cancel_url: `${clientUrl}/checkout/cancel?order_id=${order.id}`,
    });

    res.status(200).json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Create Checkout Session Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to create payment session.' });
  }
};

// =========================================================================
// 2. HANDLE STRIPE WEBHOOKS
// =========================================================================
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id || session.client_reference_id;
    const paymentIntentId = session.payment_intent;

    if (orderId) {
      const client = typeof db.connect === 'function' ? await db.connect() : await db.pool.connect();

      try {
        await client.query('BEGIN');

        // Update order status to paid (stock was deducted during order creation)
        const updateOrderQuery = `
          UPDATE orders 
          SET status = 'paid', stripe_payment_id = $2, updated_at = NOW() 
          WHERE id = $1 AND status = 'pending'
          RETURNING id
        `;
        const { rows } = await client.query(updateOrderQuery, [orderId, paymentIntentId]);

        if (rows.length > 0) {
          await client.query('COMMIT');
          console.log(`✅ Order #${orderId} successfully marked as PAID.`);
        } else {
          await client.query('ROLLBACK');
          console.log(`⚠️ Order #${orderId} was already processed or not pending.`);
        }
      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error(`Failed to update order #${orderId} in DB:`, dbError.message);
        return res.status(500).send('Database processing error.');
      } finally {
        client.release();
      }
    }
  }

  res.status(200).json({ received: true });
};