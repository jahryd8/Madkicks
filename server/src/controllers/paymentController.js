const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// =========================================================================
// 1. CREATE STRIPE CHECKOUT SESSION
// =========================================================================
exports.createCheckoutSession = async (req, res) => {
  const userId = req.user.id;
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ status: 'fail', message: 'Order ID is required.' });
  }

  try {
    // 1. Fetch order and corresponding line items from database
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

    // 2. Map line items to Stripe line_items format (Stripe expects amounts in cents)
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: `Size: ${item.size}`,
        },
        unit_amount: Math.round(Number(item.price_at_purchase) * 100), // convert to cents
      },
      quantity: item.quantity,
    }));

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // 3. Create Stripe Checkout Session
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
      cancel_url: `${clientUrl}/checkout/cancel`,
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

  // 1. Verify Stripe Webhook Cryptographic Signature using the raw buffer
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Must be raw Buffer (provided by express.raw({ type: 'application/json' }))
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Process specific webhook event types
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id || session.client_reference_id;

    if (orderId) {
      try {
        // Update database status from 'pending' -> 'paid'
        const updateOrderQuery = `
          UPDATE orders 
          SET status = 'paid', updated_at = NOW() 
          WHERE id = $1 AND status = 'pending'
          RETURNING id, status
        `;
        const { rows } = await db.query(updateOrderQuery, [orderId]);

        if (rows.length > 0) {
          console.log(`✅ Order #${orderId} marked as PAID via Stripe Webhook.`);
        } else {
          console.log(`⚠️ Order #${orderId} was not updated (may already be processed).`);
        }
      } catch (dbError) {
        console.error(`Failed to update order #${orderId} status in DB:`, dbError.message);
        return res.status(500).send('Database update failed');
      }
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};