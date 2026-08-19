CREATE OR REPLACE FUNCTION create_payment_order(
  p_user_id UUID,
  p_plan_id TEXT,
  p_billing_period TEXT,
  p_crypto_symbol TEXT,
  p_network TEXT,
  p_promo_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_plan subscription_plans%ROWTYPE;
  v_order_id TEXT;
  v_months INTEGER;
  v_usd_amount DECIMAL;
  v_discount DECIMAL := 0;
  v_payment_address TEXT;
  v_crypto_price DECIMAL;
  v_crypto_amount DECIMAL;
BEGIN
  -- Get plan
  SELECT * INTO v_plan FROM subscription_plans WHERE plan_id = p_plan_id AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plan not found'; END IF;

  -- Billing months
  v_months := CASE p_billing_period
    WHEN 'yearly'    THEN 12
    WHEN 'quarterly' THEN 3
    ELSE 1
  END;

  -- Base amount with period multiplier and discount
  v_usd_amount := v_plan.base_price * v_months;
  IF p_billing_period = 'yearly'    THEN v_usd_amount := v_usd_amount * 0.8;  END IF;
  IF p_billing_period = 'quarterly' THEN v_usd_amount := v_usd_amount * 0.9;  END IF;

  -- Promo code
  IF p_promo_code IS NOT NULL THEN
    DECLARE v_promo promo_codes%ROWTYPE;
    BEGIN
      SELECT * INTO v_promo FROM promo_codes
        WHERE code = p_promo_code AND active = true
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (max_uses IS NULL OR used_count < max_uses);
      IF FOUND THEN
        v_discount := CASE v_promo.discount_type
          WHEN 'percentage' THEN v_usd_amount * (v_promo.discount_value / 100)
          ELSE v_promo.discount_value
        END;
        v_usd_amount := GREATEST(v_usd_amount - v_discount, 0);
        UPDATE promo_codes SET used_count = used_count + 1 WHERE id = v_promo.id;
      END IF;
    END;
  END IF;

  -- Payment address by network
  v_payment_address := CASE p_network
    WHEN 'BSC' THEN current_setting('app.payment_bep20_address', true)
    WHEN 'ETH' THEN current_setting('app.payment_erc20_address', true)
    WHEN 'TRX' THEN current_setting('app.payment_trc20_address', true)
    WHEN 'BTC' THEN current_setting('app.payment_btc_address',   true)
    WHEN 'LTC' THEN current_setting('app.payment_ltc_address',   true)
    ELSE current_setting('app.payment_bep20_address', true)
  END;

  -- Dummy rate (replace with live rate from CoinGecko/CMC in production)
  v_crypto_price := CASE p_crypto_symbol
    WHEN 'USDT' THEN 1
    WHEN 'BNB'  THEN 600
    WHEN 'ETH'  THEN 3500
    WHEN 'BTC'  THEN 65000
    WHEN 'LTC'  THEN 85
    ELSE 1
  END;

  v_crypto_amount := ROUND((v_usd_amount / v_crypto_price)::DECIMAL, 8);
  v_order_id := 'ORD-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 12));

  INSERT INTO payments (
    order_id, user_id, plan_id, plan_name, billing_period,
    usd_amount, original_amount, discount, promo_code,
    crypto_symbol, network, crypto_amount, exchange_rate,
    payment_address, status, quote_expires_at, expires_at
  ) VALUES (
    v_order_id, p_user_id, p_plan_id, v_plan.name, p_billing_period,
    v_usd_amount, v_plan.base_price * v_months, v_discount, p_promo_code,
    p_crypto_symbol, p_network, v_crypto_amount, v_crypto_price,
    v_payment_address, 'pending',
    NOW() + INTERVAL '15 minutes',
    NOW() + INTERVAL '24 hours'
  );

  RETURN jsonb_build_object(
    'paymentOrder', jsonb_build_object(
      'orderId',         v_order_id,
      'usdAmount',       v_usd_amount,
      'cryptoAmount',    v_crypto_amount,
      'exchangeRate',    v_crypto_price,
      'paymentAddress',  v_payment_address,
      'expiresAt',       (NOW() + INTERVAL '15 minutes')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
