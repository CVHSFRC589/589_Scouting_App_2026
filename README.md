# FRC Team 589 Scouting Application

An educational mobile scouting application built by and for Team 589 Falkon Robotics students to support data-driven competition strategy during FIRST Robotics Competition (FRC) events.

## Purpose

During FRC competitions, teams need to quickly gather and analyze performance data about other robots to make strategic decisions, especially when forming alliances. This application enables Team 589 to:

- **Collect scouting data** from multiple scouts simultaneously during matches
- **Store data reliably** in a central database even with spotty competition WiFi
- **Generate team statistics** quickly to support alliance selection decisions
- **Learn software development** through a real-world application

This is an **educational project** - students will learn full-stack mobile development, database design, API architecture, and collaborative software engineering while building something that directly helps the team compete.

## Documentation Directory

- **[Docs/APP_QUICKSTART.md](Docs/APP_QUICKSTART.md)** - Start here! Quick guide to run the app
- **[Docs/IDEAS.md](Docs/IDEAS.md)** - Future enhancement ideas for students to implement
- **[Backend_2025_Scouting/README.md](Backend_2025_Scouting/README.md)** - Backend API documentation

## Application Architecture

### Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Mobile Scout Apps                      │
│              (10+ scouts at competition)                 │
│        Frontend_2025_Scouting (React Native/Expo)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Real-time data sync
                     │ (works offline)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Database                      │
│              (PostgreSQL + Real-time sync)               │
│    - Match data      - Robot info (pit scouting)        │
│    - Team stats      - Scout assignments                │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Data aggregation
                     │ Statistics calculation
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend Application                     │
│          Backend_2025_Scouting (Node.js/Express)        │
│     - Statistical analysis    - Team reports            │
│     - Data validation         - TBA API integration     │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**Why Supabase as the central hub?**
- **Offline-first:** Scouts can continue working during network outages
- **Real-time sync:** Data appears immediately when connectivity returns
- **Reliable:** Battle-tested database that handles concurrent writes from multiple scouts
- **Simple:** Students can focus on app features instead of building sync infrastructure

**Why keep the backend?**
- **Learning:** Students practice building REST APIs and server-side logic
- **Complex analytics:** Heavy statistical calculations don't burden mobile apps
- **Integration:** Connects to external APIs (The Blue Alliance)
- **Reports:** Generates formatted team analysis documents

**Why separate frontend apps?**
- **Specialization:** Different scouts can focus on different tasks (pit scouting vs. match scouting)
- **Performance:** Mobile devices only run what they need
- **Reliability:** If one scout's app crashes, others continue working

## Expected Workflows

### 1. Competition Day - Match Scouting

```
Scout opens app → Receives assignment (e.g., "Scout Team 589 in Match 15")
                ↓
        Match begins → Scout records:
                       - Autonomous actions
                       - Teleop performance
                       - Endgame results
                ↓
        Submit data → Syncs to Supabase (even if offline, syncs later)
                ↓
    Backend processes → Updates team statistics
                ↓
Strategy team views → Latest stats available for alliance decisions
```

### 2. Pit Scouting

```
Scout walks to team pit → Opens pit scouting form
                        ↓
              Interviews team → Records:
                                - Robot capabilities
                                - Drivetrain type
                                - Special features
                        ↓
              Takes photos → Attaches to report
                        ↓
                  Submit → Data available to strategy team immediately
```

### 3. Alliance Selection

```
All match data collected → Backend calculates:
                           - Average points scored
                           - Reliability metrics
                           - Special capabilities
                    ↓
        Strategy team reviews → Filtered lists by capability
                                (e.g., "Teams that can climb")
                    ↓
          Make alliance picks → Data-driven decisions!
```

## Technology Stack

**Frontend (Mobile App):**
- React Native - Cross-platform mobile development (iOS + Android)
- Expo - Development framework and build tools
- TypeScript - Type-safe JavaScript

**Backend (API Server):**
- Node.js - JavaScript runtime
- Express.js - Web framework
- Joi - Data validation

**Database:**
- Supabase - PostgreSQL database with real-time features
- Row Level Security - Data access control
- Functions - Server-side stored procedures

## Project Structure

```
589_Scouting_App_2026/
├── Frontend_2025_Scouting/     # Mobile app (React Native/Expo)
│   ├── app/                     # Screen components (file-based routing)
│   ├── data/                    # Data processing and API calls
│   └── package.json
│
├── Backend_2025_Scouting/      # API server (Node.js/Express)
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Request processing
│   │   └── server.js           # Main application
│   ├── supabase/               # Database schemas and functions
│   └── package.json
│
└── Docs/                       # Documentation and guides
    ├── APP_QUICKSTART.md       # How to run the app
    └── IDEAS.md                # Future enhancements
```

## Getting Started

**First time setup?** Follow the [Quick Start Guide](Docs/APP_QUICKSTART.md) to get the application running on your computer.

**Already set up?** Just run:
```bash
# Terminal 1 - Backend
cd Backend_2025_Scouting
npm run dev

# Terminal 2 - Frontend
cd Frontend_2025_Scouting
npm start
```

## Learning Opportunities

Students working on this project will gain experience with:

- **Mobile Development:** Building cross-platform apps with React Native
- **Backend APIs:** Creating RESTful endpoints and server logic
- **Database Design:** Schema design, queries, and optimization
- **Real-time Systems:** Handling concurrent users and data sync
- **Git/GitHub:** Collaborative development and version control
- **Testing:** Writing tests and ensuring code quality
- **Deployment:** Publishing apps and hosting servers
- **Agile Development:** Working in sprints and iterating on features

## Contributing

This is a team project! Here's how to contribute:

1. **Pick a task** from [Docs/IDEAS.md](Docs/IDEAS.md) or create your own
2. **Create a branch** for your feature: `git checkout -b feature-name`
3. **Make your changes** and test thoroughly
4. **Commit with clear messages:** `git commit -m "Add scout assignment feature"`
5. **Push and create a Pull Request** for team review
6. **Collaborate** - discuss, review, improve together!

## Competition Data Flow Example

**Scenario:** 10 scouts at Orange County Regional

1. **Friday (Pit Scouting):**
   - 3 scouts visit team pits, collect robot capabilities
   - Data syncs to Supabase as each pit report is completed
   - Strategy team can already see which teams have specific features

2. **Saturday (Qualification Matches):**
   - 6 scouts assigned to matches (one per robot per match)
   - Each scout records their assigned robot's performance
   - Backend calculates running averages after each match
   - Strategy team tracks top performers in real-time

3. **Alliance Selection:**
   - Backend generates ranked lists by various metrics
   - Team compares stats across multiple criteria
   - Makes informed alliance selections based on data

## Support & Questions

- **Technical issues?** Check existing documentation or ask a team mentor
- **Ideas for features?** Add them to [Docs/IDEAS.md](Docs/IDEAS.md)
- **Found a bug?** Create a GitHub issue with details to reproduce

## License

MIT License - Built by 589 Falkon Robotics students for the FRC community.

---

**Go Falkons! 🦅🤖**
