-- ============================================================================
-- CREATE AUTH TRIGGER
-- ============================================================================
-- Purpose: Automatically create user_profiles entry when a new user signs up
--
-- This trigger runs on the auth.users table (managed by Supabase)
-- and creates a corresponding entry in the public.user_profiles table.
--
-- Run this AFTER creating the main schema with CREATE_CLEAN_SCHEMA.sql
-- ============================================================================

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Verify the trigger was created
SELECT
    trigger_name,
    event_object_schema,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Expected output:
-- trigger_name: on_auth_user_created
-- event_object_schema: auth
-- event_object_table: users
-- action_statement: EXECUTE FUNCTION create_user_profile()

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- To test the trigger:
-- 1. Sign up a new user in your app
-- 2. Run this query to verify the profile was created:
--
-- SELECT id, email, display_name, is_admin
-- FROM user_profiles
-- ORDER BY created_at DESC
-- LIMIT 5;
--
-- You should see the new user with a profile automatically created.
-- ============================================================================
