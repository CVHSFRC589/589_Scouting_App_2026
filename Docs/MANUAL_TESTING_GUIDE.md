# Frontend-Supabase Manual Testing Guide
**Team 589 Falkon Robotics - FRC 2025 Scouting App**

---

## 📋 Purpose

This guide provides step-by-step instructions to manually test that the frontend app can successfully:
- ✅ **Submit data** to Supabase (writes)
- ✅ **Retrieve data** from Supabase (reads)
- ✅ **Display data** correctly in the UI

---

## 🚨 Prerequisites

Before testing, ensure:

1. **Database Setup Complete**: Optimized schema is implemented
   - Run `Backend_2025_Scouting/COMPLETE_SCHEMA_RESET_WITH_TEST_DATA.sql` in Supabase SQL Editor
   - Verify tables exist: `teams`, `robot_info`, `robot_stats`, `matches`
   - Verify view exists: `robots_complete`

2. **Frontend Running**:
   ```bash
   cd Frontend_2025_Scouting
   npm start
   # Press 'w' for web or scan QR code for mobile
   ```

3. **Supabase Access**: Open https://supabase.com/dashboard in another browser tab
   - Navigate to: Table Editor
   - Keep this open to verify data in real-time

4. **Test Regional**: Know which regional you're testing with (e.g., "Test Regional 2025")

---

## 📝 Test Plan Overview

| Test # | Feature | Type | Tables Affected | Priority |
|--------|---------|------|----------------|----------|
| 1 | Pit Scouting | WRITE | `robot_info` | HIGH |
| 2 | Match Pregame | WRITE | `matches` | HIGH |
| 3 | Match Auto Phase | WRITE | `matches` | HIGH |
| 4 | Match Teleop Phase | WRITE | `matches` | HIGH |
| 5 | Match Postgame | WRITE | `matches` | HIGH |
| 6 | Leaderboard Display | READ | `robots_complete` view | HIGH |
| 7 | Robot Display | READ | `robots_complete` view | MEDIUM |
| 8 | Match Data Charts | READ | `matches`, `robot_stats` | MEDIUM |

---

## 🧪 TEST 1: Pit Scouting Data Submission

**File:** `app/(login)/(regional)/(Scouting)/PitScouting.tsx`
**Database Table:** `robot_info`
**Expected Behavior:** Robot pit data is created/updated in Supabase

### Test Steps:

1. **Navigate to Pit Scouting**
   - Open the app → Select Regional → Navigate to "Scouting" tab → "Pit Scouting"

2. **Enter Team Number**
   - Input: `589` (or any team number)
   - Press "Submit"
   - ✅ **Verify:** Team number field shows the value

3. **Fill Out Pit Data Form**
   - **Vision System:** Select "Limelight" (or any option)
   - **Drive Train:** Select "Swerve" (or any option)
   - **Ground Intake:** Toggle ON
   - **Source Intake:** Toggle ON
   - **L1 Scoring:** Toggle ON
   - **L2 Scoring:** Toggle ON
   - **L3 Scoring:** Toggle ON
   - **L4 Scoring:** Toggle ON
   - **Algae Remove:** Toggle ON
   - **Processor:** Toggle ON
   - **Net:** Toggle ON
   - **Climb Deep:** Toggle ON
   - **Climb Shallow:** Toggle ON
   - **Comments:** Type "Test pit scouting submission"

4. **Submit Data**
   - Scroll to bottom → Press "Submit" button
   - ✅ **Expected:** Success message or navigation to next screen
   - ❌ **Failure:** Error message or no response

5. **Verify in Supabase**
   - Go to Supabase Dashboard → Table Editor → `robot_info`
   - Filter: `team_num = 589` AND `regional = "Your Regional Name"`
   - ✅ **Check Row Exists** with:
     - `vision_sys = "Limelight"`
     - `drive_train = "Swerve"`
     - `ground_intake = true`
     - `source_intake = true`
     - `l1_scoring = true`, `l2_scoring = true`, `l3_scoring = true`, `l4_scoring = true`
     - `remove = true`, `processor = true`, `net = true`
     - `climb_deep = true`, `climb_shallow = true`
     - `comments = "Test pit scouting submission"`

### Test Result:
- [ ] **PASS**: Data visible in Supabase table
- [ ] **FAIL**: Data not in Supabase (check error logs)

