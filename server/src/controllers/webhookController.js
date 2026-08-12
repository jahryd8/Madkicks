const Stripe = require('stripe');
const db = require('../config/db');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  // 1. Verify signature using raw request body buffer
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id || session.client_reference_id;

    if (!orderId) {
      console.error('Webhook Error: Missing order_id in session metadata or client_reference_id.');
      return res.status(400).send('Missing order ID reference in session.');
    }

    try {
      // Update order status to 'paid' in PostgreSQL database
      const updateQuery = `
        UPDATE orders
        SET status = 'paid', updated_at = NOW()
        WHERE id = $1 AND status = 'pending'
        RETURNING id, status, total_amount
      `;
      const { rows } = await db.query(updateQuery, [orderId]);

      if (rows.length === 0) {
        console.warn(`Webhook Warning: Order ID ${orderId} was not updated (already processed or non-existent).`);
      } else {
        console.log(`Order ${orderId} successfully updated to status: PAID.`);
      }
    } catch (dbError) {
      console.error(`Webhook Database Error: ${dbError.message}`);
      return res.status(500).send('Database processing error');
    }
  }

  // Return a 200 response to acknowledge receipt of event
  res.status(200).json({ received: true });
};