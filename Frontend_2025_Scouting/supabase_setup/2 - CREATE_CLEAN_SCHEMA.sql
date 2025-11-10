-- ============================================================================
-- CLEAN SLATE SCHEMA CREATION SCRIPT
-- ============================================================================
-- Purpose: Create the entire FRC 589 Scouting App database schema from scratch
-- Version: 2.0.0
-- Date: 2025-11-09
--
-- This script creates a minimal, clean schema with no legacy components.
-- Use this to set up a new Supabase project or rebuild from scratch.
--
-- TABLES (6):
--   - app_metadata: Application configuration
--   - user_profiles: User accounts and permissions
--   - game_scoring_config: REEFSCAPE scoring point values (admin-configurable)
--   - match_reports: Match scouting data
--   - pit_reports: Pit scouting data (robot capabilities)
--   - robot_stats: Calculated statistics (auto-updated by trigger)
--
-- VIEWS (2):
--   - robots_complete: Leaderboard view (robot_stats + pit_reports)
--   - admin_user_list: Admin dashboard view
--
-- FUNCTIONS (8):
--   - get_reefscape_scoring_config: Returns scoring point values
--   - calculate_match_score: Calculates match score from game elements
--   - trigger_calculate_match_score: Auto-calculate match score on insert/update
--   - trigger_recalculate_stats: Trigger wrapper for stats calculation
--   - recalculate_team_stats: Main stats calculation logic (includes match scoring)
--   - create_user_profile: Creates profile on user signup
--   - is_user_admin: Admin permission check for RLS
--   - check_schema_compatibility: Frontend version compatibility check
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABLE 1: app_metadata
-- ============================================================================
-- Purpose: Application-wide configuration and metadata
-- Single row table (id = 1) for app settings

CREATE TABLE IF NOT EXISTS app_metadata (
    id INTEGER PRIMARY KEY DEFAULT 1,

    -- App identification
    app_name TEXT NOT NULL DEFAULT 'FRC 589 Scouting App',
    game_name TEXT NOT NULL DEFAULT 'REEFSCAPE',
    game_year INTEGER NOT NULL DEFAULT 2025,

    -- Version management
    schema_version TEXT NOT NULL DEFAULT '2.0.0',
    min_frontend_version TEXT NOT NULL DEFAULT '2.0.0',
    min_backend_version TEXT NOT NULL DEFAULT '2.0.0',

    -- Competition management
    active_competition VARCHAR,
    available_competitions JSONB DEFAULT '[]'::jsonb,

    -- Feature flags
    feature_flags JSONB DEFAULT '{
        "match_scouting": true,
        "pit_scouting": true,
        "analytics": true,
        "realtime_updates": false
    }'::jsonb,

    -- Health monitoring
    database_status TEXT NOT NULL DEFAULT 'ready',
    health_check_key TEXT NOT NULL DEFAULT 'alive',
    last_health_check TIMESTAMP WITH TIME ZONE,

    -- Migration tracking
    last_migration_name TEXT,
    last_migration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    schema_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Ensure only one row
    CONSTRAINT app_metadata_id_check CHECK (id = 1)
);

COMMENT ON TABLE app_metadata IS 'Application-wide configuration and metadata (single row)';

-- ============================================================================
-- TABLE 2: user_profiles
-- ============================================================================
-- Purpose: User accounts and permissions (extends auth.users)
-- Note: Created before game_scoring_config because that table references it

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- User info
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    team_number INTEGER,

    -- Permissions
    is_admin BOOLEAN DEFAULT FALSE,

    -- Preferences
    default_regional VARCHAR,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS 'User accounts and permissions';

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_is_admin ON user_profiles(is_admin);

-- ============================================================================
-- TABLE 3: game_scoring_config
-- ============================================================================
-- Purpose: REEFSCAPE scoring point values (admin-configurable)

