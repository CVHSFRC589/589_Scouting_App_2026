-- 589 FRC Scouting Database Schema
-- Designed for educational purposes and Supabase deployment

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Teams participating in competitions
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_number INTEGER UNIQUE NOT NULL,
    team_name TEXT,
    regional TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Competition matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    match_number INTEGER NOT NULL,
    regional TEXT NOT NULL,
    scouter_name TEXT,

    -- Pregame data
    starting_position TEXT CHECK (starting_position IN ('Amp', 'Middle', 'Source')),

    -- Autonomous period
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

    -- Teleoperation period
    teleop_amp_attempts INTEGER DEFAULT 0,
    teleop_amp_scored INTEGER DEFAULT 0,
    teleop_speaker_attempts INTEGER DEFAULT 0,
    teleop_speaker_scored INTEGER DEFAULT 0,
    teleop_ground_intake INTEGER DEFAULT 0,
    teleop_source_intake INTEGER DEFAULT 0,

    -- Endgame
    endgame_climb TEXT CHECK (endgame_climb IN ('Nothing', 'Park', 'Single Climb', 'Double Climb', 'Triple Climb')),
    endgame_trap_count INTEGER DEFAULT 0 CHECK (endgame_trap_count >= 0 AND endgame_trap_count <= 3),

    -- Postgame
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    robot_disabled BOOLEAN DEFAULT FALSE,
    played_defense BOOLEAN DEFAULT FALSE,
    comments TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Robot information (pit scouting)
CREATE TABLE robot_info (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional TEXT NOT NULL,

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
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- COMPUTED STATISTICS TABLES
-- ============================================================================

-- Team statistics (calculated from match data)
CREATE TABLE team_statistics (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional TEXT NOT NULL,
    stat_category TEXT NOT NULL, -- 'pregame', 'auto', 'teleop', 'endgame', 'overall'
    stat_name TEXT NOT NULL,     -- 'amp_accuracy', 'taxi_rate', etc.
    stat_value DECIMAL(10,4),
    stat_fraction TEXT,          -- "15/20" format for display
    total_matches INTEGER,
    last_calculated TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, regional, stat_category, stat_name)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_teams_regional ON teams(regional);
CREATE INDEX idx_teams_number ON teams(team_number);
CREATE INDEX idx_matches_team_regional ON matches(team_id, regional);
CREATE INDEX idx_matches_match_number ON matches(match_number);
CREATE INDEX idx_statistics_team_category ON team_statistics(team_id, stat_category);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_statistics ENABLE ROW LEVEL SECURITY;

-- Basic policies (can be refined later)
CREATE POLICY "Allow all operations for authenticated users" ON teams
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON matches
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON robot_info
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON team_statistics
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample teams
INSERT INTO teams (team_number, team_name, regional) VALUES
(589, 'Falkon Robotics', 'Orange County'),
(254, 'The Cheesy Poofs', 'Orange County'),
(1678, 'Citrus Circuits', 'Orange County'),
(2471, 'Team Mean Machine', 'Orange County');

-- Insert sample match data
INSERT INTO matches (
    team_id, match_number, regional, starting_position,
    auto_taxi, auto_m1, auto_s1,
    teleop_amp_attempts, teleop_amp_scored,
    teleop_speaker_attempts, teleop_speaker_scored,
    endgame_climb, endgame_trap_count,
    driver_rating, scouter_name
) VALUES
(1, 1, 'Orange County', 'Middle', TRUE, 2, 1, 5, 4, 10, 8, 'Single Climb', 1, 4, 'Test Scouter'),
(1, 2, 'Orange County', 'Amp', TRUE, 1, 2, 3, 3, 12, 9, 'Double Climb', 0, 5, 'Test Scouter'),
(2, 1, 'Orange County', 'Source', FALSE, 0, 3, 8, 6, 15, 12, 'Triple Climb', 2, 3, 'Test Scouter');