-- ============================================================================
-- Insert Sample Data for 2025 East Bay Regional ('be')
-- Teams from TBA + Sample Match and Pit Scouting Data
-- ============================================================================

-- ============================================================================
-- STEP 1: Insert Teams from East Bay Regional
-- ============================================================================

INSERT INTO teams (team_number, team_name, regional, nickname) VALUES
    (199, 'Deep Blue', 'be', 'Deep Blue'),
    (253, 'Boba Bots', 'be', 'Boba Bots'),
    (254, 'The Cheesy Poofs', 'be', 'The Cheesy Poofs'),
    (589, 'Falkon Robotics', 'be', 'Falkon Robotics'),
    (649, 'MSET Fish', 'be', 'MSET Fish'),
    (668, 'The Apes of Wrath', 'be', 'The Apes of Wrath'),
    (766, 'M-A Bears', 'be', 'M-A Bears'),
    (841, 'The BioMechs', 'be', 'The BioMechs'),
    (972, 'Iron Claw', 'be', 'Iron Claw'),
    (1280, 'Ragin'' C-Biscuits', 'be', 'Ragin'' C-Biscuits'),
    (1351, 'TKO', 'be', 'TKO'),
    (1868, 'Space Cookies', 'be', 'Space Cookies'),
    (2141, 'Spartronics', 'be', 'Spartronics'),
    (2204, 'Rambots', 'be', 'Rambots'),
    (2551, 'Penguin Empire', 'be', 'Penguin Empire'),
    (2854, 'The Prototypes', 'be', 'The Prototypes'),
    (3390, 'ANATOLIAN EAGLEBOTS', 'be', 'ANATOLIAN EAGLEBOTS'),
    (3482, 'Arrowbotics', 'be', 'Arrowbotics'),
    (4171, 'BayBots', 'be', 'BayBots'),
    (4186, 'Alameda Aztechs', 'be', 'Alameda Aztechs')
ON CONFLICT (team_number, regional) DO NOTHING;

-- ============================================================================
-- STEP 2: Insert Robot Rankings (TBA-like rankings)
-- ============================================================================

INSERT INTO robot_rankings (team_num, regional, rank_value) VALUES
    (254, 'be', 1.0),
    (1678, 'be', 2.0),
    (589, 'be', 3.0),
    (649, 'be', 4.0),
    (1868, 'be', 5.0),
    (972, 'be', 6.0),
    (2854, 'be', 7.0),
    (253, 'be', 8.0),
    (199, 'be', 9.0),
    (2141, 'be', 10.0),
    (668, 'be', 11.0),
    (766, 'be', 12.0),
    (841, 'be', 13.0),
    (1280, 'be', 14.0),
    (1351, 'be', 15.0),
    (2204, 'be', 16.0),
    (2551, 'be', 17.0),
    (3390, 'be', 18.0),
    (3482, 'be', 19.0),
    (4171, 'be', 20.0),
    (4186, 'be', 21.0)
ON CONFLICT (team_num, regional) DO UPDATE SET rank_value = EXCLUDED.rank_value;

-- ============================================================================
-- STEP 3: Insert Pit Scouting Data (robot_info)
-- ============================================================================

INSERT INTO robot_info (
    team_num, regional, vision_sys, drive_train,
    ground_intake, source_intake,
    l1_scoring, l2_scoring, l3_scoring, l4_scoring,
    remove, processor, net,
    climb_deep, climb_shallow,
    comments
) VALUES
    -- Team 589
    (589, 'be', 'Limelight', 'Swerve',
     true, true,
     true, true, true, true,
     true, true, true,
     true, false,
     'Excellent all-around robot with strong coral and algae capabilities'),

    -- Team 254
    (254, 'be', 'PhotonVision', 'Swerve',
     true, false,
     true, true, true, true,
     true, false, true,
     false, true,
     'Fast swerve drive, focuses on coral scoring'),

    -- Team 1678
    (1678, 'be', 'Limelight', 'Swerve',
     true, true,
     true, true, true, false,
     true, true, true,
     true, true,
     'Very consistent, excellent at algae processing'),

    -- Team 649
    (649, 'be', 'Limelight', 'West Coast',
     true, false,
     true, true, false, false,
     false, false, true,
     false, true,
     'Simple and effective design, reliable'),

    -- Team 1868
    (1868, 'be', 'PhotonVision', 'Swerve',
     true, true,
     true, true, true, true,
     true, true, true,
     true, false,
     'High scorer, excellent autonomous'),

    -- Team 972
    (972, 'be', 'None', 'West Coast',
     true, false,
     true, true, true, false,
     true, false, false,
     false, false,
     'Good defense robot'),

    -- Team 253
    (253, 'be', 'Limelight', 'Mecanum',
     true, true,
     true, true, true, true,
     true, true, true,
     true, true,
     'Versatile robot with unique mecanum drive'),

    -- Team 199
    (199, 'be', 'PhotonVision', 'Swerve',
     true, false,
     true, true, true, false,
     true, false, true,
     false, true,
     'Fast cycle times on L2 and L3'),

    -- Team 2141
    (2141, 'be', 'Limelight', 'West Coast',
     true, true,
     true, true, false, false,
     false, true, true,
     false, false,
     'Focus on algae processing and removal'),

    -- Team 668
    (668, 'be', 'None', 'West Coast',
     true, false,
     true, false, false, false,
     false, false, false,
     false, true,
     'Basic but reliable L1 scorer')
