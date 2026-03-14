-- Add columns to store complete AI-generated disease detection results
-- This migration adds fields for storing detailed analysis information

ALTER TABLE public.crop_disease_detections
ADD COLUMN IF NOT EXISTS affected_area_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS primary_symptoms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS immediate_action TEXT,
ADD COLUMN IF NOT EXISTS systemic_treatment TEXT,
ADD COLUMN IF NOT EXISTS cultural_practices TEXT,
ADD COLUMN IF NOT EXISTS organic_alternatives TEXT,
ADD COLUMN IF NOT EXISTS prevention_measures TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS analysis_method TEXT DEFAULT 'ai_powered',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS disease_scientific_name TEXT,
ADD COLUMN IF NOT EXISTS disease_common_symptoms TEXT[],
ADD COLUMN IF NOT EXISTS affected_crops TEXT[],
ADD COLUMN IF NOT EXISTS severity_explanation TEXT;

-- Add comment to describe the table
COMMENT ON TABLE public.crop_disease_detections IS 'Stores complete disease detection analysis results including AI-generated recommendations';

-- Add comments for new columns
COMMENT ON COLUMN public.crop_disease_detections.affected_area_percentage IS 'Percentage of crop area affected by disease (0-100)';
COMMENT ON COLUMN public.crop_disease_detections.primary_symptoms IS 'Array of primary symptoms observed';
COMMENT ON COLUMN public.crop_disease_detections.immediate_action IS 'Immediate actions to take';
COMMENT ON COLUMN public.crop_disease_detections.systemic_treatment IS 'Systemic treatment recommendations';
COMMENT ON COLUMN public.crop_disease_detections.cultural_practices IS 'Cultural practices to implement';
COMMENT ON COLUMN public.crop_disease_detections.organic_alternatives IS 'Organic treatment alternatives';
COMMENT ON COLUMN public.crop_disease_detections.prevention_measures IS 'Prevention measures for future';
COMMENT ON COLUMN public.crop_disease_detections.additional_notes IS 'Additional notes from AI analysis';
COMMENT ON COLUMN public.crop_disease_detections.analysis_method IS 'Method used: ai_powered, intelligent_demo, etc';
COMMENT ON COLUMN public.crop_disease_detections.location IS 'Location where detection was performed';
COMMENT ON COLUMN public.crop_disease_detections.disease_scientific_name IS 'Scientific name of the disease';
COMMENT ON COLUMN public.crop_disease_detections.disease_common_symptoms IS 'Common symptoms of this disease';
COMMENT ON COLUMN public.crop_disease_detections.affected_crops IS 'List of crops commonly affected by this disease';
COMMENT ON COLUMN public.crop_disease_detections.severity_explanation IS 'Explanation of severity level';
