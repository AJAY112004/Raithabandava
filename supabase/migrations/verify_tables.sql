-- Verification Script: Check which marketplace tables exist
-- Run this in Supabase SQL Editor to see what's missing

-- Check if all required tables exist
SELECT 
  'user_profiles' as table_name,
  CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
UNION ALL
SELECT 'marketplace_listings', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'marketplace_listings') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'orders', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'order_items', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'cart_items', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cart_items') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'messages', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'reviews', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'wishlist', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wishlist') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'notifications', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'exchange_offers', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exchange_offers') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'exchange_responses', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exchange_responses') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'conversations', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'delivery_tracking', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'delivery_tracking') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'trust_badges', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trust_badges') THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'transaction_history', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transaction_history') THEN '✅ EXISTS' ELSE '❌ MISSING' END
ORDER BY table_name;

-- Summary
DO $$
DECLARE
  missing_count INT;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM (
    SELECT 'user_profiles' WHERE NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles')
    UNION ALL
    SELECT 'messages' WHERE NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages')
    UNION ALL
    SELECT 'orders' WHERE NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders')
    UNION ALL
    SELECT 'cart_items' WHERE NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cart_items')
  ) missing;
  
  IF missing_count > 0 THEN
    RAISE NOTICE '⚠️ WARNING: % critical tables are missing!', missing_count;
    RAISE NOTICE '📋 You need to run the main migration: 20251105_farmer_marketplace_enhanced.sql';
  ELSE
    RAISE NOTICE '✅ SUCCESS: All required tables exist!';
    RAISE NOTICE '🎉 You can now add mock data: 20251105_marketplace_mock_data.sql';
  END IF;
END $$;
