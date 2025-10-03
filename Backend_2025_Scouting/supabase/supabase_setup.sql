-- ============================================================================
-- Team 589 Falkon Robotics - Scouting Database Setup
-- Complete database initialization script
--
-- This script will:
-- 1. Drop all existing tables (if they exist)
-- 2. Create all tables for scouting and TBA data
-- 3. Set up Row Level Security policies
-- 4. Create indexes for performance
--
-- USAGE: Copy entire file and run in Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================================================

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS tba_sync_log CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS district_rankings CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS event_opr CASCADE;
DROP TABLE IF EXISTS team_event_status CASCADE;
DROP TABLE IF EXISTS event_rankings CASCADE;
DROP TABLE IF EXISTS awards CASCADE;
DROP TABLE IF EXISTS tba_matches CASCADE;
DROP TABLE IF EXISTS event_teams CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS robots CASCADE;
DROP TABLE IF EXISTS robot_info CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- ============================================================================
-- STEP 2: CREATE CORE SCOUTING TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- TEAMS - FRC Team Information
-- -----------------------------------------------------------------------------
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_number INTEGER UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    regional VARCHAR(100) NOT NULL,

    -- TBA Integration Fields
    team_key VARCHAR(10) UNIQUE,
    nickname VARCHAR(255),
    city VARCHAR(100),
    state_prov VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(20),
    website VARCHAR(500),
    rookie_year INTEGER,
    motto TEXT,
    tba_last_updated TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teams_team_number ON teams(team_number);
CREATE INDEX idx_teams_team_key ON teams(team_key);
CREATE INDEX idx_teams_regional ON teams(regional);

-- -----------------------------------------------------------------------------
-- MATCHES - Scouting Match Data
-- -----------------------------------------------------------------------------
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_number INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,
    scouter_name VARCHAR(100) NOT NULL,

    -- Autonomous Phase
    auto_taxi BOOLEAN DEFAULT FALSE,
    auto_m1 INTEGER DEFAULT 0,
    auto_s1 INTEGER DEFAULT 0,

    -- Teleop Phase
    teleop_amp_attempts INTEGER DEFAULT 0,
    teleop_amp_scored INTEGER DEFAULT 0,
    teleop_speaker_attempts INTEGER DEFAULT 0,
    teleop_speaker_scored INTEGER DEFAULT 0,

    -- Endgame
    endgame_climb VARCHAR(50),
    endgame_trap_count INTEGER DEFAULT 0,

    -- Postgame Analysis
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    robot_disabled BOOLEAN DEFAULT FALSE,
    played_defense BOOLEAN DEFAULT FALSE,
    comments TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matches_team ON matches(team_id);
CREATE INDEX idx_matches_regional ON matches(regional);
CREATE INDEX idx_matches_match_number ON matches(match_number);

-- -----------------------------------------------------------------------------
-- ROBOT_INFO - Pre-Match Robot Capabilities
-- -----------------------------------------------------------------------------
CREATE TABLE robot_info (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    regional VARCHAR(100) NOT NULL,

    -- Robot Capabilities
    can_score_amp BOOLEAN DEFAULT FALSE,
    can_score_speaker BOOLEAN DEFAULT FALSE,
    can_climb BOOLEAN DEFAULT FALSE,
    can_score_trap BOOLEAN DEFAULT FALSE,
    has_autonomous BOOLEAN DEFAULT FALSE,

    -- Additional Notes
    strengths TEXT,
    weaknesses TEXT,
    strategy_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(team_id, regional)
);

CREATE INDEX idx_robot_info_team ON robot_info(team_id);
CREATE INDEX idx_robot_info_regional ON robot_info(regional);

-- ============================================================================
-- STEP 3: CREATE TBA INTEGRATION TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- EVENTS - FRC Competition Events
-- -----------------------------------------------------------------------------
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_key VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    event_code VARCHAR(20) NOT NULL,
    event_type INTEGER NOT NULL,
    event_type_string VARCHAR(50),

    -- Location
    city VARCHAR(100),
    state_prov VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(20),
    address TEXT,

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    year INTEGER NOT NULL,
    week INTEGER,

    -- Event Details
    timezone VARCHAR(50),
    website VARCHAR(500),
    first_event_id VARCHAR(50),
    first_event_code VARCHAR(20),

    -- Webcasts (JSONB array)
    webcasts JSONB,

    -- Division info
    division_keys TEXT[],
    parent_event_key VARCHAR(20),
    playoff_type INTEGER,
    playoff_type_string VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tba_last_updated TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_events_event_key ON events(event_key);
CREATE INDEX idx_events_year ON events(year);
CREATE INDEX idx_events_event_type ON events(event_type);

