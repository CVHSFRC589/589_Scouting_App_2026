-- ============================================================================
-- SUPABASE DIRECT FRONTEND SETUP
-- Row-Level Security, Triggers, and Functions for Direct Client Access
-- ============================================================================

-- ============================================================================
-- PART 1: ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reefscape_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE algae ENABLE ROW LEVEL SECURITY;
ALTER TABLE coral ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_rankings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Allow public read on teams" ON teams;
DROP POLICY IF EXISTS "Allow public read on matches" ON reefscape_matches;
DROP POLICY IF EXISTS "Allow public read on robot_info" ON robot_info;
DROP POLICY IF EXISTS "Allow public read on algae" ON algae;
DROP POLICY IF EXISTS "Allow public read on coral" ON coral;
DROP POLICY IF EXISTS "Allow public read on robot_stats" ON robot_stats;
DROP POLICY IF EXISTS "Allow public read on robot_rankings" ON robot_rankings;

DROP POLICY IF EXISTS "Allow inserts on matches" ON reefscape_matches;
DROP POLICY IF EXISTS "Allow updates on matches" ON reefscape_matches;
DROP POLICY IF EXISTS "Allow inserts on robot_info" ON robot_info;
DROP POLICY IF EXISTS "Allow updates on robot_info" ON robot_info;
DROP POLICY IF EXISTS "Allow upserts on robot_info" ON robot_info;
DROP POLICY IF EXISTS "Allow inserts on algae" ON algae;
DROP POLICY IF EXISTS "Allow inserts on coral" ON coral;
DROP POLICY IF EXISTS "Restrict deletes on matches" ON reefscape_matches;

-- READ POLICIES: Allow all users to read data
CREATE POLICY "Allow public read on teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on matches"
  ON reefscape_matches FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on robot_info"
  ON robot_info FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on algae"
  ON algae FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on coral"
  ON coral FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on robot_stats"
  ON robot_stats FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on robot_rankings"
  ON robot_rankings FOR SELECT
  USING (true);

-- WRITE POLICIES: Allow scouts to submit data
CREATE POLICY "Allow inserts on matches"
  ON reefscape_matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updates on matches"
  ON reefscape_matches FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow inserts on robot_info"
  ON robot_info FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updates on robot_info"
  ON robot_info FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow inserts on algae"
  ON algae FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow inserts on coral"
  ON coral FOR INSERT
  WITH CHECK (true);

-- RESTRICT DELETE: Only service role can delete (prevents accidental data loss)
CREATE POLICY "Restrict deletes on matches"
  ON reefscape_matches FOR DELETE
  USING (false);

-- ============================================================================
-- PART 2: STATISTICS CALCULATION FUNCTION
-- ============================================================================

