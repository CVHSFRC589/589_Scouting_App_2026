# FRC Team 589 Scouting Application 2025

A comprehensive mobile scouting application for FIRST Robotics Competition (FRC) Team 589, built for the 2025 REEFSCAPE game season.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---
Ready to get up and running? Dive into the [FRONTEND_SETUP_GUIDE](Frontend_2025_Scouting\docs\FRONTEND_SETUP_GUIDE.md)!
## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [File System Structure](#file-system-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The FRC 589 Scouting App is a mobile-first application designed to streamline the collection, analysis, and visualization of match data during FIRST Robotics competitions. The app enables team members to scout opponent robots, track match performance, and make data-driven decisions for alliance selections.

### Purpose

- **Data Collection**: Scouts collect real-time data on robot performance during matches and pit inspections
- **Strategic Analysis**: Analyze team statistics, rankings, and capabilities to inform strategy
- **Alliance Selection**: Make informed decisions during alliance selection based on comprehensive data
- **Competition Management**: Administrators manage competitions, users, and data across multiple regionals

### Target Users

- **Scouts**: Team members collecting match and pit data on tablets/phones
- **Strategy Team**: Analyzing data for match strategy and alliance selection
- **Administrators**: Managing competitions, users, and application configuration

---

## ✨ Features

### Core Functionality

- ✅ **Match Scouting**
  - Track autonomous, teleoperated, and endgame performance
  - Score coral placement (L1-L4 levels)
  - Track algae removal, processing, and scoring
  - Record climb performance and endgame actions
  - Driver ratings and defensive play tracking

- ✅ **Pit Scouting**
  - Document robot capabilities and specifications
  - Vision system and drivetrain information
  - Intake and scoring capabilities
  - Climb abilities and strategic notes

- ✅ **Real-time Statistics**
  - Auto-calculated team averages and rankings
  - Leaderboard with sortable metrics
  - Match history and trend analysis
  - Visual charts and graphs

- ✅ **User Management**
  - Supabase authentication (email/password)
  - Role-based access control (scouts, admins)
  - User profiles and permissions
  - Submission tracking

- ✅ **Competition Management**
  - Multiple competition support
  - Dynamic competition switching
  - Competition-specific data isolation
  - Admin controls for competition setup

### Advanced Features

- 🔄 **Offline Support**
  - Upload queue for failed submissions
  - Automatic retry with exponential backoff
  - Local data caching
  - Graceful degradation without internet

- 📊 **Data Visualization**
  - Interactive bar charts
  - Team comparison views
  - Match-by-match breakdowns
  - Sortable leaderboards

- 🎨 **Modern UI/UX**
  - Swipe navigation between screens
  - Touch-friendly controls
  - Demo mode border for testing
  - Connection status indicators
  - Dark status bar for visibility

---

## 🏗️ Architecture

### System Design

