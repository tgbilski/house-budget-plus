-- Create daily_checkins table for tracking daily financial activities
CREATE TABLE public.daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2),
  category TEXT,
  description TEXT,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create challenges table for goal-based challenges
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_type TEXT NOT NULL, -- 'no_takeout', 'save_target', 'budget_streak', etc.
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2),
  target_days INTEGER,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  current_progress DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed', 'paused'
  reward_badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_insights table for storing personalized insights
CREATE TABLE public.user_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'spending_pattern', 'budget_prediction', 'savings_opportunity'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB, -- Store additional insight data
  priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  is_read BOOLEAN DEFAULT FALSE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_streaks table for tracking consistency
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL, -- 'daily_checkin', 'budget_tracking', 'no_takeout'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Enable RLS on all tables
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_checkins
CREATE POLICY "Users can view their own daily checkins" 
ON public.daily_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily checkins" 
ON public.daily_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily checkins" 
ON public.daily_checkins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily checkins" 
ON public.daily_checkins 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for challenges
CREATE POLICY "Users can view their own challenges" 
ON public.challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenges" 
ON public.challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" 
ON public.challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges" 
ON public.challenges 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_insights
CREATE POLICY "Users can view their own insights" 
ON public.user_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" 
ON public.user_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_streaks
CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.user_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update streaks
CREATE OR REPLACE FUNCTION public.update_user_streak(
  _user_id UUID,
  _streak_type TEXT,
  _activity_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
  VALUES (_user_id, _streak_type, 1, 1, _activity_date)
  ON CONFLICT (user_id, streak_type)
  DO UPDATE SET
    current_streak = CASE 
      WHEN user_streaks.last_activity_date = _activity_date - INTERVAL '1 day' THEN user_streaks.current_streak + 1
      WHEN user_streaks.last_activity_date = _activity_date THEN user_streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_streaks.longest_streak,
      CASE 
        WHEN user_streaks.last_activity_date = _activity_date - INTERVAL '1 day' THEN user_streaks.current_streak + 1
        WHEN user_streaks.last_activity_date = _activity_date THEN user_streaks.current_streak
        ELSE 1
      END
    ),
    last_activity_date = _activity_date,
    updated_at = now();
END;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_daily_checkins_updated_at
BEFORE UPDATE ON public.daily_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();