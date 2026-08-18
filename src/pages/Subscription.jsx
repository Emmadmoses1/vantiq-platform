import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Info } from 'lucide-react';
import api from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import PlanCard from '../components/subscription/PlanCard';
import Modal from '../components/ui/Modal';
import PaymentModal from '../components/subscription/PaymentModal';
import telegram from '../config/telegram';

const Subscription = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const billingPeriods = [
    { id: 'monthly', label: 'Monthly', months: 1, discount: 0, popular: false },
    { id: 'quarterly', label: '3 Months', months: 3, discount: 10, popular: true },
    { id: 'semiannual', label: '6 Months', months: 6, discount: 15, popular: false },
    { id: 'yearly', label: 'Yearly', months: 12, discount: 25, popular: false },
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const [plansData, subData] = await Promise.all([
        api.getPlans(),
        api.getUserSubscription(),
      ]);

      setPlans(plansData);
      setCurrentSubscription(subData);
    } catch (error) {
      console.error('Error loading plans:', error);
      telegram.showAlert('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    telegram.haptic('medium');
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;
    telegram.haptic('medium');
    setShowPaymentModal(true);
  };

  const calculatePrice = (basePrice) => {
    const period = billingPeriods.find((p) => p.id === selectedBillingPeriod);
    const subtotal = basePrice * period.months;
    const discount = subtotal * (period.discount / 100);
    const total = subtotal - discount;

    return {
      subtotal,
      discount,
      total,
      months: period.months,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" text="Loading plans..." />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="inline-block"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Select the perfect subscription plan for your trading needs. All plans include premium
          market analysis and professional signals.
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card variant="gradient" glow hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="success" className="mb-2">
                CURRENT PLAN
              </Badge>
              <h3 className="text-xl font-bold text-white">{currentSubscription.plan_name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                Valid until {new Date(currentSubscription.end_date).toLocaleDateString()}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </Card>
      )}

      {/* Billing Period Selector */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Select Billing Period</h3>
        <div className="grid grid-cols-2 gap-3">
          {billingPeriods.map((period) => {
            const isActive = selectedBillingPeriod === period.id;

            return (
              <motion.button
                key={period.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  telegram.haptic('light');
                  setSelectedBillingPeriod(period.id);
                }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-white/10 bg-dark-100/50 hover:border-primary-500/50'
                }`}
              >
                {period.popular && (
                  <Badge
                    variant="primary"
                    size="sm"
                    className="absolute -top-2 -right-2"
                  >
                    SAVE {period.discount}%
                  </Badge>
                )}
                <p className="font-semibold text-white mb-1">{period.label}</p>
                {period.discount > 0 && (
                  <p className="text-xs text-green-400">Save {period.discount}%</p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Available Plans</h3>
        <div className="grid gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlanCard
                plan={plan}
                onSelect={handleSelectPlan}
                currentPlan={currentSubscription?.plan_id}
                popular={plan.popular}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient" hover={false}>
            <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>

            {(() => {
              const pricing = calculatePrice(selectedPlan.base_price);
              return (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className="text-white font-semibold">
                      {selectedPlan.name}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white font-semibold">
                      {pricing.months} {pricing.months === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${pricing.subtotal.toFixed(2)}</span>
                  </div>

                  {pricing.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-400">Discount</span>
                      <span className="text-green-400">
                        -${pricing.discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-bold text-white">Total</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                          ${pricing.total.toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">USD</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleProceedToPayment}
                    icon={Zap}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              );
            })()}
          </Card>
        </motion.div>
      )}

      {/* Info Notice */}
      <Card variant="glass" hover={false}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-gray-300 space-y-2">
            <p>• All plans include access to professional trading signals</p>
            <p>• Cryptocurrency payments are processed securely on-chain</p>
            <p>• Subscriptions activate immediately after payment confirmation</p>
            <p>• No automatic renewal - you control your subscription</p>
          </div>
        </div>
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment"
        size="full"
      >
        {selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            billingPeriod={selectedBillingPeriod}
            onSuccess={() => {
              setShowPaymentModal(false);
              loadPlans();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Subscription;