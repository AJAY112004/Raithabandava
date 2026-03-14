-- Add payment columns to supply_chain_orders table
-- This migration adds support for storing payment information in supply chain orders

-- Add payment columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'supply_chain_orders' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.supply_chain_orders ADD COLUMN payment_method TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'supply_chain_orders' 
    AND column_name = 'payment_method_details'
  ) THEN
    ALTER TABLE public.supply_chain_orders ADD COLUMN payment_method_details JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'supply_chain_orders' 
    AND column_name = 'payment_transaction_id'
  ) THEN
    ALTER TABLE public.supply_chain_orders ADD COLUMN payment_transaction_id TEXT;
  END IF;
END $$;

-- Add index for faster payment transaction lookups
CREATE INDEX IF NOT EXISTS idx_supply_chain_orders_payment_transaction_id 
ON public.supply_chain_orders(payment_transaction_id);

-- Add comments to document the columns
COMMENT ON COLUMN public.supply_chain_orders.payment_method IS 'Payment method used: upi, card, netbanking, or wallet';
COMMENT ON COLUMN public.supply_chain_orders.payment_method_details IS 'JSON object containing payment method specific details';
COMMENT ON COLUMN public.supply_chain_orders.payment_transaction_id IS 'Unique transaction ID generated during payment';
