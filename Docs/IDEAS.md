# Future Development Ideas

This document tracks potential features and enhancements for the FRC Team 589 Scouting Application.

---

## 🔄 Real-time Competition Synchronization

**Priority:** Medium
**Difficulty:** Low (infrastructure already tested)
**Requires:** Upgraded Supabase subscription with Realtime enabled

### Description

Currently, when an admin changes the active competition, connected apps update via 30-second polling. Real-time synchronization would provide instant updates across all devices.

### Benefits

- **Instant sync:** Competition changes appear on all devices within 1 second (vs. current 30 seconds)
- **Better UX:** No delay when admin switches competitions during events
- **Reduced confusion:** All team members see the same competition simultaneously
- **Lower bandwidth:** Event-driven updates more efficient than periodic polling

### Technical Details

The infrastructure for real-time sync was built and tested but removed because it requires:
- Supabase Realtime replication (requires paid subscription)
- ~$25/month for Pro plan or ~$599/month for Team plan

**Implementation notes:**
- Code framework already exists in git history (commit before removal)
- Uses Supabase Realtime with PostgreSQL change notifications
- WebSocket-based event system with DeviceEventEmitter
- Graceful fallback to polling if real-time unavailable
- Successfully tested subscription establishment (status: SUBSCRIBED)

### Implementation Estimate

**Time:** 1-2 hours (restore removed code, verify functionality)
**Cost:** Supabase subscription upgrade

### Files Affected (when implemented)

- `Frontend_2025_Scouting/data/competitionManager.ts` - Add real-time subscription
- `Frontend_2025_Scouting/contexts/CompetitionContext.tsx` - Event handling
- Documentation for Supabase Realtime setup

### References

- Supabase Realtime docs: https://supabase.com/docs/guides/realtime
- Supabase Pricing: https://supabase.com/pricing
- Git history: Check commits before real-time removal for implementation code

---

## 📋 Scout Assignment Messaging System

**Priority:** Medium
**Difficulty:** Medium
**Requires:** Supabase Realtime subscription (see above)

### Description

Implement a real-time assignment system using Supabase to distribute scouting tasks from the backend coordinator to mobile scouts.

### Benefits

- Eliminates confusion about who is scouting which team
- Coordinator has real-time visibility into coverage gaps
- Scouts receive updates anywhere with internet connectivity
- Persistent assignments (visible even after app restart)
- Works over-the-air during competitions (not just on local network)

### Technical Details

**Implementation approach:**
- Create `scout_assignments` table in Supabase
- Backend coordinator can assign specific scouts to specific teams/matches
- Frontend apps receive assignments via Supabase real-time subscriptions
- Scouts can accept/acknowledge assignments so coordinator knows coverage status

