-- 589 FRC Scouting Database Schema - Season Layered Architecture
-- Designed for multi-season durability and Firebase compatibility
-- Structure: Season -> Regional -> Teams -> Stats (Percentage/Fraction)

-- ============================================================================
-- SEASON MANAGEMENT LAYER
-- ============================================================================

-- Seasons (2025, 2026, etc.)
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    season_year INTEGER UNIQUE NOT NULL,
    season_name TEXT NOT NULL, -- "2025 Crescendo", "2026 TBD"
    game_name TEXT, -- "Crescendo", "Charged Up"
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Regionals within seasons
CREATE TABLE regionals (
    id SERIAL PRIMARY KEY,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    regional_name TEXT NOT NULL, -- "Orange County", "San Diego"
    regional_code TEXT, -- "CAOC", "CASD"
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(season_id, regional_name)
);

-- ============================================================================
-- CORE TEAM AND MATCH DATA
-- ============================================================================

-- Teams participating in regionals (can participate in multiple seasons)
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_number INTEGER NOT NULL,
    team_name TEXT,
    organization TEXT,
    city TEXT,
    state TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_number)
);

-- Team participation in specific regionals
CREATE TABLE team_regional_participation (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional_id INTEGER REFERENCES regionals(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, regional_id)
);

-- Match data (Firebase equivalent: season/regional/teams/teamNumber/matches)
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional_id INTEGER REFERENCES regionals(id) ON DELETE CASCADE,
    match_number INTEGER NOT NULL,
    scouter_name TEXT,

    -- Pregame data (starting_position)
    starting_position TEXT CHECK (starting_position IN ('Amp', 'Middle', 'Source')),

    -- Autonomous period (auto_*)
    auto_taxi BOOLEAN DEFAULT FALSE,
    auto_m1 INTEGER DEFAULT 0,
    auto_m2 INTEGER DEFAULT 0,
    auto_m3 INTEGER DEFAULT 0,
    auto_m4 INTEGER DEFAULT 0,
    auto_m5 INTEGER DEFAULT 0,
    auto_s1 INTEGER DEFAULT 0,
    auto_s2 INTEGER DEFAULT 0,
    auto_s3 INTEGER DEFAULT 0,
    auto_r INTEGER DEFAULT 0,

    -- Teleoperation period (teleop_*)
    teleop_amp_attempts INTEGER DEFAULT 0,
    teleop_amp_scored INTEGER DEFAULT 0,
    teleop_speaker_attempts INTEGER DEFAULT 0,
    teleop_speaker_scored INTEGER DEFAULT 0,
    teleop_ground_intake INTEGER DEFAULT 0,
    teleop_source_intake INTEGER DEFAULT 0,

    -- Endgame (endgame_*)
    endgame_climb TEXT CHECK (endgame_climb IN ('Nothing', 'Park', 'Single Climb', 'Double Climb', 'Triple Climb')),
    endgame_trap_count INTEGER DEFAULT 0 CHECK (endgame_trap_count >= 0 AND endgame_trap_count <= 3),

    -- Postgame (driver_rating, robot_disabled, played_defense)
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    robot_disabled BOOLEAN DEFAULT FALSE,
    played_defense BOOLEAN DEFAULT FALSE,
    comments TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, regional_id, match_number)
);

-- ============================================================================
-- FIREBASE-COMPATIBLE STATISTICS TABLES
-- ============================================================================

