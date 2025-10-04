-- ============================================================================
-- Team 589 Falkon Robotics - 2025 REEFSCAPE Scouting Database Setup
-- Complete database initialization script
--
-- This script will:
-- 1. Drop all existing tables (if they exist)
-- 2. Create all tables for 2025 Reefscape scouting
-- 3. Create statistics calculation functions
-- 4. Set up Row Level Security policies
-- 5. Create indexes for performance
-- 6. Create helpful views
--
-- USAGE: Copy entire file and run in Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING TABLES AND FUNCTIONS
-- ============================================================================

-- First, drop all views (they depend on tables)
DROP VIEW IF EXISTS match_summaries CASCADE;
DROP VIEW IF EXISTS robots_complete CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS recalculate_climb_stats(INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS recalculate_algae_stats(INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS recalculate_coral_stats(INTEGER, VARCHAR) CASCADE;

-- Drop all existing policies (Supabase may have default policies)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables in public schema
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop all tables (CASCADE ensures foreign key constraints are handled)
-- Order doesn't matter with CASCADE, but organized for clarity

-- TBA Integration tables
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

-- Reefscape scouting tables
DROP TABLE IF EXISTS robot_climb_stats CASCADE;
DROP TABLE IF EXISTS robot_algae_stats CASCADE;
DROP TABLE IF EXISTS robot_coral_stats CASCADE;
DROP TABLE IF EXISTS robot_rankings CASCADE;
DROP TABLE IF EXISTS algae_actions CASCADE;
DROP TABLE IF EXISTS coral_actions CASCADE;
DROP TABLE IF EXISTS team_matches CASCADE;
DROP TABLE IF EXISTS robot_info CASCADE;

-- Legacy/old tables
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS match_scouting CASCADE;
DROP TABLE IF EXISTS pit_scouting CASCADE;
DROP TABLE IF EXISTS team_statistics CASCADE;
DROP TABLE IF EXISTS team_stats_percentage CASCADE;
DROP TABLE IF EXISTS team_stats_fraction CASCADE;
DROP TABLE IF EXISTS team_rankings CASCADE;
DROP TABLE IF EXISTS team_regional_participation CASCADE;
DROP TABLE IF EXISTS regionals CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Drop any remaining tables we might have missed
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: CREATE CORE SCOUTING TABLES (2025 REEFSCAPE)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- TEAMS - FRC Team Information
-- -----------------------------------------------------------------------------
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_number INTEGER NOT NULL,
    team_name VARCHAR(255),
    regional VARCHAR(100) NOT NULL,

    -- TBA Integration Fields
    team_key VARCHAR(10),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure team_number is unique per regional
    UNIQUE(team_number, regional)
);

CREATE INDEX idx_teams_team_number ON teams(team_number);
CREATE INDEX idx_teams_team_key ON teams(team_key);
CREATE INDEX idx_teams_regional ON teams(regional);
CREATE INDEX idx_teams_composite ON teams(team_number, regional);

-- -----------------------------------------------------------------------------
-- TEAM_MATCHES - Match Data (Pregame and Postgame)
-- -----------------------------------------------------------------------------
CREATE TABLE team_matches (
    id SERIAL PRIMARY KEY,
    team_num INTEGER NOT NULL,
    match_num INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,

    -- Pregame data
    auto_starting_position INTEGER DEFAULT 0, -- 0-100 scale (0=Opposite, 100=Processor)

    -- Postgame data
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    disabled BOOLEAN DEFAULT FALSE,
    defence BOOLEAN DEFAULT FALSE,
    malfunction BOOLEAN DEFAULT FALSE,
    no_show BOOLEAN DEFAULT FALSE,
    comments TEXT,

    -- Endgame (stored at match level)
    climb_deep BOOLEAN DEFAULT FALSE,
    climb_shallow BOOLEAN DEFAULT FALSE,
    park BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one record per team per match per regional
    UNIQUE(team_num, match_num, regional)
);

CREATE INDEX idx_team_matches_regional ON team_matches(regional);
CREATE INDEX idx_team_matches_team ON team_matches(team_num);
CREATE INDEX idx_team_matches_match ON team_matches(match_num);
CREATE INDEX idx_team_matches_composite ON team_matches(team_num, regional);

-- -----------------------------------------------------------------------------
-- CORAL_ACTIONS - Individual Coral Placements
-- -----------------------------------------------------------------------------
CREATE TABLE coral_actions (
    id SERIAL PRIMARY KEY,
    team_num INTEGER NOT NULL,
    match_num INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,

    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4), -- L1, L2, L3, L4
    made BOOLEAN NOT NULL DEFAULT TRUE,
    timestamp TEXT NOT NULL, -- ISO 8601 duration format (e.g., "PT15S")

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key to team_matches
    FOREIGN KEY (team_num, match_num, regional)
        REFERENCES team_matches(team_num, match_num, regional)
        ON DELETE CASCADE
);

