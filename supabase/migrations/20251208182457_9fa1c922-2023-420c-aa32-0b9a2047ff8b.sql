-- Clean up any existing rows with NULL user_id
DELETE FROM public.plant_scans WHERE user_id IS NULL;

-- Make user_id NOT NULL to prevent orphaned records
ALTER TABLE public.plant_scans ALTER COLUMN user_id SET NOT NULL;