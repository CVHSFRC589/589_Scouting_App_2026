-- Fix for recalculate_algae_stats function
-- The issue: INSERT has 7 columns but SELECT only returns 6 values

DROP FUNCTION IF EXISTS recalculate_algae_stats(INTEGER, VARCHAR);

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
        -- Calculate averages (FIXED: Added NOW() as the last_calculated value)
        INSERT INTO robot_algae_stats (team_num, regional, avg_algae_scored, avg_algae_removed, avg_algae_processed, avg_algae, last_calculated)
        SELECT
            p_team_num,
            p_regional,
            COALESCE(SUM(CASE WHEN aa.where_scored = 'net' AND aa.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_algae_scored,
            COALESCE(SUM(CASE WHEN aa.where_scored = 'removed' THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_algae_removed,
            COALESCE(SUM(CASE WHEN aa.where_scored = 'processed' AND aa.made THEN 1 ELSE 0 END)::DECIMAL / v_match_count, 0) as avg_algae_processed,
            COALESCE(COUNT(CASE WHEN aa.made THEN 1 END)::DECIMAL / v_match_count, 0) as avg_algae,
            NOW() as last_calculated  -- FIXED: Added this line
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

SELECT '✅ Function recalculate_algae_stats has been fixed!' AS status;
