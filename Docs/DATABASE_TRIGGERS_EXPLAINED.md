# Supabase Database Triggers - How They Work

## Overview

Your FRC Scouting App uses **two types of triggers** in Supabase:

1. **Database Triggers** (PostgreSQL) - Server-side automation
2. **Realtime Subscriptions** (Supabase Realtime) - Client-side live updates

These are **completely different** systems that work together to keep data synchronized.

---

## 1. Database Triggers (PostgreSQL)

### What They Are
PostgreSQL triggers are **server-side** database functions that automatically run when data changes. They execute **inside the database** before or after INSERT/UPDATE/DELETE operations.

### Current Database Triggers in Your Schema

#### A. `trigger_auto_recalculate_stats`
**Location**: Attached to `match_reports` table
**Purpose**: Automatically recalculates `robot_stats` whenever match data changes
**Type**: AFTER INSERT OR UPDATE OR DELETE trigger

**How it works:**
```sql
CREATE TRIGGER trigger_auto_recalculate_stats
    AFTER INSERT OR UPDATE OR DELETE ON match_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_stats();
```

**Flow:**
1. Scout submits a match report → INSERT into `match_reports`
2. Trigger fires **automatically in the database**
3. Calls `trigger_recalculate_stats()` function
4. Function calls `recalculate_team_stats(team_number, regional)`
5. `recalculate_team_stats()` queries all matches for that team
6. Calculates averages (avg_l1, avg_l2, avg_coral, etc.)
7. UPSERTs the results into `robot_stats` table
8. Done! The leaderboard view (`robots_complete`) now shows updated stats

