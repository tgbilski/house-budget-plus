-- Add AI usage tracking columns to subscribers table
ALTER TABLE subscribers 
ADD COLUMN ai_queries_count INTEGER DEFAULT 0,
ADD COLUMN ai_queries_reset_date TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', now() + interval '1 month');

-- Create index for performance
CREATE INDEX idx_subscribers_ai_usage ON subscribers(user_id, ai_queries_count, ai_queries_reset_date);

-- Create function to check and increment AI usage
CREATE OR REPLACE FUNCTION public.check_and_increment_ai_usage(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscriber_record RECORD;
  result jsonb;
BEGIN
  -- Get subscriber record
  SELECT * INTO subscriber_record 
  FROM subscribers 
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'not_subscribed');
  END IF;
  
  -- Check if reset date has passed
  IF subscriber_record.ai_queries_reset_date <= now() THEN
    -- Reset counter
    UPDATE subscribers 
    SET ai_queries_count = 0,
        ai_queries_reset_date = date_trunc('month', now() + interval '1 month')
    WHERE user_id = _user_id;
    
    subscriber_record.ai_queries_count := 0;
  END IF;
  
  -- Check if limit reached
  IF subscriber_record.ai_queries_count >= 10 THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'limit_reached',
      'queries_count', subscriber_record.ai_queries_count,
      'reset_date', subscriber_record.ai_queries_reset_date
    );
  END IF;
  
  -- Increment counter
  UPDATE subscribers 
  SET ai_queries_count = ai_queries_count + 1
  WHERE user_id = _user_id;
  
  RETURN jsonb_build_object(
    'allowed', true, 
    'queries_count', subscriber_record.ai_queries_count + 1,
    'queries_remaining', 9 - subscriber_record.ai_queries_count,
    'reset_date', subscriber_record.ai_queries_reset_date
  );
END;
$$;