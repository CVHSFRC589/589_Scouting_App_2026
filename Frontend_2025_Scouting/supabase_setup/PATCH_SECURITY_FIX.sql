-- ============================================================================
-- SECURITY PATCH: Fix Search Path Mutable Warnings
-- ============================================================================
-- Purpose: Update existing star functions to include SET search_path = ''
-- Target: Existing databases running schema v2.1.0
--
-- This script can be run on an existing database to fix Supabase security
-- warnings without needing to drop and recreate the entire schema.
--
-- WARNING: This script will temporarily replace the star functions.
--          Make sure no users are actively starring teams during execution.
--
-- Usage:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Create new query
--   3. Paste this entire script
--   4. Click "Run"
--   5. Verify success with verification queries at the end
--
-- Expected Duration: ~1 second
-- Impact: Zero downtime, fully backward compatible
-- ============================================================================

BEGIN;

-- ============================================================================
-- FUNCTION 9: toggle_user_star (SECURITY FIX)
-- ============================================================================

CREATE OR REPLACE FUNCTION toggle_user_star(
    p_team_number INTEGER,
    p_regional VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- SECURITY FIX: Prevent search path injection
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if star already exists
    SELECT EXISTS (
        SELECT 1 FROM public.user_team_stars
        WHERE user_id = auth.uid()
          AND team_number = p_team_number
          AND regional = p_regional
    ) INTO v_exists;

    IF v_exists THEN
        -- Remove star
        DELETE FROM public.user_team_stars
        WHERE user_id = auth.uid()
          AND team_number = p_team_number
          AND regional = p_regional;
        RETURN false;
    ELSE
        -- Add star
        INSERT INTO public.user_team_stars (user_id, team_number, regional)
        VALUES (auth.uid(), p_team_number, p_regional);
        RETURN true;
    END IF;
END;
$$;

COMMENT ON FUNCTION toggle_user_star IS 'Toggle user star - returns true if added, false if removed (SECURITY PATCHED)';

-- ============================================================================
-- FUNCTION 10: toggle_admin_star (SECURITY FIX)
-- ============================================================================

CREATE OR REPLACE FUNCTION toggle_admin_star(
    p_team_number INTEGER,
    p_regional VARCHAR,
    p_note TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- SECURITY FIX: Prevent search path injection
AS $$
DECLARE
    v_exists BOOLEAN;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT is_admin INTO v_is_admin
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only admins can toggle admin stars';
    END IF;

    -- Check if admin star already exists
    SELECT EXISTS (
        SELECT 1 FROM public.admin_team_stars
        WHERE team_number = p_team_number
          AND regional = p_regional
    ) INTO v_exists;

    IF v_exists THEN
        -- Remove admin star
        DELETE FROM public.admin_team_stars
        WHERE team_number = p_team_number
          AND regional = p_regional;
        RETURN false;
    ELSE
        -- Add admin star
        INSERT INTO public.admin_team_stars (team_number, regional, created_by, note)
        VALUES (p_team_number, p_regional, auth.uid(), p_note);
        RETURN true;
    END IF;
END;
$$;

COMMENT ON FUNCTION toggle_admin_star IS 'Toggle admin star - returns true if added, false if removed (admin only, SECURITY PATCHED)';

-- ============================================================================
-- FUNCTION 11: get_user_starred_teams (SECURITY FIX)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_starred_teams(
    p_regional VARCHAR
)
RETURNS INTEGER[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- SECURITY FIX: Prevent search path injection
AS $$
BEGIN
    RETURN ARRAY(
        SELECT team_number
        FROM public.user_team_stars
        WHERE user_id = auth.uid()
          AND regional = p_regional
        ORDER BY team_number
    );
END;
$$;

COMMENT ON FUNCTION get_user_starred_teams IS 'Get array of team numbers starred by current user (SECURITY PATCHED)';

-- ============================================================================
-- FUNCTION 12: get_admin_starred_teams (SECURITY FIX)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_admin_starred_teams(
    p_regional VARCHAR
)
RETURNS INTEGER[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- SECURITY FIX: Prevent search path injection
AS $$
BEGIN
    RETURN ARRAY(
        SELECT team_number
        FROM public.admin_team_stars
        WHERE regional = p_regional
        ORDER BY team_number
    );
END;
$$;

COMMENT ON FUNCTION get_admin_starred_teams IS 'Get array of admin-starred team numbers (visible to all, SECURITY PATCHED)';

-- ============================================================================
-- FUNCTION 13: check_user_star (SECURITY FIX)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_user_star(
    p_team_number INTEGER,
    p_regional VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- SECURITY FIX: Prevent search path injection
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_team_stars
        WHERE user_id = auth.uid()
          AND team_number = p_team_number
          AND regional = p_regional
    );
END;
$$;

COMMENT ON FUNCTION check_user_star IS 'Check if current user has starred a team (SECURITY PATCHED)';

-- ============================================================================
-- FUNCTION 14: check_admin_star (SECURITY FIX)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_admin_star(
    p_team_number INTEGER,
    p_regional VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- SECURITY FIX: Prevent search path injection
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_team_stars
        WHERE team_number = p_team_number
          AND regional = p_regional
    );
END;
$$;

COMMENT ON FUNCTION check_admin_star IS 'Check if a team has an admin star (SECURITY PATCHED)';

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that all functions were updated successfully
SELECT
    'All 6 star functions patched successfully!' as status,
    COUNT(*) as function_count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'toggle_user_star',
    'toggle_admin_star',
    'get_user_starred_teams',
    'get_admin_starred_teams',
    'check_user_star',
    'check_admin_star'
  )
  AND p.proconfig IS NOT NULL  -- Has configuration parameters (search_path)
HAVING COUNT(*) = 6;

-- Show function details with search_path settings
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as parameters,
    p.proconfig as configuration,
    CASE
        WHEN p.proconfig IS NOT NULL THEN '✅ SECURE (search_path set)'
        ELSE '⚠️ INSECURE (no search_path)'
    END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'toggle_user_star',
    'toggle_admin_star',
    'get_user_starred_teams',
    'get_admin_starred_teams',
    'check_user_star',
    'check_admin_star'
  )
ORDER BY p.proname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '
╔═══════════════════════════════════════════════════════════════════╗
║                     SECURITY PATCH APPLIED                        ║
╚═══════════════════════════════════════════════════════════════════╝

✅ All 6 star functions updated with SET search_path = ''''

Functions patched:
  • toggle_user_star()
  • toggle_admin_star()
  • get_user_starred_teams()
  • get_admin_starred_teams()
  • check_user_star()
  • check_admin_star()

Security improvements:
  ✓ SET search_path = '''' added to all functions
  ✓ All table references use explicit public. schema
  ✓ Protection against search path injection attacks
  ✓ Zero breaking changes - fully backward compatible

Next steps:
  1. Check verification queries above for ✅ SECURE status
  2. Test star functionality in your app
  3. Check Supabase Dashboard → Database → Linter
  4. Warnings should be resolved (may take a moment to refresh)

Your existing stars data is completely safe and unchanged!
';
END $$;

-- ============================================================================
-- OPTIONAL: Test Function Execution
-- ============================================================================

-- Uncomment to test that functions still work (replace with your test data):
/*
-- Test toggle_user_star (should work if you're authenticated)
-- SELECT toggle_user_star(589, 'Test Competition') as user_star_toggled;

-- Test get_user_starred_teams (should return empty array or your starred teams)
-- SELECT get_user_starred_teams('Test Competition') as my_starred_teams;

-- Test check_user_star (should return false if not starred)
-- SELECT check_user_star(589, 'Test Competition') as is_starred;
*/