**Why it's useful:**
- Stats are **always up to date** - no manual recalculation needed
- Happens **automatically** when data changes
- Works even if multiple scouts submit simultaneously
- **Free** - included in all Supabase plans (it's just PostgreSQL)

**Code:**
```typescript
// Frontend just submits the match data:
await supabaseService.submitCompleteMatch(matchData);

// The trigger automatically:
// 1. Inserts into match_reports
// 2. Triggers recalculate_team_stats()
// 3. Updates robot_stats
// ✨ No extra frontend code needed!
```

#### B. `app_metadata_updated_at_trigger`
**Location**: Attached to `app_metadata` table
**Purpose**: Automatically updates `updated_at` timestamp when metadata changes
**Type**: BEFORE UPDATE trigger

**How it works:**
```sql
CREATE TRIGGER app_metadata_updated_at_trigger
    BEFORE UPDATE ON app_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_app_metadata_updated_at();
```

**What it does:**
- Whenever `app_metadata` row is updated (e.g., changing active competition)
- Automatically sets `updated_at = NOW()` before saving
- Ensures timestamp is always current

**Is it used?**
- **YES**, but **NOT for realtime subscriptions**
- It just maintains the `updated_at` field
- The frontend polls `app_metadata` table periodically via `CompetitionManager`
- **Does NOT require** Supabase Realtime subscription

---

## 2. Supabase Realtime Subscriptions (Client-Side)

### What They Are
Supabase Realtime allows frontend clients to **subscribe to database changes** and receive live updates. This is **separate** from database triggers.

### How Realtime Works

**Server Side (Supabase):**
1. Supabase listens to PostgreSQL's **Write-Ahead Log (WAL)**
2. When data changes in a table, PostgreSQL writes to WAL
3. Supabase Realtime reads the WAL
4. Broadcasts changes to all subscribed clients via WebSocket

**Client Side (Your Frontend):**
1. Create a subscription channel
2. Listen for `postgres_changes` events
3. React to changes (refetch data, update UI, etc.)

### Current Realtime Subscriptions in Your App

#### A. `useRealtimeMatches` Hook
**File**: `hooks/useRealtimeMatches.ts`
**Purpose**: Live updates when match data changes for a specific team

**Code:**
```typescript
const channel = supabase
  .channel(`matches-${regional}-${teamNum}`)
  .on(
    'postgres_changes',
    {
      event: '*',                    // Listen to INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'match_reports',        // Watch the match_reports table
      filter: `regional=eq.${regional} AND team_number=eq.${teamNum}`
    },
    (payload) => {
      console.log('✨ Real-time: Match updated:', payload);
      fetchMatches();  // Refetch data when change detected
    }
  )
  .subscribe();
```

**What it does:**
- Watches `match_reports` table for a specific team/regional
- When **ANY** scout submits/updates a match for that team
- **Immediately** notifies all clients viewing that team
- Clients refetch data and update the UI

**Example:**
- Scout A is viewing Team 589's match data
- Scout B submits a new match for Team 589
- Scout A's screen **instantly** shows the new match (via realtime)

#### B. `useRealtimeRobots` Hook
**File**: `hooks/useRealtimeRobots.ts`
**Purpose**: Live leaderboard updates when ANY team's data changes

**Code:**
```typescript
const channel = supabase
  .channel(`robots-${regional}`)
  .on('postgres_changes', { table: 'match_reports', ... })
  .on('postgres_changes', { table: 'pit_reports', ... })
  .on('postgres_changes', { table: 'robot_stats', ... })
  .subscribe();
```

**What it does:**
- Watches **3 tables**: `match_reports`, `pit_reports`, `robot_stats`
- When ANY data changes in these tables
- Refetches the leaderboard (`robots_complete` view)
- Updates the leaderboard display

**Example:**
- Scout A is viewing the leaderboard
- Scout B submits a match for Team 254
- Database trigger updates `robot_stats` automatically
- Realtime detects the `robot_stats` change
- Scout A's leaderboard **instantly** refreshes with new rankings

---

## How They Work Together

### Example: Scout Submits a Match Report

**Step-by-step flow:**

1. **Frontend**: Scout clicks "Submit" on match scouting
   ```typescript
   await supabaseService.submitCompleteMatch(matchData);
   ```

2. **Database**: INSERT happens in `match_reports` table
   ```sql
   INSERT INTO match_reports (team_number, match_number, ...) VALUES (...);
   ```

3. **Database Trigger**: `trigger_auto_recalculate_stats` fires IMMEDIATELY
   ```sql
   -- Automatically runs:
   PERFORM recalculate_team_stats(589, 'tc');
   ```

4. **Database Function**: Calculates new averages and updates `robot_stats`
   ```sql
   UPDATE robot_stats
   SET avg_l1 = 2.5, avg_coral = 10.2, rank_value = 3, ...
   WHERE team_number = 589 AND regional = 'tc';
   ```

5. **Supabase Realtime**: Detects changes via PostgreSQL WAL
   - Sees INSERT in `match_reports`
   - Sees UPDATE in `robot_stats`

6. **Frontend Subscriptions**: Receive notifications
   - `useRealtimeMatches` detects match_reports change → refetches team matches
   - `useRealtimeRobots` detects robot_stats change → refetches leaderboard

7. **UI Updates**: All connected clients see fresh data **instantly**

**Key Point**: The database trigger (`trigger_auto_recalculate_stats`) runs **before** realtime notifications are sent. This ensures clients always get the **most current** calculated stats.

---

## Subscription Pricing Confusion

### Your Question: "I thought realtime triggers required an upgraded subscription?"

**Answer**: You're mixing up two different things:

#### 1. Database Triggers (PostgreSQL) - **FREE**
- These are just SQL triggers in PostgreSQL
- Included in **ALL** Supabase plans (even free tier)
- Run on the database server
- Examples: `trigger_auto_recalculate_stats`, `app_metadata_updated_at_trigger`

#### 2. Realtime Subscriptions (Supabase Realtime) - **PAID FEATURE**

**Free Tier Limitations:**
- ✅ **Included**: Up to 200 concurrent realtime connections
- ✅ **Included**: 2GB/month realtime bandwidth
- ✅ **Included**: Basic realtime features

**Paid Tiers Add:**
- More concurrent connections (500+ on Pro, unlimited on Enterprise)
- More bandwidth
- Dedicated resources
- **Advanced features** like:
  - **Presence** (who's online)
  - **Broadcast** (client-to-client messages)
  - Row-level security on realtime

**What You're Currently Using:**
- ✅ Database triggers (`trigger_auto_recalculate_stats`) - **FREE**
- ✅ Basic Realtime (`postgres_changes` subscriptions) - **FREE** (within limits)
- ❌ NOT using advanced realtime features

**Your Current Setup is FREE** as long as you stay under:
- 200 concurrent connections (plenty for a scouting team)
- 2GB/month realtime bandwidth (plenty for occasional updates)

---

## app_metadata_updated_at_trigger Specifics

### Is It Actually Used for Realtime?

**NO** - Let me explain:

#### What it DOES:
```sql
CREATE TRIGGER app_metadata_updated_at_trigger
    BEFORE UPDATE ON app_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_app_metadata_updated_at();
```

This just updates the `updated_at` timestamp field. That's it. It's a **convenience trigger** to keep timestamps current.

#### How Frontend Gets Competition Changes:

**File**: `data/competitionManager.ts`

```typescript
// Polls app_metadata every 30 seconds
private async poll() {
  const { data } = await supabase
    .from('app_metadata')
    .select('active_competition')
    .eq('id', 1)
    .single();

  // Emits event if competition changed
  if (data.active_competition !== this.state.activeCompetition) {
    this.updateState({ activeCompetition: data.active_competition });
  }
}
```

**Key Points:**
- Uses **polling** (checking every 30 seconds), NOT realtime subscriptions
- The `updated_at` trigger just maintains the timestamp
- No realtime subscription to `app_metadata` table
- **Reason**: Competition changes are rare (maybe once per event), so polling is fine

**Could you use realtime?** Yes, but it's overkill for data that changes once per day.

---

## Summary

### Database Triggers vs Realtime Subscriptions

| Feature | Database Triggers | Realtime Subscriptions |
|---------|------------------|----------------------|
| **Where it runs** | Database server | Client (browser/app) |
| **What it does** | Auto-update related tables | Notify clients of changes |
| **Technology** | PostgreSQL triggers | WebSocket + WAL |
| **Cost** | Free (part of PostgreSQL) | Free tier: 200 connections |
| **Your usage** | ✅ `trigger_auto_recalculate_stats` | ✅ `useRealtimeMatches` |
|  | ✅ `app_metadata_updated_at_trigger` | ✅ `useRealtimeRobots` |
| **Purpose** | Keep `robot_stats` updated | Keep UI updated |

### Current Active Triggers

1. **`trigger_auto_recalculate_stats`** on `match_reports`
   - Keeps `robot_stats` current when matches are added/updated
   - **Essential** - DO NOT REMOVE

2. **`app_metadata_updated_at_trigger`** on `app_metadata`
   - Maintains `updated_at` timestamp
   - **Not critical** - Could be removed if you always manually set timestamps
   - **Not used for realtime** - Frontend polls instead

### Recommendations

✅ **Keep**: `trigger_auto_recalculate_stats` - Critical for stats calculation
⚠️ **Optional**: `app_metadata_updated_at_trigger` - Nice to have, not essential
✅ **Keep**: Realtime subscriptions (`useRealtimeMatches`, `useRealtimeRobots`) - Great UX

**You're well within free tier limits!** Your current setup is efficient and doesn't require a paid plan.
