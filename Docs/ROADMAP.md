# FRC Team 589 Scouting App Development Roadmap

**Last Updated:** October 30, 2025
**Team Size:** ~6 high school students
**Current Status:** 70% complete functional prototype

---

## Executive Summary

### Near-Term Goal (4 Sessions × 2.5 Hours)
Complete a **working, testable prototype** with real-time updates and offline resilience. Focus on understanding the application architecture to enable rapid refactoring for the 2026 game.

### Long-Term Goal (January 2026 + 4 Weeks)
When the 2026 FRC game is announced, quickly refactor the app to match new game mechanics and deploy for competition use.

---

## Table of Contents
1. [Team Structure](#team-structure)
2. [Near-Term Development (Sessions 1-4)](#near-term-development-sessions-1-4)
3. [Long-Term Refactoring Plan](#long-term-refactoring-plan-january-2026)
4. [Success Metrics](#success-metrics)
5. [Risk Management](#risk-management)

---

## Team Structure

The development team is organized into **three parallel workstreams** to maximize productivity and learning:

### 1. Backend Development Team (2 students)

**Primary Responsibilities:**
- Database schema design and migration
- Express.js API development and maintenance
- The Blue Alliance (TBA) API integration
- Backend testing and validation
- API documentation (Swagger)

**Key Skills to Develop:**
- SQL and database design
- RESTful API principles
- Node.js/Express.js
- External API integration
- Server-side validation

**Lead:** Database/Backend Lead

---

### 2. Frontend Development Team (2 students)

**Primary Responsibilities:**
- React Native component development
- Mobile UI/UX implementation
- Real-time data integration with Supabase
- Offline queue implementation
- Frontend testing (Jest, React Testing Library)

**Key Skills to Develop:**
- React Native and Expo
- TypeScript
- State management with React hooks
- Mobile app architecture
- Responsive design

**Lead:** Frontend Leads

---

### 3. Scouting Strategy Team (2 students)

**Primary Responsibilities:**
- Define what data to collect (match and pit scouting)
- Design scouting workflows and UI mockups
- Create training materials for scouts
- Test end-to-end scouting flows
- Gather feedback from team members
- Define statistics that matter for alliance selection

**Key Skills to Develop:**
- FRC game analysis and strategy
- User experience design
- Technical writing and documentation
- Quality assurance and testing
- Communication and training

**Lead:** Testing/DevOps Lead + rotates

---

### Cross-Team Coordination

**All Teams Together:**
- Session kickoff and planning (15 min)
- Integration and end-to-end testing (30-60 min per session)
- Code reviews and knowledge sharing
- Session retrospectives

**Communication:**
- **Daily async standups** in Discord/Slack
- **Shared documentation** in Google Docs and GitHub
- **Code reviews** required before merge
- **Weekly sync** to ensure alignment

**Knowledge Sharing:**
- Rotate students between teams every 2 sessions
- Pair programming across teams for complex features
- Documented architecture for all to understand

---

## Near-Term Development (Sessions 1-4)

### Session 1: Real-Time Integration & Testing Foundation (2.5 hours)

**Session Goals:**
- Integrate real-time Supabase subscriptions into UI
- Set up comprehensive testing infrastructure
- Define what data scouts should collect and why

---

#### **Backend Team** (2 students) - 2 hours

**Focus:** Real-time database subscriptions and testing

**Tasks:**
1. **Study Supabase Real-Time System** (30 min)
   - Review `hooks/useRealtimeRobots.ts` and `hooks/useRealtimeMatches.ts`
   - Understand Supabase subscriptions architecture
   - Test subscriptions in Supabase dashboard
   - Verify real-time replication is enabled on all tables

2. **Backend API Testing** (60 min)
   - Create `Backend_2025_Scouting/__tests__/` directory
   - Write tests for match routes (pregame, auto, tele, post)
   - Test TBA integration endpoints (even if not fully implemented)
   - Test error handling and validation
   - Document test patterns

3. **Database Trigger Testing** (30 min)
   - Manually insert algae/coral data in Supabase
   - Verify `robot_stats` updates automatically
   - Test edge cases (zero scores, negative numbers blocked)
   - Document trigger behavior

**Deliverables:**
- ✅ Understanding of real-time subscription architecture
- ✅ Backend API test suite (basic coverage)
- ✅ Database triggers verified and documented

---

#### **Frontend Team** (2 students) - 2 hours

**Focus:** Integrate real-time hooks into UI components

**Tasks:**
1. **Real-Time Leaderboard Integration** (60 min)
   - File: `app/(login)/(regional)/(TeamInfo)/Leaderboard.tsx`
   - Replace manual fetch with `useRealtimeRobots` hook:
     ```typescript
     // BEFORE
     const sortedRobots = await robotApiService.getSortedRobots(...);

     // AFTER
     const { robots, loading, error, refetch } = useRealtimeRobots(regional);
     ```
   - Add loading states and error handling
   - Test with multiple browser tabs simulating scouts
   - Add visual indicator for live updates ("Live • Updated 2s ago")

2. **Team Detail Real-Time Updates** (45 min)
   - File: `app/(login)/(regional)/(TeamInfo)/(tabs)/MatchData.tsx`
   - Integrate `useRealtimeMatches` hook
   - Add live update indicators
   - Test by submitting match data in another window

3. **Frontend Component Testing** (15 min)
   - Create `components/__tests__/RobotLeaderboard.test.tsx`
   - Test rendering with mock data
   - Test sorting functionality
   - Document testing patterns

**Deliverables:**
- ✅ Real-time leaderboard that auto-updates
- ✅ Real-time team detail views
- ✅ Frontend component tests started

---

#### **Scouting Strategy Team** (2 students) - 2 hours

**Focus:** Define scouting data requirements and test workflows

**Tasks:**
1. **Review 2025 Reefscape Game Rules** (30 min)
   - Study game manual and scoring rules
   - Identify critical data points for alliance selection:
     - What makes a good autonomous robot?
     - What scoring capabilities matter most?
     - How important is climbing vs scoring?
   - Document assumptions and strategy priorities

2. **Create Scouting Data Dictionary** (45 min)
   - Document in `docs/SCOUTING_DATA_GUIDE.md`:
     - **Match Data Fields:** What each field means and why it matters
     - **Pit Scouting Fields:** What capabilities to assess
     - **Statistics:** Which calculated stats are most useful
     - **Prioritization:** What data is "must-have" vs "nice-to-have"
   - Include examples and edge cases

3. **End-to-End Scouting Flow Testing** (45 min)
   - Both students scout 3-5 mock matches on devices
   - Use demo mode or real database
   - Test complete flow: Pregame → Auto → Tele → Post
   - Document pain points, confusing UI, timing issues
   - Create list of UX improvements needed

**Deliverables:**
- ✅ Scouting data dictionary document
- ✅ Strategy priorities defined
- ✅ UX issues identified and documented

---

#### **All Teams Together:** Integration & Review (30 min)

**Tasks:**
1. **Team Demonstrations** (15 min)
   - Backend: Demo real-time subscriptions and show test results
   - Frontend: Demo auto-updating leaderboard
   - Strategy: Present data dictionary and UX findings

2. **Integration Testing** (10 min)
   - All 6 students submit match data simultaneously
   - Verify leaderboard updates automatically across devices
   - Test statistics calculations

3. **Session Retrospective** (5 min)
   - What did we learn?
   - What blockers exist?
   - Adjustments for next session?

**Session Deliverables:**
- ✅ Real-time features integrated and working
- ✅ Testing infrastructure established (backend and frontend)
- ✅ Data requirements documented
- ✅ UX improvement backlog created

---

### Session 2: Offline Queue & Error Resilience (2.5 hours)

**Session Goals:**
- Implement offline data queueing for poor WiFi conditions
- Enhance error handling across the stack
- Test competition-like stress scenarios

---

#### **Backend Team** (2 students) - 2 hours

**Focus:** Backend error handling and validation

**Tasks:**
1. **Enhanced Backend Error Responses** (45 min)
   - Update all routes to return structured error responses:
     ```javascript
     res.status(400).json({
       error: true,
       message: "User-friendly message",
       code: "VALIDATION_ERROR",
       details: validationErrors
     });
     ```
   - Add error codes for different scenarios
   - Update Swagger documentation with error examples

2. **Input Validation Hardening** (45 min)
   - Review all Joi validation schemas
   - Add edge case validation (negative scores, future timestamps)
   - Test with invalid data payloads
   - Document validation rules in API comments

3. **Backend Monitoring Utilities** (30 min)
   - Create `src/utils/monitoring.js`
   - Log all errors with context (timestamp, request data, user info)
   - Track API endpoint performance (response times)
   - Document monitoring approach

**Deliverables:**
- ✅ Structured error responses across all endpoints
- ✅ Comprehensive input validation
- ✅ Backend monitoring utilities

---

#### **Frontend Team** (2 students) - 2 hours

**Focus:** Offline queue implementation

**Tasks:**
1. **Offline Queue System** (75 min)
   - Create `data/offlineQueue.tsx`
   - Design queue structure:
     ```typescript
     interface QueuedRequest {
       id: string;
       timestamp: number;
       operation: 'pregame' | 'auto' | 'tele' | 'postgame' | 'pit';
       data: any;
       regional: string;
     }
     ```
   - Implement operations:
     - `addToQueue()` - Save to AsyncStorage
     - `getQueue()` - Retrieve pending requests
     - `removeFromQueue()` - Remove after sync
     - `processQueue()` - Sync all pending
   - Add network listener using `@react-native-community/netinfo`

2. **Queue UI Integration** (30 min)
   - Add queue status indicator to match scouting screens
   - Show "X items queued" badge
   - Visual feedback when syncing
   - Update `data/processing.tsx` to use queue on network errors

3. **Offline Testing** (15 min)
   - Turn off WiFi and submit data
   - Verify queue storage in AsyncStorage
   - Turn on WiFi and verify auto-sync
   - Test with multiple queued items

**Deliverables:**
- ✅ Offline queue system fully functional
- ✅ Network status monitoring and auto-sync
- ✅ Queue UI indicators

---

#### **Scouting Strategy Team** (2 students) - 2 hours

**Focus:** Competition stress testing and scout training materials

**Tasks:**
1. **Create Scout Training Guide** (60 min)
   - Document in `docs/SCOUT_TRAINING_GUIDE.md`:
     - **Quick Start:** How to scout a match in 2 minutes
     - **Autonomous Phase:** What to watch for and how to track
     - **Teleop Phase:** Scoring patterns to observe
     - **Post-Match:** How to rate drivers objectively
     - **Common Mistakes:** What not to do
     - **Troubleshooting:** How to handle app issues
   - Include screenshots and examples

2. **Stress Testing Scenarios** (45 min)
   - Create test scenarios document:
     - **Scenario 1:** Poor WiFi (intermittent connectivity)
     - **Scenario 2:** High volume (all scouts submit at once)
     - **Scenario 3:** Edge cases (0 scores, disabled robot, no-show)
     - **Scenario 4:** Data conflicts (duplicate submissions)
   - Execute each scenario and document results
   - Record bugs and performance issues

3. **Alliance Selection Strategy** (15 min)
   - Draft alliance selection criteria using app data
   - What statistics are most predictive of success?
   - How to use leaderboard for quick decisions?
   - Document in `docs/ALLIANCE_SELECTION_GUIDE.md`

**Deliverables:**
- ✅ Scout training guide created
- ✅ Stress test scenarios executed and documented
- ✅ Alliance selection strategy drafted

---

#### **All Teams Together:** Stress Testing (30 min)

**Tasks:**
1. **Competition Simulation** (20 min)
   - All 6 students scout simultaneously
   - Randomly toggle WiFi on/off during scouting
   - Submit conflicting data to test race conditions
   - Verify queue works correctly
   - Check statistics accuracy under load

2. **Results Review** (10 min)
   - Document any failures or bugs
   - Discuss improvements needed
   - Prioritize fixes for next session

**Session Deliverables:**
- ✅ Offline queue system with auto-sync
- ✅ Enhanced error handling (backend + frontend)
- ✅ Scout training materials
- ✅ Stress test results documented

---

### Session 3: TBA Integration & Game-Agnostic Architecture (2.5 hours)

**Session Goals:**
- Integrate The Blue Alliance API for match schedules
- Identify game-specific vs game-agnostic code
- Prepare for rapid 2026 refactoring

**Pre-Session Prep:**
- **All students:** Register for TBA API key at https://www.thebluealliance.com/account
- **All students:** Review TBA API docs: https://www.thebluealliance.com/apidocs/v3

---

#### **Backend Team** (2 students) - 2 hours

**Focus:** TBA API service layer and backend architecture

**Tasks:**
1. **TBA Service Implementation** (60 min)
   - Create `Backend_2025_Scouting/src/services/tbaService.js`
   - Implement TBA API calls:
     ```javascript
     class TBAService {
       async getEventMatches(eventKey) {
         // GET /event/{event_key}/matches
       }

       async getTeamList(eventKey) {
         // GET /event/{event_key}/teams
       }

       async getEventRankings(eventKey) {
         // GET /event/{event_key}/rankings
       }
     }
     ```
   - Test with 2025 event data (or mock if 2026 not available)
   - Add error handling and fallbacks

2. **Backend Route for TBA Data** (30 min)
   - Create `src/routes/tba.js`
   - Endpoints:
     - `GET /api/tba/matches/:eventKey`
     - `GET /api/tba/teams/:eventKey`
     - `GET /api/tba/rankings/:eventKey`
   - Cache TBA responses (5 min expiry)

3. **Backend Architecture Documentation** (30 min)
   - Review all backend routes and tag game-specific vs generic
   - Create `Backend_2025_Scouting/docs/ARCHITECTURE.md`
   - Document:
     - Which routes change for new games (match data, game pieces)
     - Which routes stay the same (teams, TBA, health)
     - How to rename/refactor for 2026

**Deliverables:**
- ✅ TBA service integrated into backend
- ✅ Backend TBA endpoints functional
- ✅ Backend architecture documented

---

#### **Frontend Team** (2 students) - 2 hours

**Focus:** Frontend TBA integration and UI components

**Tasks:**
1. **Frontend TBA Service** (45 min)
   - Create `data/tbaService.tsx`
   - Implement API wrapper:
     ```typescript
     export class TBAService {
       async getEventMatches(eventKey: string) {
         // Call backend or TBA directly
       }

       parseMatchData(tbaMatch: any): AppMatchFormat {
         // Transform TBA to app format
       }
     }
     ```
   - Add regional-to-event-key mapping

2. **Replace Mock Match Schedule** (45 min)
   - Update `data/processing.tsx`
   - Replace `fetchTeamRemainingMatches()`:
     ```typescript
     export const fetchTeamRemainingMatches = async (teamNum, regional) => {
       try {
         const eventKey = regionalToEventKey(regional);
         const matches = await tbaService.getEventMatches(eventKey);
         return matches.filter(m => isUpcoming(m) && includesTeam(m, teamNum));
       } catch {
         return getMockRemainingMatches(teamNum);
       }
     };
     ```

3. **TBA Integration Testing** (30 min)
   - Create `data/__tests__/tbaService.test.tsx`
   - Mock TBA responses
   - Test data transformation
   - Test fallback to mock data

**Deliverables:**
- ✅ Frontend TBA service layer
- ✅ Live match schedules (with fallback)
- ✅ TBA tests written

---

#### **Scouting Strategy Team** (2 students) - 2 hours

**Focus:** Game-specific vs generic architecture analysis

**Tasks:**
1. **Code Architecture Analysis** (75 min)
   - **Database Review** (25 min):
     - Read `supabase-direct-setup.sql`
     - Identify game-specific elements (algae, coral, climb types)
     - Identify generic elements (teams, match structure, statistics pattern)
     - Tag with comments: `-- GAME-SPECIFIC: 2025 Reefscape`

   - **Frontend Review** (25 min):
     - Review match scouting screens (Auto.tsx, Tele.tsx)
     - Identify game-specific UI (algae/coral buttons, climb options)
     - Identify generic UI (timers, ratings, navigation, layout)
     - Create list in spreadsheet or document

   - **Backend Review** (25 min):
     - Review API routes (`routes/reefscape_matches.js`, `routes/reefscape_stats.js`)
     - Identify game-specific endpoints (algae, coral, climb stats)
     - Identify generic endpoints (match CRUD, team info, health)

2. **Create Refactoring Checklist** (45 min)
   - Document in `docs/REFACTORING_CHECKLIST.md`:
     ```markdown
     # 2026 Game Refactoring Checklist

     ## Database Changes (2-3 hours estimated)
     - [ ] Rename `reefscape_matches` → `{2026game}_matches`
     - [ ] Replace `algae` table → `{game_piece_1}`
     - [ ] Replace `coral` table → `{game_piece_2}`
     - [ ] Update `robot_stats` columns
     - [ ] Modify triggers
     - [ ] Update `robots_complete` view

     ## Frontend Changes (4-6 hours estimated)
     - [ ] Auto.tsx - replace game piece buttons
     - [ ] Tele.tsx - replace game piece buttons
     - [ ] Update endgame options
     - [ ] Modify statistics displays
     - [ ] Update mock data
     - [ ] Update TypeScript interfaces (schema.tsx)

     ## Backend Changes (3-4 hours estimated)
     - [ ] Rename route files
     - [ ] Update table names in queries
     - [ ] Modify validation schemas
     - [ ] Update Swagger docs

     ## Generic (No Changes)
     - ✓ TBA integration
     - ✓ Real-time hooks
     - ✓ Offline queue
     - ✓ Team/regional selection
     - ✓ Pit scouting structure
     - ✓ Leaderboard sorting
     ```
   - Estimate hours for each section
   - Assign preliminary responsibilities

**Deliverables:**
- ✅ Game-specific code identified and tagged
- ✅ Refactoring checklist created with estimates
- ✅ Understanding of what changes vs what stays

---

#### **All Teams Together:** Architecture Review (30 min)

**Tasks:**
1. **Team Presentations** (20 min)
   - Backend: Demo TBA integration, explain backend architecture
   - Frontend: Show live match schedules, explain data flow
   - Strategy: Present refactoring checklist and estimates

2. **Architecture Discussion** (10 min)
   - Are we confident we can refactor in 4 weeks?
   - What's the riskiest part of 2026 refactoring?
   - What should we study before January?

**Session Deliverables:**
- ✅ TBA integration complete (backend and frontend)
- ✅ Live match schedules working
- ✅ Architecture documented and analyzed
- ✅ Refactoring checklist created
- ✅ Team prepared for 2026 game adaptation

---

### Session 4: Final Integration, Documentation & Deployment Prep (2.5 hours)

**Session Goals:**
- Complete end-to-end testing with all features
- Create comprehensive documentation for 2026 refactoring
- Prepare deployment and training materials

---

#### **Backend Team** (2 students) - 2 hours

**Focus:** Backend documentation and deployment preparation

**Tasks:**
1. **API Documentation Completion** (45 min)
   - Update Swagger documentation with all endpoints
   - Add example requests/responses for all routes
   - Document error codes and responses
   - Create Postman collection for testing
   - Export to `Backend_2025_Scouting/docs/API_EXAMPLES.md`

2. **Backend Deployment Guide** (45 min)
   - Document in `Backend_2025_Scouting/docs/DEPLOYMENT.md`:
     - Environment variables required
     - Deployment steps for Render/Railway/Heroku
     - Database connection setup
     - Testing production endpoints
     - Rollback procedures
   - Test deployment to staging environment if available

3. **Code Quality Review** (30 min)
   - Run all backend tests and verify passing
   - Check test coverage (aim for >50% on critical paths)
   - Review and document any technical debt
   - Create GitHub issues for known bugs or improvements

**Deliverables:**
- ✅ Complete API documentation with examples
- ✅ Backend deployment guide created
- ✅ Backend tests passing and documented

---

#### **Frontend Team** (2 students) - 2 hours

**Focus:** Frontend polish and mobile deployment prep

**Tasks:**
1. **UI/UX Polish** (60 min)
   - Review all screens for consistency
   - Ensure loading states are clear
   - Verify error messages are user-friendly
   - Test accessibility (font sizes, contrast, touch targets)
   - Add visual feedback for all user actions
   - Document UX improvements made

2. **Mobile Build Preparation** (45 min)
   - Update `app.json` with correct metadata:
     - App name, version (e.g., 1.0.0-beta)
     - Description, author
     - Icons and splash screen
   - Test build process: `eas build --platform ios --profile preview`
   - Document build steps in `Frontend_2025_Scouting/docs/BUILD_GUIDE.md`
   - Include troubleshooting section

3. **Frontend Testing** (15 min)
   - Run all frontend tests and verify passing
   - Test on both iOS and Android simulators
   - Document any platform-specific issues

**Deliverables:**
- ✅ UI polished and consistent
- ✅ Mobile build process documented and tested
- ✅ Frontend tests passing

---

#### **Scouting Strategy Team** (2 students) - 2 hours

**Focus:** Training materials and competition readiness

**Tasks:**
1. **Scout Quick Reference Guide** (60 min)
   - Create `docs/SCOUT_QUICK_REFERENCE.pdf` (or .md):
     - **Match Scouting Cheat Sheet:**
       - 1-page quick reference for scouting a match
       - What to watch for in auto (15s)
       - What to watch for in teleop (135s)
       - How to rate drivers (1-5 scale guidance)
       - Common mistakes to avoid
     - **Field diagram** with scoring zones labeled
     - **Game piece identification** (algae vs coral)
   - Make it printable and laminated-ready

2. **Competition Day Checklist** (45 min)
   - Create `docs/COMPETITION_CHECKLIST.md`:
     - **Pre-Competition (1 week before):**
       - [ ] Train 10+ scouts on app
       - [ ] Test app with team scrimmage data
       - [ ] Print scout quick reference guides
       - [ ] Charge all devices (tablets, phones)
     - **Competition Day:**
       - [ ] Connect to venue WiFi
       - [ ] Test real-time updates with 2+ devices
       - [ ] Assign scouts to matches
       - [ ] Set up scouting stations
       - [ ] Verify data syncing to leaderboard
     - **Emergency Procedures:**
       - [ ] Backup plan if app crashes
       - [ ] Paper scouting forms ready
       - [ ] Contact info for app support
   - Include timeline (what to do when)

3. **Data Usage Guide** (15 min)
   - Create `docs/USING_SCOUTING_DATA.md`:
     - How to use leaderboard for alliance selection
     - Key statistics to prioritize
     - How to compare teams quickly
     - Red flags to watch for (low match count, high disabled rate)

**Deliverables:**
- ✅ Scout quick reference guide ready to print
- ✅ Competition day checklist created
- ✅ Data usage guide for strategy team

---

#### **All Teams Together:** Final Integration & Planning (30 min)

**Part 1: Final End-to-End Test** (15 min)

**Realistic Competition Simulation:**
1. All 6 students become "scouts"
2. Scout 2-3 matches simultaneously
3. Use a mix of good WiFi and offline mode
4. Submit conflicting data to test edge cases
5. Verify:
   - Data appears in database
   - Statistics calculate correctly
   - Leaderboard updates in real-time
   - Offline queue works and syncs
   - TBA match schedule loads

**Part 2: Team Retrospective** (10 min)

**Discussion Questions:**
- What did we accomplish in 4 sessions?
- What are we most proud of?
- What's still risky or unclear?
- Are we confident we can refactor for 2026?
- What should we study/practice before January?

**Part 3: Next Steps Planning** (5 min)

**Assign Responsibilities:**
- Who will monitor the app if used in a practice event?
- Who will lead each team during 2026 refactoring?
- When is our first session in January (after game reveal)?
- How will we stay in touch during break?

**Session Deliverables:**
- ✅ All documentation complete (API, deployment, training, competition)
- ✅ End-to-end testing passed successfully
- ✅ Team aligned and ready for 2026
- ✅ Roles assigned for refactoring sprint

---

## Near-Term Sessions Summary

**After 4 sessions (10 hours), the team will have:**

✅ **Technical Achievements:**
- Real-time leaderboard with auto-updates
- Offline queue system with auto-sync
- TBA integration for live match schedules
- Test coverage for critical paths
- Polished UI ready for competition

✅ **Documentation Created:**
- Scouting data dictionary
- Scout training guide and quick reference
- Alliance selection strategy
- API documentation with examples
- Backend deployment guide
- Frontend build guide
- Competition day checklist
- Refactoring checklist for 2026

✅ **Skills Developed:**
- Full-stack development (database, backend, frontend)
- Real-time subscriptions and offline-first architecture
- External API integration (TBA)
- Testing and quality assurance
- Technical documentation
- FRC game analysis and strategy

✅ **2026 Readiness:**
- Clear understanding of game-specific vs generic code
- Detailed refactoring checklist with estimates
- Team roles assigned for rapid adaptation
- Confidence to refactor in 4 weeks

---

## Long-Term Refactoring Plan (January 2026)

### Timeline Overview

**Week 0: Game Announcement (Kickoff - Saturday in January)**
- Game revealed: 3-4 hours to understand rules
- Identify game pieces, scoring zones, endgame mechanics
- Map to current app structure

**Weeks 1-2: Database & Backend Refactoring (10-15 hours)**
- Adapt schema to new game mechanics
- Update API endpoints
- Migrate triggers and calculations

**Weeks 2-3: Frontend Refactoring (15-20 hours)**
- Redesign match scouting UI for new game
- Update statistics displays
- Refresh mock data

**Week 4: Testing & Deployment (8-10 hours)**
- Comprehensive testing with mock scouting
- Beta testing with team members
- Deploy to production
- Create user training materials

**Total Effort:** ~40-50 hours over 4 weeks (manageable with 6 students)

---

### Week 0: Game Analysis & Planning (3-4 hours)

**Immediate Actions (Saturday of Kickoff):**

#### Hour 1: Game Rules Analysis
**Who:** Entire team watches game reveal together

**Tasks:**
1. Watch game animation and rule explanation (30 min)
2. Identify scoring elements (20 min)
   - What are the game pieces? (e.g., cones, cubes, frisbees, balls)
   - Where can they be scored? (grids, goals, bins, processors)
   - How many types/levels of scoring?
   - What's the autonomous scoring?
   - What's the endgame mechanism? (climb, balance, park)
3. Take detailed notes on game manual (10 min)

**Deliverable:** Game mechanics document

#### Hour 2: Data Model Design
**Who:** 2-3 students (database-focused)

**Tasks:**
1. Map game pieces to database tables (20 min)
   - Example: If game has "Cubes" and "Cones"
   - Create `cubes` table (similar to `algae`)
   - Create `cones` table (similar to `coral`)
   - Identify what fields are needed (where_scored, level, made, timestamp)
2. Design match data columns (20 min)
   - Autonomous starting position
   - Endgame status (climb_high, climb_low, balance, etc.)
   - Special game mechanics
3. Sketch statistics to calculate (20 min)
   - Avg cubes scored per match
   - Avg cones per level
   - Endgame success rate
   - Whatever is strategic for alliance selection

**Deliverable:** New database schema draft

#### Hour 3: UI Mockups
**Who:** 2-3 students (frontend-focused)

**Tasks:**
1. Sketch match scouting screens on paper/whiteboard (30 min)
   - What buttons for each game piece?
   - How to track scoring zones?
   - Endgame options?
   - Keep timer and flow structure the same
2. Design statistics display (15 min)
   - What metrics to show on leaderboard?
   - What goes in team detail tabs?
3. Plan UI component reuse (15 min)
   - What can we keep from 2025? (timers, navigation, layout)
   - What must be rebuilt? (game piece buttons, scoring counters)

**Deliverable:** UI wireframes

#### Hour 4: Refactoring Sprint Planning
**Who:** Entire team

**Tasks:**
1. Review database schema and UI mockups (15 min)
2. Create detailed task list using `REFACTORING_CHECKLIST.md` (25 min)
   - Assign specific tasks to pairs
   - Estimate effort for each task
   - Identify dependencies (database first, then backend, then frontend)
3. Set up project board (15 min)
   - Use GitHub Projects or Trello
   - Columns: To Do, In Progress, Testing, Done
   - Add all tasks
4. Schedule work sessions for next 4 weeks (5 min)

**Deliverable:** Sprint plan with assignments

---

### Weeks 1-2: Database & Backend Refactoring (10-15 hours)

**Focus:** Data layer first, so frontend has something to connect to

#### Session 1: Database Schema Migration (2.5 hours)

**Pair 1: New Game Piece Tables**
1. Copy `supabase-direct-setup.sql` → `supabase-2026-setup.sql`
2. Rename tables (20 min)
   - `reefscape_matches` → `{2026game}_matches`
   - `algae` → `{game_piece_1}`
   - `coral` → `{game_piece_2}`
3. Update column names based on game mechanics (30 min)
   - Scoring zone fields
   - Endgame mechanism columns
   - Autonomous options
4. Modify `robot_stats` table (20 min)
   - `avg_algae_*` → `avg_{piece1}_*`
   - `avg_l1/l2/l3/l4` → scoring zone averages
5. Test SQL script locally (20 min)
6. Document changes (10 min)

**Pair 2: Triggers & Functions**
1. Update `calculate_robot_stats()` function (40 min)
   - Change table references
   - Update averaging logic for new game pieces
   - Add new statistics calculations
2. Modify triggers (20 min)
   - Rename to match new table names
   - Ensure they fire on correct events
3. Update `robots_complete` view (20 min)
   - Change JOIN table names
   - Update column selections
4. Test trigger execution manually (20 min)
5. Document trigger logic (10 min)

**Pair 3: RLS Policies**
1. Update Row-Level Security policies (30 min)
   - Copy policies to new tables
   - Verify read/write permissions
2. Test with Supabase anon key (15 min)
3. Create test data (30 min)
   - Insert sample teams
   - Insert sample matches with new game pieces
   - Verify statistics calculate correctly
4. Document security model (15 min)

**All Together: Deploy to Supabase (30 min)**
1. Run SQL script in Supabase dashboard (10 min)
2. Verify all tables created (5 min)
3. Test inserts from SQL editor (10 min)
4. Enable real-time replication on new tables (5 min)

**Deliverable:** Production database with 2026 schema

#### Session 2: Backend API Updates (2.5 hours)

**Pair 1: Match Routes**
1. Rename `routes/reefscape_matches.js` → `routes/{2026game}_matches.js` (5 min)
2. Update table names in all queries (30 min)
   ```javascript
   // OLD
   .from('reefscape_matches')
   .from('algae')

   // NEW
   .from('{2026game}_matches')
   .from('{game_piece_1}')
   ```
3. Update validation schemas (30 min)
   - Modify Joi schemas for new data structure
   - Change field names to match 2026 game
4. Update endpoint paths (15 min)
   - `/api/scouting/pregame` - same
   - `/api/scouting/auto` - update data shape
   - `/api/scouting/tele` - update data shape
5. Test endpoints with Postman/curl (30 min)
6. Update API documentation (10 min)

**Pair 2: Statistics Routes**
1. Update `routes/reefscape_stats.js` → `routes/{2026game}_stats.js` (5 min)
2. Modify statistics queries (40 min)
   - Update column names
   - Add new game-specific statistics
   - Endgame stats instead of climb stats
3. Create new endpoints for 2026-specific stats (30 min)
4. Test with sample data (20 min)
5. Document new statistics (15 min)

**Pair 3: Swagger Documentation**
1. Update `src/config/swagger.js` (30 min)
   - Change schema definitions
   - Update example requests/responses
   - Rename tags/sections
2. Update endpoint descriptions (30 min)
3. Test Swagger UI at `/api-docs` (15 min)
4. Create Postman collection for testing (25 min)

**All Together: Integration Testing (30 min)**
1. Test complete flow (20 min)
   - POST pregame data
   - POST auto data with game pieces
   - POST tele data
   - POST postgame
   - GET match data
   - GET statistics
2. Verify triggers worked (5 min)
3. Document any issues (5 min)

**Deliverable:** Backend API adapted for 2026 game

---

### Weeks 2-3: Frontend Refactoring (15-20 hours)

**Focus:** UI components and match scouting workflow

#### Session 3: Data Layer Updates (2.5 hours)

**Pair 1: TypeScript Interfaces**
1. Update `data/schema.tsx` (60 min)
   ```typescript
   // Rename interfaces
   export interface ReefscapeMatchData → {2026Game}MatchData
   export interface AlgaeData → {GamePiece1}Data
   export interface CoralData → {GamePiece2}Data

   // Update fields
   climb_deep → {endgame_option_1}
   climb_shallow → {endgame_option_2}
   ```
2. Update field types for new game mechanics (20 min)
3. Add TypeScript comments documenting 2026 rules (10 min)

**Pair 2: Supabase Service**
1. Update `data/supabaseService.tsx` (70 min)
   - Change all table names in queries
   - Update function parameters to match new interfaces
   - Modify data transformation logic
2. Test each function in isolation (20 min)

**Pair 3: Mock Data**
1. Update `data/mockData.tsx` (60 min)
   - Create realistic 2026 game data
   - Update robot stats for new game pieces
   - Create sample match histories
   - Use actual field dimensions/rules
2. Test demo mode with new mock data (20 min)
3. Document mock data structure (10 min)

**All Together: Integration (20 min)**
1. Test that services work with new types (10 min)
2. Run TypeScript compiler to check for errors (5 min)
3. Fix any type mismatches (5 min)

**Deliverable:** Type-safe data layer for 2026 game

#### Session 4: Match Scouting UI - Part 1 (2.5 hours)

**Pair 1: Pregame Screen**
1. Update `app/(login)/(regional)/(Scouting)/(MatchScouting)/Pregame.tsx` (45 min)
   - Change starting position options if needed
   - Update API calls to use new service functions
   - Test pregame data submission
2. Update UI text/labels for 2026 branding (15 min)
3. Test thoroughly (20 min)

**Pair 2: Auto Screen - Game Piece 1**
1. Update `Auto.tsx` (80 min)
   - Replace algae buttons with {game_piece_1} buttons
   - Update scoring zone options based on 2026 field
   - Change state management to track new data structure
   - Modify data submission to match new API
2. Style buttons to match 2026 game theme (20 min)
3. Test autonomous phase completely (20 min)

**Pair 3: Auto Screen - Game Piece 2**
1. Continue in `Auto.tsx` (80 min)
   - Replace coral buttons with {game_piece_2} buttons
   - Update level/zone options
   - Ensure both game pieces work together
2. Add visual feedback for scoring attempts (20 min)
3. Test edge cases (20 min)

**All Together: Auto Phase Testing (30 min)**
1. Each person scouts a mock autonomous phase (15 min)
2. Verify data saves correctly to database (10 min)
3. Check statistics calculate properly (5 min)

**Deliverable:** Pregame and Auto screens adapted

#### Session 5: Match Scouting UI - Part 2 (2.5 hours)

**Pair 1: Tele Screen**
1. Update `Tele.tsx` (80 min)
   - Same game piece button updates as Auto
   - Update endgame options (climb → 2026 mechanism)
   - Modify state and submission logic
2. Update timer display if needed (10 min)
3. Test teleop phase (20 min)

**Pair 2: Post Screen**
1. Update `Post.tsx` (40 min)
   - Verify driver rating still relevant
   - Update robot status options if needed
   - Change API call to new endpoint
2. Add any 2026-specific post-match questions (20 min)
3. Test submission and verify in database (20 min)
4. Test complete match flow end-to-end (30 min)

**Pair 3: Progress Indicators**
1. Update `components/ProgressBar.tsx` (30 min)
   - Ensure it works with renamed screens
2. Create visual consistency across scouting screens (40 min)
   - Update colors/theme for 2026
   - Ensure buttons are consistent size
   - Check accessibility (contrast, text size)
3. Polish UI details (20 min)

**All Together: Full Match Scouting Test (30 min)**
1. Everyone scouts a complete match (15 min)
   - Pregame → Auto → Tele → Post
   - Submit real data to database
2. Review data in Supabase dashboard (10 min)
3. Note any bugs or issues (5 min)

**Deliverable:** Complete match scouting workflow for 2026

#### Session 6: Statistics & Leaderboard (2.5 hours)

**Pair 1: Leaderboard Component**
1. Update `components/RobotLeaderboard.tsx` (50 min)
   - Change column headers for new statistics
   - Update sort options (algae → {game_piece_1})
   - Modify what data is displayed
2. Update `app/(login)/(regional)/(TeamInfo)/Leaderboard.tsx` (30 min)
   - Verify real-time hooks still work
   - Update search/filter logic if needed
3. Test sorting by all new statistics (20 min)

**Pair 2: Team Detail Tabs**
1. Update `MatchData.tsx` (40 min)
   - Display new game piece data
   - Show endgame results
   - Update match summary cards
2. Update `QualData.tsx` (40 min)
   - Show statistics for new game pieces
   - Update charts/graphs for 2026 metrics
   - Add any new qualification indicators
3. Test tab navigation and data display (20 min)

**Pair 3: Robot Display**
1. Update `RobotDisplay.tsx` (50 min)
   - Modify pit scouting display for 2026 capabilities
   - Update game piece scoring capability indicators
   - Change endgame capability display
2. Update statistics accordion (30 min)
   - New averages and percentages
3. Test complete team detail view (20 min)

**All Together: Leaderboard Testing (30 min)**
1. Generate diverse mock data (10 min)
   - Teams with different strengths
   - Various scoring patterns
2. Test all sort options (10 min)
3. Verify team details show correctly (10 min)

**Deliverable:** Statistics and leaderboard adapted for 2026

---

### Week 4: Testing, Polish & Deployment (8-10 hours)

#### Session 7: Comprehensive Testing (2.5 hours)

**All Together: Structured Testing**

**Round 1: Feature Testing (45 min)**
Each student assigned a feature:
1. Pit scouting complete flow
2. Match scouting complete flow
3. Leaderboard all sort options
4. Team details all tabs
5. Offline mode and queue
6. Real-time updates

Create test checklist for each feature, execute, document bugs

**Round 2: Cross-Device Testing (30 min)**
- iOS simulator
- Android simulator/device
- Different screen sizes
- Tablet if available

**Round 3: Stress Testing (30 min)**
- All 6 students submit data simultaneously
- Toggle network on/off randomly
- Try to break the app
- Document any crashes or errors

**Bug Triage & Fixes (45 min)**
- Categorize bugs: Critical, High, Medium, Low
- Fix critical and high priority bugs immediately
- Log medium/low for future

**Deliverable:** Tested application with critical bugs fixed

#### Session 8: Deployment & Training (2.5 hours)

**Part 1: Production Deployment (60 min)**

**Pair 1: Backend Deployment**
1. Update environment variables for production (10 min)
2. Deploy to hosting service (Render, Railway, or Heroku) (30 min)
3. Test production API endpoints (10 min)
4. Document deployment process (10 min)

**Pair 2: Frontend Build**
1. Update `app.json` with 2026 branding (10 min)
   - App name, version, description
   - Splash screen, icon (if updated)
2. Run `eas build` for iOS and Android (30 min)
   - Configure build profiles
   - Submit builds
3. Test production builds (15 min)
4. Document build process (5 min)

**Pair 3: Documentation Updates**
1. Update `README.md` with 2026 information (15 min)
2. Update setup guides for 2026 (20 min)
3. Create `docs/2026_GAME_RULES.md` (15 min)
   - Document game-specific scouting strategies
   - Explain what data to collect and why
4. Update `IMPLEMENTATION_SUMMARY.md` (10 min)

**Part 2: User Training (60 min)**

**Create Training Materials (30 min)**
1. Quick start guide for scouts (10 min)
   - How to scout a match in 2 minutes
   - What to look for in autonomous
   - What to look for in teleop
   - How to rate drivers
2. Video walkthrough (15 min)
   - Record screen while scouting a practice match
   - Narrate what you're doing
3. FAQ document (5 min)
   - Common questions
   - Troubleshooting

**Team Training Session (30 min)**
1. Present app to full robotics team (10 min)
   - Demo match scouting
   - Show leaderboard
   - Explain why data matters
2. Hands-on practice (15 min)
   - Team members scout practice scenarios
   - Answer questions
3. Gather feedback (5 min)

**Part 3: Final Preparation (30 min)**
1. Create data backup strategy (10 min)
   - Export database before competition
   - Document restore process
2. Prepare emergency procedures (10 min)
   - What if app crashes at competition?
   - What if database goes down?
   - Fallback to paper scouting?
3. Pack competition checklist (10 min)
   - Devices charged
   - Network details
   - Emergency contacts
   - Backup plan

**Deliverable:** Production-ready app deployed and team trained

---

## Team Organization

### Recommended Team Structure

**Roles** (students can have multiple roles):

1. **Database Lead** (1 student)
   - Responsible for schema design
   - Manages Supabase dashboard
   - Reviews all database-related PRs

2. **Backend Lead** (1 student)
   - Maintains Express API
   - Handles TBA integration
   - Manages API documentation

3. **Frontend Leads** (2 students)
   - Component development
   - UI/UX consistency
   - Real-time integration

4. **Testing Lead** (1 student)
   - Writes and maintains tests
   - Coordinates testing sessions
   - Tracks bug reports

5. **DevOps Lead** (1 student)
   - Manages deployments
   - Handles environment configuration
   - Documentation maintenance

**Pairing Strategy:**
- Rotate pairs each session for knowledge sharing
- Pair experienced with less experienced students
- Switch between frontend and backend to build full-stack skills

### Communication & Coordination

**Tools:**
- **GitHub:** Code repository, issues, pull requests
- **Discord/Slack:** Quick questions, coordination
- **Google Docs:** Shared notes, game analysis
- **GitHub Projects:** Task board

**Workflow:**
1. Create feature branch for each task
2. Work in pairs, commit frequently
3. Create pull request when done
4. Another pair reviews before merge
5. Test after merge to main

**Meeting Schedule:**
- **Development Sessions:** 2.5 hours, focused coding
- **Daily Standups (async):** Brief status updates in Discord
  - What did you work on?
  - What are you working on next?
  - Any blockers?
- **Code Reviews:** 15-30 min as needed

---

## Success Metrics

### Near-Term (After Session 4)

**Technical Metrics:**
- ✅ Real-time updates working in leaderboard
- ✅ Offline queue successfully queues and syncs
- ✅ TBA integration shows live match schedules
- ✅ Test coverage > 20% (key functions tested)
- ✅ Zero critical bugs in core scouting flow

**Learning Metrics:**
- ✅ All students can explain data flow from UI → Database
- ✅ All students understand real-time subscriptions
- ✅ All students can write a basic unit test
- ✅ All students can identify game-specific vs generic code
- ✅ Team confident they can refactor for 2026 game

### Long-Term (Week 4 of 2026 Refactoring)

**Technical Metrics:**
- ✅ App fully adapted to 2026 game
- ✅ Database schema matches 2026 mechanics
- ✅ All UI components updated
- ✅ Test coverage maintained or improved
- ✅ Successfully scouts matches at first competition
- ✅ Real-time updates work with 10+ scouts
- ✅ Offline queue handles poor venue WiFi

**Team Metrics:**
- ✅ 10+ robotics team members trained on app
- ✅ Data collected at minimum 2 practice events
- ✅ Alliance selection uses app data
- ✅ Positive feedback from scouts and strategy team

**Code Quality Metrics:**
- ✅ All code reviewed before merge
- ✅ Documentation updated for 2026
- ✅ No hardcoded 2025 references remaining
- ✅ Deployment process documented and tested

---

## Risk Management

### Potential Risks & Mitigations

#### Risk 1: Game is drastically different from 2025
**Probability:** Medium
**Impact:** High

**Mitigation:**
- Keep abstractions loose, don't over-optimize for 2025
- Document all assumptions about game structure
- Have fallback plan to simplify if needed
- Start with minimum viable scouting (just match outcomes) if complex

#### Risk 2: Team member availability during January
**Probability:** Medium (winter break, school)
**Impact:** Medium

**Mitigation:**
- Front-load critical work (database schema in Week 1)
- Cross-train so multiple students can do each role
- Detailed documentation so anyone can pick up tasks
- Flexible session scheduling

#### Risk 3: Database schema doesn't fit new game
**Probability:** Low
**Impact:** High

**Mitigation:**
- Design schema to be flexible (use JSON columns if needed)
- Study multiple past FRC games to understand patterns
- Have experienced mentor review schema design
- Plan time for iteration

#### Risk 4: Real-time or offline features break
**Probability:** Medium (new complex features)
**Impact:** Medium

**Mitigation:**
- Test extensively during near-term sessions
- Have manual refresh fallback
- Demo mode already handles offline gracefully
- Document workarounds for competitions

#### Risk 5: Not enough testing time
**Probability:** High
**Impact:** Medium

**Mitigation:**
- Integrate testing into every session, not just end
- Focus on critical path (match scouting flow)
- Use demo mode and mock data for rapid testing
- Beta test with team week before competition

#### Risk 6: TBA API changes or is unreliable
**Probability:** Low
**Impact:** Low

**Mitigation:**
- Already have fallback to mock data
- Manual match schedule entry possible
- Document TBA as "nice to have" not critical
- Cache TBA data locally

---

## Additional Resources

### Learning Materials (Self-Study Between Sessions)

**For Database Students:**
- PostgreSQL triggers: https://www.postgresql.org/docs/current/trigger-definition.html
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- SQL optimization: https://use-the-index-luke.com/

**For Frontend Students:**
- React Native docs: https://reactnative.dev/docs/getting-started
- React hooks: https://react.dev/reference/react/hooks
- Expo Router: https://docs.expo.dev/router/introduction/

**For Backend Students:**
- Express.js guide: https://expressjs.com/en/guide/routing.html
- REST API best practices: https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/
- TBA API docs: https://www.thebluealliance.com/apidocs/v3

**For Testing Students:**
- Jest documentation: https://jestjs.io/docs/getting-started
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Testing best practices: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

### Past FRC Games for Study

**Study these to understand game diversity:**
- 2024 Crescendo: Note piece (rings)
- 2023 Charged Up: Cubes and cones, grids, charging station
- 2022 Rapid React: Cargo (balls), climbing
- 2020 Infinite Recharge: Power cells, color wheel, climbing

**Pattern:** Most games have 1-2 game pieces, 2-4 scoring zones, and endgame mechanism

---

## Conclusion

This roadmap provides a structured path from current prototype (70% complete) to production-ready scouting app for 2026 season.

**Key Principles:**
1. **Learn by doing** - Every session includes hands-on coding
2. **Test continuously** - Don't wait until the end
3. **Document everything** - Future you will thank present you
4. **Design for change** - 2026 game will be different, plan for it
5. **Work as a team** - Pair programming, code review, knowledge sharing

**Success depends on:**
- Consistent attendance and participation in sessions
- Communication and coordination between students
- Willingness to learn new technologies
- Attention to detail in refactoring process
- Testing, testing, testing

**Remember:** The goal isn't just a working app—it's understanding the app well enough to rapidly adapt it. Focus on learning the architecture, patterns, and principles. When January comes, you'll be ready.

Good luck, and happy coding! 🤖📊

---

**Questions or feedback on this roadmap?** Create an issue in the GitHub repository or discuss in your team Discord/Slack.

**Last updated:** October 30, 2025
