# Database Functions Audit Guide

## Overview

Your Supabase PostgreSQL database has accumulated various functions over time through migrations. This guide helps you understand what each function does and which ones are actually needed.

---

## How to Audit Your Functions

Run this query in Supabase SQL Editor to see all functions:

```sql
SELECT
    routine_name as name,
    routine_type as type,
    security_type as security,
    data_type as return_type,
    CASE
        WHEN routine_name LIKE 'trigger_%' THEN 'TRIGGER FUNCTION'
        WHEN routine_name LIKE 'get_%' THEN 'QUERY FUNCTION'
        WHEN routine_name LIKE 'set_%' THEN 'MUTATION FUNCTION'
        WHEN routine_name LIKE 'update_%' THEN 'UPDATE FUNCTION'
        ELSE 'OTHER'
    END as category
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY category, routine_name;
```

---

## Core Functions (KEEP - Currently Used)

### 1. `trigger_recalculate_stats()`
**Type**: Trigger function
**Purpose**: Wrapper for auto-recalculating robot_stats when matches change
**Used By**: `trigger_auto_recalculate_stats` trigger on `match_reports` table
**Status**: ✅ **CRITICAL - DO NOT REMOVE**

**Code Location**: `FIX_FUNCTIONS_AFTER_RENAME.sql`, `REFACTOR_MATCHES_FINAL.sql`

```sql
CREATE OR REPLACE FUNCTION trigger_recalculate_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_team_stats(OLD.team_number, OLD.regional);
        RETURN OLD;
    ELSE
        PERFORM recalculate_team_stats(NEW.team_number, NEW.regional);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

### 2. `recalculate_team_stats(p_team_number, p_regional)`
**Type**: Calculation function
**Purpose**: Calculates averages from match_reports and updates robot_stats
**Called By**: `trigger_recalculate_stats()`
**Status**: ✅ **CRITICAL - DO NOT REMOVE**

**Parameters**:
- `p_team_number` (integer) - Team to recalculate
- `p_regional` (varchar) - Competition/regional code

**What it does**:
1. Queries all matches for the team from `match_reports`
2. Calculates averages (avg_l1, avg_l2, avg_coral, avg_algae, etc.)
3. UPSERTs results into `robot_stats` table
4. Updates `rank_value` based on performance

---

### 3. `update_app_metadata_updated_at()`
**Type**: Trigger function
**Purpose**: Auto-updates `updated_at` timestamp in app_metadata
**Used By**: `app_metadata_updated_at_trigger` trigger
**Status**: ⚠️ **OPTIONAL - Nice to have**

**Code**:
```sql
CREATE OR REPLACE FUNCTION update_app_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Note**: Not critical - you could manually set timestamps instead.

---

## Authentication Functions (KEEP if using auth)

### 4. `create_user_profile()`
**Type**: Trigger function
**Purpose**: Auto-creates user_profiles entry when auth.users is created
**Used By**: `on_auth_user_created` trigger on `auth.users`
**Status**: ✅ **KEEP if using authentication**

**What it does**:
- Triggered when new user signs up
- Creates corresponding row in `user_profiles` table
- Copies email and display_name from auth metadata

---

### 5. `is_user_admin(user_id)`
**Type**: Helper function
**Purpose**: Checks if a user is an admin
**Used By**: Row Level Security (RLS) policies
**Status**: ✅ **KEEP if using admin permissions**

**Returns**: `boolean`

---

## Deprecated/Legacy Functions (SAFE TO REMOVE)

### Functions to Check and Potentially Remove:

#### Competition Management Functions
If you see functions with these patterns, check if they're still used:

- `set_active_competition(competition_name)` - May be old competition switcher
- `get_active_competition()` - Check if replaced by app_metadata polling
- `update_competition_name(...)` - Check if still needed

**How to check if used**:
```sql
-- Search for function usage in views
SELECT DISTINCT view_definition
FROM information_schema.views
WHERE view_definition LIKE '%function_name%';

-- Search for function usage in other functions
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%function_name%';
```

#### Schema Version Functions
- `update_schema_version(new_version)` - May be legacy migration tracking
- `get_schema_version()` - Check if still used

**Note**: If using `app_metadata.schema_version` field instead, these can be removed.

#### Old Trigger Functions
Look for functions that reference old table names:
- Anything referencing `matches` (should be `match_reports`)
- Anything referencing `robot_info` (should be `pit_reports`)
- Anything referencing `teams` (table was removed)
- Anything referencing `reefscape_matches` (view was removed)

---

## How to Safely Remove Functions

### Step 1: Check Dependencies

```sql
-- Check if function is used by triggers
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE action_statement LIKE '%your_function_name%';

-- Check if function is used by views
SELECT
    table_name,
    view_definition
FROM information_schema.views
WHERE view_definition LIKE '%your_function_name%';
```