**API Call Location:** `PitScouting.tsx:423` → `robotApiService.updatePitData()`
**Supabase Service:** `supabaseService.tsx:155-188` → `updatePitData()`

---

## 🧪 TEST 2: Match Pregame Data Submission

**File:** `app/(login)/(regional)/(Scouting)/(MatchScouting)/Pregame.tsx`
**Database Table:** `reefscape_matches`
**Expected Behavior:** New match entry created with starting position

### Test Steps:

1. **Navigate to Match Scouting**
   - App → Scouting → "Match Scouting" → "Pregame"

2. **Select Regional**
   - Choose your test regional from dropdown
   - ✅ **Verify:** Regional name displays

3. **Enter Team Number**
   - Dropdown: Select `589` (or type and add new team)
   - ✅ **Verify:** Team number selected

4. **Enter Match Number**
   - Input: `1`
   - ✅ **Verify:** Match number shows

5. **Set Starting Position**
   - Drag slider to position `2` (or any value 0-3)
   - ✅ **Verify:** Position number displays

6. **Submit Pregame Data**
   - Press "Next" or "Submit" button
   - ✅ **Expected:** Navigation to Auto phase screen
   - ❌ **Failure:** Error or stuck on screen

7. **Verify in Supabase**
   - Supabase → Table Editor → `reefscape_matches`
   - Filter: `team_num = 589` AND `match_num = 1` AND `regional = "Your Regional"`
   - ✅ **Check Row Exists** with:
     - `auto_starting_position = 2`
     - Other fields may be NULL (will be filled in later phases)

### Test Result:
- [ ] **PASS**: Match row created in Supabase
- [ ] **FAIL**: No row found

**API Call Location:** `Pregame.tsx:592` → `robotApiService.sendPregameData()`
**Supabase Service:** `supabaseService.tsx:197-222` → `sendPregameData()`

---

## 🧪 TEST 3: Match Auto Phase Data Submission

**File:** `app/(login)/(regional)/(Scouting)/(MatchScouting)/Auto.tsx`
**Database Tables:** `algae`, `coral`
**Expected Behavior:** Algae and coral records inserted with timestamps

### Test Steps:

1. **Continue from Pregame** (or navigate to Auto phase)
   - Should show Team 589, Match 1

2. **Record Coral Scoring**
   - Press "L1 +" button **2 times** (L1 coral = 2)
   - Press "L2 +" button **1 time** (L2 coral = 1)
   - Press "L3 +" button **3 times** (L3 coral = 3)
   - ✅ **Verify:** Numbers display correctly on screen

3. **Record Algae Actions**
   - Press "Removed +" button **2 times** (Algae removed = 2)
   - Press "Processed +" button **1 time** (Algae processed = 1)
   - Press "Net +" button **1 time** (Algae in net = 1)
   - ✅ **Verify:** Numbers display correctly

4. **Submit Auto Phase**
   - Press "Next" or "Submit Auto" button
   - ✅ **Expected:** Navigation to Teleop screen
   - ❌ **Failure:** Error message

5. **Verify Coral in Supabase**
   - Supabase → Table Editor → `coral`
   - Filter: `team_num = 589` AND `match_num = 1` AND `regional = "Your Regional"`
   - ✅ **Check 6 rows exist:**
     - 2 rows: `level = 1`, `made = true`, `timestamp = [auto times]`
     - 1 row: `level = 2`, `made = true`, `timestamp = [auto time]`
     - 3 rows: `level = 3`, `made = true`, `timestamp = [auto times]`

6. **Verify Algae in Supabase**
   - Supabase → Table Editor → `algae`
   - Filter: `team_num = 589` AND `match_num = 1` AND `regional = "Your Regional"`
   - ✅ **Check 4 rows exist:**
     - 2 rows: `where_scored = "removed"`, `made = true`, `timestamp = [auto times]`
     - 1 row: `where_scored = "processor"`, `made = true`, `timestamp = [auto time]`
     - 1 row: `where_scored = "net"`, `made = true`, `timestamp = [auto time]`

### Test Result:
- [ ] **PASS**: Coral records in database (6 rows)
- [ ] **PASS**: Algae records in database (4 rows)
- [ ] **FAIL**: Missing records (note which table)

**API Call Location:** `Auto.tsx:468` → `robotApiService.sendAutoData()`
**Supabase Service:** `supabaseService.tsx:227-267` → `sendAutoData()`

