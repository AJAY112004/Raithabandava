-- Fix infinite recursion in RLS policies for profiles table
-- This happens when policies reference the same table they're protecting

-- Drop existing problematic policies on profiles if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Enable read access for users to their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Enable insert for users to create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure crop_disease_detections policies are simple
DROP POLICY IF EXISTS "Users can view their own detections" ON public.crop_disease_detections;
DROP POLICY IF EXISTS "Users can create their own detections" ON public.crop_disease_detections;
DROP POLICY IF EXISTS "Users can update their own detections" ON public.crop_disease_detections;
DROP POLICY IF EXISTS "Users can delete their own detections" ON public.crop_disease_detections;
DROP POLICY IF EXISTS "Admins can view all detections" ON public.crop_disease_detections;
DROP POLICY IF EXISTS "Admins can update all detections" ON public.crop_disease_detections;

-- Recreate simple policies for crop_disease_detections
CREATE POLICY "Enable read access for users to their own detections"
ON public.crop_disease_detections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users"
ON public.crop_disease_detections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users to their own detections"
ON public.crop_disease_detections
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users to their own detections"
ON public.crop_disease_detections
FOR DELETE
USING (auth.uid() = user_id);
