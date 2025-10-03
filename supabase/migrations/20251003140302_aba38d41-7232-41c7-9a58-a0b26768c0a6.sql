-- Create plant_diseases table for disease information database
CREATE TABLE IF NOT EXISTS public.plant_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  description TEXT,
  symptoms TEXT[],
  treatment TEXT[],
  prevention TEXT[],
  affected_plants TEXT[],
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plant_scans table for scan history
CREATE TABLE IF NOT EXISTS public.plant_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  plant_type TEXT,
  health_status TEXT NOT NULL CHECK (health_status IN ('healthy', 'diseased', 'unknown')),
  disease_detected TEXT,
  confidence_score DECIMAL(5,2),
  diagnosis TEXT,
  recommendations TEXT[],
  weather_data JSONB,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plant_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plant_diseases (public read, admin write)
CREATE POLICY "Anyone can view plant diseases"
  ON public.plant_diseases FOR SELECT
  USING (true);

-- RLS Policies for plant_scans (users can only see their own scans)
CREATE POLICY "Users can view their own scans"
  ON public.plant_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans"
  ON public.plant_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans"
  ON public.plant_scans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
  ON public.plant_scans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-images', 'plant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for plant images
CREATE POLICY "Anyone can view plant images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-images');

CREATE POLICY "Authenticated users can upload plant images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'plant-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own plant images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'plant-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own plant images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'plant-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert common plant diseases into the database
INSERT INTO public.plant_diseases (name, scientific_name, description, symptoms, treatment, prevention, affected_plants, severity) VALUES
('Tomato Early Blight', 'Alternaria solani', 'A fungal disease causing leaf spots and defoliation', 
  ARRAY['Dark brown spots with concentric rings on older leaves', 'Yellowing around spots', 'Leaf drop'], 
  ARRAY['Remove affected leaves', 'Apply copper-based fungicide', 'Improve air circulation', 'Water at base of plant'], 
  ARRAY['Rotate crops annually', 'Use disease-resistant varieties', 'Mulch to prevent soil splash', 'Space plants properly'],
  ARRAY['Tomato', 'Potato', 'Eggplant'],
  'medium'),

('Tomato Late Blight', 'Phytophthora infestans', 'Devastating fungal disease that can destroy entire crops', 
  ARRAY['Water-soaked spots on leaves', 'White fuzzy growth on undersides', 'Brown lesions on stems', 'Rapid plant decay'], 
  ARRAY['Remove and destroy infected plants immediately', 'Apply fungicide preventatively', 'Avoid overhead watering'], 
  ARRAY['Plant resistant varieties', 'Ensure good drainage', 'Monitor weather conditions', 'Remove volunteer plants'],
  ARRAY['Tomato', 'Potato'],
  'critical'),

('Apple Scab', 'Venturia inaequalis', 'Fungal disease causing lesions on leaves and fruit', 
  ARRAY['Olive-green to brown spots on leaves', 'Velvety appearance', 'Scabby lesions on fruit', 'Premature leaf drop'], 
  ARRAY['Rake and destroy fallen leaves', 'Apply fungicide in spring', 'Prune for better air flow'], 
  ARRAY['Choose resistant varieties', 'Remove infected debris', 'Space trees properly', 'Apply preventative fungicide'],
  ARRAY['Apple', 'Crabapple'],
  'high'),

('Powdery Mildew', 'Various species', 'Common fungal disease appearing as white powder on leaves', 
  ARRAY['White powdery coating on leaves', 'Distorted or stunted growth', 'Yellowing leaves', 'Reduced flowering'], 
  ARRAY['Apply neem oil or sulfur fungicide', 'Improve air circulation', 'Remove severely affected parts', 'Water early in day'], 
  ARRAY['Plant in full sun', 'Avoid overcrowding', 'Choose resistant varieties', 'Avoid excess nitrogen'],
  ARRAY['Roses', 'Cucurbits', 'Grapes', 'Many ornamentals'],
  'medium'),

('Bacterial Leaf Spot', 'Xanthomonas campestris', 'Bacterial infection causing water-soaked lesions', 
  ARRAY['Small water-soaked spots', 'Yellow halos around spots', 'Leaf yellowing and drop', 'Fruit lesions'], 
  ARRAY['Remove infected leaves', 'Apply copper spray', 'Avoid overhead watering', 'Improve drainage'], 
  ARRAY['Use disease-free seeds', 'Practice crop rotation', 'Avoid working with wet plants', 'Sanitize tools'],
  ARRAY['Tomato', 'Pepper', 'Lettuce'],
  'high')
ON CONFLICT (name) DO NOTHING;