The application follows a **client-server architecture** with a mobile frontend and cloud-based backend:

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Devices                          │
│  (iOS/Android - React Native with Expo)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Scouts     │  │  Strategy    │  │    Admins    │       │
│  │   (Tablets)  │  │    Team      │  │   (Manage)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS / REST API
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Cloud Backend                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                     │   │
│  │  • Match Reports    • Pit Reports                    │   │
│  │  • Robot Stats      • User Profiles                  │   │
│  │  • App Metadata     • Scoring Config                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                Supabase Services                     │   │
│  │  • Authentication   • Row Level Security             │   │
│  │  • Real-time (opt)  • Storage (future)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Context-based State Management**: React Context API for global state (Auth, Competition)
- **Service Layer Architecture**: Separation of data access logic (`data/` services)
- **Upload Queue Pattern**: Resilient offline data submission with retry logic
- **Cache-First Strategy**: Local caching for performance and offline support
- **Database Triggers**: Auto-calculated statistics using PostgreSQL triggers
- **Row Level Security**: Supabase RLS policies for data access control

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| [React Native](https://reactnative.dev/) | 0.81.5 | Mobile framework | [Docs](https://reactnative.dev/docs/getting-started) |
| [Expo](https://expo.dev/) | 54.0.23 | Development platform | [Docs](https://docs.expo.dev/) |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3 | Type-safe JavaScript | [Docs](https://www.typescriptlang.org/docs/) |
| [Expo Router](https://expo.github.io/router/) | 6.0.14 | File-based routing | [Docs](https://docs.expo.dev/router/introduction/) |
| [React Native Chart Kit](https://www.npmjs.com/package/react-native-chart-kit) | 6.12.0 | Data visualization | [Docs](https://github.com/indiespirit/react-native-chart-kit) |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | 2.75.0 | Backend client | [Docs](https://supabase.com/docs/reference/javascript/introduction) |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | 2.2.0 | Local data persistence | [Docs](https://react-native-async-storage.github.io/async-storage/docs/usage/) |
| [React Navigation](https://reactnavigation.org/) | 7.1.17 | Navigation library | [Docs](https://reactnavigation.org/docs/getting-started) |

### Backend

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| [Supabase](https://supabase.com/) | Backend-as-a-Service | [Docs](https://supabase.com/docs) |
| [PostgreSQL](https://www.postgresql.org/) | Relational database | [Docs](https://www.postgresql.org/docs/) |
| [PostgREST](https://postgrest.org/) | REST API (via Supabase) | [Docs](https://postgrest.org/en/stable/) |
| [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) | Data access control | [Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) |

### Development Tools

| Tool | Purpose | Documentation |
|------|---------|---------------|
| [Git](https://git-scm.com/) | Version control | [Docs](https://git-scm.com/doc) |
| [npm](https://www.npmjs.com/) | Package management | [Docs](https://docs.npmjs.com/) |
| [Jest](https://jestjs.io/) | Testing framework | [Docs](https://jestjs.io/docs/getting-started) |
| [ESLint](https://eslint.org/) | Code linting | [Docs](https://eslint.org/docs/latest/) |

### Key Libraries

- **UI Components**: React Native core components, Expo Vector Icons
- **Gestures**: React Native Gesture Handler, PanResponder
- **Networking**: Fetch API, Supabase client, NetInfo
- **State Management**: React Context API, useState, useEffect hooks
- **Type Safety**: TypeScript with strict mode enabled

---

## 📁 File System Structure

```
589_Scouting_App_2026/
│
├── Frontend_2025_Scouting/              # Mobile application
│   ├── app/                              # Expo Router pages
│   │   ├── (login)/                      # Authenticated routes
│   │   │   ├── (admin)/                  # Admin pages (users, competitions)
│   │   │   ├── (regional)/               # Competition-specific routes
│   │   │   │   ├── (Scouting)/           # Data collection
│   │   │   │   │   ├── (MatchScouting)/  # Match scouting workflow
│   │   │   │   │   │   ├── Pregame.tsx   # Team/match selection
│   │   │   │   │   │   ├── Auto.tsx      # Autonomous tracking
│   │   │   │   │   │   ├── Tele.tsx      # Teleoperated tracking
│   │   │   │   │   │   └── Post.tsx      # Endgame & submission
│   │   │   │   │   └── PitScouting.tsx   # Pit report form
│   │   │   │   └── (TeamInfo)/           # Data viewing
│   │   │   │       ├── (tabs)/           # Team detail tabs
│   │   │   │       │   ├── RobotDisplay.tsx  # Pit report view
│   │   │   │       │   ├── MatchData.tsx     # Averages chart
│   │   │   │       │   └── QualData.tsx      # Per-match view
│   │   │   │       └── Leaderboard.tsx   # Rankings
│   │   │   └── home.tsx                  # Homepage
│   │   ├── login.tsx                     # Login screen
│   │   ├── signup.tsx                    # Registration screen
│   │   ├── index.tsx                     # Entry point
│   │   └── _layout.tsx                   # Root layout
│   │
│   ├── components/                       # Reusable UI components
│   │   ├── AppHeader.tsx                 # Top navigation bar
│   │   ├── AppFooter.tsx                 # Bottom navigation
│   │   ├── ConnectionHeader.tsx          # Connection status
│   │   ├── DemoBorderWrapper.tsx         # Demo mode indicator
│   │   ├── UploadQueueIndicator.tsx      # Upload status
│   │   ├── RobotLeaderboard.tsx          # Leaderboard list
│   │   ├── StatsAccordion.tsx            # Expandable stats
│   │   └── ProgressBar.tsx               # Progress indicator
│   │
│   ├── contexts/                         # React contexts
│   │   ├── AuthContext.tsx               # Authentication state
│   │   └── CompetitionContext.tsx        # Active competition
│   │
│   ├── data/                             # Data access layer
│   │   ├── supabaseClient.tsx            # Supabase initialization
│   │   ├── supabaseService.tsx           # Database queries
│   │   ├── processing.tsx                # Data processing logic
│   │   ├── uploadQueue.tsx               # Offline upload queue
│   │   ├── competitionManager.ts         # Competition sync
│   │   ├── connectionManager.ts          # Connection monitoring
│   │   ├── matchDataCache.ts             # Match data cache
│   │   ├── cache.tsx                     # Local storage
│   │   └── schemaVersion.ts              # Version compatibility
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useRealtimeMatches.ts         # Real-time match updates
│   │   └── useRealtimeRobots.ts          # Real-time robot updates
│   │
│   ├── supabase_setup/                   # Database setup scripts
│   │   ├── 1 - DROP_ALL_SCHEMA.sql       # Clean slate (dangerous!)
│   │   ├── 2 - CREATE_CLEAN_SCHEMA.sql   # Complete schema
│   │   ├── 3 - CREATE_AUTH_TRIGGER.sql   # User profile trigger
│   │   ├── 4 - SET_TEST_COMPETITION.sql  # Configure test competition
│   │   ├── 5 - LOAD_TEST_DATA.sql        # Sample data
│   │   └── 6 - GRANT_ADMIN_ACCESS.sql    # Admin privileges
│   │
│   ├── docs/                             # Frontend documentation
│   │   └── SUPABASE_SETUP_GUIDE.md       # Database setup guide
│   │
│   ├── assets/                           # Images, fonts, icons
│   ├── .env.example                      # Environment template
│   ├── app.config.js                     # Expo configuration
│   ├── package.json                      # Dependencies
│   └── tsconfig.json                     # TypeScript config
│
├── Docs/                                 # Project documentation
│   ├── IDEAS.md                          # Future enhancements
│   ├── DATABASE_FUNCTIONS_AUDIT.md       # Function documentation
│   ├── DATABASE_TRIGGERS_EXPLAINED.md    # Trigger behavior
│   ├── SCHEMA_VERSIONING_GUIDE.md        # Version management
│   ├── UPLOAD_QUEUE_SYSTEM.md            # Offline queue design
│   └── [Other documentation files]
│
├── .git/                                 # Git repository
├── .gitignore                            # Git ignore rules
└── README.md                             # This file
```

### Key Directories

- **`app/`**: File-based routing structure (Expo Router)
- **`components/`**: Reusable UI components
- **`contexts/`**: Global state management
- **`data/`**: Business logic and database access
- **`supabase_setup/`**: Database schema and migrations
- **`Docs/`**: Project documentation and guides

---

## 🗄️ Database Schema

### Schema Version: 2.0.0

The database uses **PostgreSQL 15+** via Supabase with Row Level Security enabled.

### Core Tables

#### 1. `app_metadata`
**Purpose:** Application-wide configuration (single row table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Always 1 (primary key) |
| `app_name` | TEXT | Application name |
| `game_name` | TEXT | Current FRC game (REEFSCAPE) |
| `game_year` | INTEGER | Competition year (2025) |
| `schema_version` | TEXT | Database schema version |
| `active_competition` | VARCHAR | Currently selected competition |
| `available_competitions` | JSONB | List of competitions |
| `feature_flags` | JSONB | Feature toggles |

#### 2. `user_profiles`
**Purpose:** User accounts and permissions (extends `auth.users`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Links to `auth.users(id)` |
| `email` | TEXT | User email (unique) |
| `display_name` | TEXT | Display name |
| `team_number` | INTEGER | User's FRC team |
| `is_admin` | BOOLEAN | Admin privileges |
| `default_regional` | VARCHAR | Default competition |

#### 3. `match_reports`
**Purpose:** Match scouting data (one row per team per match)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-increment primary key |
| `team_number` | INTEGER | Team being scouted |
| `match_number` | INTEGER | Match number |
| `regional` | VARCHAR | Competition name |
| `auto_l1_scored` | INTEGER | Auto L1 coral scored |
| `auto_l2_scored` | INTEGER | Auto L2 coral scored |
| `auto_l3_scored` | INTEGER | Auto L3 coral scored |
| `auto_l4_scored` | INTEGER | Auto L4 coral scored |
| `auto_algae_scored` | INTEGER | Auto algae in net |
| `tele_l1_scored` | INTEGER | Tele L1 coral scored |
| `tele_l2_scored` | INTEGER | Tele L2 coral scored |
| `tele_l3_scored` | INTEGER | Tele L3 coral scored |
| `tele_l4_scored` | INTEGER | Tele L4 coral scored |
| `tele_algae_scored` | INTEGER | Tele algae in net |
| `total_l1_scored` | INTEGER | Total L1 (auto + tele) |
| `total_l2_scored` | INTEGER | Total L2 (auto + tele) |
| `total_l3_scored` | INTEGER | Total L3 (auto + tele) |
| `total_l4_scored` | INTEGER | Total L4 (auto + tele) |
| `total_algae_scored` | INTEGER | Total algae (auto + tele) |
| `algae_removed` | INTEGER | Algae removed from reef |
| `algae_processed` | INTEGER | Algae processed |
| `climb_deep` | BOOLEAN | Deep cage climb |
| `climb_shallow` | BOOLEAN | Shallow cage climb |
| `park` | BOOLEAN | Parked in endgame |
| `match_score` | INTEGER | **Auto-calculated total score** |
| `defence` | BOOLEAN | Played defense |
| `driver_rating` | INTEGER | Driver skill (1-5) |
| `disabled` | BOOLEAN | Robot disabled |
| `malfunction` | BOOLEAN | Robot malfunction |
| `no_show` | BOOLEAN | Team didn't show |
| `comments` | TEXT | Scout notes |
| `submitted_by` | UUID | User who submitted |
| `submitted_at` | TIMESTAMP | Submission time |

**Unique Constraint:** `(team_number, match_number, regional)` - one report per team per match per competition

#### 4. `pit_reports`
**Purpose:** Pit scouting data (robot capabilities)

| Column | Type | Description |
|--------|------|-------------|
| `team_number` | INTEGER | Team number (PK) |
| `regional` | VARCHAR | Competition name (PK) |
| `vision_sys` | VARCHAR | Vision system type |
| `drive_train` | VARCHAR | Drivetrain type |
| `ground_intake` | BOOLEAN | Has ground intake |
| `source_intake` | BOOLEAN | Has source intake |
| `l1_scoring` | BOOLEAN | Can score L1 |
| `l2_scoring` | BOOLEAN | Can score L2 |
| `l3_scoring` | BOOLEAN | Can score L3 |
| `l4_scoring` | BOOLEAN | Can score L4 |
| `can_remove` | BOOLEAN | Can remove algae |
| `can_process` | BOOLEAN | Can process algae |
| `can_net` | BOOLEAN | Can score algae in net |
| `can_climb_deep` | BOOLEAN | Can deep climb |
| `can_climb_shallow` | BOOLEAN | Can shallow climb |
| `comments` | TEXT | Pit notes |
| `submitted_by` | UUID | User who submitted |

#### 5. `robot_stats`
**Purpose:** Calculated team statistics (auto-updated by triggers)

| Column | Type | Description |
|--------|------|-------------|
| `team_number` | INTEGER | Team number (PK) |
| `regional` | VARCHAR | Competition name (PK) |
| `matches_played` | INTEGER | Number of matches |
| `avg_l1` | NUMERIC(5,2) | Average L1 scored |
| `avg_l2` | NUMERIC(5,2) | Average L2 scored |
| `avg_l3` | NUMERIC(5,2) | Average L3 scored |
| `avg_l4` | NUMERIC(5,2) | Average L4 scored |
| `avg_coral` | NUMERIC(5,2) | Average total coral |
| `avg_algae_scored` | NUMERIC(5,2) | Average algae scored |
| `avg_algae_removed` | NUMERIC(5,2) | Average algae removed |
| `avg_algae_processed` | NUMERIC(5,2) | Average algae processed |
| `avg_algae` | NUMERIC(5,2) | Average total algae |
| `avg_climb_deep` | NUMERIC(5,2) | Deep climb rate (0-1) |
| `avg_climb_shallow` | NUMERIC(5,2) | Shallow climb rate (0-1) |
| `avg_park` | NUMERIC(5,2) | Park rate (0-1) |
| `avg_match_score` | NUMERIC(6,2) | Average calculated score |
| `rank_value` | NUMERIC(6,2) | **Ranking (= avg_match_score)** |

**Note:** This table is **automatically updated** by database triggers when match reports are inserted, updated, or deleted.

#### 6. `game_scoring_config`
**Purpose:** REEFSCAPE point values (admin-configurable)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `auto_coral_l1_points` | INTEGER | 3 | Auto L1 points |
| `auto_coral_l2_points` | INTEGER | 4 | Auto L2 points |
| `auto_coral_l3_points` | INTEGER | 6 | Auto L3 points |
| `auto_coral_l4_points` | INTEGER | 7 | Auto L4 points |
| `tele_coral_l1_points` | INTEGER | 2 | Tele L1 points |
| `tele_coral_l2_points` | INTEGER | 3 | Tele L2 points |
| `tele_coral_l3_points` | INTEGER | 4 | Tele L3 points |
| `tele_coral_l4_points` | INTEGER | 5 | Tele L4 points |
| `algae_net_points` | INTEGER | 4 | Algae in net points |
| `algae_processor_points` | INTEGER | 6 | Algae processed points |
| `park_points` | INTEGER | 2 | Park points |
| `climb_shallow_points` | INTEGER | 6 | Shallow climb points |
| `climb_deep_points` | INTEGER | 12 | Deep climb points |
| `leave_points` | INTEGER | 3 | Auto leave bonus |

### Database Views

#### `robots_complete`
Combines `robot_stats` and `pit_reports` for leaderboard display.

#### `admin_user_list`
Shows user statistics including submission counts for admin dashboard.

### Key Database Functions

| Function | Purpose |
|----------|---------|
| `calculate_match_score()` | Calculates total match score from game elements |
| `recalculate_team_stats()` | Recalculates all statistics for a team |
| `create_user_profile()` | Auto-creates profile when user signs up |
| `is_user_admin()` | Checks if user has admin privileges |

### Database Triggers

- **`trigger_auto_calculate_match_score`**: Automatically calculates `match_score` before insert/update on `match_reports`
- **`trigger_auto_recalculate_stats`**: Automatically updates `robot_stats` after any change to `match_reports`
- **`on_auth_user_created`**: Creates `user_profiles` entry when new user signs up

### Row Level Security (RLS)

RLS policies control data access:

- **Public read** for match data, pit data, and statistics
- **Authenticated write** for scouts submitting data
- **Admin-only access** for user management and configuration
- **User isolation** for profile data (users can only see their own profile)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Expo Go** app on iOS/Android ([App Store](https://apps.apple.com/app/expo-go/id982107779) | [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Supabase account** ([Sign up free](https://supabase.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CVHSFRC589/589_Scouting_App_2026.git
   cd 589_Scouting_App_2026/Frontend_2025_Scouting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:

   **Note:** Get a copy of the .env file with this information from your Team lead

   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device**
   - Scan the QR code with Expo Go (iOS) or the Expo Go app (Android)
   - Or press `a` for Android emulator, `i` for iOS simulator

### First Login

1. Create an account using the signup screen
2. Log in and start scouting!

---

## 📚 Documentation

### Setup Guides
- [Supabase Setup Guide](Frontend_2025_Scouting/docs/SUPABASE_SETUP_GUIDE.md) - Complete database setup instructions
- [SQL Audit Report](Frontend_2025_Scouting/supabase_setup/AUDIT_REPORT.md) - SQL scripts documentation
- [Frontend Audit Report](Frontend_2025_Scouting/FRONTEND_AUDIT_REPORT.md) - Code refactoring details

### Architecture Documentation
- [Database Functions Audit](Docs/DATABASE_FUNCTIONS_AUDIT.md) - Function documentation
- [Database Triggers Explained](Docs/DATABASE_TRIGGERS_EXPLAINED.md) - Trigger behavior
- [Upload Queue System](Docs/UPLOAD_QUEUE_SYSTEM.md) - Offline submission design
- [Schema Versioning Guide](Docs/SCHEMA_VERSIONING_GUIDE.md) - Version management

### Future Development
- [Ideas and Roadmap](Docs/IDEAS.md) - Planned features and enhancements

### External Resources

#### React Native & Expo
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

#### Supabase & Database
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

#### React & State Management
- [React Hooks Reference](https://react.dev/reference/react)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)

---

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

3. **Test your changes**
   - Test on both iOS and Android
   - Test offline functionality
   - Test with and without admin privileges

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push to remote**
   ```bash
   git push -u origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Describe your changes
   - Link any related issues
   - Request review from team members

### Code Style Guidelines

- Use **TypeScript** for type safety
- Follow **React hooks** best practices
- Use **async/await** for asynchronous code
- Add **JSDoc comments** for complex functions
- Keep components **small and focused**
- Use **meaningful variable names**

### Branching Strategy

- `main` - Production-ready code
- `version2` - Current development branch (v2.0.0)
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `docs/*` - Documentation updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Credits

**Developed by:** FRC Team 589 - Falcons
**Season:** 2025 REEFSCAPE
**Organization:** Casa Verde High School

### Special Thanks

- FIRST Robotics Competition for the game design
- Supabase for the backend infrastructure
- Expo team for the development platform
- All team members who contributed to testing and feedback

---

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/CVHSFRC589/589_Scouting_App_2026/issues)
- **Team Contact**: Contact FRC Team 589 through [FIRST website](https://www.firstinspires.org/)
- **Documentation**: Check the `Docs/` folder for detailed guides

---

## 🔄 Version History

### Version 2.0.0 (Current - November 2025)
- ✅ Complete refactoring to use database-driven competition names
- ✅ Removed hardcoded competition codes
- ✅ Added CompetitionContext for dynamic competition switching
- ✅ Improved offline support with upload queue
- ✅ Added authentication and user management
- ✅ New admin panel for competition and user management
- ✅ Enhanced UI with swipe navigation and modern design
- ✅ Comprehensive documentation and setup guides

### Version 1.0.0 (October 2024)
- Initial release
- Basic match and pit scouting functionality
- Supabase integration
- Core data visualization

---

**Built with ❤️ by FRC Team 589 for the 2025 REEFSCAPE season**