CREATE TABLE IF NOT EXISTS game_scoring_config (
    id INTEGER PRIMARY KEY DEFAULT 1,

    -- Coral scoring points - AUTO period
    auto_coral_l1_points INTEGER NOT NULL DEFAULT 3,
    auto_coral_l2_points INTEGER NOT NULL DEFAULT 4,
    auto_coral_l3_points INTEGER NOT NULL DEFAULT 6,
    auto_coral_l4_points INTEGER NOT NULL DEFAULT 7,

    -- Coral scoring points - TELEOP period
    tele_coral_l1_points INTEGER NOT NULL DEFAULT 2,
    tele_coral_l2_points INTEGER NOT NULL DEFAULT 3,
    tele_coral_l3_points INTEGER NOT NULL DEFAULT 4,
    tele_coral_l4_points INTEGER NOT NULL DEFAULT 5,

    -- Algae scoring points (same for AUTO and TELEOP)
    algae_net_points INTEGER NOT NULL DEFAULT 4,
    algae_processor_points INTEGER NOT NULL DEFAULT 6,

    -- Endgame scoring points
    park_points INTEGER NOT NULL DEFAULT 2,
    climb_shallow_points INTEGER NOT NULL DEFAULT 6,
    climb_deep_points INTEGER NOT NULL DEFAULT 12,

    -- Leave bonus (AUTO only)
    leave_points INTEGER NOT NULL DEFAULT 3,

    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES user_profiles(id),

    -- Ensure only one row
    CONSTRAINT game_scoring_config_id_check CHECK (id = 1)
);

COMMENT ON TABLE game_scoring_config IS 'REEFSCAPE scoring point values - admin-configurable through UI';

-- ============================================================================
-- TABLE 4: match_reports
-- ============================================================================
-- Purpose: Match scouting data - one row per team per match

CREATE SEQUENCE IF NOT EXISTS matches_id_seq;

CREATE TABLE IF NOT EXISTS match_reports (
    id INTEGER PRIMARY KEY DEFAULT nextval('matches_id_seq'),

    -- Match identification
    team_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    regional VARCHAR NOT NULL,

    -- Auto period scoring
    auto_l1_scored INTEGER DEFAULT 0,
    auto_l2_scored INTEGER DEFAULT 0,
    auto_l3_scored INTEGER DEFAULT 0,
    auto_l4_scored INTEGER DEFAULT 0,
    auto_algae_scored INTEGER DEFAULT 0,
    auto_starting_position INTEGER,

    -- Teleop period scoring
    tele_l1_scored INTEGER DEFAULT 0,
    tele_l2_scored INTEGER DEFAULT 0,
    tele_l3_scored INTEGER DEFAULT 0,
    tele_l4_scored INTEGER DEFAULT 0,
    tele_algae_scored INTEGER DEFAULT 0,

    -- Total scoring (auto + tele)
    total_l1_scored INTEGER DEFAULT 0,
    total_l2_scored INTEGER DEFAULT 0,
    total_l3_scored INTEGER DEFAULT 0,
    total_l4_scored INTEGER DEFAULT 0,
    total_algae_scored INTEGER DEFAULT 0,

    -- Algae processing
    algae_removed INTEGER DEFAULT 0,
    algae_processed INTEGER DEFAULT 0,

    -- Endgame
    climb_deep BOOLEAN DEFAULT FALSE,
    climb_shallow BOOLEAN DEFAULT FALSE,
    park BOOLEAN DEFAULT FALSE,

    -- Calculated match score
    match_score INTEGER DEFAULT 0,

    -- Match quality
    defence BOOLEAN DEFAULT FALSE,
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),

    -- Issues
    no_show BOOLEAN DEFAULT FALSE,
    disabled BOOLEAN DEFAULT FALSE,
    malfunction BOOLEAN DEFAULT FALSE,
    comments TEXT,

    -- Metadata
    submitted_by UUID REFERENCES user_profiles(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint: one report per team per match per competition
    CONSTRAINT matches_unique_team_match_regional
        UNIQUE (team_number, match_number, regional)
);

COMMENT ON TABLE match_reports IS 'Match scouting data - one row per team per match';

-- Indexes for query performance
CREATE INDEX idx_match_reports_team ON match_reports(team_number, regional);
CREATE INDEX idx_match_reports_match_number ON match_reports(match_number);
CREATE INDEX idx_match_reports_regional ON match_reports(regional);
CREATE INDEX idx_match_reports_submitted_by ON match_reports(submitted_by);
CREATE INDEX idx_match_reports_submitted_at ON match_reports(submitted_at);

-- ============================================================================
-- TABLE 5: pit_reports
-- ============================================================================
-- Purpose: Pit scouting data - robot capabilities observed in pits

