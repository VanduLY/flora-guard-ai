-- User Plants Collection Table
CREATE TABLE public.user_plants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  species TEXT NOT NULL,
  plant_type TEXT,
  location TEXT,
  climate_zone TEXT,
  growth_stage TEXT DEFAULT 'seedling' CHECK (growth_stage IN ('seedling', 'vegetative', 'mature', 'flowering', 'dormant')),
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'needs_attention', 'recovering', 'critical')),
  soil_type TEXT,
  light_requirement TEXT,
  water_frequency_days INTEGER DEFAULT 7,
  image_url TEXT,
  custom_notes TEXT,
  acquired_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Care Schedules Table (recurring tasks)
CREATE TABLE public.care_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('watering', 'fertilizing', 'pruning', 'repotting', 'pest_check', 'misting', 'rotation', 'cleaning')),
  frequency_days INTEGER NOT NULL DEFAULT 7,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  next_due_at TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  auto_adjust_weather BOOLEAN DEFAULT true,
  custom_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Care Tasks Table (individual task instances)
CREATE TABLE public.care_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.care_schedules(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plant Health Logs Table (daily check-ins)
CREATE TABLE public.plant_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT,
  health_rating INTEGER CHECK (health_rating >= 1 AND health_rating <= 5),
  mood TEXT,
  notes TEXT,
  environmental_data JSONB,
  ai_analysis JSONB,
  detected_issues TEXT[],
  vitality_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plant Achievements Table (gamification)
CREATE TABLE public.plant_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.user_plants(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Growth Milestones Table
CREATE TABLE public.growth_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('first_leaf', 'new_growth', 'flowering', 'fruiting', 'repotted', 'recovered', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  measurement_value NUMERIC(10,2),
  measurement_unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Care Preferences Table
CREATE TABLE public.user_care_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  notification_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00:00',
  email_reminders BOOLEAN DEFAULT true,
  weather_sync_enabled BOOLEAN DEFAULT true,
  auto_adjust_schedules BOOLEAN DEFAULT true,
  preferred_units TEXT DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
  theme_preference TEXT DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_care_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_plants
CREATE POLICY "Users can view their own plants"
  ON public.user_plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plants"
  ON public.user_plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
  ON public.user_plants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
  ON public.user_plants FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for care_schedules
CREATE POLICY "Users can view schedules for their plants"
  ON public.care_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = care_schedules.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can create schedules for their plants"
  ON public.care_schedules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = care_schedules.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can update schedules for their plants"
  ON public.care_schedules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = care_schedules.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete schedules for their plants"
  ON public.care_schedules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = care_schedules.plant_id
    AND user_plants.user_id = auth.uid()
  ));

-- RLS Policies for care_tasks
CREATE POLICY "Users can view tasks for their plants"
  ON public.care_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = care_tasks.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can create tasks for their plants"
  ON public.care_tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = care_tasks.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can update tasks for their plants"
  ON public.care_tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = care_tasks.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tasks for their plants"
  ON public.care_tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = care_tasks.plant_id
    AND user_plants.user_id = auth.uid()
  ));

-- RLS Policies for plant_health_logs
CREATE POLICY "Users can view their own health logs"
  ON public.plant_health_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health logs"
  ON public.plant_health_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health logs"
  ON public.plant_health_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health logs"
  ON public.plant_health_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plant_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.plant_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements"
  ON public.plant_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for growth_milestones
CREATE POLICY "Users can view milestones for their plants"
  ON public.growth_milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = growth_milestones.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can create milestones for their plants"
  ON public.growth_milestones FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = growth_milestones.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can update milestones for their plants"
  ON public.growth_milestones FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = growth_milestones.plant_id
    AND user_plants.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete milestones for their plants"
  ON public.growth_milestones FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE user_plants.id = growth_milestones.plant_id
    AND user_plants.user_id = auth.uid()
  ));

-- RLS Policies for user_care_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_care_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
  ON public.user_care_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_care_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_plants_user_id ON public.user_plants(user_id);
CREATE INDEX idx_user_plants_health_status ON public.user_plants(health_status);
CREATE INDEX idx_care_schedules_plant_id ON public.care_schedules(plant_id);
CREATE INDEX idx_care_schedules_next_due ON public.care_schedules(next_due_at);
CREATE INDEX idx_care_tasks_plant_id ON public.care_tasks(plant_id);
CREATE INDEX idx_care_tasks_due_date ON public.care_tasks(due_date);
CREATE INDEX idx_care_tasks_status ON public.care_tasks(status);
CREATE INDEX idx_plant_health_logs_plant_id ON public.plant_health_logs(plant_id);
CREATE INDEX idx_plant_health_logs_created_at ON public.plant_health_logs(created_at DESC);
CREATE INDEX idx_plant_achievements_user_id ON public.plant_achievements(user_id);
CREATE INDEX idx_growth_milestones_plant_id ON public.growth_milestones(plant_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_plants_updated_at
  BEFORE UPDATE ON public.user_plants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_schedules_updated_at
  BEFORE UPDATE ON public.care_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_care_preferences_updated_at
  BEFORE UPDATE ON public.user_care_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();