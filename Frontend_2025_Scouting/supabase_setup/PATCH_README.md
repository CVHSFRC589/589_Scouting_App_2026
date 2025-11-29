# Security Patch for Existing Databases

## Purpose

This patch fixes Supabase security warnings about "Function Search Path Mutable" for team starring functions **without requiring a full database reset**.

Use this if you already have a running database with data and just want to fix the security warnings.

---

## Quick Start

### 1. Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

### 2. Run the Patch

1. Open `PATCH_SECURITY_FIX.sql` in VS Code
2. Copy the entire contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)

### 3. Verify Success

You should see output like:

```
All 6 star functions patched successfully!
function_count: 6

function_name          | security_status
-----------------------+---------------------------
check_admin_star       | ✅ SECURE (search_path set)
check_user_star        | ✅ SECURE (search_path set)
get_admin_starred_teams| ✅ SECURE (search_path set)
get_user_starred_teams | ✅ SECURE (search_path set)
toggle_admin_star      | ✅ SECURE (search_path set)
toggle_user_star       | ✅ SECURE (search_path set)

✅ SECURITY PATCH APPLIED
```

### 4. Check Warnings Cleared

1. Go to **Database** → **Linter** in Supabase Dashboard
2. Wait ~30 seconds for linter to refresh
3. Function search path warnings should be gone!

---

## What This Patch Does

### Security Fixes Applied

✅ Adds `SET search_path = ''` to all 6 star functions
✅ Changes all table references to use explicit `public.` schema prefix
✅ Prevents search path injection attacks
✅ Resolves Supabase security linter warnings

### Functions Patched

1. `toggle_user_star()` - Toggle user's personal star
2. `toggle_admin_star()` - Toggle admin star (admin only)
3. `get_user_starred_teams()` - Get user's starred teams
4. `get_admin_starred_teams()` - Get admin-flagged teams
5. `check_user_star()` - Check if user starred a team
6. `check_admin_star()` - Check if team has admin star

---

## Safety Guarantees

✅ **Zero data loss** - All your stars are completely safe
✅ **Zero downtime** - App continues to work during patch
✅ **Zero breaking changes** - Functions work exactly the same
✅ **Fully backward compatible** - Frontend code unchanged
✅ **Transactional** - All changes in single transaction (all or nothing)

---

## When to Use This Patch

### ✅ Use This Patch If:

- You have an existing database with data
- You're getting "Function Search Path Mutable" warnings
- Your database is running schema v2.1.0
- You don't want to drop and recreate everything

### ❌ Use Full Setup If:

- You're setting up a brand new database
- You want to start from scratch
- You have no existing data
- Use `2 - CREATE_CLEAN_SCHEMA.sql` instead

---

## Troubleshooting

### Error: "relation 'user_team_stars' does not exist"

**Problem:** Star tables haven't been created yet.

**Solution:** Run the full setup script first (`2 - CREATE_CLEAN_SCHEMA.sql`), then this patch isn't needed as the full setup already includes the security fixes.

---

### Error: "function toggle_user_star does not exist"

**Problem:** You're running an older schema version (pre-2.1.0).

**Solution:**
1. Check your schema version: `SELECT schema_version FROM app_metadata;`
2. If version < 2.1.0, run full setup scripts in order
3. If version = 2.1.0, check that star functions exist

---

### Warnings Still Show After Patch

**Problem:** Supabase linter takes time to refresh.

**Solution:**
1. Wait 1-2 minutes
2. Refresh the Linter page
3. If warnings persist, check verification queries in the patch output
4. All 6 functions should show "✅ SECURE"

---

## Testing After Patch

### Test in Your App

1. Open your scouting app
2. Go to Leaderboard
3. Try starring/unstarring teams
4. Check that stars persist after refresh
5. If you're an admin, test blue star functionality

### Test with SQL (Optional)

```sql
-- Test as authenticated user (run in Supabase SQL Editor)

-- Toggle a star
SELECT toggle_user_star(589, 'Test Competition');

-- Get your starred teams
SELECT get_user_starred_teams('Test Competition');

-- Check if team is starred
SELECT check_user_star(589, 'Test Competition');

-- Get admin starred teams (visible to all)
SELECT get_admin_starred_teams('Test Competition');
```

---

## What Changed in the Code

### Before (Insecure):

```sql
CREATE OR REPLACE FUNCTION toggle_user_star(...)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    SELECT EXISTS (SELECT 1 FROM user_team_stars WHERE ...);
    -- ⚠️ Vulnerable to search_path manipulation
END;
$$;
```

### After (Secure):

```sql
CREATE OR REPLACE FUNCTION toggle_user_star(...)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- ✅ Prevents search path injection
AS $$
BEGIN
    SELECT EXISTS (SELECT 1 FROM public.user_team_stars WHERE ...);
    -- ✅ Explicit schema reference prevents attacks
END;
$$;
```

---

## Why This Security Fix Matters

### The Vulnerability

Without `SET search_path = ''`, an attacker could:

1. Create a malicious schema: `CREATE SCHEMA attack;`
2. Create fake tables: `CREATE TABLE attack.user_team_stars (...);`
3. Set search path: `SET search_path = attack, public;`
4. Your function executes with elevated privileges but reads attacker's table
5. Attacker gains unauthorized access or escalates privileges

### The Fix

- `SET search_path = ''` ignores session search_path
- `public.user_team_stars` explicitly references correct table
- Attacker's malicious schema is never consulted
- Function executes safely with proper permissions

---

## Support

If you encounter issues:

1. Check the verification queries at the end of the patch script
2. Review the Supabase Dashboard → Database → Linter
3. Test star functionality in your app
4. Check that all 6 functions show "✅ SECURE (search_path set)"

---

## References

- **Supabase Security Linter Docs**: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- **PostgreSQL SECURITY DEFINER**: https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY
- **Search Path Security**: https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH

---

**Last Updated:** 2025-11-29
**Schema Version:** 2.1.0
**Patch Version:** 1.0
