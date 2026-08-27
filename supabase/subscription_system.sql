-- ============================================================
-- Climb IELTS — Subscription System Migration
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- SECTION 1: ALTER profiles table
-- ────────────────────────────────────────────────────────────

-- 1a. Drop old CHECK constraint on role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 1b. Migrate existing roles: student/teacher → user
UPDATE profiles SET role = 'user' WHERE role IN ('student', 'teacher');

-- 1c. Add new CHECK constraint with only 'user' and 'admin'
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin'));

-- 1d. Set default to 'user'
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- 1e. Add status column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended'));

-- ────────────────────────────────────────────────────────────
-- SECTION 2: Update handle_new_user() trigger
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_free_plan_id UUID;
BEGIN
  -- Insert profile with role='user'
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'user')
  ON CONFLICT (user_id) DO NOTHING;

  -- Auto-subscribe to Free plan if plans table exists and Free plan is available
  SELECT id INTO v_free_plan_id FROM plans WHERE slug = 'free' AND is_active = true LIMIT 1;
  IF v_free_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (user_id, plan_id, status, started_at, provider)
    VALUES (NEW.id, v_free_plan_id, 'active', NOW(), 'manual')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- SECTION 3: Fix existing RLS policies that reference old roles
-- ────────────────────────────────────────────────────────────

-- Drop old policies that reference 'teacher'/'student'
DROP POLICY IF EXISTS "Teachers read all profiles" ON profiles;
DROP POLICY IF EXISTS "Teachers read all submissions" ON writing_submissions;
DROP POLICY IF EXISTS "Teachers read all results" ON writing_results;
DROP POLICY IF EXISTS "Teachers update results" ON writing_results;

-- Recreate with 'admin' only (teachers no longer exist)
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins read all submissions" ON writing_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins read all results" ON writing_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins update results" ON writing_results FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ────────────────────────────────────────────────────────────
-- SECTION 4: Create plans table
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'VND',
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year', 'lifetime', 'none')),
  limits JSONB NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 5: Create subscriptions table
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id UUID REFERENCES plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'paused')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  provider TEXT NOT NULL DEFAULT 'manual' CHECK (provider IN ('manual', 'stripe', 'payos')),
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  provider_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 6: Create usage_records table
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL CHECK (feature IN ('writing_grading', 'speaking_grading')),
  submission_id UUID,
  billing_period TEXT NOT NULL, -- format: 'YYYY-MM' (e.g., '2026-08')
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS usage_records_user_feature_period
  ON usage_records (user_id, feature, billing_period);