---

## 🧪 TEST 4: Match Teleop Phase Data Submission

**File:** `app/(login)/(regional)/(Scouting)/(MatchScouting)/Tele.tsx`
**Database Tables:** `reefscape_matches`, `algae`, `coral`
**Expected Behavior:** Additional algae/coral records inserted + climb data updated

### Test Steps:

1. **Continue from Auto** (or navigate to Teleop)
   - Should show Team 589, Match 1

2. **Record Teleop Coral Scoring**
   - Press "L1 +" button **3 times**
   - Press "L4 +" button **2 times**
   - ✅ **Verify:** Numbers display

3. **Record Teleop Algae Actions**
   - Press "Processed +" button **5 times**
   - Press "Net +" button **2 times**
   - ✅ **Verify:** Numbers display

4. **Select Climb Type**
   - Select "Deep Climb" (or Shallow/Park/None)
   - ✅ **Verify:** Selection highlighted

5. **Submit Teleop Phase**
   - Press "Next" or "Submit Teleop" button
   - ✅ **Expected:** Navigation to Postgame screen
   - ❌ **Failure:** Error message

6. **Verify Coral in Supabase**
   - Supabase → `coral` table
   - Filter: `team_num = 589` AND `match_num = 1`
   - ✅ **Check NEW rows added** (in addition to Auto rows):
     - 3 rows: `level = 1`, timestamps in teleop range
     - 2 rows: `level = 4`, timestamps in teleop range
   - ✅ **Total coral rows should now be: 6 (auto) + 5 (teleop) = 11 rows**

7. **Verify Algae in Supabase**
   - Supabase → `algae` table
   - Filter: `team_num = 589` AND `match_num = 1`
   - ✅ **Check NEW rows added**:
     - 5 rows: `where_scored = "processor"`, teleop timestamps
     - 2 rows: `where_scored = "net"`, teleop timestamps
   - ✅ **Total algae rows: 4 (auto) + 7 (teleop) = 11 rows**

8. **Verify Climb in Supabase**
   - Supabase → `reefscape_matches` table
   - Filter: `team_num = 589` AND `match_num = 1`
   - ✅ **Check match row updated**:
     - `climb_deep = true` (if you selected Deep)
     - `climb_shallow = false`
     - `park = false`

### Test Result:
- [ ] **PASS**: Additional coral records added
- [ ] **PASS**: Additional algae records added
- [ ] **PASS**: Climb data updated in match row
- [ ] **FAIL**: (note which failed)

**API Call Location:** `Tele.tsx:526` → `robotApiService.sendTeleData()`
**Supabase Service:** `supabaseService.tsx:272-326` → `sendTeleData()`

---

## 🧪 TEST 5: Match Postgame Data Submission

**File:** `app/(login)/(regional)/(Scouting)/(MatchScouting)/Post.tsx`
**Database Table:** `reefscape_matches`
**Expected Behavior:** Match row updated with ratings, tags, and comments

### Test Steps:

1. **Continue from Teleop** (or navigate to Postgame)
   - Should show Team 589, Match 1

2. **Set Driver Rating**
   - Drag slider to **8** (1-10 scale)
   - ✅ **Verify:** Number displays

3. **Add Quick Tags**
   - Toggle ON: "Defense"
   - Toggle ON: "Malfunction"
   - Leave OFF: "Disabled", "No Show"
   - ✅ **Verify:** Tags highlighted

4. **Add Comments**
   - Type: "Excellent driver control, minor intake issue in teleop"
   - ✅ **Verify:** Text appears

5. **Submit Postgame**
   - Press "Submit" or "Finish Match" button
   - ✅ **Expected:** Success message + return to main screen
   - ❌ **Failure:** Error or stuck

6. **Verify in Supabase**
   - Supabase → `reefscape_matches` table
   - Filter: `team_num = 589` AND `match_num = 1`
   - ✅ **Check match row updated**:
     - `driver_rating = 8`
     - `defence = true` (note spelling in database)
     - `malfunction = true`
     - `disabled = false`
     - `no_show = false`
     - `comments = "Excellent driver control, minor intake issue in teleop"`

### Test Result:
- [ ] **PASS**: Match row fully updated with postgame data
- [ ] **FAIL**: Data not updated

