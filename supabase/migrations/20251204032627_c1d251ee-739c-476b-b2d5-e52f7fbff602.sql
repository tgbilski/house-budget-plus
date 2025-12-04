-- Add event_date and one_week_alert_dismissed columns to gift_lists
ALTER TABLE public.gift_lists 
ADD COLUMN event_date date,
ADD COLUMN one_week_alert_dismissed boolean DEFAULT false;

-- Create index for efficient event date queries
CREATE INDEX idx_gift_lists_event_date ON public.gift_lists(event_date) WHERE event_date IS NOT NULL;