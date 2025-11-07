-- ============================================================================
-- FRONTEND COMPATIBILITY MIGRATION
-- Team 589 Falkon Robotics - Fix Database for Frontend
-- ============================================================================
--
-- This script renames tables to match what the frontend expects
-- NO DATA LOSS - Just renaming tables!
--
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Changes:
-- 1. team_matches → reefscape_matches
-- 2. algae_actions → algae
-- 3. coral_actions → coral
--
-- Everything else stays the same!
-- ============================================================================

-- Check current state
SELECT '🔍 Checking current tables...' AS status;

SELECT
    table_name,
    CASE
        WHEN table_name = 'team_matches' THEN '→ Will rename to: reefscape_matches'
        WHEN table_name = 'algae_actions' THEN '→ Will rename to: algae'
        WHEN table_name = 'coral_actions' THEN '→ Will rename to: coral'
        WHEN table_name = 'robot_info' THEN '✓ Already correct'
        WHEN table_name = 'teams' THEN '✓ Already correct'
        ELSE '✓ No change needed'
    END as action
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name IN ('team_matches', 'algae_actions', 'coral_actions', 'robot_info', 'teams')
ORDER BY table_name;

-- ============================================================================
-- STEP 1: Rename team_matches → reefscape_matches
-- ============================================================================

SELECT '📝 Step 1: Renaming team_matches → reefscape_matches...' AS status;

-- Rename the table
ALTER TABLE IF EXISTS team_matches RENAME TO reefscape_matches;

-- Rename the indexes to match (only if they have old names)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_matches_regional') THEN
        ALTER INDEX idx_team_matches_regional RENAME TO idx_reefscape_matches_regional;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_matches_team') THEN
        ALTER INDEX idx_team_matches_team RENAME TO idx_reefscape_matches_team;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_matches_match') THEN
        ALTER INDEX idx_team_matches_match RENAME TO idx_reefscape_matches_match;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_matches_composite') THEN
        ALTER INDEX idx_team_matches_composite RENAME TO idx_reefscape_matches_composite;
    END IF;
END $$;

-- Rename the RLS policies
DO $$
BEGIN
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Team matches are publicly readable" ON reefscape_matches;
    DROP POLICY IF EXISTS "Service role can insert team matches" ON reefscape_matches;
    DROP POLICY IF EXISTS "Service role can update team matches" ON reefscape_matches;
    DROP POLICY IF EXISTS "Service role can delete team matches" ON reefscape_matches;

    -- Create new policies with clearer names
    CREATE POLICY "Reefscape matches are publicly readable"
        ON reefscape_matches FOR SELECT
        USING (true);

    CREATE POLICY "Service role can insert reefscape matches"
        ON reefscape_matches FOR INSERT
        WITH CHECK (true);

    CREATE POLICY "Service role can update reefscape matches"
        ON reefscape_matches FOR UPDATE
        USING (true);

    CREATE POLICY "Service role can delete reefscape matches"
        ON reefscape_matches FOR DELETE
        USING (true);
END $$;

SELECT '✅ team_matches renamed to reefscape_matches' AS step_1_status;

-- ============================================================================
-- STEP 2: Rename algae_actions → algae
-- ============================================================================

SELECT '📝 Step 2: Renaming algae_actions → algae...' AS status;

-- Rename the table
ALTER TABLE IF EXISTS algae_actions RENAME TO algae;

-- Note: Indexes already have correct names (idx_algae_*), no need to rename

-- Update RLS policies
DO $$
BEGIN
    -- Drop old policies
    DROP POLICY IF EXISTS "Algae actions are publicly readable" ON algae;
    DROP POLICY IF EXISTS "Service role can insert algae actions" ON algae;
    DROP POLICY IF EXISTS "Service role can update algae actions" ON algae;
    DROP POLICY IF EXISTS "Service role can delete algae actions" ON algae;

    -- Create new policies
    CREATE POLICY "Algae are publicly readable"
        ON algae FOR SELECT
        USING (true);

    CREATE POLICY "Service role can insert algae"
        ON algae FOR INSERT
        WITH CHECK (true);

    CREATE POLICY "Service role can update algae"
        ON algae FOR UPDATE
        USING (true);

    CREATE POLICY "Service role can delete algae"
        ON algae FOR DELETE
        USING (true);
END $$;

