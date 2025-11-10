# Match Scoring System and Algae Tracking Fixes - Implementation Summary

## Overview

This document summarizes all changes made to implement proper match scoring, team ranking, and algae tracking in the FRC 2025 REEFSCAPE scouting app.

---

## Changes Made

### 1. **Fixed Algae Removed & Algae Processed Tracking**

**Problem:** Algae removed and algae processed values were collected in the app but not being saved to the database.

**Solution:** Updated `supabaseService.tsx` to properly aggregate algae by type.

**Files Modified:**
- `Frontend_2025_Scouting/data/supabaseService.tsx`

**Changes:**
```typescript
// Added calculations to count algae by type
const autoAlgaeRemoved = matchData.algae?.filter(a => a.made && a.where_scored === 'removed').length || 0;
const autoAlgaeProcessed = matchData.algae?.filter(a => a.made && a.where_scored === 'processed').length || 0;
const teleAlgaeRemoved = matchData.tele_algae?.filter(a => a.made && a.where_scored === 'removed').length || 0;
const teleAlgaeProcessed = matchData.tele_algae?.filter(a => a.made && a.where_scored === 'processed').length || 0;

// Added to database upsert
algae_removed: totalAlgaeRemoved,
algae_processed: totalAlgaeProcessed,
```

---

### 2. **Implemented Match Scoring System**

**Problem:** Matches had no calculated score, and team rankings were always 0.

**Solution:** Created a comprehensive scoring system with:
- Admin-configurable scoring values in `game_scoring_config` table
- Automatic match score calculation via database trigger
- Team ranking based on average match score

**Files Modified:**
- `Frontend_2025_Scouting/supabase_setup/CREATE_CLEAN_SCHEMA.sql`

**New Database Components:**

#### A. New Table: `game_scoring_config`
```sql
CREATE TABLE game_scoring_config (
    id INTEGER PRIMARY KEY DEFAULT 1,

    -- Coral scoring points
    coral_l1_points INTEGER NOT NULL DEFAULT 3,
    coral_l2_points INTEGER NOT NULL DEFAULT 4,
    coral_l3_points INTEGER NOT NULL DEFAULT 6,
    coral_l4_points INTEGER NOT NULL DEFAULT 8,

    -- Algae scoring points
    algae_net_points INTEGER NOT NULL DEFAULT 4,
    algae_processed_points INTEGER NOT NULL DEFAULT 6,
    algae_removed_points INTEGER NOT NULL DEFAULT 3,

    -- Endgame scoring points
    climb_deep_points INTEGER NOT NULL DEFAULT 12,
    climb_shallow_points INTEGER NOT NULL DEFAULT 6,
    park_points INTEGER NOT NULL DEFAULT 2,

    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES user_profiles(id)
);
```

#### B. New Column: `match_reports.match_score`
- Stores the calculated total score for each match
- Auto-calculated by trigger on INSERT/UPDATE

#### C. New Column: `robot_stats.avg_match_score`
- Stores the average match score across all matches for a team
- Used to calculate `rank_value`

#### D. New Functions:

1. **`get_reefscape_scoring_config()`**
   - Returns current scoring point values from `game_scoring_config` table
   - Admin-configurable without code changes

2. **`calculate_match_score(...)`**
   - Calculates total match score based on game elements
   - Formula:
     ```
     score = (L1 × L1_points) + (L2 × L2_points) + (L3 × L3_points) + (L4 × L4_points)
           + (algae_net × net_points) + (algae_processed × processed_points) + (algae_removed × removed_points)
           + (climb_deep ? deep_points : 0) + (climb_shallow ? shallow_points : 0) + (park ? park_points : 0)
     ```

3. **`trigger_calculate_match_score()`**
   - Trigger function that auto-calculates `match_score` before INSERT/UPDATE
   - Runs on every match report save

4. **Updated `recalculate_team_stats()`**
   - Now calculates `avg_match_score`
   - Sets `rank_value` = `avg_match_score` for leaderboard sorting

#### E. New Triggers:

1. **`trigger_auto_calculate_match_score`**
   - BEFORE INSERT/UPDATE on `match_reports`
   - Auto-calculates `match_score` field

2. **Existing `trigger_auto_recalculate_stats`** (updated)
   - AFTER INSERT/UPDATE/DELETE on `match_reports`
   - Now includes `avg_match_score` and `rank_value` calculations

#### F. RLS Policies:

```sql
-- Public can read scoring config
CREATE POLICY "Public read access to game_scoring_config"
    ON game_scoring_config FOR SELECT
    USING (true);

-- Only admins can update scoring config
CREATE POLICY "Admins can update game_scoring_config"
    ON game_scoring_config FOR UPDATE
    USING (is_user_admin(auth.uid()));
```

---

## How It Works

### Match Submission Flow:

