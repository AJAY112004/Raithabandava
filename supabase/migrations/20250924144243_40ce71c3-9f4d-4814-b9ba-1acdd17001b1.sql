-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Create enum for income categories
CREATE TYPE income_category AS ENUM ('crop_sales', 'subsidies', 'rentals', 'other');

-- Create enum for expense categories  
CREATE TYPE expense_category AS ENUM ('seeds', 'fertilizers', 'transport', 'labor', 'equipment', 'irrigation', 'other');

-- Create enum for disease severity levels
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create financial_transactions table
CREATE TABLE public.financial_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type transaction_type NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop_disease_detections table
CREATE TABLE public.crop_disease_detections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    crop_type TEXT,
    disease_name TEXT,
    severity severity_level,
    confidence_score DECIMAL(5,4),
    treatment_recommendations TEXT,
    detection_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_shared_with_expert BOOLEAN DEFAULT FALSE,
    expert_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_disease_detections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.financial_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.financial_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.financial_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for crop_disease_detections
CREATE POLICY "Users can view their own detections" 
ON public.crop_disease_detections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own detections" 
ON public.crop_disease_detections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detections" 
ON public.crop_disease_detections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own detections" 
ON public.crop_disease_detections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policies for crop_disease_detections (for expert access)
CREATE POLICY "Admins can view all detections" 
ON public.crop_disease_detections 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
));

CREATE POLICY "Admins can update all detections" 
ON public.crop_disease_detections 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crop_disease_detections_updated_at
BEFORE UPDATE ON public.crop_disease_detections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for crop images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crop-images', 'crop-images', false);

-- Create storage policies for crop images
CREATE POLICY "Users can view their own crop images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own crop images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own crop images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own crop images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins and experts can view all crop images
CREATE POLICY "Admins can view all crop images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'crop-images' AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
));