SELECT '✅ algae_actions renamed to algae' AS step_2_status;

-- ============================================================================
-- STEP 3: Rename coral_actions → coral
-- ============================================================================

SELECT '📝 Step 3: Renaming coral_actions → coral...' AS status;

-- Rename the table
ALTER TABLE IF EXISTS coral_actions RENAME TO coral;

-- Note: Indexes already have correct names (idx_coral_*), no need to rename

-- Update RLS policies
DO $$
BEGIN
    -- Drop old policies
    DROP POLICY IF EXISTS "Coral actions are publicly readable" ON coral;
    DROP POLICY IF EXISTS "Service role can insert coral actions" ON coral;
    DROP POLICY IF EXISTS "Service role can update coral actions" ON coral;
    DROP POLICY IF EXISTS "Service role can delete coral actions" ON coral;

    -- Create new policies
    CREATE POLICY "Coral are publicly readable"
        ON coral FOR SELECT
        USING (true);

    CREATE POLICY "Service role can insert coral"
        ON coral FOR INSERT
        WITH CHECK (true);

    CREATE POLICY "Service role can update coral"
        ON coral FOR UPDATE
        USING (true);

    CREATE POLICY "Service role can delete coral"
        ON coral FOR DELETE
        USING (true);
END $$;

SELECT '✅ coral_actions renamed to coral' AS step_3_status;

-- ============================================================================
-- STEP 4: Update Foreign Key Constraints
-- ============================================================================

SELECT '📝 Step 4: Updating foreign key constraints...' AS status;

-- Update foreign key constraint for algae table
ALTER TABLE IF EXISTS algae
    DROP CONSTRAINT IF EXISTS algae_actions_team_num_match_num_regional_fkey;

ALTER TABLE IF EXISTS algae
    ADD CONSTRAINT algae_team_match_fkey
    FOREIGN KEY (team_num, match_num, regional)
    REFERENCES reefscape_matches(team_num, match_num, regional)
    ON DELETE CASCADE;

-- Update foreign key constraint for coral table
ALTER TABLE IF EXISTS coral
    DROP CONSTRAINT IF EXISTS coral_actions_team_num_match_num_regional_fkey;

ALTER TABLE IF EXISTS coral
    ADD CONSTRAINT coral_team_match_fkey
    FOREIGN KEY (team_num, match_num, regional)
    REFERENCES reefscape_matches(team_num, match_num, regional)
    ON DELETE CASCADE;

SELECT '✅ Foreign key constraints updated' AS step_4_status;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS divider;
SELECT '🎉 MIGRATION COMPLETE!' AS status;
SELECT '═══════════════════════════════════════════════════════════════' AS divider;

-- Show final table names
SELECT '📊 Final table names:' AS info;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name IN ('reefscape_matches', 'algae', 'coral', 'robot_info', 'teams',
                       'robot_rankings', 'robot_coral_stats', 'robot_algae_stats', 'robot_climb_stats')
ORDER BY table_name;

-- Verify views still exist
SELECT '👁️  Views:' AS info;
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Show RLS status
SELECT '🔒 RLS Status:' AS info;
SELECT
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('reefscape_matches', 'algae', 'coral', 'robot_info', 'teams')
ORDER BY tablename;

-- Count policies
SELECT '🛡️  Policy Count:' AS info;
SELECT
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('reefscape_matches', 'algae', 'coral', 'robot_info', 'teams')
GROUP BY tablename
ORDER BY tablename;

-- Check data preservation
SELECT '📊 Data Counts:' AS info;
SELECT
    (SELECT COUNT(*) FROM reefscape_matches) as reefscape_matches_count,
    (SELECT COUNT(*) FROM algae) as algae_count,
    (SELECT COUNT(*) FROM coral) as coral_count,
    (SELECT COUNT(*) FROM robot_info) as robot_info_count,
    (SELECT COUNT(*) FROM teams) as teams_count;

SELECT '═══════════════════════════════════════════════════════════════' AS divider;
SELECT '✅ Frontend can now write to database!' AS next_step;
SELECT 'Next: Run verification script to test frontend compatibility' AS next_action;
SELECT 'Command: cd Backend_2025_Scouting/supabase_migration && node verify_frontend_compatibility.js' AS command;
SELECT '═══════════════════════════════════════════════════════════════' AS divider;
