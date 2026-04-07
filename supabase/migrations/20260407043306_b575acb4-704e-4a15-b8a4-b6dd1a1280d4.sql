CREATE POLICY "Allow anonymous email capture inserts"
ON public.subscribers
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND subscribed = false
  AND subscription_tier IS NULL
  AND stripe_customer_id IS NULL
);