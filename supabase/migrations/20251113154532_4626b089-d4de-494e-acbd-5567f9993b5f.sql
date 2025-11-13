-- Add carbon tracking preference to user preferences
ALTER TABLE user_care_preferences 
ADD COLUMN IF NOT EXISTS carbon_tracking_enabled boolean DEFAULT false;

-- Create carbon activities table to log all activities
CREATE TABLE IF NOT EXISTS public.carbon_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plant_id uuid REFERENCES public.user_plants(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('watering', 'fertilizer', 'sensor_maintenance', 'pruning', 'repotting')),
  quantity numeric,
  unit text,
  co2_emissions numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carbon_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own carbon activities"
ON public.carbon_activities
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own carbon activities"
ON public.carbon_activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carbon activities"
ON public.carbon_activities
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carbon activities"
ON public.carbon_activities
FOR DELETE
USING (auth.uid() = user_id);

-- Create carbon footprint summary table for aggregated data
CREATE TABLE IF NOT EXISTS public.carbon_footprint_summary (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_emissions numeric NOT NULL DEFAULT 0,
  watering_emissions numeric DEFAULT 0,
  fertilizer_emissions numeric DEFAULT 0,
  sensor_emissions numeric DEFAULT 0,
  maintenance_emissions numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carbon_footprint_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own carbon summary"
ON public.carbon_footprint_summary
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own carbon summary"
ON public.carbon_footprint_summary
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carbon summary"
ON public.carbon_footprint_summary
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_carbon_footprint_summary_updated_at
BEFORE UPDATE ON public.carbon_footprint_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_carbon_activities_user_id ON public.carbon_activities(user_id);
CREATE INDEX idx_carbon_activities_created_at ON public.carbon_activities(created_at);
CREATE INDEX idx_carbon_footprint_summary_user_id ON public.carbon_footprint_summary(user_id);
CREATE INDEX idx_carbon_footprint_summary_period ON public.carbon_footprint_summary(period_start, period_end);