-- Team statistics percentages (Firebase: season/regional/teams/teamNumber/Stats/Percentage/*)
CREATE TABLE team_stats_percentage (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional_id INTEGER REFERENCES regionals(id) ON DELETE CASCADE,

    -- Pregame percentages
    pregame_amp_percent DECIMAL(5,2) DEFAULT 0,
    pregame_middle_percent DECIMAL(5,2) DEFAULT 0,
    pregame_source_percent DECIMAL(5,2) DEFAULT 0,

    -- Auto percentages
    auto_taxi_percent DECIMAL(5,2) DEFAULT 0,
    auto_m1_percent DECIMAL(5,2) DEFAULT 0,
    auto_m2_percent DECIMAL(5,2) DEFAULT 0,
    auto_m3_percent DECIMAL(5,2) DEFAULT 0,
    auto_m4_percent DECIMAL(5,2) DEFAULT 0,
    auto_m5_percent DECIMAL(5,2) DEFAULT 0,
    auto_s1_percent DECIMAL(5,2) DEFAULT 0,
    auto_s2_percent DECIMAL(5,2) DEFAULT 0,
    auto_s3_percent DECIMAL(5,2) DEFAULT 0,
    auto_r_percent DECIMAL(5,2) DEFAULT 0,

    -- Teleop percentages
    teleop_amp_percent DECIMAL(5,2) DEFAULT 0,
    teleop_ground_intake_percent DECIMAL(5,2) DEFAULT 0,
    teleop_source_intake_percent DECIMAL(5,2) DEFAULT 0,
    teleop_speaker_percent DECIMAL(5,2) DEFAULT 0,

    -- Endgame climb percentages
    endgame_nothing_percent DECIMAL(5,2) DEFAULT 0,
    endgame_park_percent DECIMAL(5,2) DEFAULT 0,
    endgame_single_climb_percent DECIMAL(5,2) DEFAULT 0,
    endgame_double_climb_percent DECIMAL(5,2) DEFAULT 0,
    endgame_triple_climb_percent DECIMAL(5,2) DEFAULT 0,

    -- Endgame trap percentages
    endgame_0_trap_percent DECIMAL(5,2) DEFAULT 0,
    endgame_1_trap_percent DECIMAL(5,2) DEFAULT 0,
    endgame_2_trap_percent DECIMAL(5,2) DEFAULT 0,
    endgame_3_trap_percent DECIMAL(5,2) DEFAULT 0,

    -- Postgame percentages
    postgame_driver_rating_avg DECIMAL(3,2) DEFAULT 0,
    postgame_disabled_percent DECIMAL(5,2) DEFAULT 0,
    postgame_defense_percent DECIMAL(5,2) DEFAULT 0,

    last_calculated TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, regional_id)
);

-- Team statistics fractions (Firebase: season/regional/teams/teamNumber/Stats/Fraction/*)
CREATE TABLE team_stats_fraction (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional_id INTEGER REFERENCES regionals(id) ON DELETE CASCADE,

    -- Pregame fractions
    pregame_amp_fraction TEXT DEFAULT '0/0',
    pregame_middle_fraction TEXT DEFAULT '0/0',
    pregame_source_fraction TEXT DEFAULT '0/0',
    pregame_total INTEGER DEFAULT 0,

    -- Auto fractions
    auto_taxi_fraction TEXT DEFAULT '0/0',
    auto_m1_fraction TEXT DEFAULT '0/0',
    auto_m2_fraction TEXT DEFAULT '0/0',
    auto_m3_fraction TEXT DEFAULT '0/0',
    auto_m4_fraction TEXT DEFAULT '0/0',
    auto_m5_fraction TEXT DEFAULT '0/0',
    auto_s1_fraction TEXT DEFAULT '0/0',
    auto_s2_fraction TEXT DEFAULT '0/0',
    auto_s3_fraction TEXT DEFAULT '0/0',
    auto_r_fraction TEXT DEFAULT '0/0',
    auto_total INTEGER DEFAULT 0,

    -- Teleop fractions
    teleop_amp_fraction TEXT DEFAULT '0/0',
    teleop_ground_intake_fraction TEXT DEFAULT '0/0',
    teleop_source_intake_fraction TEXT DEFAULT '0/0',
    teleop_speaker_fraction TEXT DEFAULT '0/0',
    teleop_amp_total INTEGER DEFAULT 0,
    teleop_intake_total INTEGER DEFAULT 0,
    teleop_speaker_total INTEGER DEFAULT 0,

    -- Endgame fractions
    endgame_nothing_fraction TEXT DEFAULT '0/0',
    endgame_park_fraction TEXT DEFAULT '0/0',
    endgame_single_climb_fraction TEXT DEFAULT '0/0',
    endgame_double_climb_fraction TEXT DEFAULT '0/0',
    endgame_triple_climb_fraction TEXT DEFAULT '0/0',
    endgame_0_trap_fraction TEXT DEFAULT '0/0',
    endgame_1_trap_fraction TEXT DEFAULT '0/0',
    endgame_2_trap_fraction TEXT DEFAULT '0/0',
    endgame_3_trap_fraction TEXT DEFAULT '0/0',
    endgame_total INTEGER DEFAULT 0,

    -- Postgame fractions
    postgame_disabled_fraction TEXT DEFAULT '0/0',
    postgame_defense_fraction TEXT DEFAULT '0/0',
    postgame_total INTEGER DEFAULT 0,

    last_calculated TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, regional_id)
);

-- Team rankings (Firebase: season/regional/teams/teamNumber/Stats/Rank)
CREATE TABLE team_rankings (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional_id INTEGER REFERENCES regionals(id) ON DELETE CASCADE,

    overall_rank INTEGER,
    auto_rank INTEGER,
    teleop_rank INTEGER,
    endgame_rank INTEGER,

    overall_score DECIMAL(10,2) DEFAULT 0,
    auto_score DECIMAL(10,2) DEFAULT 0,
    teleop_score DECIMAL(10,2) DEFAULT 0,
    endgame_score DECIMAL(10,2) DEFAULT 0,

    matches_played INTEGER DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, regional_id)
);

-- Robot information (pit scouting)
CREATE TABLE robot_info (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional_id INTEGER REFERENCES regionals(id) ON DELETE CASCADE,

    -- Robot capabilities
    can_score_amp BOOLEAN DEFAULT FALSE,
    can_score_speaker BOOLEAN DEFAULT FALSE,
    can_ground_intake BOOLEAN DEFAULT FALSE,
    can_source_intake BOOLEAN DEFAULT FALSE,
    can_climb BOOLEAN DEFAULT FALSE,
    max_climb_level TEXT CHECK (max_climb_level IN ('None', 'Park', 'Single', 'Double', 'Triple')),

    -- Physical characteristics
    robot_weight DECIMAL(5,2),
    robot_height DECIMAL(4,1),
    drive_type TEXT,

    notes TEXT,
    scouter_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, regional_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Season and regional indexes
CREATE INDEX idx_seasons_year ON seasons(season_year);
CREATE INDEX idx_regionals_season ON regionals(season_id);
CREATE INDEX idx_team_participation_regional ON team_regional_participation(regional_id);

-- Core data indexes
CREATE INDEX idx_teams_number ON teams(team_number);
CREATE INDEX idx_matches_team_regional ON matches(team_id, regional_id);
CREATE INDEX idx_matches_match_number ON matches(match_number);

-- Statistics indexes
CREATE INDEX idx_stats_percentage_team_regional ON team_stats_percentage(team_id, regional_id);
CREATE INDEX idx_stats_fraction_team_regional ON team_stats_fraction(team_id, regional_id);
CREATE INDEX idx_rankings_team_regional ON team_rankings(team_id, regional_id);
CREATE INDEX idx_rankings_overall_rank ON team_rankings(regional_id, overall_rank);

-- ============================================================================
-- SAMPLE DATA FOR 2025 SEASON
-- ============================================================================

-- Insert 2025 season
INSERT INTO seasons (season_year, season_name, game_name, is_active, start_date) VALUES
(2025, '2025 Crescendo', 'Crescendo', TRUE, '2025-01-06');

-- Insert Orange County regional for 2025
INSERT INTO regionals (season_id, regional_name, regional_code, start_date) VALUES
(1, 'Orange County', 'CAOC', '2025-03-15');

-- Insert sample teams
INSERT INTO teams (team_number, team_name, organization, city, state) VALUES
(589, 'Falkon Robotics', 'Fallbrook High School', 'Fallbrook', 'CA'),
(254, 'The Cheesy Poofs', 'Bellarmine College Preparatory', 'San Jose', 'CA'),
(1678, 'Citrus Circuits', 'Davis High School', 'Davis', 'CA'),
(2471, 'Team Mean Machine', 'San Diego High School', 'San Diego', 'CA');

-- Register teams for Orange County 2025
INSERT INTO team_regional_participation (team_id, regional_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1);

-- Insert sample match data
INSERT INTO matches (
    team_id, regional_id, match_number, starting_position,
    auto_taxi, auto_m1, auto_s1,
    teleop_amp_attempts, teleop_amp_scored,
    teleop_speaker_attempts, teleop_speaker_scored,
    endgame_climb, endgame_trap_count,
    driver_rating, scouter_name
) VALUES
(1, 1, 1, 'Middle', TRUE, 2, 1, 5, 4, 10, 8, 'Single Climb', 1, 4, 'Test Scouter'),
(1, 1, 2, 'Amp', TRUE, 1, 2, 3, 3, 12, 9, 'Double Climb', 0, 5, 'Test Scouter'),
(2, 1, 1, 'Source', FALSE, 0, 3, 8, 6, 15, 12, 'Triple Climb', 2, 3, 'Test Scouter');

-- Initialize statistics tables with default values
INSERT INTO team_stats_percentage (team_id, regional_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1);

INSERT INTO team_stats_fraction (team_id, regional_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1);

INSERT INTO team_rankings (team_id, regional_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1);

-- ============================================================================
-- FUTURE SEASON PREPARATION (2026 Example)
-- ============================================================================

-- Example: Add 2026 season (commented out for now)
-- INSERT INTO seasons (season_year, season_name, game_name, is_active, start_date) VALUES
-- (2026, '2026 TBD', 'TBD Game', FALSE, '2026-01-04');

-- Example: Add 2026 regionals
-- INSERT INTO regionals (season_id, regional_name, regional_code, start_date) VALUES
-- (2, 'Orange County', 'CAOC', '2026-03-14'),
-- (2, 'San Diego', 'CASD', '2026-03-21');

-- ============================================================================
-- HELPER VIEWS FOR FIREBASE COMPATIBILITY
-- ============================================================================

-- View to mimic Firebase path: season/regional/teams/teamNumber/Stats/Percentage/*
CREATE VIEW firebase_stats_percentage AS
SELECT
    s.season_year,
    r.regional_name,
    t.team_number,
    sp.*
FROM team_stats_percentage sp
JOIN teams t ON sp.team_id = t.id
JOIN regionals r ON sp.regional_id = r.id
JOIN seasons s ON r.season_id = s.id;

-- View to mimic Firebase path: season/regional/teams/teamNumber/Stats/Fraction/*
CREATE VIEW firebase_stats_fraction AS
SELECT
    s.season_year,
    r.regional_name,
    t.team_number,
    sf.*
FROM team_stats_fraction sf
JOIN teams t ON sf.team_id = t.id
JOIN regionals r ON sf.regional_id = r.id
JOIN seasons s ON r.season_id = s.id;

-- View to mimic Firebase path: season/regional/teams/teamNumber/Stats/Rank
CREATE VIEW firebase_rankings AS
SELECT
    s.season_year,
    r.regional_name,
    t.team_number,
    tr.*
FROM team_rankings tr
JOIN teams t ON tr.team_id = t.id
JOIN regionals r ON tr.regional_id = r.id
JOIN seasons s ON r.season_id = s.id;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE regionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_regional_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stats_percentage ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stats_fraction ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_info ENABLE ROW LEVEL SECURITY;

-- Basic policies for development (can be refined for production)
CREATE POLICY "Allow all for authenticated users" ON seasons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON regionals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON teams FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON team_regional_participation FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON team_stats_percentage FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON team_stats_fraction FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON team_rankings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON robot_info FOR ALL USING (auth.role() = 'authenticated');