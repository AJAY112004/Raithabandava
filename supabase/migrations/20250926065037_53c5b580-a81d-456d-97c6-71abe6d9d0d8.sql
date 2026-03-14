-- Create crop_plans table for user-specific crop planning
CREATE TABLE public.crop_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crop_type TEXT NOT NULL,
  soil_type TEXT,
  location TEXT,
  area NUMERIC,
  expected_yield NUMERIC,
  planting_date DATE,
  harvest_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'planted', 'growing', 'harvested')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_watchlist table for user-specific market price tracking
CREATE TABLE public.market_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crop_name TEXT NOT NULL,
  target_price NUMERIC,
  market_location TEXT,
  alert_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace_listings table for user products
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  quantity TEXT,
  location TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_locations table for weather tracking
CREATE TABLE public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_name TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crop_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for crop_plans
CREATE POLICY "Users can view their own crop plans"
ON public.crop_plans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crop plans"
ON public.crop_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crop plans"
ON public.crop_plans
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crop plans"
ON public.crop_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for market_watchlist
CREATE POLICY "Users can view their own watchlist"
ON public.market_watchlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlist items"
ON public.market_watchlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items"
ON public.market_watchlist
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items"
ON public.market_watchlist
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for marketplace_listings
CREATE POLICY "Users can view all active listings and their own listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON public.marketplace_listings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON public.marketplace_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for user_locations
CREATE POLICY "Users can view their own locations"
ON public.user_locations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own locations"
ON public.user_locations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
ON public.user_locations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
ON public.user_locations
FOR DELETE
USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_crop_plans_updated_at
BEFORE UPDATE ON public.crop_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_watchlist_updated_at
BEFORE UPDATE ON public.market_watchlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_locations_updated_at
BEFORE UPDATE ON public.user_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();