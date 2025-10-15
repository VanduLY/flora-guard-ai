-- Add avatar_url and username to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create weather_cache table for storing location-based weather
CREATE TABLE IF NOT EXISTS public.weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  weather_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(latitude, longitude)
);

ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read weather cache
CREATE POLICY "Anyone can read weather cache"
ON public.weather_cache
FOR SELECT
USING (true);

-- Only authenticated users can insert/update weather cache
CREATE POLICY "Authenticated users can insert weather cache"
ON public.weather_cache
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update weather cache"
ON public.weather_cache
FOR UPDATE
TO authenticated
USING (true);