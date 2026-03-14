-- Enhanced Farmer-to-Farmer Marketplace System
-- This migration enhances the marketplace with complete farmer collaboration features
-- Including: product listings, orders, exchanges, communication, reviews, and trust system

-- ============================================
-- STEP 1: CREATE BASE TABLES FIRST
-- ============================================

-- User profiles table for extended farmer information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  village TEXT,
  district TEXT,
  state TEXT DEFAULT 'Karnataka',
  pin_code TEXT,
  farm_size NUMERIC,
  farming_experience INTEGER,
  specializations TEXT[], -- Array of farming specializations
  bio TEXT,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table for managing marketplace transactions
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order items table for individual products in an order
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Messages table for buyer-seller communication
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_read BOOLEAN DEFAULT false,
  attachments TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews table for product and seller ratings
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_type TEXT DEFAULT 'seller' CHECK (review_type IN ('seller', 'product', 'transaction')),
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wishlist table for saved products
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Notifications table for user alerts (if not exists from other migration)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'order_placed', 'order_confirmed', 'order_shipped', 'order_delivered', 'product_low_stock', 'product_sold_out')),
  related_id UUID, -- Can reference orders, messages, etc.
  related_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 2: DROP EXISTING POLICIES (for idempotency)
-- ============================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can update order status" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Order items are created with orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Everyone can view open exchange offers" ON public.exchange_offers;
DROP POLICY IF EXISTS "Users can create their own exchange offers" ON public.exchange_offers;
DROP POLICY IF EXISTS "Users can update their own exchange offers" ON public.exchange_offers;
DROP POLICY IF EXISTS "Users can view responses to their offers or their own responses" ON public.exchange_responses;
DROP POLICY IF EXISTS "Users can create exchange responses" ON public.exchange_responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON public.exchange_responses;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view delivery tracking for their orders" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Sellers can update delivery tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Trust badges are viewable by everyone" ON public.trust_badges;
DROP POLICY IF EXISTS "Users can view their own transaction history" ON public.transaction_history;

-- ============================================
-- STEP 3: CREATE ENHANCED TABLES
-- ============================================

-- ============================================
-- STEP 3: CREATE ENHANCED TABLES
-- ============================================

-- Barter/Exchange Offers table for farmer-to-farmer resource sharing
CREATE TABLE IF NOT EXISTS public.exchange_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offered_listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  offered_quantity NUMERIC NOT NULL,
  requested_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  requested_item_name TEXT NOT NULL, -- In case specific listing doesn't exist yet
  requested_quantity NUMERIC NOT NULL,
  requested_category TEXT,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'negotiating', 'accepted', 'completed', 'rejected', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exchange Responses table for responding to exchange offers
CREATE TABLE IF NOT EXISTS public.exchange_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exchange_offer_id UUID NOT NULL REFERENCES public.exchange_offers(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offered_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  offered_quantity NUMERIC NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversations table for managing chat threads
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  exchange_offer_id UUID REFERENCES public.exchange_offers(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Delivery tracking table for order shipments
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed')),
  current_location TEXT,
  estimated_delivery DATE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  delivery_notes TEXT,
  tracking_updates JSONB[], -- Array of status updates with timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trust and Verification table
CREATE TABLE IF NOT EXISTS public.trust_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('verified_farmer', 'trusted_seller', 'quality_assured', 'fast_shipper', 'eco_friendly', 'top_rated')),
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT,
  UNIQUE(user_id, badge_type)
);

-- Transaction history for analytics
CREATE TABLE IF NOT EXISTS public.transaction_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  exchange_offer_id UUID REFERENCES public.exchange_offers(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'exchange', 'refund')),
  amount NUMERIC,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

-- RLS Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.user_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status"
ON public.orders FOR UPDATE
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for their orders"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

CREATE POLICY "Order items are created with orders"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.buyer_id = auth.uid()
  )
);

-- RLS Policies for cart_items
CREATE POLICY "Users can manage their own cart"
ON public.cart_items FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = reviewer_id);

-- RLS Policies for wishlist
CREATE POLICY "Users can manage their own wishlist"
ON public.wishlist FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for exchange_offers
CREATE POLICY "Everyone can view open exchange offers"
ON public.exchange_offers FOR SELECT
USING (true);

CREATE POLICY "Users can create their own exchange offers"
ON public.exchange_offers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exchange offers"
ON public.exchange_offers FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for exchange_responses
CREATE POLICY "Users can view responses to their offers or their own responses"
ON public.exchange_responses FOR SELECT
USING (
  auth.uid() = responder_id OR
  EXISTS (
    SELECT 1 FROM public.exchange_offers 
    WHERE exchange_offers.id = exchange_responses.exchange_offer_id 
    AND exchange_offers.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create exchange responses"
ON public.exchange_responses FOR INSERT
WITH CHECK (auth.uid() = responder_id);

CREATE POLICY "Users can update their own responses"
ON public.exchange_responses FOR UPDATE
USING (auth.uid() = responder_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update their own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- RLS Policies for delivery_tracking
CREATE POLICY "Users can view delivery tracking for their orders"
ON public.delivery_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = delivery_tracking.order_id 
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

CREATE POLICY "Sellers can update delivery tracking"
ON public.delivery_tracking FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = delivery_tracking.order_id 
    AND orders.seller_id = auth.uid()
  )
);

-- RLS Policies for trust_badges
CREATE POLICY "Trust badges are viewable by everyone"
ON public.trust_badges FOR SELECT
USING (true);

-- RLS Policies for transaction_history
CREATE POLICY "Users can view their own transaction history"
ON public.transaction_history FOR SELECT
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exchange_offers_user_id ON public.exchange_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_offers_status ON public.exchange_offers(status);
CREATE INDEX IF NOT EXISTS idx_exchange_responses_offer_id ON public.exchange_responses(exchange_offer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON public.delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_trust_badges_user_id ON public.trust_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_user_id ON public.transaction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id);

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger for auto-generating order numbers
DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();

-- Function to update user rating after review
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    rating = (
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM public.reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    updated_at = NOW()
  WHERE user_id = NEW.reviewed_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings automatically
DROP TRIGGER IF EXISTS update_rating_on_review ON public.reviews;
CREATE TRIGGER update_rating_on_review
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_marketplace_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update listing stock after order
CREATE OR REPLACE FUNCTION update_listing_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update marketplace_listings quantity
  UPDATE public.marketplace_listings
  SET 
    quantity = GREATEST(0, CAST(quantity AS NUMERIC) - NEW.quantity)::TEXT,
    status = CASE 
      WHEN CAST(quantity AS NUMERIC) - NEW.quantity <= 0 THEN 'sold'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.listing_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock after order item creation
DROP TRIGGER IF EXISTS update_stock_on_order ON public.order_items;
CREATE TRIGGER update_stock_on_order
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION update_listing_stock();

-- Function to update last message timestamp in conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE (participant1_id = NEW.sender_id AND participant2_id = NEW.receiver_id)
     OR (participant1_id = NEW.receiver_id AND participant2_id = NEW.sender_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
DROP TRIGGER IF EXISTS update_conversation_on_message ON public.messages;
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_exchange_offers_updated_at ON public.exchange_offers;
CREATE TRIGGER update_exchange_offers_updated_at
BEFORE UPDATE ON public.exchange_offers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exchange_responses_updated_at ON public.exchange_responses;
CREATE TRIGGER update_exchange_responses_updated_at
BEFORE UPDATE ON public.exchange_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_tracking_updated_at ON public.delivery_tracking;
CREATE TRIGGER update_delivery_tracking_updated_at
BEFORE UPDATE ON public.delivery_tracking
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
