-- ============================================================================
-- DROP ALL PUBLIC SCHEMA OBJECTS
-- ============================================================================
-- Purpose: Completely wipe the public schema to prepare for clean rebuild
--
-- ⚠️ WARNING: THIS WILL DELETE ALL DATA AND SCHEMA OBJECTS!
--
-- Use this before running CREATE_CLEAN_SCHEMA.sql for a truly clean slate.
--
-- What this does:
-- 1. Drops all views
-- 2. Drops all tables (CASCADE removes dependent objects)
-- 3. Drops all functions
-- 4. Drops all sequences
-- 5. Drops all types (if any custom types exist)
--
-- What this preserves:
-- - auth schema (Supabase auth system)
-- - storage schema (Supabase storage)
-- - All other Supabase system schemas
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Drop all views
-- ============================================================================
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(view_record.table_name) || ' CASCADE';
        RAISE NOTICE 'Dropped view: %', view_record.table_name;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: Drop all tables
-- ============================================================================
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(table_record.table_name) || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', table_record.table_name;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: Drop all functions
-- ============================================================================
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT
            routine_name,
            string_agg(parameter_mode || ' ' || parameter_name || ' ' || p.data_type, ', ') as params
        FROM information_schema.routines r
        LEFT JOIN information_schema.parameters p
            ON r.specific_name = p.specific_name
        WHERE r.routine_schema = 'public'
        GROUP BY routine_name, r.specific_name
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(func_record.routine_name) || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.routine_name;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 4: Drop all sequences
-- ============================================================================
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(seq_record.sequence_name) || ' CASCADE';
        RAISE NOTICE 'Dropped sequence: %', seq_record.sequence_name;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 5: Drop all custom types (if any)
-- ============================================================================
DO $$
DECLARE
    type_record RECORD;
BEGIN
    FOR type_record IN
        SELECT typname
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        AND t.typtype = 'e' -- enum types
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(type_record.typname) || ' CASCADE';
        RAISE NOTICE 'Dropped type: %', type_record.typname;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 6: Drop auth trigger (if it exists)
-- ============================================================================
-- This trigger is on auth.users table and needs special handling
DO $$
BEGIN
    -- Try to drop the trigger on auth.users
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    RAISE NOTICE 'Dropped auth trigger: on_auth_user_created';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Auth trigger does not exist or cannot be dropped';
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION: Confirm public schema is empty
-- ============================================================================

SELECT 'Tables remaining:' as status, COUNT(*)::text as count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 'Views remaining:' as status, COUNT(*)::text as count
FROM information_schema.views
WHERE table_schema = 'public'

UNION ALL

SELECT 'Functions remaining:' as status, COUNT(DISTINCT routine_name)::text as count
FROM information_schema.routines
WHERE routine_schema = 'public'

UNION ALL

SELECT 'Sequences remaining:' as status, COUNT(*)::text as count
FROM information_schema.sequences
WHERE sequence_schema = 'public';

-- ============================================================================
-- EXPECTED OUTPUT:
-- All counts should be 0
-- ============================================================================

-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- 1. Verify all counts are 0 above
-- 2. Run CREATE_CLEAN_SCHEMA.sql to rebuild from scratch
-- 3. Recreate auth trigger via Supabase dashboard or SQL:
--    CREATE TRIGGER on_auth_user_created
--      AFTER INSERT ON auth.users
--      FOR EACH ROW
--      EXECUTE FUNCTION create_user_profile();
-- ============================================================================
