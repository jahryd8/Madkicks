const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// 1. CREATE STRIPE CHECKOUT SESSION
exports.createCheckoutSession = async (req, res) => {
  const { order_id } = req.body;
  const userId = req.user.id;

  try {
    // Fetch order details and ensure it belongs to the authenticated user
    const orderQuery = await db.query(
      `SELECT id, status, total_amount FROM orders WHERE id = $1 AND user_id = $2`,
      [order_id, userId]
    );

    if (orderQuery.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    const order = orderQuery.rows[0];

    if (order.status !== 'pending') {
      return res.status(400).json({ status: 'fail', message: `Order cannot be paid for because status is '${order.status}'.` });
    }

    // Fetch order items with product titles for line items
    const itemsQuery = await db.query(
      `SELECT oi.quantity, oi.price_at_purchase, p.title, pv.size 
       FROM order_items oi
       JOIN product_variants pv ON oi.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE oi.order_id = $1`,
      [order_id]
    );

    // Build Stripe line items
    const lineItems = itemsQuery.rows.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: `Size: ${item.size}`,
        },
        unit_amount: Math.round(Number(item.price_at_purchase) * 100), // Convert dollars to cents
      },
      quantity: item.quantity,
    }));

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel?order_id=${order.id}`,
      client_reference_id: order.id,
      metadata: {
        order_id: order.id,
        user_id: userId,
      },
    });

    res.status(200).json({
      status: 'success',
      session_id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe Session Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to initiate checkout session.' });
  }
};

// 2. STRIPE WEBHOOK LISTENER
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Construct event using the raw body buffer
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.order_id;

    try {
      // Mark order status as paid and store transaction details
      await db.query(
        `UPDATE orders 
         SET status = 'paid', updated_at = NOW() 
         WHERE id = $1 AND status = 'pending'`,
        [orderId]
      );

      console.log(`✅ Order ${orderId} successfully marked as PAID.`);
    } catch (dbErr) {
      console.error(`Database error fulfilling order ${orderId}:`, dbErr.message);
    }
  }

  // Handle expired/abandoned sessions - Return reserved stock back to inventory
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const orderId = session.metadata.order_id;

    await cancelAndRestockOrder(orderId);
  }

  res.status(200).json({ received: true });
};

// Helper function to return inventory if payment is cancelled or abandoned
async function cancelAndRestockOrder(orderId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Retrieve order items
    const items = await client.query(
      `SELECT variant_id, quantity FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    // Return stock
    for (const item of items.rows) {
      await client.query(
        `UPDATE product_variants 
         SET stock_quantity = stock_quantity + $1 
         WHERE id = $2`,
        [item.quantity, item.variant_id]
      );
    }

    // Update order status to cancelled
    await client.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [orderId]
    );

    await client.query('COMMIT');
    console.log(`🔄 Order ${orderId} cancelled and stock returned to inventory.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Failed to cancel and restock order ${orderId}:`, err.message);
  } finally {
    client.release();
  }
}