**API Call Location:** `Post.tsx:196` → `robotApiService.updatePostGame()`
**Supabase Service:** `supabaseService.tsx:331-354` → `updatePostGame()`

---

## ✅ CHECKPOINT: Complete Match Data

At this point, you should have a **complete match** for Team 589, Match 1:

**In `reefscape_matches` table:**
- ✅ 1 row with all fields populated (pregame → auto → teleop → postgame)

**In `algae` table:**
- ✅ 11 rows total (4 auto + 7 teleop)

**In `coral` table:**
- ✅ 11 rows total (6 auto + 5 teleop)

**In `robot_info` table:**
- ✅ 1 row with pit scouting data

---

## 🧪 TEST 6: Leaderboard Data Retrieval

**File:** `app/(login)/(regional)/(TeamInfo)/Leaderboard.tsx`
**Database View:** `robots_complete`
**Expected Behavior:** Display sorted list of robots with stats

### Test Steps:

1. **Navigate to Leaderboard**
   - App → "Team Info" tab → "Leaderboard"

2. **Verify Data Loads**
   - ✅ **Expected:** List of teams appears
   - ✅ **Check:** Team 589 appears in list
   - ❌ **Failure:** Empty list or loading forever

3. **Test Sorting - Rank**
   - Press sort dropdown → Select "Rank"
   - ✅ **Verify:** Teams reorder by rank_value
   - ✅ **Check:** Team 589 shows rank number

4. **Test Sorting - Algae Processed**
   - Sort dropdown → Select "Algae Processed Avg"
   - ✅ **Verify:** Teams reorder
   - ✅ **Check:** Team 589 shows algae processed average
   - ✅ **Expected Value:** Should reflect match data (processed: 1 auto + 5 teleop = 6 total / 1 match = 6.0 avg)

5. **Test Sorting - Coral Levels**
   - Sort by "L1 Avg", "L2 Avg", "L3 Avg", "L4 Avg"
   - ✅ **Check Team 589 values:**
     - L1 Avg: (2 auto + 3 teleop) / 1 match = 5.0
     - L2 Avg: (1 auto + 0 teleop) / 1 match = 1.0
     - L3 Avg: (3 auto + 0 teleop) / 1 match = 3.0
     - L4 Avg: (0 auto + 2 teleop) / 1 match = 2.0

6. **Test Search**
   - Type "589" in search bar
   - ✅ **Verify:** Only Team 589 appears
   - Clear search → All teams return

7. **Verify Data Freshness**
   - Go to Supabase → Edit Team 589's data in `robot_info`
   - Return to app → Pull down to refresh
   - ✅ **Verify:** Updated data appears

### Test Result:
- [ ] **PASS**: Leaderboard loads and displays correct data
- [ ] **PASS**: Sorting works for all criteria
- [ ] **PASS**: Search filters correctly
- [ ] **PASS**: Calculated averages match expected values
- [ ] **FAIL**: (note which failed)

**API Call Location:** `Leaderboard.tsx:109` → `robotApiService.getSortedRobots()`
**Supabase Service:** `supabaseService.tsx:63-130` → `getSortedRobots()`
**Database View:** `robots_complete` (combines teams + robot_info + calculated averages)

---

## 🧪 TEST 7: Robot Display Data Retrieval

**File:** `app/(login)/(regional)/(TeamInfo)/(tabs)/RobotDisplay.tsx`
**Database View:** `robots_complete`
**Expected Behavior:** Display detailed robot capabilities

### Test Steps:

1. **Navigate to Robot Display**
   - App → Team Info → Leaderboard → Tap on Team 589
   - OR navigate directly to Robot Display → Enter team 589

2. **Verify Pit Data Displays**
   - ✅ **Check each field matches Test 1 data:**
     - Vision System: "Limelight"
     - Drive Train: "Swerve"
     - Ground Intake: ✅ (checkmark/green)
     - Source Intake: ✅
     - L1/L2/L3/L4 Scoring: All ✅
     - Algae Remove: ✅
     - Processor: ✅
     - Net: ✅
     - Climb Deep: ✅
     - Climb Shallow: ✅
     - Comments: "Test pit scouting submission"

3. **Verify Calculated Stats**
   - ✅ **Check stats match match data:**
     - Algae Processed Avg: 6.0
     - Total matches: 1

