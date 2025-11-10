-- ============================================================================
-- LOAD TEST DATA
-- ============================================================================
-- Purpose: Load sample data for testing the scouting app
--
-- This creates:
-- - 5 sample teams (589, 254, 1114, 2056, 3310)
-- - Pit reports for each team
-- - 3 match reports per team
-- - Auto-calculated statistics
--
-- Use this to verify the database is working correctly
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 0: Clear existing test data for 'Test Competition' regional
-- ============================================================================

DELETE FROM match_reports WHERE regional = 'Test Competition';
DELETE FROM pit_reports WHERE regional = 'Test Competition';
DELETE FROM robot_stats WHERE regional = 'Test Competition';

-- ============================================================================
-- STEP 1: Insert Pit Reports (Robot Capabilities)
-- ============================================================================

INSERT INTO pit_reports (team_number, regional, vision_sys, drive_train, ground_intake, source_intake,
    l1_scoring, l2_scoring, l3_scoring, l4_scoring, can_remove, can_process, can_net,
    can_climb_deep, can_climb_shallow, comments)
VALUES
    (589, 'Test Competition', 'Yes', 'Swerve', true, true, true, true, true, false, true, true, false, true, true, 'Strong L1-L3 scorer, good algae processor'),
    (254, 'Test Competition', 'Yes', 'Swerve', true, false, true, true, true, true, true, false, true, true, false, 'Elite all-around robot, L4 capable'),
    (1114, 'Test Competition', 'No', 'Tank', true, true, true, true, false, false, true, true, true, true, true, 'Consistent L1-L2 scorer, excellent algae'),
    (2056, 'Test Competition', 'Yes', 'Swerve', true, true, true, true, true, false, false, true, false, false, true, 'Fast cycle times, solid scorer'),
    (3310, 'Test Competition', 'No', 'Wheel', false, true, true, false, false, false, true, false, false, true, false, 'Defense specialist, limited scoring');

-- ============================================================================
-- STEP 2: Insert Match Reports (Match Scouting Data)
-- ============================================================================

-- Team 589 - Good L2/L3 scorer
INSERT INTO match_reports (team_number, match_number, regional,
    auto_l1_scored, auto_l2_scored, auto_l3_scored, auto_l4_scored, auto_algae_scored,
    tele_l1_scored, tele_l2_scored, tele_l3_scored, tele_l4_scored, tele_algae_scored,
    total_l1_scored, total_l2_scored, total_l3_scored, total_l4_scored, total_algae_scored,
    algae_removed, algae_processed, climb_deep, climb_shallow, park, driver_rating)
VALUES
    (589, 1, 'Test Competition', 1, 1, 0, 0, 2, 2, 3, 2, 0, 8, 3, 4, 2, 0, 10, 3, 2, true, false, false, 4),
    (589, 2, 'Test Competition', 0, 1, 1, 0, 1, 3, 2, 3, 0, 7, 3, 3, 4, 0, 8, 2, 3, false, true, false, 5),
    (589, 3, 'Test Competition', 1, 2, 0, 0, 3, 1, 4, 1, 0, 9, 2, 6, 1, 0, 12, 4, 1, true, false, false, 4);

-- Team 254 - Elite all-around
INSERT INTO match_reports (team_number, match_number, regional,
    auto_l1_scored, auto_l2_scored, auto_l3_scored, auto_l4_scored, auto_algae_scored,
    tele_l1_scored, tele_l2_scored, tele_l3_scored, tele_l4_scored, tele_algae_scored,
    total_l1_scored, total_l2_scored, total_l3_scored, total_l4_scored, total_algae_scored,
    algae_removed, algae_processed, climb_deep, climb_shallow, park, driver_rating)
VALUES
    (254, 1, 'Test Competition', 2, 2, 1, 1, 3, 3, 4, 3, 2, 10, 5, 6, 4, 3, 13, 5, 0, true, false, false, 5),
    (254, 2, 'Test Competition', 1, 3, 2, 0, 2, 4, 3, 4, 1, 8, 5, 6, 6, 1, 10, 3, 1, true, false, false, 5),
    (254, 3, 'Test Competition', 2, 1, 1, 1, 4, 2, 5, 2, 3, 12, 4, 6, 3, 4, 16, 6, 2, true, false, false, 5);

-- Team 1114 - Consistent L1/L2 + Algae
INSERT INTO match_reports (team_number, match_number, regional,
    auto_l1_scored, auto_l2_scored, auto_l3_scored, auto_l4_scored, auto_algae_scored,
    tele_l1_scored, tele_l2_scored, tele_l3_scored, tele_l4_scored, tele_algae_scored,
    total_l1_scored, total_l2_scored, total_l3_scored, total_l4_scored, total_algae_scored,
    algae_removed, algae_processed, climb_deep, climb_shallow, park, driver_rating)
