# Match Reports Schema Migration Guide

## Overview

This guide covers the migration from the old `matches` table schema (which stored only combined totals) to the new `match_reports` table schema (which tracks autonomous and teleop scoring separately).

## Migration Summary

### What Changed

1. **Table Name**: `matches` → `match_reports`
2. **Column Renames**:
   - `l1_scored` → `total_l1_scored`
   - `l2_scored` → `total_l2_scored`
   - `l3_scored` → `total_l3_scored`
   - `l4_scored` → `total_l4_scored`
   - `algae_scored` → `total_algae_scored`

3. **New Columns Added**:
   - **Auto Phase**: `auto_l1_scored`, `auto_l2_scored`, `auto_l3_scored`, `auto_l4_scored`, `auto_algae_scored`
   - **Tele Phase**: `tele_l1_scored`, `tele_l2_scored`, `tele_l3_scored`, `tele_l4_scored`, `tele_algae_scored`

## Implementation Steps

### Step 1: Run Database Migration

1. Open Supabase SQL Editor
2. Run the migration file: `Backend_2025_Scouting/supabase_migration/REFACTOR_MATCHES_SCHEMA_COMPLETE.sql`
3. Verify the migration completed successfully (should show 15 scoring columns and recreated trigger)

### Step 2: Update Database Views (If Needed)

The migration automatically updates the `recalculate_team_stats()` function and trigger. However, if you have custom views that reference the `matches` table, they need to be updated:

```sql
-- Example: Update robots_complete view if it exists
DROP VIEW IF EXISTS robots_complete CASCADE;

CREATE VIEW robots_complete AS
SELECT
  t.*,
  ri.*,
  rs.*
FROM teams t
LEFT JOIN robot_info ri ON t.team_number = ri.team_number AND t.regional = ri.regional
LEFT JOIN robot_stats rs ON t.team_number = rs.team_number AND t.regional = rs.regional;
```

**Note**: The migration already handles:
- ✅ `recalculate_team_stats()` function (updated to use `match_reports` and `total_*` columns)
- ✅ `trigger_recalculate_stats()` function (recreated)
- ✅ `trigger_auto_recalculate_stats` trigger (recreated on `match_reports` table)

### Step 3: Frontend Updates (Already Completed)

The following files have been updated to use the new schema:

✅ **supabaseService.tsx**:
- `sendPregameData()` - Uses `match_reports` table
- `sendAutoData()` - Saves to `auto_*` columns
- `sendTeleData()` - Saves to `tele_*` columns
- `updatePostGame()` - Calculates and saves `total_*` columns
- `submitCompleteMatch()` - Saves all auto, tele, and total columns
- `fetchTeamMatchData()` - Reads from `match_reports`
- `fetchAllTeamMatchData()` - Reads from `match_reports`

### Step 4: Clear Upload Queue (Recommended)

Since the schema changed, any queued match uploads using the old schema will fail. You should:

1. Either let them fail naturally (they'll be marked as failed after retries)
2. Or manually clear the upload queue by resetting AsyncStorage

To manually clear (run this in your app's console or add temporary code):
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('@upload_queue');
```

### Step 5: Test the New Schema

1. Submit a new pit scouting report (should work as before)
2. Submit a complete match report:
   - Pregame (team, match, starting position)
   - Auto phase (coral and algae scoring)
   - Tele phase (coral, algae, climb)
   - Postgame (ratings, comments)
3. Verify in Supabase that the data is saved correctly:
   - Check `auto_*` columns have auto phase data
   - Check `tele_*` columns have tele phase data
   - Check `total_*` columns = auto + tele

## Data Flow

### Old Flow (Before Migration)
```
Auto Page → Save → matches.l1_scored = X
Tele Page → Fetch current → Add counts → matches.l1_scored = X + Y
Post Page → Save → matches.l1_scored (unchanged)
```

### New Flow (After Migration)
```
Auto Page → Save → match_reports.auto_l1_scored = X
Tele Page → Save → match_reports.tele_l1_scored = Y
Post Page → Calculate → match_reports.total_l1_scored = X + Y
```

## Benefits of New Schema

1. **Separate Analysis**: Can now analyze autonomous vs teleop performance separately
2. **Better Scouting**: Identify which teams are strong in auto vs tele
3. **Data Integrity**: Totals are calculated from auto + tele, preventing inconsistencies
4. **Future Analytics**: Enables advanced stats like "auto efficiency" or "tele scoring rate"

## Troubleshooting

### Error: "Could not find the table 'public.matches'"
**Cause**: Migration hasn't been run yet or didn't complete successfully
**Fix**: Run the migration SQL in Supabase SQL Editor

### Error: "Could not find column 'l1_scored'"
**Cause**: Code still referencing old column names
**Fix**: Ensure you've pulled the latest frontend code with updated `supabaseService.tsx`

### Error: "Match not found" when saving tele/post data
**Cause**: Pregame data wasn't saved first
**Fix**: Ensure match scouting follows the flow: Pregame → Auto → Tele → Post

### Upload queue stuck with old schema errors
**Cause**: Queued uploads were created before migration
**Fix**: Clear the upload queue (see Step 4 above)

## Verification Queries

### Check Table Exists
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'match_reports';
```

### Check All Scoring Columns
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'match_reports'
  AND column_name LIKE '%scored'
ORDER BY column_name;
```
Expected: 15 rows (auto_*, tele_*, total_* for l1-l4 and algae)

### Verify Data Totals Match
```sql
SELECT
  team_number,
  match_number,
  auto_l1_scored,
  tele_l1_scored,
  total_l1_scored,
  (auto_l1_scored + tele_l1_scored = total_l1_scored) as l1_matches
FROM match_reports
WHERE total_l1_scored > 0
LIMIT 10;
```
All rows should have `l1_matches = true`

## Rollback Plan

If you need to rollback to the old schema, see the rollback section in:
`Backend_2025_Scouting/supabase_migration/README_REFACTOR_MATCHES_SCHEMA.md`

⚠️ **Warning**: Rollback will lose the auto/tele separation data!

## What the Migration Does

The complete migration (`REFACTOR_MATCHES_SCHEMA_COMPLETE.sql`) performs these steps automatically:

1. **Drops the trigger** that depends on matches table
2. **Renames table**: `matches` → `match_reports`
3. **Adds auto columns**: `auto_l1_scored`, `auto_l2_scored`, `auto_l3_scored`, `auto_l4_scored`, `auto_algae_scored`
4. **Adds tele columns**: `tele_l1_scored`, `tele_l2_scored`, `tele_l3_scored`, `tele_l4_scored`, `tele_algae_scored`
5. **Renames existing columns**: `l1_scored` → `total_l1_scored`, etc.
6. **Migrates existing data**: Splits current totals evenly between auto/tele (best effort)
7. **Recreates function**: `recalculate_team_stats()` with new table/column names
8. **Recreates trigger function**: `trigger_recalculate_stats()`
9. **Recreates trigger**: `trigger_auto_recalculate_stats` on `match_reports` table
10. **Verifies migration**: Shows scoring columns and triggers

## Related Documentation

- `Backend_2025_Scouting/supabase_migration/REFACTOR_MATCHES_SCHEMA_COMPLETE.sql` - The complete migration SQL
- `Backend_2025_Scouting/supabase_migration/README_REFACTOR_MATCHES_SCHEMA.md` - Detailed README
- `Docs/UPLOAD_QUEUE_SYSTEM.md` - Upload queue documentation