### Step 2: Drop Function

```sql
-- Drop specific function
DROP FUNCTION IF EXISTS function_name(argument_types) CASCADE;

-- Example:
DROP FUNCTION IF EXISTS set_active_competition(text) CASCADE;
```

**⚠️ Important**: The `CASCADE` option will also drop any triggers/views that depend on this function!

### Step 3: Verify

```sql
-- Verify function is gone
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'function_name';

-- Should return 0 rows
```

---

## Recommended Cleanup Script

Based on your current simplified schema, here's what you should **definitely keep**:

```sql
-- ============================================================================
-- FUNCTIONS TO KEEP (Core functionality)
-- ============================================================================

-- 1. Stats calculation
✅ trigger_recalculate_stats()
✅ recalculate_team_stats(p_team_number, p_regional)

-- 2. Metadata management
⚠️ update_app_metadata_updated_at() -- Optional but harmless

-- 3. Authentication (if using)
✅ create_user_profile() -- If using auth
✅ is_user_admin(user_id) -- If using RLS with admin checks
```

### Functions to Review and Possibly Remove:

Create this audit script:

```sql
-- ============================================================================
-- AUDIT SCRIPT - Find potentially unused functions
-- ============================================================================

-- Functions that reference old table names (likely legacy)
SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
    routine_definition LIKE '%matches%'
    AND routine_definition NOT LIKE '%match_reports%'
    OR routine_definition LIKE '%robot_info%'
    OR routine_definition LIKE '%teams%'
    OR routine_definition LIKE '%reefscape%'
)
ORDER BY routine_name;

-- This will show functions that might be outdated
```

---

## Security Settings

### Definer vs Invoker

You mentioned seeing "Definer" and "Invoker" in your function list:

**SECURITY DEFINER** (runs as function creator):
- Function runs with **creator's permissions**
- Can bypass Row Level Security (RLS)
- **Security risk** if not careful - use only when necessary

**SECURITY INVOKER** (default, runs as caller):
- Function runs with **caller's permissions**
- Respects RLS policies
- **Safer** - use this for most functions

**Recommendation**: Your stats functions should use **SECURITY INVOKER** (default) since they don't need elevated permissions.

**Check security settings**:
```sql
SELECT
    routine_name,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY security_type, routine_name;
```

---

## Your Current Essential Functions List

Based on your simplified schema (3 tables: `match_reports`, `pit_reports`, `robot_stats`), you **only need**:

### Database Functions (2-3 total):
1. ✅ `trigger_recalculate_stats()` - Trigger wrapper
2. ✅ `recalculate_team_stats(team_number, regional)` - Main calculation
3. ⚠️ `update_app_metadata_updated_at()` - Optional timestamp updater

### Authentication Functions (if using auth):
4. ✅ `create_user_profile()` - Creates profile on signup
5. ✅ `is_user_admin(user_id)` - Admin check for RLS

**That's it!** Any other functions are likely legacy and can be removed.

---

## Next Steps

1. **Export current functions** for backup:
```sql
-- Get all function definitions
SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

2. **Create cleanup migration** with only the functions you need

3. **Test thoroughly** after cleanup to ensure nothing breaks

4. **Document** which functions you kept and why

---

## Sample Cleanup Migration

```sql
-- ============================================================================
-- CLEANUP: Remove Unused Functions
-- ============================================================================
-- Purpose: Remove legacy functions that reference old table names
--
-- BACKUP FIRST: Export current functions before running this!
-- ============================================================================

BEGIN;

-- Drop any functions referencing old table names
-- (Check first with the audit script above!)

-- Example: If you find old functions
-- DROP FUNCTION IF EXISTS old_function_name(argument_types) CASCADE;

-- Verify only essential functions remain
SELECT
    routine_name,
    security_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Should see only:
-- - create_user_profile (if using auth)
-- - is_user_admin (if using auth)
-- - recalculate_team_stats
-- - trigger_recalculate_stats
-- - update_app_metadata_updated_at (optional)

COMMIT;
```

---

## Questions to Answer

To help you clean up, can you paste the **complete** function list? I can help identify:

1. Which functions are legacy/unused
2. Which functions reference old table names
3. Which functions can be safely removed
4. Which functions need to be updated

**To get the full list, run**:
```sql
SELECT
    routine_name,
    string_agg(parameter_name || ' ' || data_type, ', ') as parameters,
    data_type as return_type,
    security_type
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p
    ON r.specific_name = p.specific_name
WHERE r.routine_schema = 'public'
GROUP BY routine_name, data_type, security_type
ORDER BY routine_name;
```

This will give us a clean list of all functions with their parameters!