**Database schema example:**
```sql
CREATE TABLE scout_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scout_id UUID REFERENCES auth.users(id),
  match_number INTEGER,
  team_number INTEGER,
  assignment_type TEXT, -- 'pit', 'match', 'alliance_selection'
  status TEXT DEFAULT 'assigned', -- 'assigned', 'acknowledged', 'completed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Implementation Estimate

**Time:** 8-12 hours
- Database schema creation: 1 hour
- Backend coordinator UI: 3-4 hours
- Frontend assignment display: 2-3 hours
- Real-time subscription logic: 2-3 hours
- Testing: 1-2 hours

**Cost:** Requires Supabase Realtime subscription (see Real-time Competition Synchronization)

### Files Affected

- New table migration in `supabase_setup/`
- New admin page: `Frontend_2025_Scouting/app/(login)/(admin)/scout-assignments.tsx`
- Frontend component: `Frontend_2025_Scouting/components/ScoutAssignments.tsx`
- Data service: `Frontend_2025_Scouting/data/scoutAssignmentService.ts`

---

## 📝 Separate Report Types into Independent Submissions

**Priority:** High
**Difficulty:** Medium-High
**Requires:** Database schema changes, frontend workflow redesign

### Description

Currently the frontend workflow requires scouts to complete pit reports, autonomous reports, and teleoperated reports serially before submission. This creates bottlenecks and data loss if a scout can't complete all sections.

### Benefits

- Scouts can specialize (one does pits, others do matches)
- Partial data is better than no data if a scout has to leave
- Faster data entry - submit each section as soon as it's complete
- Reduces memory pressure on mobile devices (smaller forms)
- Better workflow for multi-scout teams covering different phases

### Technical Details

**Proposed changes:**
- Separate pit scouting into its own independent workflow and submission (✅ Already done!)
- Allow autonomous phase reports to be submitted independently
- Allow teleoperated phase reports to be submitted independently
- Enable partial data collection (e.g., if scout only catches autonomous phase)

**Database implications:**
- Match reports already support partial data (nullable fields)
- May need to track submission status per phase
- Consider adding `auto_submitted`, `tele_submitted`, `endgame_submitted` flags

### Implementation Estimate

**Time:** 12-16 hours
- Database schema updates: 2 hours
- Redesign match scouting workflow: 4-6 hours
- Update scoring calculations: 2-3 hours
- UI/UX improvements: 3-4 hours
- Testing: 2-3 hours

**Cost:** None (code changes only)

### Files Affected

- `Frontend_2025_Scouting/app/(login)/(regional)/(Scouting)/(MatchScouting)/*.tsx` - All match scouting pages
- `Frontend_2025_Scouting/data/matchDataCache.ts` - Update caching strategy
- `Backend_2025_Scouting/supabase_setup/2 - CREATE_CLEAN_SCHEMA.sql` - Add submission flags
- Database functions for partial score calculation

---

## 🎥 Video Capture Assignment

**Priority:** Low
**Difficulty:** High
**Requires:** Supabase Storage subscription, mobile camera permissions

### Description

Add a dedicated video scouting role where one scout records match videos with associated metadata.

### Benefits

- Visual evidence for alliance selection discussions
- Review controversial calls or unusual strategies
- Training tool for new scouts
- Archive for end-of-season analysis
- Helps verify scouting data accuracy

### Technical Details

**Features:**
- Simplified frontend workflow specifically for video scout
- Quick metadata entry: event, match number, teams (red/blue alliance)
- Video capture integrated into app
- Videos uploaded to Supabase storage or external service
- Backend can link videos to match data for review

**Implementation considerations:**
- Video file size management (compression, resolution options)
- Storage limits and costs
- Offline capture with delayed upload when network available
- Optional: Mark key moments with timestamps during recording

### Implementation Estimate

**Time:** 20-30 hours
- Video capture UI: 4-6 hours
- Storage integration: 3-4 hours
- Upload queue system: 4-5 hours
- Video playback interface: 3-4 hours
- Compression/optimization: 3-4 hours
- Metadata linking: 2-3 hours
- Testing: 3-4 hours

**Cost:**
- Supabase Storage: $0.021/GB stored, $0.09/GB transferred
- Estimated: ~$10-50/season depending on video quality and quantity

### Files Affected

- New video scouting workflow: `Frontend_2025_Scouting/app/(login)/(regional)/(Scouting)/VideoScouting.tsx`
- Storage service: `Frontend_2025_Scouting/data/videoStorageService.ts`
- Database table for video metadata
- Admin video review page

---

## 📊 Advanced Analytics Dashboard

**Priority:** Low
**Difficulty:** Medium
**Requires:** Data visualization libraries

### Description

Create comprehensive analytics and visualization tools for strategic decision-making during competitions.

### Potential Features

- Team comparison charts (radar plots, bar charts)
- Trend analysis across matches
- Predictive scoring based on historical performance
- Alliance strength calculator
- Heat maps for field positioning
- Export reports to PDF for strategy meetings

### Benefits

- Data-driven alliance selection
- Identify opponent weaknesses and strengths
- Track team improvement over season
- Professional presentation materials for strategy sessions

### Implementation Estimate

**Time:** 30-40 hours (extensive feature set)
**Cost:** None (use free charting libraries)

### References

- React Native Chart Kit: https://www.npmjs.com/package/react-native-chart-kit
- Victory Native: https://formidable.com/open-source/victory/docs/native/

---

## 🔔 Push Notifications

**Priority:** Low
**Difficulty:** Medium
**Requires:** Push notification service (Firebase, OneSignal, or Expo Notifications)

### Description

Send push notifications to scouts for important updates, reminders, and assignments.

### Use Cases

- "Match 42 starting in 5 minutes - scout assigned to Team 589"
- "Competition changed to 'Regional Finals' - please sync data"
- "New scout assignment: Pit scout Team 254"
- "Data submission failed - retry needed"
- "Low battery warning - charge before next match"

### Benefits

- Proactive communication
- Reduce missed assignments
- Alert scouts to urgent situations
- Better coordination during busy competitions

### Implementation Estimate

**Time:** 8-12 hours
**Cost:** Free tier available on most services

---

## 🌐 Offline-First Architecture Enhancement

**Priority:** Medium
**Difficulty:** High
**Requires:** Local database (SQLite), sync engine

### Description

Enhance offline capabilities to enable full app functionality without internet, with automatic sync when connection restored.

### Current State

- Upload queue for failed submissions ✅
- Basic offline data viewing ✅
- Competition data cached ✅

### Proposed Enhancements

- Local SQLite database for all data
- Full CRUD operations offline
- Conflict resolution when syncing
- Offline leaderboard calculations
- Download competition data for offline use

### Benefits

- Works in areas with poor connectivity (common at competition venues)
- Faster app performance (local queries)
- No data loss during network outages
- Reduced server costs (fewer API calls)

### Implementation Estimate

**Time:** 40-60 hours (major architecture change)
**Cost:** None (SQLite included with React Native)

---

## Template for New Ideas

**Priority:** High / Medium / Low
**Difficulty:** High / Medium / Low
**Requires:** List dependencies, subscriptions, hardware, etc.

### Description

Brief description of the feature or enhancement.

### Benefits

- Bullet points of key benefits
- How it improves the user experience
- What problems it solves

### Technical Details

Technical implementation notes, requirements, constraints.

### Implementation Estimate

**Time:** Estimated development time
**Cost:** Any costs involved (subscriptions, hardware, etc.)

### Files Affected

- List of files that would need changes

### References

- Links to documentation, related issues, etc.

---

## Contributing Ideas

To add new ideas to this document:

1. Use the template above
2. Add a descriptive heading with an emoji
3. Be specific about benefits and technical requirements
4. Include realistic time and cost estimates
5. Reference related features or dependencies

---

**Last Updated:** 2025-11-09
**Maintainer:** FRC Team 589 Development Team