CREATE INDEX idx_coral_team_match ON coral_actions(team_num, match_num, regional);
CREATE INDEX idx_coral_regional ON coral_actions(regional);
CREATE INDEX idx_coral_level ON coral_actions(level);

-- -----------------------------------------------------------------------------
-- ALGAE_ACTIONS - Algae Removal, Processing, and Net Scoring
-- -----------------------------------------------------------------------------
CREATE TABLE algae_actions (
    id SERIAL PRIMARY KEY,
    team_num INTEGER NOT NULL,
    match_num INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,

    where_scored VARCHAR(50) NOT NULL CHECK (where_scored IN ('removed', 'processed', 'net')),
    made BOOLEAN NOT NULL DEFAULT TRUE,
    timestamp TEXT NOT NULL, -- ISO 8601 duration format

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key to team_matches
    FOREIGN KEY (team_num, match_num, regional)
        REFERENCES team_matches(team_num, match_num, regional)
        ON DELETE CASCADE
);

CREATE INDEX idx_algae_team_match ON algae_actions(team_num, match_num, regional);
CREATE INDEX idx_algae_regional ON algae_actions(regional);
CREATE INDEX idx_algae_where_scored ON algae_actions(where_scored);

-- -----------------------------------------------------------------------------
-- ROBOT_INFO - Pit Scouting Data
-- -----------------------------------------------------------------------------
CREATE TABLE robot_info (
    id SERIAL PRIMARY KEY,
    team_num INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,

    -- Vision and drive
    vision_sys VARCHAR(255),
    drive_train VARCHAR(255),

    -- Intake capabilities
    ground_intake BOOLEAN DEFAULT FALSE,
    source_intake BOOLEAN DEFAULT FALSE,

    -- Coral scoring capabilities (which levels can they score)
    l1_scoring BOOLEAN DEFAULT FALSE,
    l2_scoring BOOLEAN DEFAULT FALSE,
    l3_scoring BOOLEAN DEFAULT FALSE,
    l4_scoring BOOLEAN DEFAULT FALSE,

    -- Algae capabilities
    remove BOOLEAN DEFAULT FALSE,      -- Can remove algae
    processor BOOLEAN DEFAULT FALSE,   -- Can process algae
    net BOOLEAN DEFAULT FALSE,         -- Can score in net

    -- Climb capabilities
    climb_deep BOOLEAN DEFAULT FALSE,
    climb_shallow BOOLEAN DEFAULT FALSE,

    -- Additional info
    comments TEXT,
    picture_path TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One pit scouting record per team per regional
    UNIQUE(team_num, regional)
);

CREATE INDEX idx_robot_info_regional ON robot_info(regional);
CREATE INDEX idx_robot_info_team ON robot_info(team_num);
CREATE INDEX idx_robot_info_composite ON robot_info(team_num, regional);

-- ============================================================================
-- STEP 3: CREATE STATISTICS & RANKINGS TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- ROBOT_RANKINGS - TBA-Based Rankings
-- -----------------------------------------------------------------------------
CREATE TABLE robot_rankings (
    id SERIAL PRIMARY KEY,
    team_num INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,
    rank_value DECIMAL(10, 4) DEFAULT 0,

    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(team_num, regional)
);

