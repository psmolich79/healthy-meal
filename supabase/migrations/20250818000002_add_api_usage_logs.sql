-- Create api_usage_logs table to track API key usage
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES user_api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);
-- Create index for user_id and date (without DATE function)
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_created ON api_usage_logs(user_id, created_at);

-- Add RLS policies
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage logs
CREATE POLICY "Users can view own usage logs" ON api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert usage logs
CREATE POLICY "Service can insert usage logs" ON api_usage_logs
  FOR INSERT WITH CHECK (true);

-- Add usage_count and last_used_at to user_api_keys if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'usage_count') THEN
    ALTER TABLE user_api_keys ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'last_used_at') THEN
    ALTER TABLE user_api_keys ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create increment function for usage_count
CREATE OR REPLACE FUNCTION increment()
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(usage_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;
