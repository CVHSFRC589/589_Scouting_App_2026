# Match Reports Schema Migration - COMPLETED ✅

## Migration Status: SUCCESS

The database schema has been successfully migrated from `matches` to `match_reports` with separate autonomous and teleop scoring.

## What Changed

### Database Schema

#### Table Renamed
- ✅ `matches` → `match_reports`

#### New Columns Added
**Autonomous Phase**:
- `auto_l1_scored` (INTEGER)
- `auto_l2_scored` (INTEGER)
- `auto_l3_scored` (INTEGER)
- `auto_l4_scored` (INTEGER)
- `auto_algae_scored` (INTEGER)

**Teleop Phase**:
- `tele_l1_scored` (INTEGER)
- `tele_l2_scored` (INTEGER)
- `tele_l3_scored` (INTEGER)
- `tele_l4_scored` (INTEGER)
- `tele_algae_scored` (INTEGER)

**Totals** (renamed from old columns):
- `l1_scored` → `total_l1_scored`
- `l2_scored` → `total_l2_scored`
- `l3_scored` → `total_l3_scored`
- `l4_scored` → `total_l4_scored`
- `algae_scored` → `total_algae_scored`

#### Functions and Triggers Updated
- ✅ `recalculate_team_stats()` - Now uses `match_reports` table and `total_*` columns
- ✅ `trigger_recalculate_stats()` - Recreated
- ✅ `trigger_auto_recalculate_stats` - Recreated on `match_reports` table

### Frontend Code (Already Updated)

All match scouting functions in `supabaseService.tsx` have been updated:

1. **sendPregameData()** - Uses `match_reports` table
2. **sendAutoData()** - Saves to `auto_l1_scored`, `auto_l2_scored`, etc.
3. **sendTeleData()** - Saves to `tele_l1_scored`, `tele_l2_scored`, etc.
4. **updatePostGame()** - Calculates totals: `total_* = auto_* + tele_*`
5. **submitCompleteMatch()** - Saves all auto, tele, and total columns in one operation
6. **fetchTeamMatchData()** - Reads from `match_reports`
7. **fetchAllTeamMatchData()** - Reads from `match_reports`

## Data Flow

### Match Scouting Workflow

**Pregame Page**:
```
Creates match record with team, match number, starting position
→ INSERT INTO match_reports (team_number, match_number, auto_starting_position, ...)
```

**Auto Page**:
```
Tracks coral/algae scoring during autonomous
→ UPDATE match_reports SET auto_l1_scored = X, auto_l2_scored = Y, auto_algae_scored = Z
```

**Tele Page**:
```
Tracks coral/algae scoring during teleop
→ UPDATE match_reports SET tele_l1_scored = X, tele_l2_scored = Y, tele_algae_scored = Z, climb_deep = ..., park = ...
```

**Post Page**:
```
Fetches auto and tele scores, calculates totals
→ UPDATE match_reports SET total_l1_scored = (auto_l1_scored + tele_l1_scored), driver_rating = ..., comments = ...
```

**Complete Match Submission**:
```
Saves everything at once (auto, tele, totals, postgame data)
→ UPSERT INTO match_reports with all columns
```

## Existing Data Migration

Any match reports that existed before the migration have had their scores split evenly between auto and tele:
- `auto_* = FLOOR(total / 2)`
- `tele_* = CEIL(total / 2)`

This is a best-effort migration since historical auto/tele breakdown wasn't tracked. All NEW match reports will have accurate auto/tele separation.

## What to Test

### 1. Submit a Complete Match Report

Test the full workflow:
1. Open the app and navigate to Match Scouting
2. Fill out Pregame (team, match, starting position)
3. Fill out Auto (record some coral and algae scoring)
4. Fill out Tele (record more coral/algae, set climb/park)
5. Fill out Post (rating, comments)
6. Submit

### 2. Verify Data in Database

Check Supabase to ensure data is saved correctly:

```sql
SELECT
  team_number,
  match_number,
  regional,
  auto_l1_scored,
  auto_l2_scored,
  auto_algae_scored,
  tele_l1_scored,
  tele_l2_scored,
  tele_algae_scored,
  total_l1_scored,
  total_l2_scored,
  total_algae_scored
FROM match_reports
ORDER BY created_at DESC
LIMIT 5;
```

Verify that:
- Auto columns have autonomous phase scores
- Tele columns have teleop phase scores
- Total columns = auto + tele

### 3. Check Robot Stats

Verify the trigger is working:

```sql
SELECT
  team_number,
  regional,
  matches_played,
  avg_l1,
  avg_l2,
  avg_coral,
  avg_algae_scored
FROM robot_stats
WHERE matches_played > 0
ORDER BY updated_at DESC
LIMIT 5;
```

Stats should be automatically calculated from the `total_*` columns.

## Benefits

✅ **Separate Analysis** - Can now analyze autonomous vs teleop performance
✅ **Better Scouting Insights** - Identify which teams excel in auto vs tele
✅ **Data Integrity** - Totals are calculated from auto + tele
✅ **Advanced Analytics** - Enable metrics like "auto efficiency", "tele scoring rate"
✅ **Historical Tracking** - Track how teams improve in different phases over the season

## Upload Queue Consideration

Any match reports queued before the migration will fail with schema errors. The upload queue system will:
- Retry them with exponential backoff
- Eventually mark them as permanently failed (after 10 attempts)

To clear the queue manually, scouts can reset the app cache or you can wait for the failed items to be removed.

## Related Documentation

- `Backend_2025_Scouting/supabase_migration/REFACTOR_MATCHES_FINAL.sql` - The migration that was run
- `Backend_2025_Scouting/supabase_migration/README_REFACTOR_MATCHES_SCHEMA.md` - Detailed migration info
- `Docs/MATCH_REPORTS_SCHEMA_MIGRATION_GUIDE.md` - Complete implementation guide
- `Docs/MIGRATION_RECOVERY_GUIDE.md` - Troubleshooting guide

## Next Steps

1. ✅ Migration completed
2. 📱 Test the app with a complete match scouting workflow
3. 🔍 Verify data in Supabase shows correct auto/tele/total separation
4. 📊 Start using the new data for autonomous vs teleop analysis!

---

**Migration completed on**: 2025-11-08
**Migrated by**: Database migration script `REFACTOR_MATCHES_FINAL.sql`
**Status**: ✅ SUCCESS
