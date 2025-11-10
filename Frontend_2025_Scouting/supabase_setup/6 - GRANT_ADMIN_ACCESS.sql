-- ============================================================================
-- GRANT ADMIN ACCESS BY EMAIL
-- ============================================================================
-- This script grants admin access to a user account by email address
-- Usage: Replace 'user@example.com' with the actual user email
--
-- Schema Reference: Frontend_2025_Scouting/supabase_setup/2 - CREATE_CLEAN_SCHEMA.sql
-- Table: user_profiles (lines 93-111)
-- ============================================================================

-- ============================================================================
-- METHOD 1: Grant admin access by email (recommended)
-- ============================================================================

-- Replace 'user@example.com' with the actual email address
UPDATE user_profiles
SET is_admin = TRUE,
    updated_at = NOW()
WHERE email = 'user@example.com';

-- Verify the update
SELECT
    id,
    email,
    display_name,
    team_number,
    is_admin,
    default_regional,
    created_at,
    last_login,
    updated_at
FROM user_profiles
WHERE email = 'user@example.com';

-- ============================================================================
-- METHOD 2: Grant admin access by user ID (if you know the UUID)
-- ============================================================================

-- Uncomment and replace with actual UUID if needed
-- UPDATE user_profiles
-- SET is_admin = true,
--     updated_at = NOW()
-- WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

-- ============================================================================
-- REVOKE ADMIN ACCESS (if needed)
-- ============================================================================

-- To remove admin access from a user:
-- UPDATE user_profiles
-- SET is_admin = FALSE,
--     updated_at = NOW()
-- WHERE email = 'user@example.com';

-- ============================================================================
-- BULK OPERATIONS (if needed)
-- ============================================================================

-- Grant admin to multiple users at once:
-- UPDATE user_profiles
-- SET is_admin = TRUE,
--     updated_at = NOW()
-- WHERE email IN (
--     'admin1@example.com',
--     'admin2@example.com',
--     'admin3@example.com'
-- );

-- Grant admin to all users from a specific team:
-- UPDATE user_profiles
-- SET is_admin = TRUE,
--     updated_at = NOW()
-- WHERE team_number = 589;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- List all admin users
SELECT
    id,
    email,
    display_name,
    team_number,
    is_admin,
    default_regional,
    created_at,
    last_login
FROM user_profiles
WHERE is_admin = TRUE
ORDER BY email;

-- Count admin vs regular users
SELECT
    is_admin,
    COUNT(*) AS user_count
FROM user_profiles
GROUP BY is_admin
ORDER BY is_admin DESC;

-- Show recent admin grants (users who became admin in last 7 days)
SELECT
    id,
    email,
    display_name,
    team_number,
    default_regional,
    updated_at AS admin_granted_at
FROM user_profiles
WHERE is_admin = TRUE
  AND updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- What this script does:
-- - Updates the is_admin flag for a user profile
-- - Sets updated_at timestamp to track when admin was granted
-- - Provides verification queries to confirm the change
--
-- Security considerations:
-- - Only database administrators should run this script
-- - Admin users have elevated privileges including:
--   * View all user profiles
--   * Update any user profile
--   * Access admin-only pages/features
--
-- Important:
-- - The user must already exist (have signed up through the app)
-- - If the email doesn't exist, the UPDATE will affect 0 rows
-- - Check verification query to confirm success
--
-- ============================================================================
