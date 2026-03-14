-- Create market_prices_cache table for caching live market price data
CREATE TABLE IF NOT EXISTS market_prices_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  crop text NOT NULL,
  currentprice numeric NOT NULL,
  previousprice numeric NOT NULL,
  market text NOT NULL,
  unit text NOT NULL,
  trend text NOT NULL CHECK (trend IN ('up', 'down')),
  change numeric NOT NULL,
  demand text NOT NULL CHECK (demand IN ('high', 'medium', 'low')),
  quality text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  cached_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_crop_market_date UNIQUE (crop, market, DATE(updated_at))
);

-- Create index for faster queries
CREATE INDEX idx_market_prices_cache_updated_at ON market_prices_cache(updated_at DESC);
CREATE INDEX idx_market_prices_cache_crop ON market_prices_cache(crop);
CREATE INDEX idx_market_prices_cache_market ON market_prices_cache(market);

-- Enable Row Level Security
ALTER TABLE market_prices_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read market data
CREATE POLICY "Users can read market prices cache"
ON market_prices_cache FOR SELECT
TO authenticated
USING (true);

-- Create policy for service role to manage cache data
CREATE POLICY "Service role can manage market prices cache"
ON market_prices_cache FOR ALL
TO service_role
USING (true);
