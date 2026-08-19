const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Chain Scanners ────────────────────────────────────────────
const scanners = {
  ETH: async (txHash, expectedAddress, expectedAmount) => {
    const url = `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    const txUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    const [status, tx] = await Promise.all([axios.get(url), axios.get(txUrl)]);
    const confirmed = status.data?.result?.status === '1';
    const toMatch = tx.data?.result?.to?.toLowerCase() === expectedAddress.toLowerCase();
    const value = parseInt(tx.data?.result?.value || '0', 16) / 1e18;
    return { confirmed, toMatch, value, confirmations: confirmed ? 12 : 0 };
  },

  BSC: async (txHash, expectedAddress, expectedAmount) => {
    const url = `https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${process.env.BSCSCAN_API_KEY}`;
    const txUrl = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.BSCSCAN_API_KEY}`;
    const [status, tx] = await Promise.all([axios.get(url), axios.get(txUrl)]);
    const confirmed = status.data?.result?.status === '1';
    const toMatch = tx.data?.result?.to?.toLowerCase() === expectedAddress.toLowerCase();
    const value = parseInt(tx.data?.result?.value || '0', 16) / 1e18;
    return { confirmed, toMatch, value, confirmations: confirmed ? 15 : 0 };
  },

  TRX: async (txHash, expectedAddress, expectedAmount) => {
    const url = `https://api.trongrid.io/v1/transactions/${txHash}`;
    const res = await axios.get(url);
    const tx = res.data?.data?.[0];
    const confirmed = tx?.ret?.[0]?.contractRet === 'SUCCESS';
    const toAddress = tx?.raw_data?.contract?.[0]?.parameter?.value?.to_address;
    const toMatch = toAddress === expectedAddress;
    const value = (tx?.raw_data?.contract?.[0]?.parameter?.value?.amount || 0) / 1e6;
    return { confirmed, toMatch, value, confirmations: confirmed ? 20 : 0 };
  },

  BTC: async (txHash, expectedAddress, expectedAmount) => {
    const url = `https://api.blockcypher.com/v1/btc/main/txs/${txHash}?token=${process.env.BLOCKCYPHER_TOKEN}`;
    const res = await axios.get(url);
    const tx = res.data;
    const confirmations = tx?.confirmations || 0;
    const confirmed = confirmations >= 1;
    const output = tx?.outputs?.find(o => o.addresses?.includes(expectedAddress));
    const value = (output?.value || 0) / 1e8;
    return { confirmed, toMatch: !!output, value, confirmations };
  },

  LTC: async (txHash, expectedAddress, expectedAmount) => {
    const url = `https://api.blockcypher.com/v1/ltc/main/txs/${txHash}?token=${process.env.BLOCKCYPHER_TOKEN}`;
    const res = await axios.get(url);
    const tx = res.data;
    const confirmations = tx?.confirmations || 0;
    const confirmed = confirmations >= 6;
    const output = tx?.outputs?.find(o => o.addresses?.includes(expectedAddress));
    const value = (output?.value || 0) / 1e8;
    return { confirmed, toMatch: !!output, value, confirmations };
  },
};

// ── Activate Subscription ─────────────────────────────────────
async function activateSubscription(payment) {
  const months = payment.billing_period === 'yearly' ? 12
    : payment.billing_period === 'quarterly' ? 3 : 1;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  // Create subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: payment.user_id,
      plan_id: payment.plan_id,
      plan_name: payment.plan_name,
      billing_period: payment.billing_period,
      months,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      payment_order_id: payment.id,
    });

  if (subError) throw subError;

  // Update user record
  const { error: userError } = await supabase
    .from('users')
    .update({
      current_plan: payment.plan_id,
      subscription_status: 'active',
      subscription_end_date: endDate.toISOString(),
    })
    .eq('id', payment.user_id);

  if (userError) throw userError;

  // Notify user
  await supabase.from('notifications').insert({
    user_id: payment.user_id,
    type: 'subscription_activated',
    title: '🎉 Subscription Activated!',
    message: `Your ${payment.plan_name} plan is now active until ${endDate.toLocaleDateString()}.`,
    data: { plan_id: payment.plan_id, end_date: endDate.toISOString() },
  });
}

// ── Main Verify Function ──────────────────────────────────────
async function verifyPayment(orderId) {
  // Fetch payment record
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error || !payment) throw new Error(`Payment not found: ${orderId}`);
  if (payment.status === 'confirmed') return { status: 'confirmed', payment };
  if (!payment.tx_hash) return { status: 'pending', payment };

  const network = payment.network.toUpperCase();
  const scanner = scanners[network];
  if (!scanner) throw new Error(`Unsupported network: ${network}`);

  let result;
  try {
    result = await scanner(
      payment.tx_hash,
      payment.payment_address,
      payment.crypto_amount
    );
  } catch (err) {
    console.error(`Scanner error for ${network}:`, err.message);
    return { status: 'pending', payment };
  }

  const amountOk = result.value >= parseFloat(payment.crypto_amount) * 0.99; // 1% tolerance

  if (result.confirmed && result.toMatch && amountOk) {
    // Mark payment confirmed
    await supabase
      .from('payments')
      .update({
        status: 'confirmed',
        confirmations: result.confirmations,
        verification_result: result,
        verified_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    // Activate the subscription
    await activateSubscription(payment);

    return { status: 'confirmed', payment };
  }

  // Update confirmations even if not fully confirmed yet
  await supabase
    .from('payments')
    .update({
      confirmations: result.confirmations || 0,
      status: 'detecting',
    })
    .eq('order_id', orderId);

  return { status: 'detecting', confirmations: result.confirmations, payment };
}

// ── Poll All Pending Payments (called by scheduler) ───────────
async function pollPendingPayments() {
  const { data: pending } = await supabase
    .from('payments')
    .select('order_id')
    .in('status', ['detected', 'detecting'])
    .lt('expires_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    .gt('expires_at', new Date().toISOString());

  if (!pending?.length) return;

  console.log(`Polling ${pending.length} pending payments...`);

  await Promise.allSettled(
    pending.map(p => verifyPayment(p.order_id))
  );
}

module.exports = { verifyPayment, pollPendingPayments };