CREATE TABLE IF NOT EXISTS pit_reports (
    team_number INTEGER NOT NULL,
    regional VARCHAR NOT NULL,

    -- Robot systems
    vision_sys VARCHAR,
    drive_train VARCHAR,
    ground_intake BOOLEAN DEFAULT FALSE,
    source_intake BOOLEAN DEFAULT FALSE,

    -- Scoring capabilities
    l1_scoring BOOLEAN DEFAULT FALSE,
    l2_scoring BOOLEAN DEFAULT FALSE,
    l3_scoring BOOLEAN DEFAULT FALSE,
    l4_scoring BOOLEAN DEFAULT FALSE,

    -- Algae capabilities
    can_remove BOOLEAN DEFAULT FALSE,
    can_process BOOLEAN DEFAULT FALSE,
    can_net BOOLEAN DEFAULT FALSE,

    -- Endgame capabilities
    can_climb_deep BOOLEAN DEFAULT FALSE,
    can_climb_shallow BOOLEAN DEFAULT FALSE,

    -- Notes
    comments TEXT,

    -- Metadata
    submitted_by UUID REFERENCES user_profiles(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Primary key: one pit report per team per competition
    PRIMARY KEY (team_number, regional)
);

COMMENT ON TABLE pit_reports IS 'Pit scouting data - robot capabilities observed in pits';

CREATE INDEX idx_pit_reports_regional ON pit_reports(regional);
CREATE INDEX idx_pit_reports_submitted_by ON pit_reports(submitted_by);

-- ============================================================================
-- TABLE 6: robot_stats
-- ============================================================================
-- Purpose: Calculated statistics - auto-updated by trigger on match_reports

CREATE TABLE IF NOT EXISTS robot_stats (
    team_number INTEGER NOT NULL,
    regional VARCHAR NOT NULL,

    -- Match count
    matches_played INTEGER DEFAULT 0,

    -- Average coral scoring
    avg_l1 NUMERIC(5,2) DEFAULT 0,
    avg_l2 NUMERIC(5,2) DEFAULT 0,
    avg_l3 NUMERIC(5,2) DEFAULT 0,
    avg_l4 NUMERIC(5,2) DEFAULT 0,
    avg_coral NUMERIC(5,2) DEFAULT 0, -- Total coral (L1+L2+L3+L4)

    -- Average algae operations
    avg_algae_scored NUMERIC(5,2) DEFAULT 0,
    avg_algae_removed NUMERIC(5,2) DEFAULT 0,
    avg_algae_processed NUMERIC(5,2) DEFAULT 0,
    avg_algae NUMERIC(5,2) DEFAULT 0, -- Total algae (scored+removed+processed)

    -- Average endgame
    avg_climb_deep NUMERIC(5,2) DEFAULT 0,
    avg_climb_shallow NUMERIC(5,2) DEFAULT 0,
    avg_park NUMERIC(5,2) DEFAULT 0,

    -- Average match score
    avg_match_score NUMERIC(6,2) DEFAULT 0,

    -- Overall ranking (based on avg_match_score)
    rank_value NUMERIC(6,2) DEFAULT 0,

    -- Timestamp
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Primary key: one stats record per team per competition
    PRIMARY KEY (team_number, regional)
);

COMMENT ON TABLE robot_stats IS 'Calculated statistics - auto-updated by trigger on match_reports changes';

CREATE INDEX idx_robot_stats_regional ON robot_stats(regional);
CREATE INDEX idx_robot_stats_rank ON robot_stats(rank_value);

-- ============================================================================
-- VIEW 1: robots_complete
-- ============================================================================
-- Purpose: Leaderboard view - combines robot_stats with pit_reports

CREATE OR REPLACE VIEW robots_complete
WITH (security_invoker = true) AS
SELECT
    -- Team identification (from robot_stats)
    rs.team_number AS team_num,
    rs.regional,

    -- Pit report data (capabilities observed in pits)
    pr.vision_sys,
    pr.drive_train,
    pr.ground_intake,
    pr.source_intake,
    pr.l1_scoring,
    pr.l2_scoring,
    pr.l3_scoring,
    pr.l4_scoring,
    pr.can_remove,
    pr.can_process,
    pr.can_net,
    pr.can_climb_deep,
    pr.can_climb_shallow,
    pr.comments,

    -- Match performance statistics
    rs.rank_value,
    rs.avg_l1,
    rs.avg_l2,
    rs.avg_l3,
    rs.avg_l4,
    rs.avg_coral,
    rs.avg_algae_scored,
    rs.avg_algae_removed,
    rs.avg_algae_processed,
    rs.avg_algae,
    rs.avg_climb_deep,
    rs.avg_climb_shallow,
    rs.avg_park,
    rs.matches_played

FROM robot_stats rs
LEFT JOIN pit_reports pr
    ON rs.team_number = pr.team_number
    AND rs.regional = pr.regional
ORDER BY rs.regional, rs.rank_value;

COMMENT ON VIEW robots_complete IS 'Leaderboard view - combines robot_stats with pit_reports (INVOKER security for RLS compliance)';

-- ============================================================================
-- VIEW 2: admin_user_list
-- ============================================================================
-- Purpose: Admin dashboard view - user stats

CREATE OR REPLACE VIEW admin_user_list
WITH (security_invoker = true) AS
SELECT
    up.id,
    up.email,
    up.display_name,
    up.team_number,
    up.is_admin,
    up.default_regional,
    up.created_at,
    up.last_login,
    COUNT(DISTINCT m.id) AS total_matches_submitted,
    COUNT(DISTINCT (pr.team_number || '_' || pr.regional)) AS total_pit_reports_submitted
FROM user_profiles up
LEFT JOIN match_reports m ON m.submitted_by = up.id
LEFT JOIN pit_reports pr ON pr.submitted_by = up.id
GROUP BY up.id, up.email, up.display_name, up.team_number, up.is_admin,
         up.default_regional, up.created_at, up.last_login
ORDER BY up.created_at DESC;

COMMENT ON VIEW admin_user_list IS 'Admin dashboard view - user submission statistics (INVOKER security for RLS compliance)';

-- ============================================================================
-- FUNCTION 1: get_reefscape_scoring_config
-- ============================================================================
-- Purpose: Returns scoring point values for REEFSCAPE from game_scoring_config table

CREATE OR REPLACE FUNCTION get_reefscape_scoring_config()
RETURNS TABLE (
    config_key TEXT,
    config_value INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_config RECORD;
BEGIN
    SELECT * INTO v_config FROM game_scoring_config WHERE id = 1;

    RETURN QUERY SELECT * FROM (VALUES
        ('auto_coral_l1_points', v_config.auto_coral_l1_points),
        ('auto_coral_l2_points', v_config.auto_coral_l2_points),
        ('auto_coral_l3_points', v_config.auto_coral_l3_points),
        ('auto_coral_l4_points', v_config.auto_coral_l4_points),
        ('tele_coral_l1_points', v_config.tele_coral_l1_points),
        ('tele_coral_l2_points', v_config.tele_coral_l2_points),
        ('tele_coral_l3_points', v_config.tele_coral_l3_points),
        ('tele_coral_l4_points', v_config.tele_coral_l4_points),
        ('algae_net_points', v_config.algae_net_points),
        ('algae_processor_points', v_config.algae_processor_points),
        ('park_points', v_config.park_points),
        ('climb_shallow_points', v_config.climb_shallow_points),
        ('climb_deep_points', v_config.climb_deep_points),
        ('leave_points', v_config.leave_points)
    ) AS config(config_key, config_value);
END;
$$;

COMMENT ON FUNCTION get_reefscape_scoring_config IS 'Returns REEFSCAPE scoring point values from game_scoring_config table';

-- ============================================================================
-- FUNCTION 2: calculate_match_score
-- ============================================================================
-- Purpose: Calculate match score based on game element counts and endgame status

CREATE OR REPLACE FUNCTION calculate_match_score(
    p_auto_l1 INTEGER,
    p_auto_l2 INTEGER,
    p_auto_l3 INTEGER,
    p_auto_l4 INTEGER,
    p_auto_algae INTEGER,
    p_tele_l1 INTEGER,
    p_tele_l2 INTEGER,
    p_tele_l3 INTEGER,
    p_tele_l4 INTEGER,
    p_tele_algae INTEGER,
    p_algae_processed INTEGER,
    p_climb_deep BOOLEAN,
    p_climb_shallow BOOLEAN,
    p_park BOOLEAN
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_score INTEGER := 0;
    v_config RECORD;
BEGIN
    -- Get scoring configuration
    SELECT * INTO v_config FROM game_scoring_config WHERE id = 1;

    -- AUTO period coral scoring
    v_score := v_score + (p_auto_l1 * v_config.auto_coral_l1_points);
    v_score := v_score + (p_auto_l2 * v_config.auto_coral_l2_points);
    v_score := v_score + (p_auto_l3 * v_config.auto_coral_l3_points);
    v_score := v_score + (p_auto_l4 * v_config.auto_coral_l4_points);

    -- TELEOP period coral scoring
    v_score := v_score + (p_tele_l1 * v_config.tele_coral_l1_points);
    v_score := v_score + (p_tele_l2 * v_config.tele_coral_l2_points);
    v_score := v_score + (p_tele_l3 * v_config.tele_coral_l3_points);
    v_score := v_score + (p_tele_l4 * v_config.tele_coral_l4_points);

    -- Algae scoring (NET and PROCESSOR)
    -- Note: p_auto_algae and p_tele_algae are "scored in NET" (total_algae_scored)
    v_score := v_score + ((p_auto_algae + p_tele_algae) * v_config.algae_net_points);
    v_score := v_score + (p_algae_processed * v_config.algae_processor_points);

    -- Endgame scoring
    IF p_climb_deep THEN
        v_score := v_score + v_config.climb_deep_points;
    END IF;

    IF p_climb_shallow THEN
        v_score := v_score + v_config.climb_shallow_points;
    END IF;

    IF p_park THEN
        v_score := v_score + v_config.park_points;
    END IF;

    RETURN v_score;
END;
$$;

COMMENT ON FUNCTION calculate_match_score IS 'Calculate total match score based on game elements and endgame status';

-- ============================================================================
-- FUNCTION 3: trigger_calculate_match_score
-- ============================================================================
-- Purpose: Auto-calculate match_score before insert/update on match_reports

CREATE OR REPLACE FUNCTION trigger_calculate_match_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    -- Calculate match score before insert/update
    -- Pass auto and tele scores separately for correct point calculation
    NEW.match_score := calculate_match_score(
        NEW.auto_l1_scored,
        NEW.auto_l2_scored,
        NEW.auto_l3_scored,
        NEW.auto_l4_scored,
        NEW.auto_algae_scored,
        NEW.tele_l1_scored,
        NEW.tele_l2_scored,
        NEW.tele_l3_scored,
        NEW.tele_l4_scored,
        NEW.tele_algae_scored,
        COALESCE(NEW.algae_processed, 0),
        NEW.climb_deep,
        NEW.climb_shallow,
        NEW.park
    );

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_calculate_match_score IS 'Auto-calculate match_score before insert/update on match_reports';

-- ============================================================================
-- FUNCTION 4: trigger_recalculate_stats
-- ============================================================================
-- Purpose: Trigger wrapper for auto-recalculating robot_stats

CREATE OR REPLACE FUNCTION trigger_recalculate_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_team_stats(OLD.team_number, OLD.regional);
        RETURN OLD;
    ELSE
        PERFORM recalculate_team_stats(NEW.team_number, NEW.regional);
        RETURN NEW;
    END IF;
END;
$$;

COMMENT ON FUNCTION trigger_recalculate_stats IS 'Trigger wrapper - auto-recalculates robot_stats when match_reports changes';

-- ============================================================================
-- FUNCTION 5: recalculate_team_stats
-- ============================================================================
-- Purpose: Calculate team statistics from match_reports and update robot_stats

CREATE OR REPLACE FUNCTION recalculate_team_stats(
    p_team_number INTEGER,
    p_regional VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_matches_played INTEGER;
    v_avg_l1 DECIMAL(5,2);
    v_avg_l2 DECIMAL(5,2);
    v_avg_l3 DECIMAL(5,2);
    v_avg_l4 DECIMAL(5,2);
    v_avg_coral DECIMAL(5,2);
    v_avg_algae_scored DECIMAL(5,2);
    v_avg_algae_removed DECIMAL(5,2);
    v_avg_algae_processed DECIMAL(5,2);
    v_avg_algae DECIMAL(5,2);
    v_avg_climb_deep DECIMAL(5,2);
    v_avg_climb_shallow DECIMAL(5,2);
    v_avg_park DECIMAL(5,2);
    v_avg_match_score DECIMAL(6,2);
BEGIN
    -- Calculate statistics from match_reports using TOTAL columns
    -- Excludes no-shows and disabled robots
    SELECT
        COUNT(*),
        COALESCE(AVG(total_l1_scored), 0),
        COALESCE(AVG(total_l2_scored), 0),
        COALESCE(AVG(total_l3_scored), 0),
        COALESCE(AVG(total_l4_scored), 0),
        COALESCE(AVG(total_l1_scored + total_l2_scored + total_l3_scored + total_l4_scored), 0),
        COALESCE(AVG(total_algae_scored), 0),
        COALESCE(AVG(algae_removed), 0),
        COALESCE(AVG(algae_processed), 0),
        COALESCE(AVG(total_algae_scored + COALESCE(algae_removed, 0) + COALESCE(algae_processed, 0)), 0),
        COALESCE(AVG(CASE WHEN climb_deep THEN 1 ELSE 0 END), 0),
        COALESCE(AVG(CASE WHEN climb_shallow THEN 1 ELSE 0 END), 0),
        COALESCE(AVG(CASE WHEN park THEN 1 ELSE 0 END), 0),
        COALESCE(AVG(match_score), 0)
    INTO
        v_matches_played,
        v_avg_l1, v_avg_l2, v_avg_l3, v_avg_l4, v_avg_coral,
        v_avg_algae_scored, v_avg_algae_removed, v_avg_algae_processed, v_avg_algae,
        v_avg_climb_deep, v_avg_climb_shallow, v_avg_park,
        v_avg_match_score
    FROM match_reports
    WHERE team_number = p_team_number
      AND regional = p_regional
      AND COALESCE(no_show, false) = false
      AND COALESCE(disabled, false) = false;

    -- Upsert into robot_stats
    -- rank_value is set equal to avg_match_score for sorting
    INSERT INTO robot_stats (
        team_number, regional,
        matches_played,
        avg_l1, avg_l2, avg_l3, avg_l4, avg_coral,
        avg_algae_scored, avg_algae_removed, avg_algae_processed, avg_algae,
        avg_climb_deep, avg_climb_shallow, avg_park,
        avg_match_score,
        rank_value,
        updated_at
    ) VALUES (
        p_team_number, p_regional,
        v_matches_played,
        v_avg_l1, v_avg_l2, v_avg_l3, v_avg_l4, v_avg_coral,
        v_avg_algae_scored, v_avg_algae_removed, v_avg_algae_processed, v_avg_algae,
        v_avg_climb_deep, v_avg_climb_shallow, v_avg_park,
        v_avg_match_score,
        v_avg_match_score, -- rank_value = avg_match_score
        NOW()
    )
    ON CONFLICT (team_number, regional) DO UPDATE SET
        matches_played = v_matches_played,
        avg_l1 = v_avg_l1,
        avg_l2 = v_avg_l2,
        avg_l3 = v_avg_l3,
        avg_l4 = v_avg_l4,
        avg_coral = v_avg_coral,
        avg_algae_scored = v_avg_algae_scored,
        avg_algae_removed = v_avg_algae_removed,
        avg_algae_processed = v_avg_algae_processed,
        avg_algae = v_avg_algae,
        avg_climb_deep = v_avg_climb_deep,
        avg_climb_shallow = v_avg_climb_shallow,
        avg_park = v_avg_park,
        avg_match_score = v_avg_match_score,
        rank_value = v_avg_match_score, -- rank_value = avg_match_score
        updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION recalculate_team_stats IS 'Calculate team statistics including average match score and ranking';

-- ============================================================================
-- FUNCTION 6: create_user_profile
-- ============================================================================
-- Purpose: Auto-create user_profiles entry when auth.users is created

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_user_profile IS 'Auto-create user_profiles entry on user signup (DEFINER security for auth.users access)';

-- ============================================================================
-- FUNCTION 7: is_user_admin
-- ============================================================================
-- Purpose: Check if a user is an admin (used by RLS policies)

CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN
    SELECT is_admin INTO admin_status
    FROM user_profiles
    WHERE id = user_id;

    RETURN COALESCE(admin_status, false);
END;
$$;

COMMENT ON FUNCTION is_user_admin IS 'Check if user is admin - used by RLS policies (DEFINER security)';

-- ============================================================================
-- FUNCTION 8: check_schema_compatibility
-- ============================================================================
-- Purpose: Check if client schema version matches database

CREATE OR REPLACE FUNCTION check_schema_compatibility(client_version TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT schema_version = client_version
        FROM app_metadata
        WHERE id = 1
    );
END;
$$;

COMMENT ON FUNCTION check_schema_compatibility IS 'Check if client schema version matches database (INVOKER security for RLS compliance)';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-calculate match_score before insert/update
CREATE TRIGGER trigger_auto_calculate_match_score
    BEFORE INSERT OR UPDATE ON match_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_match_score();

-- Auto-recalculate robot_stats when match_reports changes
CREATE TRIGGER trigger_auto_recalculate_stats
    AFTER INSERT OR UPDATE OR DELETE ON match_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_stats();

-- Auto-create user_profiles when auth.users is created
-- Note: This trigger is on auth.users table, created via Supabase dashboard
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION create_user_profile();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE app_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_stats ENABLE ROW LEVEL SECURITY;

-- app_metadata policies
CREATE POLICY "Public read access to app_metadata"
    ON app_metadata FOR SELECT
    USING (true);

CREATE POLICY "No public insert to app_metadata"
    ON app_metadata FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Service role can update app_metadata"
    ON app_metadata FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "No public delete from app_metadata"
    ON app_metadata FOR DELETE
    USING (false);

-- game_scoring_config policies
CREATE POLICY "Public read access to game_scoring_config"
    ON game_scoring_config FOR SELECT
    USING (true);

CREATE POLICY "No public insert to game_scoring_config"
    ON game_scoring_config FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Admins can update game_scoring_config"
    ON game_scoring_config FOR UPDATE
    USING (is_user_admin(auth.uid()))
    WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "No public delete from game_scoring_config"
    ON game_scoring_config FOR DELETE
    USING (false);

-- user_profiles policies
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (is_user_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
    ON user_profiles FOR UPDATE
    USING (is_user_admin(auth.uid()));

CREATE POLICY "Service role can insert profiles"
    ON user_profiles FOR INSERT
    WITH CHECK (true);

-- match_reports policies
CREATE POLICY "Allow public read access to matches"
    ON match_reports FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to insert matches"
    ON match_reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update matches"
    ON match_reports FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete matches"
    ON match_reports FOR DELETE
    USING (true);

-- pit_reports policies
CREATE POLICY "Allow public read access to robot_info"
    ON pit_reports FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to insert robot_info"
    ON pit_reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update robot_info"
    ON pit_reports FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- robot_stats policies
CREATE POLICY "Allow public read access to robot_stats"
    ON robot_stats FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to insert robot_stats"
    ON robot_stats FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update robot_stats"
    ON robot_stats FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role full access to robot_stats"
    ON robot_stats FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert initial app_metadata row
INSERT INTO app_metadata (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Insert initial game_scoring_config row with official REEFSCAPE values
-- Source: Table 6-2 REEFSCAPE point values (official game manual)
INSERT INTO game_scoring_config (
    id,
    auto_coral_l1_points, auto_coral_l2_points, auto_coral_l3_points, auto_coral_l4_points,
    tele_coral_l1_points, tele_coral_l2_points, tele_coral_l3_points, tele_coral_l4_points,
    algae_net_points, algae_processor_points,
    park_points, climb_shallow_points, climb_deep_points,
    leave_points
) VALUES (
    1,
    3, 4, 6, 7,        -- AUTO coral scoring (L1, L2, L3, L4)
    2, 3, 4, 5,        -- TELEOP coral scoring (L1, L2, L3, L4)
    4, 6,              -- Algae scoring (NET, PROCESSOR)
    2, 6, 12,          -- Endgame scoring (PARK, shallow cage, deep cage)
    3                  -- LEAVE bonus (AUTO)
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT 'Tables created:' as status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify views created
SELECT 'Views created:' as status;
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify functions created
SELECT 'Functions created:' as status;
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verify triggers created
SELECT 'Triggers created:' as status;
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Create auth.users trigger via Supabase dashboard (SQL Editor):
--    CREATE TRIGGER on_auth_user_created
--      AFTER INSERT ON auth.users
--      FOR EACH ROW
--      EXECUTE FUNCTION create_user_profile();
--
-- 2. Verify RLS policies are enabled
-- 3. Set up realtime subscriptions if needed
-- 4. Import data from existing database if migrating
-- ============================================================================