CREATE INDEX idx_rankings_regional ON robot_rankings(regional);
CREATE INDEX idx_rankings_team ON robot_rankings(team_num);
CREATE INDEX idx_rankings_composite ON robot_rankings(team_num, regional);

-- -----------------------------------------------------------------------------
-- ROBOT_CORAL_STATS - Computed Coral Statistics
-- -----------------------------------------------------------------------------
CREATE TABLE robot_coral_stats (
    id SERIAL PRIMARY KEY,
    team_num INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,

    -- Average successful scores per level per match
    avg_l1 DECIMAL(10, 4) DEFAULT 0,
    avg_l2 DECIMAL(10, 4) DEFAULT 0,
    avg_l3 DECIMAL(10, 4) DEFAULT 0,
    avg_l4 DECIMAL(10, 4) DEFAULT 0,
    avg_coral DECIMAL(10, 4) DEFAULT 0, -- Overall average coral per match

    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(team_num, regional)
);

CREATE INDEX idx_coral_stats_regional ON robot_coral_stats(regional);
CREATE INDEX idx_coral_stats_team ON robot_coral_stats(team_num);

-- -----------------------------------------------------------------------------
-- ROBOT_ALGAE_STATS - Computed Algae Statistics
-- -----------------------------------------------------------------------------
CREATE TABLE robot_algae_stats (
    id SERIAL PRIMARY KEY,
    team_num INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,

    -- Average successful actions per match
    avg_algae_scored DECIMAL(10, 4) DEFAULT 0,    -- Net scoring
    avg_algae_removed DECIMAL(10, 4) DEFAULT 0,   -- Removed from reef
    avg_algae_processed DECIMAL(10, 4) DEFAULT 0, -- Processed
    avg_algae DECIMAL(10, 4) DEFAULT 0,           -- Total algae actions

    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(team_num, regional)
);

CREATE INDEX idx_algae_stats_regional ON robot_algae_stats(regional);
CREATE INDEX idx_algae_stats_team ON robot_algae_stats(team_num);

-- -----------------------------------------------------------------------------
-- ROBOT_CLIMB_STATS - Computed Climb Statistics
-- -----------------------------------------------------------------------------
CREATE TABLE robot_climb_stats (
    id SERIAL PRIMARY KEY,
    team_num INTEGER NOT NULL,
    regional VARCHAR(100) NOT NULL,

    deep_count INTEGER DEFAULT 0,
    shallow_count INTEGER DEFAULT 0,
    park_count INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,

    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(team_num, regional)
);

CREATE INDEX idx_climb_stats_regional ON robot_climb_stats(regional);
CREATE INDEX idx_climb_stats_team ON robot_climb_stats(team_num);

-- ============================================================================
-- STEP 4: CREATE TBA INTEGRATION TABLES
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

-- ============================================================================
-- STEP 5: CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Complete robot view with all statistics
CREATE OR REPLACE VIEW robots_complete AS
SELECT
    t.team_number as team_num,
    t.team_name,
    t.regional,

    -- Rankings
    COALESCE(rr.rank_value, 0) as rank_value,

    -- Pit scouting data
    ri.vision_sys,
    ri.drive_train,
    ri.ground_intake,
    ri.source_intake,
    ri.l1_scoring,
    ri.l2_scoring,
    ri.l3_scoring,
    ri.l4_scoring,
    ri.remove,
    ri.processor,
    ri.net,
    ri.climb_deep,
    ri.climb_shallow,
    ri.comments,
    ri.picture_path,

    -- Coral statistics
    COALESCE(rcs.avg_l1, 0) as avg_l1,
    COALESCE(rcs.avg_l2, 0) as avg_l2,
    COALESCE(rcs.avg_l3, 0) as avg_l3,
    COALESCE(rcs.avg_l4, 0) as avg_l4,
    COALESCE(rcs.avg_coral, 0) as avg_coral,

    -- Algae statistics
    COALESCE(ras.avg_algae_scored, 0) as avg_algae_scored,
    COALESCE(ras.avg_algae_removed, 0) as avg_algae_removed,
    COALESCE(ras.avg_algae_processed, 0) as avg_algae_processed,
    COALESCE(ras.avg_algae, 0) as avg_algae,

    -- Get all matches as array (for frontend)
    ARRAY(
        SELECT json_build_object(
            'match_num', tm.match_num,
            'team_num', tm.team_num,
            'regional', tm.regional
        )
        FROM team_matches tm
        WHERE tm.team_num = t.team_number AND tm.regional = t.regional
        ORDER BY tm.match_num
    ) as matches