VALUES
    (1114, 1, 'Test Competition', 2, 1, 0, 0, 2, 4, 3, 0, 0, 9, 6, 4, 0, 0, 11, 5, 4, true, false, false, 4),
    (1114, 2, 'Test Competition', 1, 2, 0, 0, 3, 3, 4, 1, 0, 10, 4, 6, 1, 0, 13, 6, 3, false, true, false, 4),
    (1114, 3, 'Test Competition', 2, 1, 0, 0, 1, 5, 2, 0, 0, 8, 7, 3, 0, 0, 9, 4, 5, true, false, false, 3);

-- Team 2056 - Fast cycles
INSERT INTO match_reports (team_number, match_number, regional,
    auto_l1_scored, auto_l2_scored, auto_l3_scored, auto_l4_scored, auto_algae_scored,
    tele_l1_scored, tele_l2_scored, tele_l3_scored, tele_l4_scored, tele_algae_scored,
    total_l1_scored, total_l2_scored, total_l3_scored, total_l4_scored, total_algae_scored,
    algae_removed, algae_processed, climb_deep, climb_shallow, park, driver_rating)
VALUES
    (2056, 1, 'Test Competition', 1, 1, 1, 0, 2, 2, 3, 1, 0, 7, 3, 4, 2, 0, 9, 2, 1, false, true, false, 4),
    (2056, 2, 'Test Competition', 0, 2, 0, 0, 1, 4, 2, 2, 0, 6, 4, 4, 2, 0, 7, 1, 2, false, true, false, 3),
    (2056, 3, 'Test Competition', 1, 0, 1, 0, 3, 3, 3, 1, 0, 8, 4, 3, 2, 0, 11, 3, 0, true, false, false, 4);

-- Team 3310 - Defense specialist
INSERT INTO match_reports (team_number, match_number, regional,
    auto_l1_scored, auto_l2_scored, auto_l3_scored, auto_l4_scored, auto_algae_scored,
    tele_l1_scored, tele_l2_scored, tele_l3_scored, tele_l4_scored, tele_algae_scored,
    total_l1_scored, total_l2_scored, total_l3_scored, total_l4_scored, total_algae_scored,
    algae_removed, algae_processed, climb_deep, climb_shallow, park, defence, driver_rating)
VALUES
    (3310, 1, 'Test Competition', 0, 0, 0, 0, 1, 2, 0, 0, 0, 3, 2, 0, 0, 0, 4, 2, 0, true, false, false, true, 3),
    (3310, 2, 'Test Competition', 1, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 1, 0, 0, 2, 1, 1, false, true, false, true, 4),
    (3310, 3, 'Test Competition', 0, 0, 0, 0, 2, 3, 0, 0, 0, 4, 3, 0, 0, 0, 6, 3, 0, true, false, false, true, 3);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that pit reports were inserted
SELECT 'Pit Reports Created:' as status, COUNT(*) as count FROM pit_reports;
-- Expected: 5

-- Check that match reports were inserted
SELECT 'Match Reports Created:' as status, COUNT(*) as count FROM match_reports;
-- Expected: 15 (3 matches × 5 teams)

-- Check that robot_stats were auto-calculated by trigger
SELECT 'Robot Stats Auto-Created:' as status, COUNT(*) as count FROM robot_stats;
-- Expected: 5 (one per team)

-- Show the leaderboard
SELECT
    team_num,
    matches_played,
    avg_coral,
    avg_algae,
    avg_climb_deep,
    drive_train,
    vision_sys
FROM robots_complete
WHERE regional = 'Test Competition'
ORDER BY avg_coral DESC;

-- Expected leaderboard (approximately):
-- Team 254: ~15 coral, ~13 algae (best overall)
-- Team 1114: ~3 coral, ~11 algae (algae specialist)
-- Team 589: ~4 coral, ~10 algae (good all-around)
-- Team 2056: ~3 coral, ~9 algae (solid performer)
-- Team 3310: ~0.3 coral, ~4 algae (defense robot)

-- Show team statistics in detail
SELECT
    team_number,
    regional,
    matches_played,
    avg_l1,
    avg_l2,
    avg_l3,
    avg_l4,
    avg_coral,
    avg_algae_scored,
    avg_algae_removed,
    avg_algae_processed,
    avg_climb_deep,
    avg_climb_shallow
FROM robot_stats
WHERE regional = 'Test Competition'
ORDER BY avg_coral DESC;

-- ============================================================================
-- TEST DATA LOADED SUCCESSFULLY
-- ============================================================================
-- You can now:
-- 1. View the leaderboard in the app
-- 2. Browse team details
-- 3. Test editing match reports
-- 4. Test the realtime updates (if enabled)
--
-- To clear this test data:
-- DELETE FROM match_reports WHERE regional = 'Test Competition';
-- DELETE FROM pit_reports WHERE regional = 'Test Competition';
-- DELETE FROM robot_stats WHERE regional = 'Test Competition';
-- ============================================================================
