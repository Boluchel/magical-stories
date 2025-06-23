/*
  # Subscription Integration with Supabase

  1. New Tables
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `revenue_cat_user_id` (text)
      - `is_subscribed` (boolean)
      - `subscription_type` (text)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_subscriptions` table
    - Add policies for authenticated users to manage their own subscription data

  3. Usage Tracking
    - Add `stories_created_today` column to track daily usage
    - Add function to check subscription limits
*/

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  revenue_cat_user_id text,
  is_subscribed boolean DEFAULT false,
  subscription_type text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription data
CREATE POLICY "Users can read own subscription data"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own subscription data
CREATE POLICY "Users can insert own subscription data"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription data
CREATE POLICY "Users can update own subscription data"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add usage tracking columns to stories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'generation_type'
  ) THEN
    ALTER TABLE stories ADD COLUMN generation_type text DEFAULT 'free';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_expires_at_idx ON user_subscriptions(expires_at);

-- Function to get user's daily story count
CREATE OR REPLACE FUNCTION get_daily_story_count(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  story_count integer;
BEGIN
  SELECT COUNT(*)
  INTO story_count
  FROM stories
  WHERE user_id = user_uuid
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  RETURN COALESCE(story_count, 0);
END;
$$;

-- Function to check if user can create stories
CREATE OR REPLACE FUNCTION can_create_story(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_subscribed boolean := false;
  daily_count integer;
  free_limit integer := 3; -- Free users can create 3 stories per day
BEGIN
  -- Check subscription status
  SELECT COALESCE(us.is_subscribed, false)
  INTO is_subscribed
  FROM user_subscriptions us
  WHERE us.user_id = user_uuid
    AND (us.expires_at IS NULL OR us.expires_at > now());
  
  -- Get daily story count
  daily_count := get_daily_story_count(user_uuid);
  
  -- Return result
  RETURN json_build_object(
    'can_create', is_subscribed OR daily_count < free_limit,
    'is_subscribed', is_subscribed,
    'daily_count', daily_count,
    'daily_limit', CASE WHEN is_subscribed THEN -1 ELSE free_limit END,
    'remaining', CASE WHEN is_subscribed THEN -1 ELSE greatest(0, free_limit - daily_count) END
  );
END;
$$;

-- Function to update subscription status (called from edge function)
CREATE OR REPLACE FUNCTION update_subscription_status(
  user_uuid uuid,
  rc_user_id text,
  subscribed boolean,
  sub_type text DEFAULT NULL,
  expires timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id,
    revenue_cat_user_id,
    is_subscribed,
    subscription_type,
    expires_at,
    updated_at
  )
  VALUES (
    user_uuid,
    rc_user_id,
    subscribed,
    sub_type,
    expires,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    revenue_cat_user_id = EXCLUDED.revenue_cat_user_id,
    is_subscribed = EXCLUDED.is_subscribed,
    subscription_type = EXCLUDED.subscription_type,
    expires_at = EXCLUDED.expires_at,
    updated_at = now();
END;
$$;