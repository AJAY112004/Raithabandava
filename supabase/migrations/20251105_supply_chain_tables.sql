-- Supply Chain Management Database Schema
-- Tables for products, orders, and shipments tracking

-- Products table for farmer inventory
CREATE TABLE IF NOT EXISTS public.supply_chain_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  farmer TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  harvest_date DATE NOT NULL,
  location TEXT NOT NULL,
  quality TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'ordered', 'sold')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table for managing product orders
CREATE TABLE IF NOT EXISTS public.supply_chain_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.supply_chain_products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shipments table for tracking deliveries
CREATE TABLE IF NOT EXISTS public.supply_chain_shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.supply_chain_orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'in_transit', 'out_for_delivery', 'delivered')),
  current_location TEXT,
  estimated_delivery DATE,
  tracking_notes TEXT,
  transporter TEXT,
  transporter_contact TEXT,
  vehicle_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.supply_chain_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_shipments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the migration)
DROP POLICY IF EXISTS "Users can view all products" ON public.supply_chain_products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.supply_chain_products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.supply_chain_products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.supply_chain_products;

DROP POLICY IF EXISTS "Users can view all orders" ON public.supply_chain_orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.supply_chain_orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.supply_chain_orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.supply_chain_orders;

DROP POLICY IF EXISTS "Users can view all shipments" ON public.supply_chain_shipments;
DROP POLICY IF EXISTS "Users can insert their own shipments" ON public.supply_chain_shipments;
DROP POLICY IF EXISTS "Users can update their own shipments" ON public.supply_chain_shipments;
DROP POLICY IF EXISTS "Users can delete their own shipments" ON public.supply_chain_shipments;

-- RLS Policies for products
CREATE POLICY "Users can view all products"
ON public.supply_chain_products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own products"
ON public.supply_chain_products FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update any product (for inventory management when orders are placed)
CREATE POLICY "Users can update their own products"
ON public.supply_chain_products FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete their own products"
ON public.supply_chain_products FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view all orders"
ON public.supply_chain_orders FOR SELECT
TO authenticated
USING (true);

-- Allow any authenticated user to create orders (retailers ordering from farmers)
CREATE POLICY "Users can insert their own orders"
ON public.supply_chain_orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON public.supply_chain_orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
ON public.supply_chain_orders FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for shipments
CREATE POLICY "Users can view all shipments"
ON public.supply_chain_shipments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own shipments"
ON public.supply_chain_shipments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipments"
ON public.supply_chain_shipments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shipments"
ON public.supply_chain_shipments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_supply_chain_products_user_id ON public.supply_chain_products(user_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_products_status ON public.supply_chain_products(status);
CREATE INDEX IF NOT EXISTS idx_supply_chain_orders_user_id ON public.supply_chain_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_orders_product_id ON public.supply_chain_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_shipments_user_id ON public.supply_chain_shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_shipments_order_id ON public.supply_chain_shipments(order_id);