ON CONFLICT (team_num, regional) DO NOTHING;

-- ============================================================================
-- STEP 4: Insert Sample Matches for Team 589
-- ============================================================================

-- Match 1
INSERT INTO team_matches (team_num, match_num, regional, auto_starting_position, driver_rating, disabled, defence, malfunction, no_show, climb_deep, climb_shallow, park, comments)
VALUES (589, 1, 'be', 75, 5, false, false, false, false, true, false, false, 'Great match! Scored high on all levels')
ON CONFLICT (team_num, match_num, regional) DO NOTHING;

INSERT INTO coral_actions (team_num, match_num, regional, level, made, timestamp) VALUES
    (589, 1, 'be', 1, true, 'PT10S'),
    (589, 1, 'be', 2, true, 'PT25S'),
    (589, 1, 'be', 2, true, 'PT40S'),
    (589, 1, 'be', 3, true, 'PT55S'),
    (589, 1, 'be', 3, true, 'PT70S'),
    (589, 1, 'be', 4, true, 'PT85S');

INSERT INTO algae_actions (team_num, match_num, regional, where_scored, made, timestamp) VALUES
    (589, 1, 'be', 'removed', true, 'PT15S'),
    (589, 1, 'be', 'processed', true, 'PT30S'),
    (589, 1, 'be', 'net', true, 'PT45S'),
    (589, 1, 'be', 'removed', true, 'PT60S'),
    (589, 1, 'be', 'processed', true, 'PT75S');

-- Match 2
INSERT INTO team_matches (team_num, match_num, regional, auto_starting_position, driver_rating, disabled, defence, malfunction, no_show, climb_deep, climb_shallow, park, comments)
VALUES (589, 2, 'be', 50, 4, false, false, false, false, false, true, false, 'Good match, minor intake issues')
ON CONFLICT (team_num, match_num, regional) DO NOTHING;

INSERT INTO coral_actions (team_num, match_num, regional, level, made, timestamp) VALUES
    (589, 2, 'be', 1, true, 'PT12S'),
    (589, 2, 'be', 1, true, 'PT28S'),
    (589, 2, 'be', 2, true, 'PT44S'),
    (589, 2, 'be', 3, true, 'PT60S'),
    (589, 2, 'be', 3, false, 'PT76S');

INSERT INTO algae_actions (team_num, match_num, regional, where_scored, made, timestamp) VALUES
    (589, 2, 'be', 'removed', true, 'PT20S'),
    (589, 2, 'be', 'removed', true, 'PT35S'),
    (589, 2, 'be', 'processed', true, 'PT50S'),
    (589, 2, 'be', 'net', true, 'PT65S');

-- Match 3
INSERT INTO team_matches (team_num, match_num, regional, auto_starting_position, driver_rating, disabled, defence, malfunction, no_show, climb_deep, climb_shallow, park, comments)
VALUES (589, 3, 'be', 100, 5, false, false, false, false, true, false, false, 'Perfect match!')
ON CONFLICT (team_num, match_num, regional) DO NOTHING;

INSERT INTO coral_actions (team_num, match_num, regional, level, made, timestamp) VALUES
    (589, 3, 'be', 1, true, 'PT8S'),
    (589, 3, 'be', 2, true, 'PT22S'),
    (589, 3, 'be', 2, true, 'PT36S'),
    (589, 3, 'be', 3, true, 'PT50S'),
    (589, 3, 'be', 3, true, 'PT64S'),
    (589, 3, 'be', 4, true, 'PT78S'),
    (589, 3, 'be', 4, true, 'PT92S');

