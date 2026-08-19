const { verifyPayment, pollPendingPayments } = require('./verify');

// Called by Firebase scheduled function every 2 minutes
async function runPaymentPoller() {
  console.log('[PaymentPoller] Starting poll cycle:', new Date().toISOString());
  try {
    await pollPendingPayments();
    console.log('[PaymentPoller] Poll cycle complete');
  } catch (err) {
    console.error('[PaymentPoller] Error:', err.message);
  }
}

// Called directly with a specific order (e.g. after user submits tx hash)
async function handlePaymentWebhook(orderId) {
  console.log('[Webhook] Verifying order:', orderId);
  try {
    const result = await verifyPayment(orderId);
    console.log('[Webhook] Result:', result.status);
    return result;
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    throw err;
  }
}

module.exports = { runPaymentPoller, handlePaymentWebhook };