1. **User submits match report** → Frontend sends data to Supabase
2. **BEFORE INSERT trigger fires** → `trigger_calculate_match_score()` runs
3. **Match score calculated** → Uses `calculate_match_score()` function
4. **Scoring values retrieved** → From `game_scoring_config` table
5. **Match score stored** → In `match_reports.match_score`
6. **AFTER INSERT trigger fires** → `trigger_recalculate_stats()` runs
7. **Team stats updated** → Including `avg_match_score` and `rank_value`
8. **Leaderboard updates** → Teams sorted by `rank_value` (descending)

### Admin Score Configuration Flow:

1. **Admin opens score config page** (to be created)
2. **Admin updates point values** → e.g., "Coral L3 = 7 points"
3. **Update saved to `game_scoring_config`** table
4. **Recalculate all scores** → Run SQL to update existing matches:
   ```sql
   -- Update all match scores
   UPDATE match_reports
   SET match_score = calculate_match_score(
       total_l1_scored, total_l2_scored, total_l3_scored, total_l4_scored,
       total_algae_scored, algae_removed, algae_processed,
       climb_deep, climb_shallow, park
   );

   -- Recalculate all team stats
   DO $$
   DECLARE team_record RECORD;
   BEGIN
       FOR team_record IN SELECT DISTINCT team_number, regional FROM match_reports
       LOOP
           PERFORM recalculate_team_stats(team_record.team_number, team_record.regional);
       END LOOP;
   END $$;
   ```

---

## Installation Instructions

### For Clean Install:

1. **Run the updated schema:**
   ```
   Frontend_2025_Scouting/supabase_setup/CREATE_CLEAN_SCHEMA.sql
   ```
   This creates everything including the new scoring system.

2. **Verify installation:**
   ```sql
   -- Check scoring config exists
   SELECT * FROM game_scoring_config;

   -- Check match scores are being calculated
   SELECT team_number, match_number, match_score
   FROM match_reports
   LIMIT 10;

   -- Check team rankings
   SELECT team_number, avg_match_score, rank_value
   FROM robot_stats
   ORDER BY rank_value DESC;
   ```

---

## Default Scoring Values

⚠️ **These are PLACEHOLDER values** - adjust based on official REEFSCAPE game manual!

| Game Element | Points |
|--------------|--------|
| Coral L1 | 3 |
| Coral L2 | 4 |
| Coral L3 | 6 |
| Coral L4 | 8 |
| Algae (Net) | 4 |
| Algae (Processed) | 6 |
| Algae (Removed) | 3 |
| Deep Climb | 12 |
| Shallow Climb | 6 |
| Park | 2 |

---

## Next Steps

### Immediate:
1. ✅ Run updated `CREATE_CLEAN_SCHEMA.sql` to install scoring system
2. ⏳ Find official REEFSCAPE scoring values and update `game_scoring_config` table
3. ⏳ Test match submission - verify `match_score` is calculated
4. ⏳ Test leaderboard - verify teams sorted by `rank_value`

### Future Enhancements:
1. ⏳ Create admin UI page for adjusting scoring values
2. ⏳ Add autonomous bonus support (if applicable)
3. ⏳ Add ranking points (RP) tracking
4. ⏳ Display `match_score` in match history
5. ⏳ Show `avg_match_score` on leaderboard

---

## Files Changed

| File | Changes |
|------|---------|
| `Frontend_2025_Scouting/data/supabaseService.tsx` | Added algae_removed and algae_processed aggregation |
| `Frontend_2025_Scouting/supabase_setup/CREATE_CLEAN_SCHEMA.sql` | Added scoring system (table, functions, triggers) |
| `Frontend_2025_Scouting/supabase_setup/LOAD_TEST_DATA.sql` | Auto-clears and reloads test data |

---

## Testing Checklist

- [ ] Submit a match report with algae removed/processed
- [ ] Verify `algae_removed` and `algae_processed` columns populated in database
- [ ] Verify `match_score` is calculated automatically
- [ ] Verify `avg_match_score` updates in `robot_stats`
- [ ] Verify `rank_value` equals `avg_match_score`
- [ ] Verify leaderboard sorted by `rank_value` (descending)
- [ ] Update a scoring value in `game_scoring_config`
- [ ] Recalculate scores and verify they changed
- [ ] Test admin permissions (only admins can update scores)

---

## Troubleshooting

### Scores not calculating?

```sql
-- Manually trigger for one team
SELECT calculate_match_score(3, 4, 2, 1, 8, 2, 3, true, false, false);

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_calculate_match_score';
```

### Rankings still 0?

```sql
-- Manually recalculate for one team
SELECT recalculate_team_stats(589, 'Test Competition');

-- Check robot_stats
SELECT team_number, avg_match_score, rank_value
FROM robot_stats;
```

---

## Documentation

- [Scoring System README](./supabase_setup/SCORING_SYSTEM_README.md)
- [CREATE_CLEAN_SCHEMA.sql](./supabase_setup/CREATE_CLEAN_SCHEMA.sql)

---

**Implementation Complete!** 🎉

The scoring system is now fully integrated into the database schema. Teams will be automatically ranked by their average match score, and admins can adjust scoring values through the `game_scoring_config` table.
