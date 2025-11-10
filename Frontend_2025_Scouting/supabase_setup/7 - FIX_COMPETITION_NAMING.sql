-- ============================================================================
-- FIX COMPETITION NAMING
-- ============================================================================
-- Purpose: Update existing data from 'tc' code to 'Test Competition' name
--
-- This fixes the mismatch where:
-- - Database has regional = 'tc' (competition code)
-- - Frontend expects regional = 'Test Competition' (competition name)
--
-- Run this if your leaderboard/homepage is showing no data after setup
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Update match_reports regional from 'tc' to 'Test Competition'
-- ============================================================================

UPDATE match_reports
SET regional = 'Test Competition'
WHERE regional = 'tc';

-- ============================================================================
-- STEP 2: Update pit_reports regional from 'tc' to 'Test Competition'
-- ============================================================================

UPDATE pit_reports
SET regional = 'Test Competition'
WHERE regional = 'tc';

-- ============================================================================
-- STEP 3: Update robot_stats regional from 'tc' to 'Test Competition'
-- ============================================================================

UPDATE robot_stats
SET regional = 'Test Competition'
WHERE regional = 'tc';

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show count of records for 'Test Competition'
SELECT 'match_reports' as table_name, COUNT(*) as record_count
FROM match_reports
WHERE regional = 'Test Competition'
UNION ALL
SELECT 'pit_reports', COUNT(*)
FROM pit_reports
WHERE regional = 'Test Competition'
UNION ALL
SELECT 'robot_stats', COUNT(*)
FROM robot_stats
WHERE regional = 'Test Competition';

-- Verify no 'tc' records remain
SELECT 'match_reports (tc)' as table_name, COUNT(*) as should_be_zero
FROM match_reports
WHERE regional = 'tc'
UNION ALL
SELECT 'pit_reports (tc)', COUNT(*)
FROM pit_reports
WHERE regional = 'tc'
UNION ALL
SELECT 'robot_stats (tc)', COUNT(*)
FROM robot_stats
WHERE regional = 'tc';

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Why this is needed:
-- - The database stores competition identifier in the 'regional' column
-- - Original scripts used 'tc' as a short code
-- - Frontend CompetitionContext expects full competition name
-- - App queries with 'Test Competition' but data was stored as 'tc'
-- - Result: No data shown in leaderboard/homepage
--
-- After running this script:
-- - All data will use 'Test Competition' as the regional value
-- - Frontend queries will find the data correctly
-- - Leaderboard and homepage will display properly
--
-- ============================================================================
