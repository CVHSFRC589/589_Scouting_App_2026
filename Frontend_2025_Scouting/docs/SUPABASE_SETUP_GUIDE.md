# Supabase Database Setup Guide

This guide will walk you through setting up a new Supabase database for the FRC 589 Scouting App from scratch.  Note this guide is intended only for Scouting Team Leads and mentors who have access to the 589 Supabase account.

---

## Prerequisites

- A Supabase account (free tier is fine)
- Access to https://supabase.com/dashboard
- Basic understanding of SQL (we'll provide all the scripts)

---

## Step 1: Create a New Supabase Project

### 1.1 Sign in to Supabase

1. Go to https://supabase.com/dashboard
2. Sign in with your account (or create one if you don't have one)

### 1.2 Create New Project

1. Click the **"New Project"** button
2. Fill in the project details on the "Create a new project" form:
   - **Organization**: Select your organization from the dropdown (it will default to your team's organization if you have one, or your personal account)
   - **Project name**: Enter a descriptive name like `FRC 589 Scouting App` or `2026 Scouting App`
   - **Database Password**: Either use the auto-generated strong password (click "Copy" to save it), or click "Generate a password" for a new one. **Save this password securely - you'll need it for database access!**
   - **Region**: Select the region closest to your team (default is "Americas" for most US teams)

3. **Security Options** (you can leave these at their defaults):
   - **What connections do you plan to use?**: Leave as **"Data API + Connection String"** (default)
   - **Data API configuration**: Leave as **"Use public schema for Data API"** (default)

4. **Advanced Configuration** (you can leave this at default):
   - **Postgres Type**: Leave as **"Postgres"** (default - recommended for production workloads)

5. Click **"Create new project"** at the bottom right
6. Wait ~2 minutes for your project to be provisioned

### 1.3 Disable Email Confirmation

To make development and testing easier, disable email confirmation for new signups:

1. In your Supabase project dashboard, click on **"Authentication"** in the left sidebar
2. Click on **"Sign In / Providers"** in the Authentication menu
3. Find the **"Email"** provider and click on it
4. Scroll down to find **"Confirm email"** toggle
5. **Turn OFF** the "Confirm email" toggle
6. Click **"Save"** at the bottom

💡 **Why?** With email confirmation disabled, users can sign up and immediately log in without needing to verify their email. This is helpful for development and testing. For production deployments, you may want to re-enable this for security.

### 1.4 Configure Frontend with Project Credentials

Once your project is ready, you'll configure the frontend app with your Supabase credentials.

#### Get your API keys from Supabase:

1. In your Supabase project dashboard, click on **"Settings"** (gear icon in left sidebar)
2. Click on **"API Keys"** in the settings menu
3. If you see legacy keys (anon key starting with `eyJ...`), click **"Create New API Keys"** to generate modern publishable keys
4. You'll need these two values:
   - **Project URL** (under "Project URL" section, looks like `https://xxxxx.supabase.co`)
   - **Publishable Key** (under "Publishable key" section, starts with `sb_publishable_...`)

💡 **Note**: Supabase is moving from legacy "anon keys" to modern "publishable keys". Always use the publishable key (`sb_publishable_...`) for new projects.

#### Configure the Frontend App

1. **Open the project in VS Code:**
   - Open VS Code
   - Click `File` > `Open Folder`
   - Navigate to the `Frontend_2025_Scouting` folder and click "Open"

2. **Open the Integrated Terminal in VS Code:**
   - Press `` Ctrl+` `` (Windows) or `` Cmd+` `` (Mac) to open the terminal
   - Or go to `Terminal` > `New Terminal`
   - Make sure you're in the `Frontend_2025_Scouting` directory

3. **Copy the `.env.example` file to create your `.env` file:**

   In the VS Code terminal, type:
   ```bash
   cp .env.example .env
   ```
   (On Windows Command Prompt, use: `copy .env.example .env`)

4. **Open the new `.env` file in VS Code:**
   - In the VS Code file explorer (left sidebar), you should now see a `.env` file
   - Click on it to open it in the editor

5. **Update these two values with your credentials from above:
   ```env
   PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   PUBLIC_SUPABASE_KEY=sb_publishable_...your_key_here
   ```
   Replace:
   - `https://xxxxx.supabase.co` with your actual **Project URL**
   - `sb_publishable_...your_key_here` with your actual **Publishable Key**

6. **Save the `.env` file:**
   - Press `Ctrl+S` (Windows) or `Cmd+S` (Mac)

⚠️ **Important**: Never commit your `.env` file to GitHub. It's already in `.gitignore` to protect your credentials.

⚠️ **Also Important**: This .env file should be shared with anyone else using the [FRONTEND_SETUP_GUIDE](Frontend_2025_Scouting\docs\FRONTEND_SETUP_GUIDE.md) in Step 4.

---

## Step 2: Create the Database Schema

### 2.1 Open SQL Editor

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click the **"New Query"** button

### 2.2 Run the Schema Creation Script

1. **In VS Code**, navigate to `Frontend_2025_Scouting/supabase_setup/CREATE_CLEAN_SCHEMA.sql`
2. **Open the file** and select all the contents (`Ctrl+A` on Windows, `Cmd+A` on Mac)
3. **Copy the entire script** (`Ctrl+C` on Windows, `Cmd+C` on Mac)
4. **In the Supabase SQL Editor**, paste the script (`Ctrl+V` or `Cmd+V`)
5. Click **"Run"** (or press `Ctrl+Enter`)
6. Wait for the execution to complete (~10-30 seconds)

### 2.3 Verify Schema Creation

You should see output showing:

```
Tables created:
- app_metadata
- match_reports
- pit_reports
- robot_stats
- user_profiles

Views created:
- admin_user_list
- robots_complete

Functions created:
- check_schema_compatibility
- create_user_profile
- is_user_admin
- recalculate_team_stats
- trigger_recalculate_stats

Triggers created:
- trigger_auto_recalculate_stats (on match_reports)
```

If you see errors, check the troubleshooting section at the bottom.

---

## Step 3: Create the Auth Trigger

The auth trigger automatically creates a user profile when someone signs up.

### 3.1 Run Auth Trigger Script

1. In the Supabase SQL Editor, click **"New Query"**
2. **In VS Code**, open `Frontend_2025_Scouting/supabase_setup/CREATE_AUTH_TRIGGER.sql`
3. **Copy the entire script** (`Ctrl+A` then `Ctrl+C` on Windows, `Cmd+A` then `Cmd+C` on Mac)
4. **In the Supabase SQL Editor**, paste the script and click **"Run"**

### 3.2 Verify Trigger Created

In the Supabase SQL Editor, run this query to verify the trigger was created:

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see one row showing the `on_auth_user_created` trigger on event_object_table `users`.

---

## Step 4: Initialize App Metadata

### 4.1 Set Initial Configuration

In the Supabase SQL Editor, run this query to set up your first competition:

```sql
UPDATE app_metadata SET
    active_competition = 'Test Competition',
    available_competitions = '["Test Competition"]'::jsonb,
    schema_version = '1.0.0'
WHERE id = 1;
```

### 4.2 Verify Configuration

In the Supabase SQL Editor, run this query to verify the configuration:

```sql
SELECT active_competition, schema_version, game_name, game_year
FROM app_metadata;
```

You should see:
- `active_competition`: Test Competition
- `schema_version`: 1.0.0
- `game_name`: REEFSCAPE
- `game_year`: 2025

---

## Step 5: Create Your First Admin User

### 5.1 Sign Up in the App

1. **In the VS Code terminal**, start the app:
   ```bash
   npm start -- --tunnel --clear
   ```
   💡 **Note**: `--tunnel` may or may not be needed depending on your local network configuration.  Try it both ways if you have trouble starting the app on your iPhone

2. Follow the instructions in the terminal to open the app on your device or simulator
3. Create a new account with your email
4. Sign in with your new account

### 5.2 Make Yourself Admin

In the Supabase SQL Editor, run this query (replace `your.email@example.com` with your actual email):

```sql
UPDATE user_profiles
SET is_admin = true
WHERE email = 'your.email@example.com';
```

### 5.3 Verify Admin Status

1. In the VS Code terminal where Expo is running, press `r` to reload the app
2. Sign in again - you should now have access to admin features

---

## Step 6: Test the Database

### 6.1 Load Test Data (Optional)

To verify everything works, you can load sample data:

1. **In VS Code**, open `Frontend_2025_Scouting/supabase_setup/LOAD_TEST_DATA.sql`
2. **Copy the entire script** (`Ctrl+A` then `Ctrl+C` on Windows, `Cmd+A` then `Cmd+C` on Mac)
3. **In the Supabase SQL Editor**, paste and run the script
4. This will create 5 sample teams with match and pit data

### 6.2 Verify Data Loaded

Check the leaderboard in the app - you should see 5 teams with statistics.

Or in the Supabase SQL Editor, run this query:

```sql
SELECT team_num, matches_played, avg_coral, avg_algae
FROM robots_complete
ORDER BY rank_value
LIMIT 5;
```

---

## Database Schema Overview

### Tables

1. **app_metadata** - Application settings and competition configuration
2. **match_reports** - Match scouting data (auto/tele scoring, climb, etc.)
3. **pit_reports** - Pit scouting data (robot capabilities)
4. **robot_stats** - Calculated statistics (auto-updated by trigger)
5. **user_profiles** - User accounts and permissions

### Views

1. **robots_complete** - Leaderboard view (combines stats + pit data)
2. **admin_user_list** - Admin dashboard (user submission stats)

### Key Features

- **Automatic stats calculation**: When you submit a match, `robot_stats` updates automatically
- **Row Level Security (RLS)**: Data is secure with proper access controls
- **Real-time updates**: Optional real-time subscriptions for live leaderboard
- **Schema versioning**: Frontend checks compatibility before making changes

---

## Troubleshooting

### Error: "Permission denied for schema public"

**Solution**: Make sure you're running the SQL as the project owner. Check your Supabase project settings to verify you're logged in with the correct account.

### Error: "relation already exists"

**Solution**: The schema already exists. If you want to start fresh, see the "Reset Database" section below.

### Frontend shows "Schema version mismatch"

**Solution**: In the Supabase SQL Editor, update the schema version in app_metadata by running this query:

```sql
UPDATE app_metadata SET schema_version = '1.0.0' WHERE id = 1;
```

### Connection test fails

**Solution**:
1. **In VS Code**, open your `.env` file and verify it has the correct URL and publishable key
2. Check that your Supabase project is active (not paused) in the Supabase dashboard
3. Make sure you're using the **publishable key** (`sb_publishable_...`), not a secret key (`sb_secret_...`)
4. If using a legacy project, ensure you created new API keys (Settings → API Keys → Create New API Keys)
5. **In the VS Code terminal**, try running the connection test again: `node Frontend_2025_Scouting\supabase_setup\test-supabase-connection.js`

### Auth trigger not working (users don't get profiles)

**Solution**: In the Supabase SQL Editor, recreate the trigger:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();
```

---

## Resetting the Database

If you need to start completely fresh:

### Option 1: Drop and Recreate (Quick)

1. **In VS Code**, open `supabase_setup/DROP_ALL_SCHEMA.sql`, copy the contents
2. **In the Supabase SQL Editor**, paste and run the script
3. Repeat the process with `CREATE_CLEAN_SCHEMA.sql`
4. Repeat the process with `CREATE_AUTH_TRIGGER.sql`

### Option 2: Create New Project (Safest)

1. Create a new Supabase project (follow Step 1 again)
2. Follow all the setup steps with the new project
3. Update your `.env` file with the new credentials
4. Delete the old project when you're ready

---

## Security Best Practices

### ✅ DO:
- Keep your `.env` file private (it's in `.gitignore`)
- Use the **anon key** in the frontend (not the service role key)
- Enable Row Level Security (RLS) on all tables (already done by the setup script)
- Rotate your database password periodically
- Give admin privileges only to trusted team members

### ❌ DON'T:
- Commit your `.env` file to GitHub
- Share your service role key publicly
- Disable RLS policies
- Use the same password for everything

---

## Next Steps

After completing this setup:

1. ✅ Test match scouting submission
2. ✅ Test pit scouting submission
3. ✅ Verify leaderboard displays correctly
4. ✅ Test realtime updates (if enabled)
5. ✅ Create additional admin users for your team
6. ✅ Configure your competition settings in app_metadata

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **FRC 589 Scouting App Docs**: See other files in `docs/` folder
- **Database Schema Reference**: See `supabase_setup/SCHEMA_REFERENCE.md`

---

## Getting Help

If you run into issues:

1. Check the troubleshooting section above
2. Review your Supabase project logs (Dashboard → Logs)
3. **In VS Code**, check the terminal for error messages from the connection test or Expo
4. Use **Claude Code** in VS Code (`` Ctrl+` `` or `` Cmd+` `` to open terminal, type `claude`) to ask questions
5. Ask your team's software lead or mentor

---

## Appendix: Manual Verification Queries

In the Supabase SQL Editor, you can run these queries to verify everything is set up correctly:

```sql
-- Check table count (should be 5)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check view count (should be 2)
SELECT COUNT(*) FROM information_schema.views
WHERE table_schema = 'public';

-- Check function count (should be 5)
SELECT COUNT(DISTINCT routine_name) FROM information_schema.routines
WHERE routine_schema = 'public';

-- Check RLS enabled on all tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- All should show 'true'

-- Check app_metadata initialized
SELECT * FROM app_metadata;
-- Should have 1 row with id=1

-- Check for any data
SELECT
    (SELECT COUNT(*) FROM match_reports) as matches,
    (SELECT COUNT(*) FROM pit_reports) as pit_reports,
    (SELECT COUNT(*) FROM robot_stats) as stats,
    (SELECT COUNT(*) FROM user_profiles) as users;
```

---

**Setup Complete! 🎉**

Your Supabase database is now ready for scouting. Start the app and begin collecting data!
