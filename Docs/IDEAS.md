# Application Enhancement Ideas

This document contains ideas for future improvements to the FRC Team 589 Scouting Application.

## 1. Scout Assignment Messaging System

Implement a real-time assignment system using Supabase to distribute scouting tasks from the backend coordinator to mobile scouts.

**Implementation approach:**
- Create `scout_assignments` table in Supabase
- Backend coordinator can assign specific scouts to specific teams/matches
- Frontend apps receive assignments via Supabase real-time subscriptions
- Scouts can accept/acknowledge assignments so coordinator knows coverage status
- Works over-the-air during competitions (not just on local network)

**Benefits:**
- Eliminates confusion about who is scouting which team
- Coordinator has real-time visibility into coverage gaps
- Scouts receive updates anywhere with internet connectivity
- Persistent assignments (visible even after app restart)

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

## 2. Separate Report Types into Independent Submissions

Currently the frontend workflow requires scouts to complete pit reports, autonomous reports, and teleoperated reports serially before submission. This creates bottlenecks and data loss if a scout can't complete all sections.

**Proposed changes:**
- Separate pit scouting into its own independent workflow and submission
- Allow autonomous phase reports to be submitted independently
- Allow teleoperated phase reports to be submitted independently
- Enable partial data collection (e.g., if scout only catches autonomous phase)

**Benefits:**
- Scouts can specialize (one does pits, others do matches)
- Partial data is better than no data if a scout has to leave
- Faster data entry - submit each section as soon as it's complete
- Reduces memory pressure on mobile devices (smaller forms)
- Better workflow for multi-scout teams covering different phases

## 3. Video Capture Assignment

Add a dedicated video scouting role where one scout records match videos with associated metadata.

**Features:**
- Simplified frontend workflow specifically for video scout
- Quick metadata entry: event, match number, teams (red/blue alliance)
- Video capture integrated into app
- Videos uploaded to Supabase storage or external service
- Backend can link videos to match data for review

**Benefits:**
- Visual evidence for alliance selection discussions
- Review controversial calls or unusual strategies
- Training tool for new scouts
- Archive for end-of-season analysis
- Helps verify scouting data accuracy

**Implementation considerations:**
- Video file size management (compression, resolution options)
- Storage limits and costs
- Offline capture with delayed upload when network available
- Optional: Mark key moments with timestamps during recording