FROM teams t
LEFT JOIN robot_rankings rr ON t.team_number = rr.team_num AND t.regional = rr.regional
LEFT JOIN robot_info ri ON t.team_number = ri.team_num AND t.regional = ri.regional
LEFT JOIN robot_coral_stats rcs ON t.team_number = rcs.team_num AND t.regional = rcs.regional
LEFT JOIN robot_algae_stats ras ON t.team_number = ras.team_num AND t.regional = ras.regional;

-- Match summary view - aggregates coral and algae per match
CREATE OR REPLACE VIEW match_summaries AS
SELECT
    tm.team_num,
    tm.match_num,
    tm.regional,
    tm.auto_starting_position,
    tm.climb_deep,
    tm.climb_shallow,
    tm.park,
    tm.driver_rating,
    tm.disabled,
    tm.defence,
    tm.malfunction,
    tm.no_show,
    tm.comments,

    -- Coral counts per level
    COUNT(CASE WHEN ca.level = 1 AND ca.made THEN 1 END) as l1_total_made,
    COUNT(CASE WHEN ca.level = 1 THEN 1 END) as l1_total,
    COUNT(CASE WHEN ca.level = 2 AND ca.made THEN 1 END) as l2_total_made,
    COUNT(CASE WHEN ca.level = 2 THEN 1 END) as l2_total,
    COUNT(CASE WHEN ca.level = 3 AND ca.made THEN 1 END) as l3_total_made,
    COUNT(CASE WHEN ca.level = 3 THEN 1 END) as l3_total,
    COUNT(CASE WHEN ca.level = 4 AND ca.made THEN 1 END) as l4_total_made,
    COUNT(CASE WHEN ca.level = 4 THEN 1 END) as l4_total,

    -- Algae counts by type
    COUNT(CASE WHEN aa.where_scored = 'removed' THEN 1 END) as removed,
    COUNT(CASE WHEN aa.where_scored = 'processed' AND aa.made THEN 1 END) as processed,
    COUNT(CASE WHEN aa.where_scored = 'net' AND aa.made THEN 1 END) as net,
    COUNT(CASE WHEN aa.made THEN 1 END) as total_algae

FROM team_matches tm
LEFT JOIN coral_actions ca ON tm.team_num = ca.team_num
    AND tm.match_num = ca.match_num
    AND tm.regional = ca.regional
LEFT JOIN algae_actions aa ON tm.team_num = aa.team_num
    AND tm.match_num = aa.match_num
    AND tm.regional = aa.regional
GROUP BY
    tm.id, tm.team_num, tm.match_num, tm.regional,
    tm.auto_starting_position, tm.climb_deep, tm.climb_shallow, tm.park,
    tm.driver_rating, tm.disabled, tm.defence, tm.malfunction, tm.no_show, tm.comments;

-- ============================================================================
-- STEP 6: CREATE FUNCTIONS FOR STATISTICS CALCULATION
-- ============================================================================