-- -----------------------------------------------------------------------------
-- EVENT_TEAMS - Team Participation in Events
-- -----------------------------------------------------------------------------
CREATE TABLE event_teams (
    id SERIAL PRIMARY KEY,
    event_key VARCHAR(20) NOT NULL REFERENCES events(event_key) ON DELETE CASCADE,
    team_key VARCHAR(10) NOT NULL,
    status VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(event_key, team_key)
);

CREATE INDEX idx_event_teams_event ON event_teams(event_key);
CREATE INDEX idx_event_teams_team ON event_teams(team_key);

-- -----------------------------------------------------------------------------
-- TBA_MATCHES - Official Match Results from TBA
-- -----------------------------------------------------------------------------
CREATE TABLE tba_matches (
    id SERIAL PRIMARY KEY,
    match_key VARCHAR(50) UNIQUE NOT NULL,
    event_key VARCHAR(20) NOT NULL REFERENCES events(event_key) ON DELETE CASCADE,

    -- Match Info
    comp_level VARCHAR(10) NOT NULL, -- qm, ef, qf, sf, f
    set_number INTEGER,
    match_number INTEGER NOT NULL,

    -- Alliances (JSONB for flexibility)
    alliances JSONB NOT NULL,

    -- Winning Alliance
    winning_alliance VARCHAR(10), -- red, blue, or empty for tie

    -- Score Breakdown (game-specific, JSONB for flexibility)
    score_breakdown JSONB,

    -- Videos
    videos JSONB,

    -- Time
    time BIGINT,
    actual_time BIGINT,
    predicted_time BIGINT,
    post_result_time BIGINT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tba_matches_match_key ON tba_matches(match_key);
CREATE INDEX idx_tba_matches_event ON tba_matches(event_key);
CREATE INDEX idx_tba_matches_comp_level ON tba_matches(comp_level);

-- -----------------------------------------------------------------------------
-- AWARDS - Team Awards
-- -----------------------------------------------------------------------------
CREATE TABLE awards (
    id SERIAL PRIMARY KEY,
    event_key VARCHAR(20) NOT NULL REFERENCES events(event_key) ON DELETE CASCADE,
    award_type INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,

    -- Recipients (array of team keys)
    recipient_team_keys TEXT[],

    -- Individual recipients (JSONB array)
    recipient_list JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_awards_event ON awards(event_key);
CREATE INDEX idx_awards_year ON awards(year);

-- -----------------------------------------------------------------------------
-- EVENT_RANKINGS - Qualification Rankings
-- -----------------------------------------------------------------------------
CREATE TABLE event_rankings (
    id SERIAL PRIMARY KEY,
    event_key VARCHAR(20) NOT NULL REFERENCES events(event_key) ON DELETE CASCADE,
    team_key VARCHAR(10) NOT NULL,

    -- Ranking Info
    rank INTEGER NOT NULL,

    -- Record (JSONB for wins-losses-ties)
    record JSONB,

    -- Qualification Average
    qual_average DECIMAL(10,2),

    -- Ranking Points
    ranking_points DECIMAL(10,2),

    -- Sort Orders (array for tiebreakers)
    sort_orders DECIMAL(10,2)[],

    -- Extra Stats (JSONB for game-specific stats)
    extra_stats JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(event_key, team_key)
);

CREATE INDEX idx_event_rankings_event ON event_rankings(event_key);
CREATE INDEX idx_event_rankings_team ON event_rankings(team_key);
CREATE INDEX idx_event_rankings_rank ON event_rankings(event_key, rank);

-- -----------------------------------------------------------------------------
-- TEAM_EVENT_STATUS - Team Progression Through Events
-- -----------------------------------------------------------------------------
CREATE TABLE team_event_status (
    id SERIAL PRIMARY KEY,
    event_key VARCHAR(20) NOT NULL REFERENCES events(event_key) ON DELETE CASCADE,
    team_key VARCHAR(10) NOT NULL,

    -- Qualification Status
    qual JSONB,

    -- Alliance Status
    alliance JSONB,

    -- Playoff Status
    playoff JSONB,

    -- Status Strings
    alliance_status_str VARCHAR(255),
    playoff_status_str VARCHAR(255),
    overall_status_str VARCHAR(255),

    -- Match Keys
    next_match_key VARCHAR(50),
    last_match_key VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(event_key, team_key)
);

CREATE INDEX idx_team_event_status_event ON team_event_status(event_key);
CREATE INDEX idx_team_event_status_team ON team_event_status(team_key);

-- -----------------------------------------------------------------------------
-- EVENT_OPR - Offensive Power Ratings
-- -----------------------------------------------------------------------------
CREATE TABLE event_opr (
    id SERIAL PRIMARY KEY,
    event_key VARCHAR(20) NOT NULL REFERENCES events(event_key) ON DELETE CASCADE,
    team_key VARCHAR(10) NOT NULL,

    -- OPR Stats
    opr DECIMAL(10,2),
    dpr DECIMAL(10,2),
    ccwm DECIMAL(10,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(event_key, team_key)
);

CREATE INDEX idx_event_opr_event ON event_opr(event_key);
CREATE INDEX idx_event_opr_team ON event_opr(team_key);

-- -----------------------------------------------------------------------------
-- MEDIA - Team Photos, Videos, Social Media
-- -----------------------------------------------------------------------------
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    team_key VARCHAR(10),
    year INTEGER,
    type VARCHAR(50) NOT NULL, -- imgur, youtube, cdphotothread, instagram, etc.
    foreign_key VARCHAR(255) NOT NULL,

    -- Media Details (JSONB for flexibility)
    details JSONB,

    -- Preferred (for team avatar)
    preferred BOOLEAN DEFAULT FALSE,

    -- URLs
    direct_url VARCHAR(500),
    view_url VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_team ON media(team_key);
CREATE INDEX idx_media_year ON media(year);
CREATE INDEX idx_media_type ON media(type);

-- -----------------------------------------------------------------------------
-- DISTRICTS - Regional Competition Districts
-- -----------------------------------------------------------------------------
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    district_key VARCHAR(20) UNIQUE NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_districts_year ON districts(year);

-- -----------------------------------------------------------------------------
-- DISTRICT_RANKINGS - Team Rankings within Districts
-- -----------------------------------------------------------------------------
CREATE TABLE district_rankings (
    id SERIAL PRIMARY KEY,
    district_key VARCHAR(20) NOT NULL REFERENCES districts(district_key) ON DELETE CASCADE,
    team_key VARCHAR(10) NOT NULL,

    -- Ranking Info
    rank INTEGER NOT NULL,
    point_total INTEGER NOT NULL,

    -- Event Points (JSONB array)
    event_points JSONB,

    -- Rookie Bonus
    rookie_bonus INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(district_key, team_key)
);

CREATE INDEX idx_district_rankings_district ON district_rankings(district_key);
CREATE INDEX idx_district_rankings_team ON district_rankings(team_key);

-- -----------------------------------------------------------------------------
-- PREDICTIONS - Match and Event Predictions
-- -----------------------------------------------------------------------------
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,

    -- Can be for match or event
    match_key VARCHAR(50),
    event_key VARCHAR(20),

    -- Prediction Data (JSONB for flexibility)
    prediction_data JSONB NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_predictions_match ON predictions(match_key);
CREATE INDEX idx_predictions_event ON predictions(event_key);

-- -----------------------------------------------------------------------------
-- ROBOTS - Robot Specifications
-- -----------------------------------------------------------------------------
CREATE TABLE robots (
    id SERIAL PRIMARY KEY,
    team_key VARCHAR(10) NOT NULL,
    year INTEGER NOT NULL,

    -- Robot Name
    robot_name VARCHAR(100),

    -- Key (team_key_year)
    robot_key VARCHAR(20) UNIQUE NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(team_key, year)
);

CREATE INDEX idx_robots_team ON robots(team_key);
CREATE INDEX idx_robots_year ON robots(year);

-- -----------------------------------------------------------------------------
-- TBA_SYNC_LOG - Track TBA Data Synchronization
-- -----------------------------------------------------------------------------
CREATE TABLE tba_sync_log (
    id SERIAL PRIMARY KEY,

    -- Sync Details
    entity_type VARCHAR(50) NOT NULL, -- teams, events, matches, etc.
    entity_key VARCHAR(100),

    -- Sync Status
    status VARCHAR(20) NOT NULL, -- success, error, partial
    records_synced INTEGER DEFAULT 0,
    error_message TEXT,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB
);

CREATE INDEX idx_tba_sync_log_entity_type ON tba_sync_log(entity_type);
CREATE INDEX idx_tba_sync_log_started_at ON tba_sync_log(started_at);

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tba_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_event_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_opr ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tba_sync_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES - Public Read, Service Role Write
-- ============================================================================

-- TEAMS Policies
CREATE POLICY "Teams are publicly readable" ON teams FOR SELECT USING (true);
CREATE POLICY "Service role can insert teams" ON teams FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update teams" ON teams FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete teams" ON teams FOR DELETE USING (auth.role() = 'service_role');

-- MATCHES Policies
CREATE POLICY "Matches are publicly readable" ON matches FOR SELECT USING (true);
CREATE POLICY "Service role can insert matches" ON matches FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update matches" ON matches FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete matches" ON matches FOR DELETE USING (auth.role() = 'service_role');

-- ROBOT_INFO Policies
CREATE POLICY "Robot info is publicly readable" ON robot_info FOR SELECT USING (true);
CREATE POLICY "Service role can insert robot info" ON robot_info FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update robot info" ON robot_info FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete robot info" ON robot_info FOR DELETE USING (auth.role() = 'service_role');

-- EVENTS Policies
CREATE POLICY "Events are publicly readable" ON events FOR SELECT USING (true);
CREATE POLICY "Service role can insert events" ON events FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update events" ON events FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete events" ON events FOR DELETE USING (auth.role() = 'service_role');

-- EVENT_TEAMS Policies
CREATE POLICY "Event teams are publicly readable" ON event_teams FOR SELECT USING (true);
CREATE POLICY "Service role can insert event teams" ON event_teams FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update event teams" ON event_teams FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete event teams" ON event_teams FOR DELETE USING (auth.role() = 'service_role');

-- TBA_MATCHES Policies
CREATE POLICY "TBA matches are publicly readable" ON tba_matches FOR SELECT USING (true);
CREATE POLICY "Service role can insert tba matches" ON tba_matches FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update tba matches" ON tba_matches FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete tba matches" ON tba_matches FOR DELETE USING (auth.role() = 'service_role');

-- AWARDS Policies
CREATE POLICY "Awards are publicly readable" ON awards FOR SELECT USING (true);
CREATE POLICY "Service role can insert awards" ON awards FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update awards" ON awards FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete awards" ON awards FOR DELETE USING (auth.role() = 'service_role');

-- EVENT_RANKINGS Policies
CREATE POLICY "Event rankings are publicly readable" ON event_rankings FOR SELECT USING (true);
CREATE POLICY "Service role can insert rankings" ON event_rankings FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update rankings" ON event_rankings FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete rankings" ON event_rankings FOR DELETE USING (auth.role() = 'service_role');

-- TEAM_EVENT_STATUS Policies
CREATE POLICY "Team event status is publicly readable" ON team_event_status FOR SELECT USING (true);
CREATE POLICY "Service role can insert team event status" ON team_event_status FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update team event status" ON team_event_status FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete team event status" ON team_event_status FOR DELETE USING (auth.role() = 'service_role');

-- EVENT_OPR Policies
CREATE POLICY "Event OPR is publicly readable" ON event_opr FOR SELECT USING (true);
CREATE POLICY "Service role can insert OPR" ON event_opr FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update OPR" ON event_opr FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete OPR" ON event_opr FOR DELETE USING (auth.role() = 'service_role');

-- MEDIA Policies
CREATE POLICY "Media is publicly readable" ON media FOR SELECT USING (true);
CREATE POLICY "Service role can insert media" ON media FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update media" ON media FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete media" ON media FOR DELETE USING (auth.role() = 'service_role');

-- DISTRICTS Policies
CREATE POLICY "Districts are publicly readable" ON districts FOR SELECT USING (true);
CREATE POLICY "Service role can insert districts" ON districts FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update districts" ON districts FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete districts" ON districts FOR DELETE USING (auth.role() = 'service_role');

-- DISTRICT_RANKINGS Policies
CREATE POLICY "District rankings are publicly readable" ON district_rankings FOR SELECT USING (true);
CREATE POLICY "Service role can insert district rankings" ON district_rankings FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update district rankings" ON district_rankings FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete district rankings" ON district_rankings FOR DELETE USING (auth.role() = 'service_role');

-- PREDICTIONS Policies
CREATE POLICY "Predictions are publicly readable" ON predictions FOR SELECT USING (true);
CREATE POLICY "Service role can insert predictions" ON predictions FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update predictions" ON predictions FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete predictions" ON predictions FOR DELETE USING (auth.role() = 'service_role');

-- ROBOTS Policies
CREATE POLICY "Robots are publicly readable" ON robots FOR SELECT USING (true);
CREATE POLICY "Service role can insert robots" ON robots FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update robots" ON robots FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete robots" ON robots FOR DELETE USING (auth.role() = 'service_role');

-- TBA_SYNC_LOG Policies (service role only)
CREATE POLICY "Service role can read sync log" ON tba_sync_log FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role can insert sync log" ON tba_sync_log FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update sync log" ON tba_sync_log FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete sync log" ON tba_sync_log FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Verify table creation
SELECT 'Setup complete! Tables created:' AS status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
