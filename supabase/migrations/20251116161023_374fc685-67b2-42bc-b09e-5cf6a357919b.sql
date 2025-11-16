-- Create user_stats table for tracking gamification progress
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  plants_added INTEGER NOT NULL DEFAULT 0,
  achievements_earned INTEGER NOT NULL DEFAULT 0,
  perfect_weeks INTEGER NOT NULL DEFAULT 0,
  diseases_treated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats"
ON public.user_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.user_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.user_stats
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create achievement_definitions table for managing available achievements
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  color TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirement_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public read)
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievement definitions"
ON public.achievement_definitions
FOR SELECT
USING (true);

-- Insert predefined achievements
INSERT INTO public.achievement_definitions (id, title, description, icon, achievement_type, color, xp_reward, requirement_count) VALUES
  ('first_plant', 'Plant Parent', 'Added your first plant to the collection', 'Sprout', 'collection', 'text-green-500', 50, 1),
  ('five_plants', 'Growing Collection', 'Manage 5 healthy plants', 'TreeDeciduous', 'collection', 'text-green-500', 100, 5),
  ('ten_plants', 'Green Thumb', 'Maintain 10 healthy plants', 'Trees', 'collection', 'text-emerald-500', 250, 10),
  ('first_task', 'Getting Started', 'Completed your first care task', 'CheckCircle', 'task', 'text-blue-500', 25, 1),
  ('ten_tasks', 'Dedicated Gardener', 'Completed 10 care tasks', 'ListChecks', 'task', 'text-blue-500', 100, 10),
  ('fifty_tasks', 'Master Gardener', 'Completed 50 care tasks', 'Award', 'task', 'text-blue-600', 500, 50),
  ('perfect_week', 'Perfect Week', 'Completed all tasks on time for a week', 'Star', 'streak', 'text-purple-500', 150, 1),
  ('seven_day_streak', '7-Day Streak', 'Consistent care for 7 days', 'Flame', 'streak', 'text-orange-500', 100, 7),
  ('thirty_day_streak', '30-Day Streak', 'Consistent care for 30 days', 'Zap', 'streak', 'text-orange-600', 300, 30),
  ('disease_defender', 'Pest Defender', 'Successfully treated a plant disease', 'Shield', 'health', 'text-red-500', 200, 1),
  ('first_bloom', 'First Bloom', 'Witnessed your first flowering milestone', 'Flower', 'milestone', 'text-yellow-500', 150, 1),
  ('growth_tracker', 'Growth Tracker', 'Logged 10 growth milestones', 'TrendingUp', 'milestone', 'text-yellow-600', 200, 10),
  ('early_bird', 'Early Bird', 'Completed a task before 8 AM', 'Sunrise', 'special', 'text-amber-500', 75, 1),
  ('night_owl', 'Night Owl', 'Completed a task after 10 PM', 'Moon', 'special', 'text-indigo-500', 75, 1),
  ('carbon_conscious', 'Carbon Conscious', 'Tracked carbon footprint for 7 days', 'Leaf', 'carbon', 'text-teal-500', 100, 7)
ON CONFLICT (id) DO NOTHING;