-- ────────────────────────────────────────────────────────────
-- SECTION 7: Create bonus_credits table
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bonus_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL CHECK (feature IN ('writing_grading', 'speaking_grading')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  remaining INTEGER NOT NULL CHECK (remaining >= 0),
  granted_by UUID REFERENCES auth.users(id),
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bonus_credits_user_feature
  ON bonus_credits (user_id, feature)
  WHERE remaining > 0;

-- ────────────────────────────────────────────────────────────
-- SECTION 8: Create audit_logs table
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_target_user ON audit_logs (target_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_admin_user ON audit_logs (admin_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at ON audit_logs (created_at DESC);

-- ────────────────────────────────────────────────────────────
-- SECTION 9: RPC — check_and_record_usage (atomic, with advisory lock)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_and_record_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_submission_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lock_key BIGINT;
  v_billing_period TEXT;
  v_plan_limits JSONB;
  v_monthly_limit INTEGER;
  v_current_usage INTEGER;
  v_bonus_remaining INTEGER;
  v_bonus_id UUID;
  v_plan_slug TEXT;
BEGIN
  -- Advisory lock per user to prevent race conditions
  v_lock_key := hashtext(p_user_id::TEXT || p_feature);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Idempotency: if this submission_id is already recorded, allow without re-charging
  IF p_submission_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM usage_records
      WHERE user_id = p_user_id AND feature = p_feature AND submission_id = p_submission_id
    ) THEN
      RETURN jsonb_build_object('allowed', true, 'source', 'idempotent');
    END IF;
  END IF;

  -- Current billing period in YYYY-MM format
  v_billing_period := to_char(NOW(), 'YYYY-MM');

  -- Get user's active plan limits
  SELECT pl.limits, pl.slug INTO v_plan_limits, v_plan_slug
  FROM subscriptions s
  JOIN plans pl ON pl.id = s.plan_id
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
  LIMIT 1;

  -- If no active subscription, treat as free plan (0 limit)
  IF v_plan_limits IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'no_active_subscription',
      'remaining', 0
    );
  END IF;

  -- Extract monthly limit for this feature
  v_monthly_limit := COALESCE((v_plan_limits ->> (p_feature || '_monthly'))::INTEGER, 0);

  -- Count usage this billing period
  SELECT COUNT(*) INTO v_current_usage
  FROM usage_records
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND billing_period = v_billing_period;

  -- Check if within plan limit
  IF v_current_usage < v_monthly_limit THEN
    -- Record usage and allow
    INSERT INTO usage_records (user_id, feature, submission_id, billing_period)
    VALUES (p_user_id, p_feature, p_submission_id, v_billing_period);

    RETURN jsonb_build_object(
      'allowed', true,
      'source', 'plan',
      'plan', v_plan_slug,
      'remaining', v_monthly_limit - v_current_usage - 1
    );
  END IF;

  -- Plan limit exhausted — check bonus credits
  SELECT id, remaining INTO v_bonus_id, v_bonus_remaining
  FROM bonus_credits
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND remaining > 0
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY expires_at ASC NULLS LAST, created_at ASC
  LIMIT 1;

  IF v_bonus_id IS NOT NULL THEN
    -- Deduct from bonus credit
    UPDATE bonus_credits SET remaining = remaining - 1 WHERE id = v_bonus_id;

    -- Record usage
    INSERT INTO usage_records (user_id, feature, submission_id, billing_period)
    VALUES (p_user_id, p_feature, p_submission_id, v_billing_period);

    RETURN jsonb_build_object(
      'allowed', true,
      'source', 'bonus',
      'remaining', v_bonus_remaining - 1
    );
  END IF;

  -- No quota available
  RETURN jsonb_build_object(
    'allowed', false,
    'reason', 'quota_exceeded',
    'plan', v_plan_slug,
    'monthly_limit', v_monthly_limit,
    'current_usage', v_current_usage,
    'remaining', 0
  );
END;
$$;

-- ────────────────────────────────────────────────────────────
-- SECTION 10: Enable RLS on new tables
-- ────────────────────────────────────────────────────────────

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- SECTION 11: RLS policies
-- ────────────────────────────────────────────────────────────

-- plans: all authenticated users can read active plans
DROP POLICY IF EXISTS "Authenticated users read active plans" ON plans;
CREATE POLICY "Authenticated users read active plans" ON plans
  FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage plans" ON plans;
CREATE POLICY "Admins manage plans" ON plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- subscriptions: users read own subscription
DROP POLICY IF EXISTS "Users read own subscription" ON subscriptions;
CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage subscriptions" ON subscriptions;
CREATE POLICY "Admins manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- usage_records: users read own usage
DROP POLICY IF EXISTS "Users read own usage" ON usage_records;
CREATE POLICY "Users read own usage" ON usage_records
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all usage" ON usage_records;
CREATE POLICY "Admins read all usage" ON usage_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- bonus_credits: users read own credits
DROP POLICY IF EXISTS "Users read own bonus credits" ON bonus_credits;
CREATE POLICY "Users read own bonus credits" ON bonus_credits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage bonus credits" ON bonus_credits;
CREATE POLICY "Admins manage bonus credits" ON bonus_credits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- audit_logs: admins only
DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;
CREATE POLICY "Admins read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins insert audit logs" ON audit_logs;
CREATE POLICY "Admins insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- SECTION 12: Seed plans
-- ────────────────────────────────────────────────────────────

INSERT INTO plans (slug, name, description, price, currency, billing_interval, limits, features, is_active, sort_order)
VALUES
(
  'free',
  'Free',
  'Bắt đầu miễn phí với các tính năng cơ bản',
  0,
  'VND',
  'none',
  jsonb_build_object(
    'writing_grading_monthly', 3,
    'speaking_grading_monthly', 3
  ),
  jsonb_build_object(
    'writing_grading', true,
    'speaking_grading', true,
    'advanced_correction', false,
    'progress_tracking', false,
    'ai_tutor', false
  ),
  true,
  0
),
(
  'basic',
  'Basic',
  'Phù hợp cho người học ôn luyện thường xuyên',
  149000,
  'VND',
  'month',
  jsonb_build_object(
    'writing_grading_monthly', 20,
    'speaking_grading_monthly', 20
  ),
  jsonb_build_object(
    'writing_grading', true,
    'speaking_grading', true,
    'advanced_correction', true,
    'progress_tracking', true,
    'ai_tutor', false
  ),
  true,
  1
),
(
  'pro',
  'Pro',
  'Không giới hạn — dành cho người học nghiêm túc',
  299000,
  'VND',
  'month',
  jsonb_build_object(
    'writing_grading_monthly', 999,
    'speaking_grading_monthly', 999
  ),
  jsonb_build_object(
    'writing_grading', true,
    'speaking_grading', true,
    'advanced_correction', true,
    'progress_tracking', true,
    'ai_tutor', true
  ),
  true,
  2
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  limits = EXCLUDED.limits,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ────────────────────────────────────────────────────────────
-- SECTION 13: Assign existing users to Free plan
-- ────────────────────────────────────────────────────────────

INSERT INTO subscriptions (user_id, plan_id, status, started_at, provider)
SELECT
  p.user_id,
  (SELECT id FROM plans WHERE slug = 'free' LIMIT 1),
  'active',
  NOW(),
  'manual'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions s WHERE s.user_id = p.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SECTION 14: updated_at triggers
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS plans_updated_at ON plans;
CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
