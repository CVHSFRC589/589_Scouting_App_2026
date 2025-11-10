-- ============================================================================
-- SET TEST COMPETITION
-- ============================================================================
-- Purpose: Configure "Test Competition" as the active competition
--
-- This script:
-- 1. Sets active_competition to "Test Competition"
-- 2. Adds "Test Competition" to available_competitions list (if not already present)
--
-- Run this after CREATE_CLEAN_SCHEMA.sql to configure the test competition
--
-- Note: Competition codes vs. display names:
--   - Competition CODE: "tc" (used in database regional field)
--   - Competition NAME: "Test Competition" (displayed in UI)
--   - The app_metadata stores the display name, not the code
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Update active_competition
-- ============================================================================

UPDATE app_metadata
SET
    active_competition = 'Test Competition',
    updated_at = NOW()
WHERE id = 1;

-- ============================================================================
-- STEP 2: Add "Test Competition" to available_competitions (if not present)
-- ============================================================================

UPDATE app_metadata
SET
    available_competitions = CASE
        -- If "Test Competition" is already in the list, keep it as-is
        WHEN available_competitions @> '"Test Competition"'::jsonb THEN
            available_competitions
        -- Otherwise, add "Test Competition" to the array
        ELSE
            available_competitions || '"Test Competition"'::jsonb
    END,
    updated_at = NOW()
WHERE id = 1;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show current competition configuration
SELECT
    active_competition,
    available_competitions,
    updated_at
FROM app_metadata
WHERE id = 1;

-- Expected output:
-- active_competition: "Test Competition"
-- available_competitions: ["Test Competition"]
-- updated_at: [current timestamp]

-- ============================================================================
-- NEXT STEPS
-- ============================================================================
-- 1. Teams and match data should use "Test Competition" as their regional value
-- 2. To add more competitions, run:
--
--    UPDATE app_metadata
--    SET available_competitions = available_competitions || '["Competition Name"]'::jsonb
--    WHERE id = 1;
--
-- 3. To change active competition:
--
--    UPDATE app_metadata
--    SET active_competition = 'Competition Name'
--    WHERE id = 1;
-- ============================================================================
