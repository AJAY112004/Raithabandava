-- Migration: add knowledge_base table and seed sample rows
-- Run this in your Supabase SQL editor or via psql connected to the DB

CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  language text NOT NULL DEFAULT 'en',
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Seed sample entries (transform / adapt content from src/data/knowledge_base.json)
INSERT INTO public.knowledge_base (slug, language, data) VALUES
('tomato-blight', 'en', '{"title":"Tomato - Early Blight","tags":["disease","tomato","blight"],"content":{"description":"Early blight is caused by Alternaria solani and shows concentric rings on leaves.","symptoms":["dark circular lesions on lower leaves","yellowing of foliage","fruit lesions"],"recommendation":"Remove infected leaves, avoid overhead watering, apply a copper fungicide or recommended local fungicide following label rates. Rotate crops and practice sanitation."}}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.knowledge_base (slug, language, data) VALUES
('powdery-mildew', 'en', '{"title":"Powdery Mildew (general)","tags":["disease","fungus","powdery"],"content":{"description":"White powdery patches appear on leaves and stems; common on many vegetable and horticultural crops.","symptoms":["white powdery lesions","distorted growth","reduced yield"],"recommendation":"Improve airflow, avoid dense planting, apply sulfur or potassium bicarbonate sprays per label. Remove severely affected tissue."}}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.knowledge_base (slug, language, data) VALUES
('weather-advice', 'en', '{"title":"Weather-related Advice","tags":["weather","advice"],"content":{"description":"General guidelines for actions to take on heavy rainfall, drought, or frost alerts.","actions":{"heavy_rain":"Ensure good drainage, secure young plants, delay pesticide application until fields dry.","drought":"Mulch to conserve soil moisture, irrigate at critical stages, consider drought-tolerant varieties.","frost":"Protective covers for high-value crops, delayed irrigation to reduce frost risk, consult local forecast for timing."}}}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.knowledge_base (slug, language, data) VALUES
('market-pricing-tips', 'en', '{"title":"Market Pricing & Selling Tips","tags":["market","pricing","sales"],"content":{"description":"Practical market advice for smallholder farmers","tips":["Harvest at the right maturity for best price","Grade produce and remove spoiled items","Bundle and pack neatly for buyers","Check multiple mandi/market prices before deciding where to sell"]}}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- You can add localized (kn, hi) versions by inserting rows with language='kn' or 'hi' and translated content in the data jsonb.