-- Function to recalculate robot statistics when match data changes
CREATE OR REPLACE FUNCTION calculate_robot_stats(p_team_num INT, p_regional TEXT)
RETURNS void AS $$
BEGIN
  -- Ensure robot_stats record exists
  INSERT INTO robot_stats (team_num, regional, rank_value)
  VALUES (p_team_num, p_regional, 999)
  ON CONFLICT (team_num, regional) DO NOTHING;

  -- Update algae statistics
  UPDATE robot_stats
  SET
    avg_algae_scored = COALESCE((
      SELECT AVG(CASE WHEN made = true AND where_scored = 'net' THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM algae
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    avg_algae_removed = COALESCE((
      SELECT AVG(CASE WHEN made = true AND where_scored = 'removed' THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM algae
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    avg_algae_processed = COALESCE((
      SELECT AVG(CASE WHEN made = true AND where_scored = 'processor' THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM algae
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    avg_algae = COALESCE((
      SELECT AVG(CASE WHEN made = true THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM algae
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    -- Update coral statistics
    avg_l1 = COALESCE((
      SELECT AVG(CASE WHEN made = true AND level = 1 THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM coral
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    avg_l2 = COALESCE((
      SELECT AVG(CASE WHEN made = true AND level = 2 THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM coral
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    avg_l3 = COALESCE((
      SELECT AVG(CASE WHEN made = true AND level = 3 THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM coral
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    avg_l4 = COALESCE((
      SELECT AVG(CASE WHEN made = true AND level = 4 THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM coral
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    avg_coral = COALESCE((
      SELECT AVG(CASE WHEN made = true THEN 1 ELSE 0 END)::NUMERIC(10,2)
      FROM coral
      WHERE team_num = p_team_num AND regional = p_regional
    ), 0),
    last_updated = NOW()
  WHERE team_num = p_team_num AND regional = p_regional;

  -- Log the update
  RAISE NOTICE 'Statistics recalculated for team % in regional %', p_team_num, p_regional;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 3: TRIGGERS FOR AUTO-CALCULATION
-- ============================================================================

-- Trigger function to recalculate stats after algae/coral changes
CREATE OR REPLACE FUNCTION trigger_recalculate_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Use NEW record for INSERT/UPDATE, OLD for DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_robot_stats(OLD.team_num, OLD.regional);
  ELSE
    PERFORM calculate_robot_stats(NEW.team_num, NEW.regional);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS algae_stats_trigger ON algae;
DROP TRIGGER IF EXISTS coral_stats_trigger ON coral;

-- Create triggers for automatic statistics calculation
CREATE TRIGGER algae_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON algae
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_stats();

CREATE TRIGGER coral_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON coral
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_stats();

-- ============================================================================
-- PART 4: ENABLE REAL-TIME REPLICATION
-- ============================================================================

-- Enable real-time for relevant tables
-- Note: This must also be enabled in Supabase Dashboard > Database > Replication

-- You can check which tables have real-time enabled with:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- To enable via SQL (may require superuser):
-- ALTER PUBLICATION supabase_realtime ADD TABLE reefscape_matches;
-- ALTER PUBLICATION supabase_realtime ADD TABLE robot_info;
-- ALTER PUBLICATION supabase_realtime ADD TABLE robot_stats;
-- ALTER PUBLICATION supabase_realtime ADD TABLE algae;
-- ALTER PUBLICATION supabase_realtime ADD TABLE coral;

-- ============================================================================
-- PART 5: HELPER VIEWS (Optional but useful)
-- ============================================================================

-- Create or replace the robots_complete view to ensure it includes all necessary fields
CREATE OR REPLACE VIEW robots_complete AS
SELECT
  t.team_num,
  t.team_name,
  t.regional,
  COALESCE(rr.rank_value, 999) as rank_value,

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

  -- Statistics
  COALESCE(rs.avg_l1, 0) as avg_l1,
  COALESCE(rs.avg_l2, 0) as avg_l2,
  COALESCE(rs.avg_l3, 0) as avg_l3,
  COALESCE(rs.avg_l4, 0) as avg_l4,
  COALESCE(rs.avg_coral, 0) as avg_coral,
  COALESCE(rs.avg_algae_scored, 0) as avg_algae_scored,
  COALESCE(rs.avg_algae_removed, 0) as avg_algae_removed,
  COALESCE(rs.avg_algae_processed, 0) as avg_algae_processed,
  COALESCE(rs.avg_algae, 0) as avg_algae

FROM teams t
LEFT JOIN robot_rankings rr ON t.team_num = rr.team_num AND t.regional = rr.regional
LEFT JOIN robot_info ri ON t.team_num = ri.team_num AND t.regional = ri.regional
LEFT JOIN robot_stats rs ON t.team_num = rs.team_num AND t.regional = rs.regional;

-- Grant access to the view
GRANT SELECT ON robots_complete TO anon, authenticated;

-- ============================================================================
-- PART 6: VALIDATION AND TESTING
-- ============================================================================

-- Test the statistics calculation function
-- SELECT calculate_robot_stats(589, 'test-regional');

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- View all policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Enable real-time in Dashboard > Database > Replication for:
--    - reefscape_matches
--    - robot_info
--    - robot_stats
-- 3. Get your anon key from Dashboard > Settings > API
-- 4. Add anon key to frontend .env file
-- 5. Test connection from mobile app

-- ============================================================================
