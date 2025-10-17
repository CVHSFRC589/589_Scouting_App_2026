# 🚀 Supabase Direct Connection Setup Guide

## Overview

The FRC 589 Scouting App now connects **directly to Supabase** from the mobile frontend, eliminating the need for the Express.js backend for normal scouting operations.

### Architecture Change

**Old:** `Mobile App → Express API → Supabase`
**New:** `Mobile App → Supabase (direct)`

### Benefits
- ⚡ **Real-time updates** - Leaderboard updates instantly when scouts submit data
- 🔄 **Automatic sync** - Offline data queues and syncs when network returns
- 📊 **Reduced latency** - No Express middleware
- 🎓 **Modern stack** - Learn Backend-as-a-Service (BaaS) architecture

---

## Prerequisites

- ✅ Supabase account (already set up at https://supabase.com)
- ✅ Project created: `felzvdhnugvnuvqtzwkt`
- ✅ Database schema deployed (from backend setup)
- ✅ Node.js 20+ installed
- ✅ Expo CLI installed

---

## Part 1: Supabase Configuration

### Step 1: Get Supabase Credentials

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/felzvdhnugvnuvqtzwkt/settings/api

2. Copy these values:
   - **Project URL**: `https://felzvdhnugvnuvqtzwkt.supabase.co`
   - **Anon/Public Key** (starts with `eyJhbGc...`): Safe for frontend use

3. **DO NOT** copy the `service_role` key - that's for backend only

### Step 2: Run Database Setup Script

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/felzvdhnugvnuvqtzwkt/sql

2. Create a new query

3. Copy and paste the contents of `supabase-direct-setup.sql`

4. Click **RUN** to execute

5. Verify success - you should see:
   ```
   Success. No rows returned
   ```

This script:
- ✅ Enables Row-Level Security (RLS)
- ✅ Creates read/write policies for scouts
- ✅ Sets up automatic statistics calculation
- ✅ Creates triggers for data updates
- ✅ Prepares real-time subscriptions

### Step 3: Enable Real-Time Replication

1. Go to: https://supabase.com/dashboard/project/felzvdhnugvnuvqtzwkt/database/replication

2. Enable real-time for these tables:
   - ✅ `reefscape_matches`
   - ✅ `robot_info`
   - ✅ `robot_stats`
   - ✅ `algae`
   - ✅ `coral`

3. Click **Save** after enabling each table

**Why?** This allows the mobile app to receive live updates when data changes.

---

## Part 2: Frontend Configuration

### Step 4: Update Environment Variables

1. Open `Frontend_2025_Scouting/.env`

2. Add your Supabase credentials:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://felzvdhnugvnuvqtzwkt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Optional: Backend API (for TBA integration)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_KEY=589_e49493d424064e8cd5043d8b5073c63dcde70e87627a1b85c2cf81d62c6688cb
```

3. Replace `your_actual_anon_key_here` with the anon key from Step 1

4. Save the file

### Step 5: Install Dependencies

```bash
cd Frontend_2025_Scouting
npm install --legacy-peer-deps
```

This installs:
- ✅ `@supabase/supabase-js` - Supabase client library
- ✅ `@react-native-community/netinfo` - Network status detection

---

## Part 3: Testing

### Step 6: Test Supabase Connection

1. Start the development server:

```bash
npm start
```

2. Choose your platform:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser
   - Scan QR code for physical device (Expo Go app)

3. Check the console for:

```
✅ Supabase connection successful
```

If you see this, Supabase is connected! 🎉

### Step 7: Test Data Operations

#### Test READ Operations (Leaderboard)

1. Navigate to **Leaderboard** screen
2. You should see teams from Supabase (not demo data)
3. Check console for:
   ```
   Fetching robots from Supabase...
   ```

#### Test WRITE Operations (Match Scouting)

1. Navigate to **Match Scouting**
2. Fill out a pregame form
3. Submit data
4. Check console for:
   ```
   ✅ Pregame data saved to Supabase
   ```

5. Verify in Supabase Dashboard:
   - Go to: https://supabase.com/dashboard/project/felzvdhnugvnuvqtzwkt/editor
   - Open `reefscape_matches` table
   - Your match should appear!

#### Test REAL-TIME Updates

1. Open the app on **two devices** (or two browser windows)
2. On Device 1: Submit match scouting data
3. On Device 2: Watch the leaderboard
4. Device 2 should update **automatically** within 1-2 seconds!
5. Check console for:
   ```
   ✨ Real-time: Match data changed: {...}
   ```

---

## Part 4: Troubleshooting

### Issue: "Supabase connection failed"

**Symptoms:**
- App falls back to demo mode
- Console shows: `❌ Supabase connection failed`

**Solutions:**

1. **Check environment variables**
   ```bash
   # Verify .env file exists and has correct values
   cat Frontend_2025_Scouting/.env
   ```

2. **Restart Expo server**
   ```bash
   # Stop current server (Ctrl+C)
   # Clear cache and restart
   npm start --clear
   ```

3. **Check Supabase project status**
   - Go to: https://supabase.com/dashboard/project/felzvdhnugvnuvqtzwkt
   - Ensure project is active (not paused)

4. **Verify anon key is correct**
   - Re-copy from: https://supabase.com/dashboard/project/felzvdhnugvnuvqtzwkt/settings/api

### Issue: "Failed to insert data" or "Row-Level Security" error

**Symptoms:**
- Can read data but can't submit
- Error: `new row violates row-level security policy`

**Solutions:**

1. **Re-run RLS setup script**
   - Go to SQL Editor
   - Run `supabase-direct-setup.sql` again
   - This resets all policies

2. **Check table RLS status**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```
   All tables should show `rowsecurity = true`

3. **Verify policies exist**
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```
   You should see policies like:
   - `Allow public read on teams`
   - `Allow inserts on matches`
   - etc.

### Issue: Real-time updates not working

**Symptoms:**
- Data submits successfully
- But other devices don't update automatically

**Solutions:**

1. **Enable real-time replication**
   - Dashboard > Database > Replication
   - Enable for all relevant tables (see Step 3)

2. **Check subscription status**
   - Console should show:
     ```
     Subscribed to channel: robots-{regional}
     ```

3. **Verify real-time is enabled**
   ```sql
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime';
   ```
   Tables should be listed here

### Issue: Statistics not calculating

**Symptoms:**
- Match data submits
- But averages stay at 0

**Solutions:**

1. **Verify triggers are created**
   ```sql
   SELECT * FROM pg_trigger
   WHERE tgname IN ('algae_stats_trigger', 'coral_stats_trigger');
   ```

2. **Manually trigger calculation**
   ```sql
   SELECT calculate_robot_stats(589, 'test-regional');
   ```

3. **Check robot_stats table**
   ```sql
   SELECT * FROM robot_stats WHERE team_num = 589;
   ```
   Averages should update after running the function

### Issue: Demo mode always active

**Symptoms:**
- App shows demo data even with correct setup
- `isDemoMode = true` in console

**Solutions:**

1. **Force Supabase mode**
   - Check `.env` file has **no** placeholder values
   - Anon key should start with `eyJhbGc...`

2. **Clear app cache**
   ```bash
   # Android
   npm start -- --clear
   # Or manually clear app data in device settings
   ```

3. **Check network connectivity**
   - Ensure device can reach `https://felzvdhnugvnuvqtzwkt.supabase.co`
   - Test in browser first

---

## Part 5: Verification Checklist

Before deploying to competition, verify:

### ✅ Database Setup
- [ ] RLS enabled on all tables
- [ ] Read/write policies created
- [ ] Statistics function works
- [ ] Triggers fire on data changes
- [ ] Real-time enabled for tables

### ✅ Frontend Setup
- [ ] Supabase client installed
- [ ] Environment variables configured
- [ ] Connection test successful
- [ ] Demo mode disabled (when online)

### ✅ Functionality
- [ ] Can read leaderboard data
- [ ] Can submit match scouting
- [ ] Can submit pit scouting
- [ ] Statistics calculate automatically
- [ ] Real-time updates work
- [ ] Offline queue works

### ✅ Multi-Device Testing
- [ ] Multiple scouts can submit simultaneously
- [ ] Leaderboard updates on all devices
- [ ] No duplicate match errors
- [ ] Data syncs correctly

---

## Part 6: Advanced Configuration

### Custom Real-Time Filters

Want to receive updates for specific teams only?

```typescript
const channel = supabase
  .channel('team-589-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'reefscape_matches',
    filter: 'team_num=eq.589'  // Only team 589
  }, (payload) => {
    console.log('Team 589 updated:', payload);
  })
  .subscribe();
```

### Performance Optimization

For large datasets, use pagination:

```typescript
const { data, error } = await supabase
  .from('robots_complete')
  .select('*')
  .eq('regional', regional)
  .range(0, 49)  // First 50 results
  .order('rank_value', { ascending: true });
```

### Security: Additional RLS Rules

Restrict updates to specific scouts:

```sql
CREATE POLICY "Only allow scout's own submissions"
  ON reefscape_matches FOR UPDATE
  USING (scout_name = current_setting('request.jwt.claims')::json->>'email');
```

---

## Part 7: Rollback to Express Backend

If needed, you can revert to the Express backend:

1. **Update `.env`**
   ```bash
   # Comment out Supabase
   # EXPO_PUBLIC_SUPABASE_URL=...
   # EXPO_PUBLIC_SUPABASE_ANON_KEY=...

   # Use backend API
   EXPO_PUBLIC_API_URL=http://192.168.5.17:3000
   ```

2. **Start backend server**
   ```bash
   cd Backend_2025_Scouting
   npm start
   ```

3. **Revert `processing.tsx`**
   - Uncomment fetch() calls
   - Comment out supabaseService calls

---

## Support & Resources

### Documentation
- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript
- **Real-time Guide**: https://supabase.com/docs/guides/realtime

### Helpful Commands

```bash
# View Supabase logs (errors, queries)
# Dashboard > Logs > Postgres Logs

# Test connection from terminal
curl https://felzvdhnugvnuvqtzwkt.supabase.co/rest/v1/teams \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id felzvdhnugvnuvqtzwkt > data/database.types.ts
```

### Contact

- **Issues**: https://github.com/CVHSFRC589/589_Scouting_App_2026/issues
- **Supabase Support**: support@supabase.io
- **Team Lead**: (add contact info)

---

## Next Steps

1. ✅ Complete setup checklist above
2. ✅ Test with multiple devices
3. ✅ Train scouts on new app
4. ✅ Prepare for competition deployment

**The app is now ready for direct Supabase operation! 🎉**

---

## Appendix: What Changed?

### Files Created
1. `Frontend_2025_Scouting/data/supabaseClient.tsx` - Supabase client config
2. `Frontend_2025_Scouting/data/supabaseService.tsx` - Data operations
3. `Frontend_2025_Scouting/hooks/useRealtimeRobots.ts` - Real-time hook
4. `Frontend_2025_Scouting/hooks/useRealtimeMatches.ts` - Match updates hook
5. `supabase-direct-setup.sql` - Database setup script

### Files Modified
1. `Frontend_2025_Scouting/data/processing.tsx` - Now uses Supabase
2. `Frontend_2025_Scouting/.env` - Added Supabase credentials
3. `Frontend_2025_Scouting/package.json` - Added dependencies

### Backend Status
- **Express API**: Optional (only for TBA integration or admin tasks)
- **Supabase**: Primary database (handles all scouting operations)
