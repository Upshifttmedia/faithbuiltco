-- ============================================================
-- Push Subscriptions
-- Stores each user's Web Push subscription endpoint + keys,
-- plus their preferred notification times and timezone.
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription  jsonb       NOT NULL,          -- full PushSubscription JSON
  morning_time  text        NOT NULL DEFAULT '07:00',  -- HH:MM local time
  evening_time  text        NOT NULL DEFAULT '20:00',  -- HH:MM local time
  timezone      text        NOT NULL DEFAULT 'America/Los_Angeles',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own subscription
DROP POLICY IF EXISTS "Users manage own push subscription" ON push_subscriptions;
CREATE POLICY "Users manage own push subscription"
  ON push_subscriptions
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
