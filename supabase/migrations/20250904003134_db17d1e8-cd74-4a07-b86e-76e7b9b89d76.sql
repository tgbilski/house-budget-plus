-- Add household_id to user_badges if not exists (badges could be per household)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_badges' 
                   AND column_name = 'household_id' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_badges ADD COLUMN household_id UUID REFERENCES public.households(id);
        
        -- Update RLS policies for user_badges to include household scoping
        DROP POLICY IF EXISTS "Users can earn their own badges" ON public.user_badges;
        DROP POLICY IF EXISTS "Users can view their own badges" ON public.user_badges;
        
        CREATE POLICY "Users can earn their own household badges" 
        ON public.user_badges 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id AND (household_id IS NULL OR household_id IN (
          SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
        )));
        
        CREATE POLICY "Users can view their own household badges" 
        ON public.user_badges 
        FOR SELECT 
        USING (auth.uid() = user_id AND (household_id IS NULL OR household_id IN (
          SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
        )));
    END IF;
END $$;