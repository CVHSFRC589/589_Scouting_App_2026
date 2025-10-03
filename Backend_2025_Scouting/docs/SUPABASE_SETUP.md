# 🗄️ Supabase Database Setup Guide
## Team 589 FRC Scouting Backend

This guide provides complete instructions for initializing your Supabase database for the Team 589 FRC Scouting Backend using the consolidated SQL setup file.

---

## 🎯 **Overview**

The Supabase database stores all scouting data including:
- **Team information** - FRC teams and their details
- **Match data** - Individual match scouting records
- **Robot information** - Robot capabilities and characteristics
- **TBA integration** - Complete The Blue Alliance data model (events, rankings, awards, OPR, media, districts, predictions)
- **Sync tracking** - TBA data synchronization logs

All tables are protected with **Row Level Security (RLS)** policies that allow:
- ✅ **Public read access** - Anyone can query data
- ✅ **Service role write access** - Only backend API can insert/update/delete

---

## 🚀 **Quick Setup (5 Minutes)**

### **Step 1: Access Supabase SQL Editor**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Team 589 project
3. Click **SQL Editor** in the left sidebar
4. Click **New query** button

### **Step 2: Run Setup Script**

1. Open the file `supabase/supabase_setup.sql` from this repository
2. **Copy the entire contents** of the file
3. **Paste** into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

**Expected result:**
```
Success. No rows returned
```

This indicates all tables were created successfully!

### **Step 3: Verify Setup**

1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - `teams`
   - `matches`
   - `robot_info`
   - `events`
   - `event_teams`
   - `tba_matches`
   - `awards`
   - `event_rankings`
   - `team_event_status`
   - `event_opr`
   - `media`
   - `districts`
   - `district_rankings`
   - `predictions`
   - `robots`
   - `tba_sync_log`

3. Click on any table and select **Policies** tab
4. Verify you see:
   - ✅ **"Public read access"** policy
   - ✅ **"Service role write access"** policy

---

## 📊 **Database Schema**

### **Core Scouting Tables**

#### **teams**
- Stores FRC team information
- Columns: `id`, `team_number`, `team_name`, `regional`, `robot_name`, `notes`, `created_at`, `updated_at`
- Primary key: `id` (UUID)
- Unique: `team_number`

#### **matches**
- Individual match scouting data
- Columns: `id`, `team_id`, `match_number`, `match_type`, `alliance`, `match_data` (JSONB), `notes`, `scouter_name`, `created_at`, `updated_at`
- Foreign key: `team_id` → `teams.id` (CASCADE delete)
- Flexible `match_data` field stores game-specific data

#### **robot_info**
- Robot capabilities per season
- Columns: `id`, `team_id`, `season`, `autonomous_capabilities`, `teleop_capabilities`, `endgame_capabilities`, `notes`, `created_at`, `updated_at`
- Foreign key: `team_id` → `teams.id` (CASCADE delete)
- All capabilities stored as JSONB for game-specific flexibility

### **The Blue Alliance (TBA) Integration Tables**

#### **events**
- FRC events/competitions
- Key columns: `event_key`, `name`, `event_type`, `district`, `year`, `start_date`, `end_date`, `location_name`, `city`, `state_prov`, `country`, `website`
- Primary key: `event_key` (e.g., "2024occ")

#### **event_teams**
- Teams participating in events
- Links teams to events (many-to-many)
- Columns: `event_key`, `team_key`, `status` (JSONB)

#### **tba_matches**
- Official match data from TBA
- Columns: `match_key`, `event_key`, `comp_level`, `match_number`, `alliances` (JSONB), `score_breakdown` (JSONB), `videos`, `predicted_time`, `actual_time`
- Stores complete match results and breakdowns

#### **awards**
- Team awards from competitions
- Columns: `id`, `event_key`, `award_type`, `name`, `team_key`, `recipient_list` (JSONB)

#### **event_rankings**
- Team rankings at events
- Columns: `event_key`, `team_key`, `rank`, `ranking_data` (JSONB)
- Stores rank, record, and ranking point breakdowns

#### **team_event_status**
- Current team status at event
- Columns: `event_key`, `team_key`, `alliance_status` (JSONB), `playoff_status` (JSONB), `overall_status_str`

#### **event_opr**
- Offensive Power Ratings and stats
- Columns: `event_key`, `team_key`, `opr`, `dpr`, `ccwm`
- Statistical performance metrics

#### **media**
- Team photos, videos, avatars
- Columns: `id`, `team_key`, `media_type`, `media_key`, `details` (JSONB)

#### **districts**
- FIRST district information
- Columns: `district_key`, `abbreviation`, `display_name`, `year`

#### **district_rankings**
- Team district point rankings
- Columns: `district_key`, `team_key`, `rank`, `point_total`, `event_points` (JSONB)

#### **predictions**
- Match prediction data
- Columns: `event_key`, `match_key`, `predictions` (JSONB)