4. **Test Data Update**
   - Go to Supabase → `robot_info` → Change Team 589's `vision_sys` to "Photon Vision"
   - Return to app → Refresh/reload page
   - ✅ **Verify:** Vision System now shows "Photon Vision"

### Test Result:
- [ ] **PASS**: All pit scouting data displays correctly
- [ ] **PASS**: Stats match expected values
- [ ] **PASS**: Data updates when changed in database
- [ ] **FAIL**: (note which failed)

**API Call Location:** `RobotDisplay.tsx:47` → `robotApiService.getRobot()`
**Supabase Service:** `supabaseService.tsx:135-150` → `getRobot()`

---

## 🧪 TEST 8: Match Data Charts Retrieval

**File:** `app/(login)/(regional)/(TeamInfo)/(tabs)/MatchData.tsx`
**Database Tables:** `reefscape_matches`, `algae`, `coral`
**Expected Behavior:** Display match-by-match performance charts

### Test Steps:

1. **Navigate to Match Data**
   - App → Team Info → Select Team 589 → "Match Data" tab

2. **Load Graph Data**
   - Press "Load Graph" button
   - ✅ **Expected:** Loading indicator → Graph appears
   - ❌ **Failure:** Error or infinite loading

3. **Verify Stacked Bar Chart**
   - ✅ **Check Match 1 bar shows:**
     - Algae sections: Removed (2), Processed (6), Net (3)
     - Coral sections: L1 (5), L2 (1), L3 (3), L4 (2)
   - ✅ **Verify:** Bar colors match legend

4. **Test Interactive Legend**
   - Tap "L1" in legend to hide L1 data
   - ✅ **Verify:** L1 section disappears from bar
   - Tap "L1" again to show
   - ✅ **Verify:** L1 section reappears

5. **Verify Average Display**
   - ✅ **Check calculated averages shown:**
     - If "Algae Processed" selected: Shows 6.0
     - If "Coral L1" selected: Shows 5.0
     - If "Coral L4" selected: Shows 2.0

6. **Verify Climb Pie Chart**
   - ✅ **Check pie chart shows:**
     - Deep Climb: 100% (1 match with deep climb)
     - Shallow: 0%
     - Park: 0%

7. **Test with Multiple Matches**
   - Complete another match (Match 2) for Team 589 using Tests 2-5
   - Return to Match Data graph
   - ✅ **Verify:** Now shows 2 bars (Match 1 and Match 2)
   - ✅ **Verify:** Averages update to reflect both matches

### Test Result:
- [ ] **PASS**: Graph loads with correct data
- [ ] **PASS**: Bar chart shows accurate match data
- [ ] **PASS**: Interactive legend works
- [ ] **PASS**: Averages calculate correctly
- [ ] **PASS**: Climb pie chart accurate
- [ ] **FAIL**: (note which failed)

**API Call Location:** `MatchData.tsx:171-175`
- `robotApiService.fetchAllTeamMatchData()` → `supabaseService.tsx:388-410`
- `robotApiService.getClimbStats()` → `supabaseService.tsx:415-438`
- `robotApiService.getRobot()` → `supabaseService.tsx:135-150`

---

## 🔍 Advanced Testing Scenarios

### Scenario A: Offline Behavior (Demo Mode Fallback)

**Purpose:** Test that app handles Supabase connection failures gracefully

1. **Simulate Connection Failure**
   - Go to Supabase Dashboard → Settings → API → Temporarily change API URL to invalid value
   - OR: Disconnect from internet

2. **Test App Behavior**
   - App → Try to load Leaderboard
   - ✅ **Expected:** App switches to "Demo Mode" with mock data
   - ✅ **Verify:** Demo banner appears
   - ❌ **Failure:** App crashes or shows error

**File:** `data/processing.tsx:20-167` (Demo mode detection)

### Scenario B: Concurrent Match Submissions

**Purpose:** Test that multiple scouts can submit different matches simultaneously

1. **Scout 1:** Submit Match 1 for Team 589
2. **Scout 2:** Submit Match 2 for Team 254 (same time)
3. ✅ **Verify in Supabase:** Both matches appear with correct data

### Scenario C: Data Integrity - Partial Submission

**Purpose:** Test behavior when user exits mid-match

1. **Start Match Scouting:** Team 589, Match 3
2. **Complete Pregame Only** → Exit app/navigate away
3. ✅ **Verify in Supabase:**
   - `reefscape_matches` has row with `auto_starting_position` set
   - Other fields are NULL
   - No algae/coral records exist yet
