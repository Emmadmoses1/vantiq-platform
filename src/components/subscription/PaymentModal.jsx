import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bitcoin,
  Wallet,
  Copy,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import QRCode from 'qrcode.react';
import api from '../../lib/api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Loader from '../ui/Loader';
import telegram from '../../config/telegram';

const PaymentModal = ({ plan, billingPeriod, onSuccess }) => {
  const [step, setStep] = useState('select-crypto'); // select-crypto, payment-details, confirming, success
  const [cryptos, setCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  useEffect(() => {
    loadCryptos();
  }, []);

  useEffect(() => {
    if (step === 'payment-details' && paymentOrder) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, paymentOrder]);

  const loadCryptos = async () => {
    try {
      const data = await api.getSupportedCrypto();
      setCryptos(data.cryptocurrencies || []);
    } catch (error) {
      console.error('Error loading cryptos:', error);
    }
  };

  const handleSelectCrypto = async (crypto) => {
    try {
      telegram.haptic('medium');
      setLoading(true);

      const order = await api.createPaymentOrder(
        plan.plan_id,
        billingPeriod,
        crypto.symbol,
        crypto.network,
        null // promoCode
      );

      setSelectedCrypto(crypto);
      setPaymentOrder(order.paymentOrder);
      setStep('payment-details');
    } catch (error) {
      console.error('Error creating payment order:', error);
      telegram.showAlert('Failed to create payment order');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    telegram.haptic('light');
    navigator.clipboard.writeText(paymentOrder.paymentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitTx = async () => {
    if (!txHash.trim()) {
      telegram.showAlert('Please enter transaction hash');
      return;
    }

    try {
      telegram.haptic('medium');
      setLoading(true);

      await api.submitTransaction(paymentOrder.orderId, txHash);
      setStep('confirming');

      // Start polling for confirmation
      pollPaymentStatus();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      telegram.showAlert(error.response?.data?.message || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async () => {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    const poll = setInterval(async () => {
      try {
        attempts++;
        const payment = await api.getPaymentStatus(paymentOrder.orderId);

        if (payment.payment.status === 'confirmed') {
          clearInterval(poll);
          telegram.haptic('success');
          setStep('success');
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else if (payment.payment.status === 'failed') {
          clearInterval(poll);
          telegram.showAlert('Payment verification failed. Please contact support.');
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 5000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCryptoIcon = (symbol) => {
    const icons = {
      BTC: '₿',
      ETH: 'Ξ',
      USDT: '₮',
      LTC: 'Ł',
      BNB: 'BNB',
      TON: '💎',
    };
    return icons[symbol] || '🪙';
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Step 1: Select Cryptocurrency */}
        {step === 'select-crypto' && (
          <motion.div
            key="select-crypto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Select Payment Method</h3>
              <p className="text-gray-400">Choose your preferred cryptocurrency</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader size="md" />
              </div>
            ) : (
              <div className="grid gap-3">
                {cryptos.map((crypto) => (
                  <motion.button
                    key={crypto.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectCrypto(crypto)}
                    className="w-full"
                  >
                    <Card variant="glass" hover={false}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                            {getCryptoIcon(crypto.symbol)}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-white">{crypto.name}</p>
                            <p className="text-sm text-gray-400">
                              {crypto.symbol} • {crypto.networkName}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Card>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Payment Details */}
        {step === 'payment-details' && paymentOrder && (
          <motion.div
            key="payment-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Timer */}
            <Card variant="gradient" hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-300">Payment expires in</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </Card>

            {/* Payment Info */}
            <Card variant="glass" hover={false}>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount (USD)</span>
                  <span className="text-white font-bold">${paymentOrder.usdAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount ({selectedCrypto.symbol})</span>
                  <span className="text-white font-bold">
                    {paymentOrder.cryptoAmount} {selectedCrypto.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <Badge variant="primary">{selectedCrypto.networkName}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-sm text-gray-300">
                    1 {selectedCrypto.symbol} = ${paymentOrder.exchangeRate}
                  </span>
                </div>
              </div>
            </Card>

            {/* QR Code */}
            <Card variant="glass" hover={false}>
              <div className="text-center space-y-4">
                <p className="text-sm font-semibold text-white">Scan to Pay</p>
                <div className="bg-white p-4 rounded-xl inline-block">
                  <QRCode
                    value={paymentOrder.paymentAddress}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Scan this QR code with your wallet app
                </p>
              </div>
            </Card>

            {/* Payment Address */}
            <Card variant="glass" hover={false}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Payment Address</span>
                  <Badge variant="warning" size="sm">
                    {selectedCrypto.networkName}
                  </Badge>
                </div>
                <div className="bg-dark-200/50 rounded-lg p-3 break-all">
                  <p className="text-sm text-white font-mono">
                    {paymentOrder.paymentAddress}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleCopyAddress}
                  icon={copied ? Check : Copy}
                >
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>
              </div>
            </Card>

            {/* Warning */}
            <Card variant="glass" hover={false} className="bg-yellow-500/10 border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-yellow-100 space-y-1">
                  <p className="font-semibold">Important:</p>
                  <p>• Send ONLY {selectedCrypto.symbol} to this address</p>
                  <p>• Ensure you're using {selectedCrypto.networkName} network</p>
                  <p>• Send exact amount: {paymentOrder.cryptoAmount} {selectedCrypto.symbol}</p>
                  <p>• Wrong network = lost funds (non-recoverable)</p>
                </div>
              </div>
            </Card>

            {/* Submit Transaction Hash */}
            <Card variant="glass" hover={false}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Transaction Hash (Optional but Recommended)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your transaction hash..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Submit your transaction hash for faster confirmation
                  </p>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmitTx}
                  loading={loading}
                  disabled={!txHash.trim()}
                >
                  Submit & Verify Payment
                </Button>

                <p className="text-xs text-center text-gray-400">
                  Or wait - we'll detect your payment automatically
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Confirming */}
        {step === 'confirming' && (
          <motion.div
            key="confirming"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12 space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center"
            >
              <RefreshCw className="w-10 h-10 text-white" />
            </motion.div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Verifying Payment</h3>
              <p className="text-gray-400">
                Please wait while we confirm your transaction on the blockchain...
              </p>
            </div>

            <Card variant="glass" hover={false} className="max-w-md mx-auto">
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Transaction detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader size="sm" />
                  <span>Waiting for confirmations...</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span>Activating subscription</span>
                </div>
              </div>
            </Card>

            <p className="text-xs text-gray-400">
              This may take a few minutes depending on network congestion
            </p>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h3>
              <p className="text-gray-400">
                Your subscription has been activated successfully
              </p>
            </div>

            <Card variant="gradient" hover={false} className="max-w-md mx-auto">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Plan</span>
                  <span className="text-white font-bold">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount Paid</span>
                  <span className="text-white font-bold">${paymentOrder.usdAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status</span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </Card>

            <p className="text-sm text-gray-400">
              You now have access to premium trading signals!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentModal;