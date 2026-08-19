const functions = require('firebase-functions');
const { runPaymentPoller } = require('./src/payments/webhook');
const { handlePaymentWebhook } = require('./src/payments/webhook');

// Runs every 2 minutes — polls all pending payments on-chain
exports.pollPayments = functions.pubsub
  .schedule('every 2 minutes')
  .onRun(async () => {
    await runPaymentPoller();
    return null;
  });

// HTTP trigger — call after user submits a tx hash
exports.verifyPayment = functions.https.onRequest(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: 'orderId required' });
  try {
    const result = await handlePaymentWebhook(orderId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
