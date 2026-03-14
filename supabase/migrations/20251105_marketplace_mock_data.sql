-- Mock Data for Farmer-to-Farmer Marketplace
-- This adds sample products, profiles, and marketplace activity for testing

-- Note: This assumes you have at least one authenticated user in auth.users
-- Replace the user_id values below with actual user IDs from your auth.users table if needed

-- First, let's create some sample user profiles (using existing auth users)
-- You'll need to replace these UUIDs with actual user IDs from your auth.users table

-- Insert sample marketplace listings (products)
-- These will use the user_id from whoever is currently logged in

-- Sample Products for Different Categories
INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Organic Tomatoes',
  'Fresh organic tomatoes grown without pesticides. Perfect for salads and cooking. Rich in vitamins and antioxidants.',
  'vegetables',
  45.00,
  '500',
  'kg',
  'Mandya District, Karnataka',
  'https://images.unsplash.com/photo-1546470427-227b80a6fb39?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Fresh Milk',
  'Pure cow milk from our farm. No preservatives or additives. Delivered fresh daily.',
  'dairy',
  55.00,
  '200',
  'liters',
  'Mysuru District, Karnataka',
  'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Basmati Rice',
  'Premium quality Basmati rice. Aged for perfect aroma and taste. Export quality grains.',
  'grains',
  80.00,
  '1000',
  'kg',
  'Davangere District, Karnataka',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Farm Fresh Eggs',
  'Free-range chicken eggs. Hens fed with natural grains. No hormones or antibiotics.',
  'dairy',
  6.00,
  '500',
  'dozen',
  'Hassan District, Karnataka',
  'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Red Onions',
  'Quality red onions. Good storage life. Ideal for wholesale and retail.',
  'vegetables',
  35.00,
  '800',
  'kg',
  'Chitradurga District, Karnataka',
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Alphonso Mangoes',
  'Premium Alphonso mangoes. Sweet and juicy. Limited seasonal availability.',
  'fruits',
  150.00,
  '200',
  'kg',
  'Belgaum District, Karnataka',
  'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Organic Turmeric Powder',
  'Pure organic turmeric powder. High curcumin content. Traditional stone-ground.',
  'spices',
  250.00,
  '100',
  'kg',
  'Tumkur District, Karnataka',
  'https://images.unsplash.com/photo-1615485500834-bc10199bc743?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Fresh Cabbage',
  'Green cabbage heads. Freshly harvested. Great for salads and cooking.',
  'vegetables',
  20.00,
  '300',
  'kg',
  'Kolar District, Karnataka',
  'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Coconut Oil',
  'Pure cold-pressed coconut oil. No chemicals. Traditional extraction method.',
  'oils',
  180.00,
  '150',
  'liters',
  'Udupi District, Karnataka',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Fresh Spinach',
  'Organic spinach leaves. Rich in iron and vitamins. Pesticide-free.',
  'vegetables',
  30.00,
  '100',
  'kg',
  'Bangalore Rural, Karnataka',
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Cardamom',
  'Premium green cardamom. Strong aroma. Organically grown in Western Ghats.',
  'spices',
  1200.00,
  '50',
  'kg',
  'Chikmagalur District, Karnataka',
  'https://images.unsplash.com/photo-1596040033229-a0b70b1e4c55?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Fresh Beetroot',
  'Red beetroots. High in nutrients. Great for juices and salads.',
  'vegetables',
  40.00,
  '250',
  'kg',
  'Mandya District, Karnataka',
  'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Ragi Flour',
  'Nutritious finger millet flour. Rich in calcium. Traditionally stone-ground.',
  'grains',
  60.00,
  '500',
  'kg',
  'Raichur District, Karnataka',
  'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Fresh Carrots',
  'Orange carrots. Crunchy and sweet. High in beta-carotene.',
  'vegetables',
  35.00,
  '400',
  'kg',
  'Hassan District, Karnataka',
  'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Honey',
  'Pure raw honey from forest flowers. No additives. Natural enzymes intact.',
  'others',
  350.00,
  '80',
  'kg',
  'Shimoga District, Karnataka',
  'https://images.unsplash.com/photo-1587049352846-4a222e784988?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Green Chillies',
  'Hot and fresh green chillies. Perfect for Indian cooking.',
  'vegetables',
  80.00,
  '150',
  'kg',
  'Gulbarga District, Karnataka',
  'https://images.unsplash.com/photo-1583032015370-0c43c7f58a56?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Fresh Coriander Leaves',
  'Aromatic coriander leaves. Freshly harvested. Essential for Indian cuisine.',
  'vegetables',
  40.00,
  '100',
  'kg',
  'Mysuru District, Karnataka',
  'https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Black Pepper',
  'Organic black pepper. Strong flavor. Sun-dried naturally.',
  'spices',
  500.00,
  '100',
  'kg',
  'Kodagu District, Karnataka',
  'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Fresh Potatoes',
  'Quality potatoes. Good for all types of cooking. Long shelf life.',
  'vegetables',
  25.00,
  '1000',
  'kg',
  'Kolar District, Karnataka',
  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_listings (title, description, category, price, quantity, unit, location, image_url, status, user_id)
SELECT 
  'Groundnut Oil',
  'Cold-pressed groundnut oil. Rich in nutrients. No preservatives.',
  'oils',
  160.00,
  '200',
  'liters',
  'Davangere District, Karnataka',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
  'active',
  id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add some sample reviews (optional - uncomment if you want sample reviews)
-- Note: Replace user IDs with actual IDs from your auth.users table

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Mock marketplace data inserted successfully!';
  RAISE NOTICE 'Added 20 sample product listings across various categories.';
  RAISE NOTICE 'Categories include: vegetables, dairy, grains, fruits, spices, oils, and others.';
END $$;
