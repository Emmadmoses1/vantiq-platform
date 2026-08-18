import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import telegram from '../../config/telegram';

const PlanCard = ({ plan, onSelect, currentPlan = null, popular = false }) => {
  const isCurrentPlan = currentPlan === plan.plan_id;

  const planIcons = {
    starter: Sparkles,
    pro: Zap,
    premium: Crown,
    elite: Crown,
    vip: Crown,
  };

  const Icon = planIcons[plan.plan_id] || Zap;

  const handleSelect = () => {
    telegram.haptic('medium');
    onSelect(plan);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge variant="primary" className="shadow-glow-md">
            ⭐ MOST POPULAR
          </Badge>
        </div>
      )}

      <Card
        variant={popular ? 'gradient' : 'glass'}
        hover={false}
        className={`relative overflow-hidden h-full ${
          popular ? 'ring-2 ring-primary-500 shadow-glow-lg' : ''
        }`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content */}
        <div className="relative">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
            popular
              ? 'from-primary-500 to-cyan-500'
              : 'from-primary-500/20 to-cyan-500/20'
          } flex items-center justify-center mb-4`}>
            <Icon className={`w-7 h-7 ${popular ? 'text-white' : 'text-primary-400'}`} />
          </div>

          {/* Plan Name */}
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                ${plan.base_price}
              </span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Billed monthly, discounts for longer periods</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-sm text-gray-300 flex-1">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            variant={popular ? 'primary' : 'secondary'}
            fullWidth
            onClick={handleSelect}
            disabled={isCurrentPlan}
            className={isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
          </Button>

          {/* Signal Limit Badge */}
          {plan.signal_limit > 0 && (
            <div className="mt-4 text-center">
              <Badge variant="default" size="sm">
                Up to {plan.signal_limit} signals/month
              </Badge>
            </div>
          )}
          {plan.signal_limit === -1 && (
            <div className="mt-4 text-center">
              <Badge variant="success" size="sm">
                ♾️ Unlimited Signals
              </Badge>
            </div>
          )}
        </div>

        {/* Shine Effect */}
        {popular && (
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
          />
        )}
      </Card>
    </motion.div>
  );
};

export default PlanCard;