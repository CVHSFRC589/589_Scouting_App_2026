# 589 FRC Scouting Backend API

REST API server for Team 589 Falkon Robotics scouting application.

## Overview

This is the backend API service for the 589 FRC Crescendo Scouting App. It provides RESTful endpoints for managing teams, matches, robot information, and statistics data stored in a Supabase PostgreSQL database.

## Quick Start

### Prerequisites
- Node.js 20.0.0+ (required for Supabase compatibility)
- Supabase account with PostgreSQL database
- Git

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SECRET_KEY=sb_secret_your_key_here
```

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the database schema in Supabase SQL Editor:
   - Execute `database-schema.sql` to create tables and indexes
   - Optionally run `database-schema-seasons.sql` for multi-season support
3. Setup sample data:
   ```bash
   npm run setup-db
   ```

### Development

```bash
# Start development server with auto-reload
npm run dev

# API will be available at http://localhost:3000
```

### Production

```bash
# Start production server
npm start
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Include API key in request headers:
```bash
curl -H "x-api-key: dev-key-123" http://localhost:3000/api/teams
```

### Core Endpoints

**Teams:**
- `GET /api/teams` - List all teams
- `GET /api/teams/:teamNumber` - Get specific team
- `POST /api/teams` - Create new team
- `PUT /api/teams/:teamNumber` - Update team
- `DELETE /api/teams/:teamNumber` - Delete team

**Matches:**
- `GET /api/matches` - List matches (filterable by team, regional)
- `POST /api/matches` - Submit match data
- `GET /api/matches/:id` - Get specific match
- `PUT /api/matches/:id` - Update match data
- `DELETE /api/matches/:id` - Delete match

**Robot Info (Pit Scouting):**
- `GET /api/robot-info/:teamNumber` - Get robot capabilities
- `POST /api/robot-info` - Submit robot info
- `PUT /api/robot-info/:teamNumber` - Update robot info

**Statistics:**
- `GET /api/statistics/team/:teamNumber` - Team performance stats
- `GET /api/statistics/rankings` - Regional rankings
- `POST /api/statistics/calculate/:teamNumber` - Trigger stats calculation

**Dashboard:**
- `GET /api/dashboard/overview` - Competition overview
- `GET /api/dashboard/recent-activity` - Latest scouting activity

### Example Request

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-123" \
  -d '{
    "team_number": 589,
    "match_number": 15,
    "regional": "Orange County",
    "starting_position": "Middle",
    "auto_taxi": true,
    "auto_m1": 2,
    "teleop_amp_attempts": 8,
    "teleop_amp_scored": 6,
    "endgame_climb": "Double Climb",
    "driver_rating": 4,
    "scouter_name": "John Doe"
  }'
```

## Project Structure

```
589_Scouting_Backend/
├── src/
│   ├── server.js              # Main Express server
│   ├── config/                # Configuration files
│   ├── middleware/            # Express middleware
│   ├── routes/                # API route handlers
│   ├── scripts/               # Database setup scripts
│   └── types/                 # TypeScript type definitions
├── database-schema.sql        # PostgreSQL schema
├── .env.example               # Environment variables template
└── package.json               # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run Jest test suite
- `npm run setup-db` - Initialize database with sample data
- `npm run gen-types` - Generate TypeScript types from database
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

Required in `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# API Security
API_KEYS=dev-key-123,prod-key-456
```

## Database Schema

**Core Tables:**
- `teams` - Team registry and regional assignments
- `matches` - Match-by-match performance data
- `robot_info` - Pit scouting data (capabilities, specs)
- `team_statistics` - Computed analytics and rankings

See `database-schema.sql` for complete schema with indexes and constraints.

## Deployment

### Railway/Render

1. Create new project and connect to this repository
2. Set environment variables (SUPABASE_URL, SUPABASE_SECRET_KEY, etc.)
3. Deploy with automatic builds from main branch

### Manual Deployment

```bash
# Install production dependencies
npm install --production

# Set environment variables
export NODE_ENV=production
export SUPABASE_URL=your-url
export SUPABASE_SECRET_KEY=your-key

# Start server
npm start
```

## Educational Resources

- **docs/REST_API_EDUCATION.md** - Learn REST API design principles
- **docs/SUPABASE_MIGRATION.md** - Understanding the Supabase migration
- **docs/README-original.md** - Full project context and architecture
- **docs/SETUP_GUIDE.md** - Detailed setup instructions

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Validation:** Joi
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI

## License

MIT License - Built by 589 Falkon Robotics for the FRC community

## Support

For issues or questions:
- GitHub Issues: [Create an issue]
- Team Email: 589falkonrobotics@gmail.com
- Documentation: See educational resources above

---

**Part of the 589 FRC Crescendo Scouting App ecosystem**