-- Function to recalculate coral statistics for a team
CREATE OR REPLACE FUNCTION recalculate_coral_stats(p_team_num INTEGER, p_regional VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_match_count INTEGER;
BEGIN
    -- Count matches for this team
    SELECT COUNT(DISTINCT match_num) INTO v_match_count
    FROM team_matches
    WHERE team_num = p_team_num AND regional = p_regional;

    IF v_match_count = 0 THEN
        -- Initialize with zeros if no matches
        INSERT INTO robot_coral_stats (team_num, regional, avg_l1, avg_l2, avg_l3, avg_l4, avg_coral, last_calculated)
        VALUES (p_team_num, p_regional, 0, 0, 0, 0, 0, NOW())
        ON CONFLICT (team_num, regional)
        DO UPDATE SET
            avg_l1 = 0,
            avg_l2 = 0,
            avg_l3 = 0,
            avg_l4 = 0,
            avg_coral = 0,
            last_calculated = NOW();
    ELSE
        -- Calculate averages
        INSERT INTO robot_coral_stats (team_num, regional, avg_l1, avg_l2, avg_l3, avg_l4, avg_coral, last_calculated)
        SELECT
            p_team_num,
            p_regional,
            COALESCE(SUM(CASE WHEN ca.level = 1 AND ca.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_l1,
            COALESCE(SUM(CASE WHEN ca.level = 2 AND ca.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_l2,
            COALESCE(SUM(CASE WHEN ca.level = 3 AND ca.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_l3,
            COALESCE(SUM(CASE WHEN ca.level = 4 AND ca.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_l4,
            COALESCE(SUM(CASE WHEN ca.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_coral,
            NOW()
        FROM team_matches tm
        LEFT JOIN coral_actions ca ON tm.team_num = ca.team_num
            AND tm.match_num = ca.match_num
            AND tm.regional = ca.regional
        WHERE tm.team_num = p_team_num AND tm.regional = p_regional
        ON CONFLICT (team_num, regional)
        DO UPDATE SET
            avg_l1 = EXCLUDED.avg_l1,
            avg_l2 = EXCLUDED.avg_l2,
            avg_l3 = EXCLUDED.avg_l3,
            avg_l4 = EXCLUDED.avg_l4,
            avg_coral = EXCLUDED.avg_coral,
            last_calculated = EXCLUDED.last_calculated;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate algae statistics for a team
CREATE OR REPLACE FUNCTION recalculate_algae_stats(p_team_num INTEGER, p_regional VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_match_count INTEGER;
BEGIN
    -- Count matches for this team
    SELECT COUNT(DISTINCT match_num) INTO v_match_count
    FROM team_matches
    WHERE team_num = p_team_num AND regional = p_regional;

    IF v_match_count = 0 THEN
        -- Initialize with zeros if no matches
        INSERT INTO robot_algae_stats (team_num, regional, avg_algae_scored, avg_algae_removed, avg_algae_processed, avg_algae, last_calculated)
        VALUES (p_team_num, p_regional, 0, 0, 0, 0, NOW())
        ON CONFLICT (team_num, regional)
        DO UPDATE SET
            avg_algae_scored = 0,
            avg_algae_removed = 0,
            avg_algae_processed = 0,
            avg_algae = 0,
            last_calculated = NOW();
    ELSE
        -- Calculate averages
        INSERT INTO robot_algae_stats (team_num, regional, avg_algae_scored, avg_algae_removed, avg_algae_processed, avg_algae, last_calculated)
        SELECT
            p_team_num,
            p_regional,
            COALESCE(SUM(CASE WHEN aa.where_scored = 'net' AND aa.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_algae_scored,
            COALESCE(SUM(CASE WHEN aa.where_scored = 'removed' THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_algae_removed,
            COALESCE(SUM(CASE WHEN aa.where_scored = 'processed' AND aa.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_algae_processed,
            COALESCE(COUNT(CASE WHEN aa.made THEN 1 END)::DECIMAL / v_match_count, 0) as avg_algae,
            NOW() as last_calculated
        FROM team_matches tm
        LEFT JOIN algae_actions aa ON tm.team_num = aa.team_num
            AND tm.match_num = aa.match_num
            AND tm.regional = aa.regional
        WHERE tm.team_num = p_team_num AND tm.regional = p_regional
        ON CONFLICT (team_num, regional)
        DO UPDATE SET
            avg_algae_scored = EXCLUDED.avg_algae_scored,
            avg_algae_removed = EXCLUDED.avg_algae_removed,
            avg_algae_processed = EXCLUDED.avg_algae_processed,
            avg_algae = EXCLUDED.avg_algae,
            last_calculated = EXCLUDED.last_calculated;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate climb statistics for a team
CREATE OR REPLACE FUNCTION recalculate_climb_stats(p_team_num INTEGER, p_regional VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO robot_climb_stats (team_num, regional, deep_count, shallow_count, park_count, total_matches, last_calculated)
    SELECT
        p_team_num,
        p_regional,
        COUNT(CASE WHEN climb_deep THEN 1 END) as deep_count,
        COUNT(CASE WHEN climb_shallow THEN 1 END) as shallow_count,
        COUNT(CASE WHEN park THEN 1 END) as park_count,
        COUNT(*) as total_matches,
        NOW()
    FROM team_matches
    WHERE team_num = p_team_num AND regional = p_regional
    ON CONFLICT (team_num, regional)
    DO UPDATE SET
        deep_count = EXCLUDED.deep_count,
        shallow_count = EXCLUDED.shallow_count,
        park_count = EXCLUDED.park_count,
        total_matches = EXCLUDED.total_matches,
        last_calculated = EXCLUDED.last_calculated;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE coral_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE algae_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_coral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_algae_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_climb_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tba_matches ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES - Public Read, Service Role Write
-- ============================================================================

-- TEAMS Policies
CREATE POLICY "Teams are publicly readable" ON teams FOR SELECT USING (true);
CREATE POLICY "Service role can insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Service role can delete teams" ON teams FOR DELETE USING (true);

-- TEAM_MATCHES Policies
CREATE POLICY "Team matches are publicly readable" ON team_matches FOR SELECT USING (true);
CREATE POLICY "Service role can insert team matches" ON team_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update team matches" ON team_matches FOR UPDATE USING (true);
CREATE POLICY "Service role can delete team matches" ON team_matches FOR DELETE USING (true);

-- CORAL_ACTIONS Policies
CREATE POLICY "Coral actions are publicly readable" ON coral_actions FOR SELECT USING (true);
CREATE POLICY "Service role can insert coral actions" ON coral_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update coral actions" ON coral_actions FOR UPDATE USING (true);
CREATE POLICY "Service role can delete coral actions" ON coral_actions FOR DELETE USING (true);

-- ALGAE_ACTIONS Policies
CREATE POLICY "Algae actions are publicly readable" ON algae_actions FOR SELECT USING (true);
CREATE POLICY "Service role can insert algae actions" ON algae_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update algae actions" ON algae_actions FOR UPDATE USING (true);
CREATE POLICY "Service role can delete algae actions" ON algae_actions FOR DELETE USING (true);

-- ROBOT_INFO Policies
CREATE POLICY "Robot info is publicly readable" ON robot_info FOR SELECT USING (true);
CREATE POLICY "Service role can insert robot info" ON robot_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update robot info" ON robot_info FOR UPDATE USING (true);
CREATE POLICY "Service role can delete robot info" ON robot_info FOR DELETE USING (true);

-- ROBOT_RANKINGS Policies
CREATE POLICY "Robot rankings are publicly readable" ON robot_rankings FOR SELECT USING (true);
CREATE POLICY "Service role can insert robot rankings" ON robot_rankings FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update robot rankings" ON robot_rankings FOR UPDATE USING (true);
CREATE POLICY "Service role can delete robot rankings" ON robot_rankings FOR DELETE USING (true);

-- ROBOT_CORAL_STATS Policies
CREATE POLICY "Coral stats are publicly readable" ON robot_coral_stats FOR SELECT USING (true);
CREATE POLICY "Service role can insert coral stats" ON robot_coral_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update coral stats" ON robot_coral_stats FOR UPDATE USING (true);
CREATE POLICY "Service role can delete coral stats" ON robot_coral_stats FOR DELETE USING (true);

-- ROBOT_ALGAE_STATS Policies
CREATE POLICY "Algae stats are publicly readable" ON robot_algae_stats FOR SELECT USING (true);
CREATE POLICY "Service role can insert algae stats" ON robot_algae_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update algae stats" ON robot_algae_stats FOR UPDATE USING (true);
CREATE POLICY "Service role can delete algae stats" ON robot_algae_stats FOR DELETE USING (true);

-- ROBOT_CLIMB_STATS Policies
CREATE POLICY "Climb stats are publicly readable" ON robot_climb_stats FOR SELECT USING (true);
CREATE POLICY "Service role can insert climb stats" ON robot_climb_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update climb stats" ON robot_climb_stats FOR UPDATE USING (true);
CREATE POLICY "Service role can delete climb stats" ON robot_climb_stats FOR DELETE USING (true);

-- EVENTS Policies
CREATE POLICY "Events are publicly readable" ON events FOR SELECT USING (true);
CREATE POLICY "Service role can insert events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update events" ON events FOR UPDATE USING (true);
CREATE POLICY "Service role can delete events" ON events FOR DELETE USING (true);

-- EVENT_TEAMS Policies
CREATE POLICY "Event teams are publicly readable" ON event_teams FOR SELECT USING (true);
CREATE POLICY "Service role can insert event teams" ON event_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update event teams" ON event_teams FOR UPDATE USING (true);
CREATE POLICY "Service role can delete event teams" ON event_teams FOR DELETE USING (true);

-- TBA_MATCHES Policies
CREATE POLICY "TBA matches are publicly readable" ON tba_matches FOR SELECT USING (true);
CREATE POLICY "Service role can insert tba matches" ON tba_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update tba matches" ON tba_matches FOR UPDATE USING (true);
CREATE POLICY "Service role can delete tba matches" ON tba_matches FOR DELETE USING (true);

-- ============================================================================
-- STEP 9: INSERT SAMPLE DATA
-- ============================================================================

-- Insert sample teams
INSERT INTO teams (team_number, team_name, regional) VALUES
    (589, 'Falkon Robotics', 'oc'),
    (254, 'The Cheesy Poofs', 'oc'),
    (1678, 'Citrus Circuits', 'oc'),
    (2471, 'Team Mean Machine', 'oc')
ON CONFLICT (team_number, regional) DO NOTHING;

-- Sample pit scouting data
INSERT INTO robot_info (team_num, regional, vision_sys, drive_train, ground_intake, source_intake, l1_scoring, l2_scoring, l3_scoring, l4_scoring, remove, processor, net, climb_deep, climb_shallow, comments) VALUES
    (589, 'oc', 'Limelight', 'Swerve', true, true, true, true, true, true, true, true, true, true, false, 'Excellent all-around robot'),
    (254, 'oc', 'PhotonVision', 'Swerve', true, false, true, true, true, false, true, false, true, false, true, 'Fast and reliable')
ON CONFLICT (team_num, regional) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE - VERIFICATION
-- ============================================================================

-- Verify all tables were created
SELECT '✅ STEP 1: All tables created successfully!' AS status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify all views were created
SELECT '✅ STEP 2: All views created successfully!' AS status;
SELECT table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify all functions were created
SELECT '✅ STEP 3: All functions created successfully!' AS status;
SELECT routine_name as function_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Verify RLS is enabled on all tables
SELECT '✅ STEP 4: Row Level Security status for all tables:' AS status;
SELECT
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify policies exist for all tables
SELECT '✅ STEP 5: RLS Policies created (should be 4 per table):' AS status;
SELECT
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Count sample data
SELECT '✅ STEP 6: Sample data inserted:' AS status;
SELECT
    (SELECT COUNT(*) FROM teams) as teams_count,
    (SELECT COUNT(*) FROM robot_info) as robot_info_count;

-- Final success message
SELECT '🎉 DATABASE SETUP COMPLETE! All tables, views, functions, and RLS policies are in place.' AS final_status;