4. **Resume Match:** Go back to Auto phase
5. ✅ **Verify:** Data appends correctly (doesn't duplicate pregame)

---

## 📊 Test Summary Sheet

Use this checklist to track all tests:

| Test | Feature | Status | Notes |
|------|---------|--------|-------|
| 1 | Pit Scouting Write | ☐ PASS ☐ FAIL | Table: `robot_info` |
| 2 | Pregame Write | ☐ PASS ☐ FAIL | Table: `reefscape_matches` |
| 3 | Auto Phase Write | ☐ PASS ☐ FAIL | Tables: `algae`, `coral` |
| 4 | Teleop Write | ☐ PASS ☐ FAIL | Tables: `algae`, `coral`, `reefscape_matches` |
| 5 | Postgame Write | ☐ PASS ☐ FAIL | Table: `reefscape_matches` |
| 6 | Leaderboard Read | ☐ PASS ☐ FAIL | View: `robots_complete` |
| 7 | Robot Display Read | ☐ PASS ☐ FAIL | View: `robots_complete` |
| 8 | Match Data Read | ☐ PASS ☐ FAIL | Multiple tables |

**Overall Test Result:** ☐ ALL PASS ☐ SOME FAIL

---

## 🐛 Troubleshooting Common Issues

### Issue: "Cannot find table 'reefscape_matches'"

**Cause:** Migration not completed
**Solution:** Run `FRONTEND_FIX_MIGRATION.sql` in Supabase SQL Editor

### Issue: Data not appearing in Supabase

**Possible Causes:**
1. **Check Console Logs:**
   - Web: Press F12 → Console tab
   - Look for red errors mentioning Supabase

2. **Verify Supabase Client:**
   - File: `data/supabaseClient.tsx:42-56`
   - Run: Test connection function
   - Check: API keys are correct in environment

3. **Check API Service:**
   - File: `data/processing.tsx:20-167`
   - Verify: Not in demo mode (check for demo flag)

### Issue: Wrong data showing in charts

**Possible Causes:**
1. **Cache Issue:** Pull down to refresh
2. **Calculation Error:** Check `robots_complete` view in Supabase
3. **Multiple Regionals:** Ensure filtering by correct regional

### Issue: App crashes when submitting

**Solution:**
1. Check Supabase Row-Level Security (RLS) policies
2. Verify authentication is working
3. Check network tab in browser DevTools for failed requests

---

## 📸 Expected Screenshots Checklist

For documentation purposes, capture these screenshots during testing:

- [ ] Pit Scouting form filled out
- [ ] Pit data visible in Supabase `robot_info` table
- [ ] Match Pregame screen with team/match selected
- [ ] Auto phase with coral/algae counts
- [ ] Supabase `algae` table with auto phase records
- [ ] Supabase `coral` table with auto phase records
- [ ] Teleop phase with data entered
- [ ] Postgame with ratings and tags
- [ ] Complete match row in `reefscape_matches` table
- [ ] Leaderboard displaying teams
- [ ] Robot Display showing pit data
- [ ] Match Data graph with bars and pie chart

---

## ✅ Test Completion Checklist

Before considering testing complete:

- [ ] All 8 core tests completed
- [ ] At least 1 advanced scenario tested
- [ ] Screenshots captured
- [ ] Any failures documented with:
  - [ ] Error messages
  - [ ] Console logs
  - [ ] Expected vs actual behavior
  - [ ] Steps to reproduce
- [ ] Supabase tables verified for data integrity
- [ ] App tested on at least one platform (web/iOS/Android)

---

## 📞 Getting Help

If tests fail:

1. **Check recent migration docs:**
   - `Backend_2025_Scouting/MIGRATION_SUMMARY.md`
   - `Backend_2025_Scouting/supabase_migration/README.md`

2. **Verify database schema:**
   ```bash
   cd Backend_2025_Scouting/supabase_migration
   node verify_frontend_compatibility.js
   ```

3. **Review Supabase logs:**
   - Dashboard → Logs → Check for errors

4. **Check GitHub issues:**
   - Search for similar issues in repo

---

**Testing Version:** 1.0
**Last Updated:** 2025-01-07
**Compatible With:** Frontend using Supabase direct connection (post-migration)