#### **robots**
- Historical robot information
- Columns: `team_key`, `year`, `robot_name`, `robot_data` (JSONB)

#### **tba_sync_log**
- Track TBA API synchronization
- Columns: `id`, `sync_type`, `entity_key`, `status`, `error_message`, `synced_at`

---

## 🛡️ **Security (Row Level Security)**

### **How RLS Works**

Every table has RLS enabled with two policies:

**1. Public Read Access**
```sql
CREATE POLICY "Public read access" ON table_name
FOR SELECT USING (true);
```
- Allows anyone to read data via Supabase API
- Perfect for mobile apps and web dashboards

**2. Service Role Write Access**
```sql
CREATE POLICY "Service role write access" ON table_name
FOR ALL USING (auth.role() = 'service_role');
```
- Only authenticated backend API can write
- Uses `SUPABASE_SECRET_KEY` from `.env`
- Prevents unauthorized data modification

### **Security Best Practices**

✅ **DO:**
- Use `SUPABASE_SECRET_KEY` only in backend API
- Keep `.env` file out of version control
- Use API key middleware for write operations
- Validate data before database operations

❌ **DON'T:**
- Expose `SUPABASE_SECRET_KEY` in frontend code
- Commit secrets to GitHub
- Bypass validation middleware
- Share production keys with students

---

## 🔄 **Resetting the Database**

If you need to start fresh or fix a corrupted database:

1. Go to **SQL Editor** in Supabase dashboard
2. Run the `supabase/supabase_setup.sql` script again
3. The script will:
   - **DROP** all existing tables (if they exist)
   - **CREATE** fresh tables with latest schema
   - **ENABLE** RLS on all tables
   - **CREATE** security policies

**Warning:** This will delete ALL existing data! Export any important data first.

---

## 🧪 **Testing Your Setup**

### **1. Test Connection**

```bash
# Start the backend server
npm start
```

Expected output:
```
🚀 FRC Scouting API running on port 3000
📊 Dashboard available at http://localhost:3000
✅ Supabase connection successful
```

### **2. Test Database Operations**

Open the dashboard at `http://localhost:3000` and verify:

- **System Info** shows all database stats
- **Server Activity Log** shows Supabase queries (blue)
- **Teams** tab loads without errors

### **3. Test API Endpoints**

```bash
# Test team creation (requires API key)
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "team_number": 589,
    "team_name": "Falkon Robotics",
    "regional": "Orange County"
  }'

# Test team query (public read)
curl http://localhost:3000/api/teams
```

### **4. Test TBA Integration**

```bash
# Import team data from TBA
curl -X POST http://localhost:3000/api/tba/import-team \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"teamNumber": 589}'
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

**"relation does not exist"**
- **Cause:** Tables not created yet
- **Fix:** Run `supabase/supabase_setup.sql` in SQL Editor

**"permission denied for table"**
- **Cause:** RLS policies not set up correctly
- **Fix:** Re-run setup script to create policies

**"new row violates row-level security policy"**
- **Cause:** Backend not using service role key
- **Fix:** Verify `SUPABASE_SECRET_KEY` in `.env` file

**"connection timeout"**
- **Cause:** Wrong Supabase URL or credentials
- **Fix:** Check `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env`

### **Verification Checklist**

- [ ] All 16 tables visible in Table Editor
- [ ] Each table has RLS enabled (shield icon)
- [ ] Each table has 2 policies (read/write)
- [ ] Backend server connects successfully
- [ ] Dashboard loads without errors
- [ ] Can create teams via API (with API key)
- [ ] Can read teams without API key

---

## 🎓 **For Students: Learning Opportunities**

### **Database Concepts**

- **Relational database design** - Primary keys, foreign keys, relationships
- **JSONB data type** - Flexible, game-specific data storage
- **Row Level Security (RLS)** - Database-level access control
- **Database migrations** - Schema versioning and updates
- **Indexes** - Performance optimization for queries

### **SQL Skills**

- **DDL (Data Definition)** - CREATE TABLE, ALTER TABLE, DROP TABLE
- **Constraints** - PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL
- **Security policies** - Row level security implementation
- **Data types** - TEXT, INTEGER, TIMESTAMP, JSONB, UUID

### **Backend Integration**

- **Environment variables** - Secure credential management
- **API authentication** - Service role vs public access
- **Query patterns** - SELECT, INSERT, UPDATE, DELETE
- **Error handling** - Database connection and query errors

---

## 📚 **Additional Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [The Blue Alliance API Docs](https://www.thebluealliance.com/apidocs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🚀 **Next Steps**

After completing database setup:

1. **Configure TBA integration** - Set `TBA_AUTH_KEY` in `.env`
2. **Import team data** - Use TBA Import tab in dashboard
3. **Create scouting forms** - Mobile app or web interface
4. **Start scouting** - Record match data at competitions
5. **Analyze data** - Use dashboard statistics and reports

---

This setup provides a **production-ready**, **secure**, and **scalable** database foundation for your FRC scouting system! 🏆
