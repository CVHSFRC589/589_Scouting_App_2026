# Supabase Database Setup Guide

**Complete guide for setting up a new Supabase database for the FRC 589 Scouting App from scratch.**

This guide is intended for Scouting Team Leads and mentors who have access to the 589 Supabase account or are setting up their own instance.

**Version:** 2.1.0
**Last Updated:** 2025-11-29

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Supabase Project](#step-1-create-supabase-project)
3. [Step 2: Initialize Database Schema](#step-2-initialize-database-schema)
4. [Step 3: Configure Authentication](#step-3-configure-authentication)
5. [Step 4: Load Test Data (Optional)](#step-4-load-test-data-optional)
6. [Step 5: Grant Admin Access](#step-5-grant-admin-access)
7. [Step 6: Configure Frontend](#step-6-configure-frontend)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Supabase account (free tier is sufficient)
- Access to https://supabase.com/dashboard
- Basic understanding of SQL (all scripts provided)
- VS Code with the project open

---

## Step 1: Create Supabase Project

### 1.1 Sign in to Supabase

1. Go to https://supabase.com/dashboard
2. Sign in with your account (or create one if needed)

### 1.2 Create New Project

1. Click **"New Project"** button
2. Fill in project details:
   - **Organization**: Select your team's organization
   - **Project name**: `FRC 589 Scouting App` or `2025 Scouting App`
   - **Database Password**: Generate and **save this password securely**
   - **Region**: Select closest region (Americas for US teams)
3. Leave security options at defaults
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### 1.3 Disable Email Confirmation (Recommended for Development)

1. Navigate to **Authentication** → **Sign In / Providers**
2. Click on **Email** provider
3. **Turn OFF** the "Confirm email" toggle
4. Click **"Save"**

💡 **Why?** Users can sign up and log in immediately without email verification. Re-enable for production if desired.

---

## Step 2: Initialize Database Schema

This is the core setup that creates all tables, functions, and security policies.

### 2.1 Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"** button (top right)

### 2.2 Run Schema Setup Scripts

You'll run **6 sequential scripts** to set up your database. Each script is in the `Frontend_2025_Scouting/supabase_setup/` directory.

#### Script 1: Drop All Existing Schema (Clean Slate)

📁 **File:** `1 - DROP_ALL_SCHEMA.sql`

**Purpose:** Removes any existing tables, functions, and policies for a fresh start.

1. Open `1 - DROP_ALL_SCHEMA.sql` in VS Code
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. ✅ **Expected:** "Success. No rows returned"

⚠️ **Warning:** This deletes all existing data! Only use for initial setup or complete reset.

#### Script 2: Create Clean Schema

📁 **File:** `2 - CREATE_CLEAN_SCHEMA.sql`

**Purpose:** Creates all tables, views, functions, and Row Level Security (RLS) policies.

**Creates:**
- **8 Tables:** app_metadata, user_profiles, game_scoring_config, match_reports, pit_reports, robot_stats, user_team_stars, admin_team_stars
- **2 Views:** robots_complete (leaderboard), admin_user_list
- **14 Functions:** All database operations including team starring system
- **RLS Policies:** Security rules for all tables

1. Open `2 - CREATE_CLEAN_SCHEMA.sql` in VS Code
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**
5. ✅ **Expected:** Verification queries show all tables, views, and functions created

**Verification Output:**
```
Tables created:
- admin_team_stars
- app_metadata
- game_scoring_config
- match_reports
- pit_reports
- robot_stats
- user_profiles
- user_team_stars

Views created:
- admin_user_list
- robots_complete

Functions created:
- calculate_match_score
- check_admin_star
- check_schema_compatibility
- check_user_star
- create_user_profile
- get_admin_starred_teams
- get_reefscape_scoring_config
- get_user_starred_teams
- is_user_admin
- recalculate_team_stats
- toggle_admin_star
- toggle_user_star
- trigger_calculate_match_score
- trigger_recalculate_stats
```

---

## Step 3: Configure Authentication

### 3.1 Create Auth Trigger

📁 **File:** `3 - CREATE_AUTH_TRIGGER.sql`

**Purpose:** Automatically creates a user profile when someone signs up.

1. Open `3 - CREATE_AUTH_TRIGGER.sql` in VS Code
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**
5. ✅ **Expected:** "Success. No rows returned"

**What this does:**
- When a user signs up, automatically creates a row in `user_profiles`
- Initializes `is_admin: false` by default
- Links to `auth.users` table

### 3.2 Set Active Competition

📁 **File:** `4 - SET_TEST_COMPETITION.sql`

**Purpose:** Configure the active competition and available competitions list.

1. Open `4 - SET_TEST_COMPETITION.sql` in VS Code
2. **Optional:** Edit the script to set your actual competition name
   ```sql
   active_competition = 'Test Competition',  -- Change to your event name
   available_competitions = '["Test Competition", "East Bay Regional"]'::jsonb
   ```
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. ✅ **Expected:** Shows the updated metadata with your competition set

---

## Step 4: Load Test Data (Optional)

📁 **File:** `5 - LOAD_TEST_DATA.sql`

**Purpose:** Populate database with sample teams and matches for testing.

**Test Data Includes:**
- 5 teams (589, 254, 1323, 971, 1678)
- 3 matches per team
- Pit scouting data for all teams
- Calculated statistics

1. Open `5 - LOAD_TEST_DATA.sql` in VS Code
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**
5. ✅ **Expected:** Multiple "INSERT" success messages

**Skip this step if you want to start with an empty database.**

---

## Step 5: Grant Admin Access

📁 **File:** `6 - GRANT_ADMIN_ACCESS.sql`

**Purpose:** Grant admin privileges to specific users.

### 5.1 Sign Up First User

**You must create at least one user account before running this script:**

1. Open your frontend app (or navigate to your Supabase auth URL)
2. Sign up with your email (the one you want to be admin)
3. Note the email address you used

### 5.2 Run Admin Grant Script

1. Open `6 - GRANT_ADMIN_ACCESS.sql` in VS Code
2. **Edit the email address** in the script:
   ```sql
   WHERE email IN (
       'your-email@example.com',  -- ← Change this to your actual email
       'mentor@example.com'       -- Add more admin emails here
   );
   ```
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. ✅ **Expected:** Shows "Admin access granted" message with count

**To add more admins later:**
- Re-run this script with additional email addresses
- Or manually update the `user_profiles` table:
  ```sql
  UPDATE user_profiles
  SET is_admin = true
  WHERE email = 'new-admin@example.com';
  ```

---

## Step 6: Configure Frontend

### 6.1 Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API Keys**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Publishable Key**: `sb_publishable_...`

💡 **Note:** Use the modern "publishable key" (starts with `sb_publishable_`), not the legacy "anon key".

### 6.2 Create .env File

1. Open VS Code in the `Frontend_2025_Scouting` directory
2. Open integrated terminal (`` Ctrl+` ``)
3. Copy the example file:
   ```bash
   cp .env.example .env
   ```
   (On Windows Command Prompt: `copy .env.example .env`)

4. Edit `.env` file with your credentials:
   ```env
   PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   PUBLIC_SUPABASE_KEY=sb_publishable_...your_key_here
   ```

5. **Save the file** (Ctrl+S)

⚠️ **Security:** The `.env` file is in `.gitignore` and won't be committed. Share it securely with your team.

---

## Verification

### Check Database Setup

Run this query in SQL Editor to verify everything:

```sql
-- Check schema version
SELECT schema_version, active_competition, available_competitions
FROM app_metadata;

-- Check tables exist (should show 8)
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check functions exist (should show 14)
SELECT COUNT(*) as function_count
FROM information_schema.routines
WHERE routine_schema = 'public';

-- Check for admin users
SELECT email, is_admin, created_at
FROM user_profiles
ORDER BY created_at;

-- Check test data loaded (if you ran script 5)
SELECT COUNT(*) as team_count FROM pit_reports;
SELECT COUNT(*) as match_count FROM match_reports;
SELECT COUNT(*) as stats_count FROM robot_stats;
```

**Expected Results:**
- Schema version: `2.1.0`
- 8 tables
- 14 functions
- At least 1 admin user
- If test data loaded: 5 teams, 15 matches, 5 stat records

### Test Frontend Connection

1. Start the frontend app:
   ```bash
   cd Frontend_2025_Scouting
   ./start_app.sh
   ```

2. Open the app (scan QR code or press `w` for web)

3. **Test Authentication:**
   - Click "Sign Up"
   - Create a new account
   - Should log in successfully without email verification

4. **Test Database Connection:**
   - Navigate to Leaderboard
   - Should see teams listed (if you loaded test data)
   - Try starring a team (star icon should persist)

5. **Test Admin Features (if you're an admin):**
   - Tap a star once → Yellow star (user favorite)
   - Tap again → Blue star (admin flag)
   - Tap again → Both stars removed
   - Other users should see blue stars

---

## What Was Created

### Database Tables (8)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `app_metadata` | App configuration | Schema version, active competition, feature flags |
| `user_profiles` | User accounts | Email, admin status, default competition |
| `game_scoring_config` | Point values | Configurable scoring for REEFSCAPE game |
| `match_reports` | Match scouting | Auto, tele, endgame data for each match |
| `pit_reports` | Pit scouting | Robot capabilities (algae, climb, coral) |
| `robot_stats` | Calculated stats | Auto-updated averages, ranking values |
| `user_team_stars` | User favorites | Personal starred teams (yellow stars) |
| `admin_team_stars` | Admin flags | Teams flagged by admins (blue stars, visible to all) |

### Security Features

**Row Level Security (RLS) enabled on all tables:**
- Users can only view/edit their own data
- Admins can modify admin-specific data
- Public data (stats, robot info) visible to all authenticated users
- Team stars properly isolated per user with admin override

**Functions use SECURITY DEFINER with fixed search_path:**
- Safe execution with proper permissions
- `SET search_path = ''` prevents search path injection attacks
- All table references use explicit `public.` schema prefix
- Prevents SQL injection
- Validates admin status before privileged operations

### Team Starring System

**User Stars (Yellow):**
- Each user can star any team
- Persists across sessions
- Only visible to that user
- Synchronized across leaderboard and team detail pages

**Admin Stars (Blue):**
- Set by admins only
- Visible to all users
- Optional note field for why team is important
- Displayed above user stars

**How It Works:**
- Regular user: Tap to toggle yellow star
- Admin: 1st tap = yellow, 2nd tap = blue, 3rd tap = remove both
- Stars sync across all pages in real-time

---

## Troubleshooting

### "Relation already exists" Error

**Solution:** You're trying to create tables that already exist.
- Run script `1 - DROP_ALL_SCHEMA.sql` first to clean slate
- Then run scripts 2-6 in order

### "Permission denied" on Function Creation

**Solution:** Make sure you're using the project owner account.
- Check you're logged into the correct Supabase organization
- Owner account has full database permissions

### Frontend Can't Connect

**Check:**
1. `.env` file exists in `Frontend_2025_Scouting/`
2. `PUBLIC_SUPABASE_URL` matches your project URL exactly
3. `PUBLIC_SUPABASE_KEY` is the publishable key (starts with `sb_publishable_`)
4. Supabase project is not paused (free tier pauses after inactivity)
5. Run test connection:
   ```bash
   cd Frontend_2025_Scouting/supabase_setup
   node test-supabase-connection.js
   ```

### Users Can't Sign Up

**Check:**
1. Email confirmation is disabled (Step 1.3)
2. Email provider is enabled: **Authentication** → **Sign In / Providers** → **Email** (enabled)
3. Check for error in browser console (F12)

### Admin Access Not Working

**Check:**
1. User signed up BEFORE running script 6
2. Email in script 6 matches exactly (case-sensitive)
3. Verify in SQL Editor:
   ```sql
   SELECT email, is_admin FROM user_profiles;
   ```
4. If `is_admin` is false, update manually:
   ```sql
   UPDATE user_profiles
   SET is_admin = true
   WHERE email = 'your-email@example.com';
   ```

### Stars Not Persisting

**Check:**
1. User is logged in (check AuthContext)
2. Active competition is set in app_metadata
3. No console errors when clicking star
4. Verify tables exist:
   ```sql
   SELECT * FROM user_team_stars;
   SELECT * FROM admin_team_stars;
   ```

### RLS Policy Errors

**Symptom:** "Row level security policy violation" errors

**Solution:**
1. Make sure user is authenticated (signed in)
2. Verify RLS policies were created:
   ```sql
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```
3. If missing, re-run script `2 - CREATE_CLEAN_SCHEMA.sql`

---

## Maintenance

### Backup Database

**Option 1: Supabase Dashboard**
1. Go to **Database** → **Backups**
2. Click **"Download backup"**

**Option 2: SQL Export**
```sql
-- Export all data
COPY (SELECT * FROM match_reports) TO '/tmp/match_reports.csv' CSV HEADER;
COPY (SELECT * FROM pit_reports) TO '/tmp/pit_reports.csv' CSV HEADER;
```

### Update Schema Version

When making schema changes, update the version:

```sql
UPDATE app_metadata
SET schema_version = '2.2.0',
    schema_updated_at = NOW()
WHERE id = 1;
```

### Reset to Factory State

To completely reset and start over:

```sql
-- Run scripts in order:
-- 1 - DROP_ALL_SCHEMA.sql
-- 2 - CREATE_CLEAN_SCHEMA.sql
-- 3 - CREATE_AUTH_TRIGGER.sql
-- 4 - SET_TEST_COMPETITION.sql
-- (Optional) 5 - LOAD_TEST_DATA.sql
-- 6 - GRANT_ADMIN_ACCESS.sql (with your email)
```

### Monitor Database Usage

Free tier limits:
- **500 MB** database size
- **2 GB** bandwidth per month
- **50,000** monthly active users

Check usage: **Settings** → **Usage**

---

## Next Steps

### 1. Customize for Your Competition

Edit `4 - SET_TEST_COMPETITION.sql` to set your regional:

```sql
UPDATE app_metadata SET
    active_competition = 'East Bay Regional',
    available_competitions = '["East Bay Regional", "Sacramento Regional"]'::jsonb
WHERE id = 1;
```

### 2. Import Team Data

Use The Blue Alliance (TBA) API to import teams:

```typescript
// Frontend app has TBA integration
// Navigate to admin panel → Import from TBA
```

### 3. Configure Scoring Values

If game rules change, update scoring in the app:

```sql
UPDATE game_scoring_config SET
    auto_coral_l1_points = 4,  -- Updated point value
    teleop_coral_l2_points = 4
WHERE id = 1;
```

### 4. Set Up Realtime (Optional)

For live leaderboard updates:

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `robot_stats`
   - `match_reports`
   - `user_team_stars`
   - `admin_team_stars`

### 5. Production Checklist

Before competition:

- [ ] Enable email confirmation (if desired)
- [ ] Verify all team leads have admin access
- [ ] Load actual team roster for your regional
- [ ] Set correct active competition
- [ ] Test on multiple devices
- [ ] Backup empty database
- [ ] Share `.env` file securely with team

---

## Support

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Frontend Setup Guide](./FRONTEND_SETUP_GUIDE.md)
- [App Quick Reference](../README.md)

### Team Resources
- Ask your team lead or mentor
- Check GitHub issues
- Team Discord/Slack

### Supabase Support
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com/)

---

**Setup Complete! 🎉**

Your database is ready for the 2025 FRC scouting season. Happy scouting!

---

*Last Updated: 2025-11-29*
*Schema Version: 2.1.0*
*Frontend Version: 2.1.0*