INSERT INTO algae_actions (team_num, match_num, regional, where_scored, made, timestamp) VALUES
    (589, 3, 'be', 'removed', true, 'PT14S'),
    (589, 3, 'be', 'processed', true, 'PT28S'),
    (589, 3, 'be', 'net', true, 'PT42S'),
    (589, 3, 'be', 'removed', true, 'PT56S'),
    (589, 3, 'be', 'processed', true, 'PT70S'),
    (589, 3, 'be', 'net', true, 'PT84S');

-- ============================================================================
-- STEP 5: Insert Sample Matches for Other Top Teams
-- ============================================================================

-- Team 254 - Match 1
INSERT INTO team_matches (team_num, match_num, regional, auto_starting_position, driver_rating, disabled, defence, malfunction, no_show, climb_deep, climb_shallow, park, comments)
VALUES (254, 1, 'be', 80, 5, false, false, false, false, false, true, false, 'Very fast cycles')
ON CONFLICT (team_num, match_num, regional) DO NOTHING;

INSERT INTO coral_actions (team_num, match_num, regional, level, made, timestamp) VALUES
    (254, 1, 'be', 2, true, 'PT15S'),
    (254, 1, 'be', 2, true, 'PT30S'),
    (254, 1, 'be', 3, true, 'PT45S'),
    (254, 1, 'be', 3, true, 'PT60S'),
    (254, 1, 'be', 3, true, 'PT75S'),
    (254, 1, 'be', 4, true, 'PT90S');

-- Team 1868 - Match 1
INSERT INTO team_matches (team_num, match_num, regional, auto_starting_position, driver_rating, disabled, defence, malfunction, no_show, climb_deep, climb_shallow, park, comments)
VALUES (1868, 1, 'be', 90, 5, false, false, false, false, true, false, false, 'Excellent autonomous')
ON CONFLICT (team_num, match_num, regional) DO NOTHING;

INSERT INTO coral_actions (team_num, match_num, regional, level, made, timestamp) VALUES
    (1868, 1, 'be', 1, true, 'PT10S'),
    (1868, 1, 'be', 2, true, 'PT25S'),
    (1868, 1, 'be', 3, true, 'PT40S'),
    (1868, 1, 'be', 3, true, 'PT55S'),
    (1868, 1, 'be', 4, true, 'PT70S');

INSERT INTO algae_actions (team_num, match_num, regional, where_scored, made, timestamp) VALUES
    (1868, 1, 'be', 'removed', true, 'PT18S'),
    (1868, 1, 'be', 'processed', true, 'PT33S'),
    (1868, 1, 'be', 'net', true, 'PT48S'),
    (1868, 1, 'be', 'net', true, 'PT63S');

-- ============================================================================
-- STEP 6: Recalculate Statistics for All Teams with Matches
-- ============================================================================

SELECT recalculate_coral_stats(589, 'be');
SELECT recalculate_algae_stats(589, 'be');
SELECT recalculate_climb_stats(589, 'be');

SELECT recalculate_coral_stats(254, 'be');
SELECT recalculate_climb_stats(254, 'be');

SELECT recalculate_coral_stats(1868, 'be');
SELECT recalculate_algae_stats(1868, 'be');
SELECT recalculate_climb_stats(1868, 'be');

-- ============================================================================
-- STEP 7: Verification Queries
-- ============================================================================

-- Check teams
SELECT '✅ Teams inserted for East Bay Regional:' AS status;
SELECT team_number, team_name FROM teams WHERE regional = 'be' ORDER BY team_number;

-- Check robots_complete view
SELECT '✅ Robots with complete data:' AS status;
SELECT team_num, team_name, rank_value, avg_coral, avg_algae FROM robots_complete WHERE regional = 'be' ORDER BY rank_value LIMIT 10;

-- Check match summaries for team 589
SELECT '✅ Team 589 Match Summaries:' AS status;
SELECT * FROM match_summaries WHERE team_num = 589 AND regional = 'be' ORDER BY match_num;

-- Final message
SELECT '🎉 SAMPLE DATA INSERTION COMPLETE!' AS final_status;
SELECT 'You can now test the frontend with realistic East Bay Regional data.' AS note;
