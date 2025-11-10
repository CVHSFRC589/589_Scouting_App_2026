# Migration Recovery Guide

## Problem

You ran the partial migration that renamed `matches` to `match_reports` and renamed columns to `total_*`, but the database functions and triggers were not updated. Now they're broken because they still reference the old table name `matches` and old column names.

## Current Error

```
ERROR: 42P01: relation "matches" does not exist
CONTEXT: PL/pgSQL function recalculate_team_stats(integer,character varying)
```

This happens because:
- ✅ Table was renamed: `matches` → `match_reports`
- ✅ Columns were renamed: `l1_scored` → `total_l1_scored`, etc.
- ❌ BUT: `recalculate_team_stats()` function still references old names
- ❌ AND: Trigger is still calling the broken function

## Recovery Steps

### Step 1: Check Current State

Run this query first to see what state your database is in:

```sql
-- File: Backend_2025_Scouting/supabase_migration/CHECK_CURRENT_SCHEMA.sql
```

Copy and paste the entire file contents into Supabase SQL Editor and run it.

This will show you:
- Whether `match_reports` table exists
- Whether old `matches` table still exists
- Which columns currently exist (auto_*, tele_*, total_*, or old l1_scored, etc.)
- Current trigger status

### Step 2: Apply the Fix

Based on the check results, choose the appropriate fix:

#### Scenario A: Table renamed, columns renamed, but functions broken

**Symptoms**:
- `match_reports` table exists
- Columns are named `total_l1_scored`, `total_l2_scored`, etc.
- `auto_*` and `tele_*` columns DO NOT exist yet

**Fix**: Run `FIX_FUNCTIONS_AFTER_RENAME.sql`

```sql
-- File: Backend_2025_Scouting/supabase_migration/FIX_FUNCTIONS_AFTER_RENAME.sql
```

This will:
1. Drop the broken trigger
2. Recreate `recalculate_team_stats()` to use `match_reports` and `total_*` columns
3. Recreate the trigger function
4. Recreate the trigger on `match_reports` table

#### Scenario B: Need to complete the full migration

**Symptoms**:
- `match_reports` table exists
- Columns renamed to `total_*`
- Functions fixed (from Scenario A)
- BUT: Still need to add `auto_*` and `tele_*` columns

**Fix**: Run this to add the missing columns:

```sql
BEGIN;

-- Add auto-specific scoring columns
ALTER TABLE match_reports
ADD COLUMN IF NOT EXISTS auto_l1_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_l2_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_l3_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_l4_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_algae_scored INTEGER DEFAULT 0;

-- Add tele-specific scoring columns
ALTER TABLE match_reports
ADD COLUMN IF NOT EXISTS tele_l1_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tele_l2_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tele_l3_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tele_l4_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tele_algae_scored INTEGER DEFAULT 0;

-- Migrate existing data (split totals evenly)
UPDATE match_reports
SET
  auto_l1_scored = FLOOR(total_l1_scored / 2),
  tele_l1_scored = CEIL(total_l1_scored / 2),
  auto_l2_scored = FLOOR(total_l2_scored / 2),
  tele_l2_scored = CEIL(total_l2_scored / 2),
  auto_l3_scored = FLOOR(total_l3_scored / 2),
  tele_l3_scored = CEIL(total_l3_scored / 2),
  auto_l4_scored = FLOOR(total_l4_scored / 2),
  tele_l4_scored = CEIL(total_l4_scored / 2),
  auto_algae_scored = FLOOR(total_algae_scored / 2),
  tele_algae_scored = CEIL(total_algae_scored / 2)
WHERE total_l1_scored > 0
   OR total_l2_scored > 0
   OR total_l3_scored > 0
   OR total_l4_scored > 0
   OR total_algae_scored > 0;

COMMIT;
```

#### Scenario C: Starting fresh (nothing has been migrated yet)

**Symptoms**:
- `matches` table still exists (NOT renamed)
- Columns are still `l1_scored`, `l2_scored`, etc. (NOT renamed)

**Fix**: Run the complete migration:

```sql
-- File: Backend_2025_Scouting/supabase_migration/REFACTOR_MATCHES_SCHEMA_COMPLETE.sql
```

### Step 3: Verify the Fix

After applying the fix, run these verification queries:

```sql
-- Check that trigger exists and is active
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'match_reports';

-- Expected: 1 row showing trigger_auto_recalculate_stats on match_reports
```

```sql
-- Check all scoring columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'match_reports'
  AND column_name LIKE '%scored'
ORDER BY column_name;

-- Expected: 15 rows (auto_*, tele_*, total_* for l1-l4 and algae)
```

```sql
-- Test the function manually
SELECT recalculate_team_stats(589, 'tc');

-- Expected: No errors, runs successfully
```

### Step 4: Test with Real Data

After the fix is applied:

1. **Try inserting a test match report**:
```sql
INSERT INTO match_reports (
    team_number, match_number, regional,
    auto_l1_scored, tele_l1_scored, total_l1_scored
) VALUES (
    9999, 1, 'tc',
    2, 3, 5
);
```

Expected: No errors, trigger runs successfully

2. **Check that robot_stats was updated**:
```sql
SELECT * FROM robot_stats
WHERE team_number = 9999 AND regional = 'tc';
```

Expected: Stats calculated correctly

3. **Clean up test data**:
```sql
DELETE FROM match_reports
WHERE team_number = 9999 AND regional = 'tc';
```

## Common Issues

### Issue: "column 'total_l1_scored' does not exist"

**Cause**: Columns weren't renamed yet
**Fix**: The migration didn't complete. You need to rename columns first, then fix functions.

### Issue: "trigger_auto_recalculate_stats already exists"

**Cause**: Trying to recreate trigger that already exists
**Fix**: Use `DROP TRIGGER IF EXISTS` before creating

### Issue: Function runs but stats are 0

**Cause**: Function is querying with wrong column names
**Fix**: Make sure function uses `total_l1_scored` not `l1_scored`

## Summary

The most likely scenario is **Scenario A**: You need to run `FIX_FUNCTIONS_AFTER_RENAME.sql` to update the functions and triggers to use the new table/column names.

After that, if you want the full auto/tele separation, run the Scenario B script to add those columns.

The frontend code is already updated and ready to use the new schema!
