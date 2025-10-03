/**
 * Swagger/OpenAPI Configuration
 * Interactive API documentation for Team 589 Scouting App
 *
 * This configuration generates live, interactive API documentation
 * that students can use to understand and test endpoints.
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Team 589 FRC Scouting API - Educational Documentation',
      version: '1.0.0',
      description: `
# 🤖 Team 589 Falkon Robotics Scouting API

An educational REST API for FRC scouting data collection and analysis.

## 🎓 Learning Objectives

This API demonstrates professional software engineering concepts for high school students:

- **REST Architecture**: CRUD operations, HTTP methods, status codes
- **Data Validation**: Input validation with Joi schemas
- **Database Design**: Relational data with PostgreSQL/Supabase
- **Authentication**: API key-based auth (production would use JWT)
- **Error Handling**: Consistent error responses
- **Documentation**: Industry-standard OpenAPI/Swagger

## 🚀 Quick Start for Frontend Students

### Authentication
All API requests require an API key in the header:
\`\`\`
x-api-key: dev-key-123
\`\`\`

### Try It Out!
1. Click on any endpoint below
2. Click "Try it out"
3. Fill in parameters
4. Click "Execute"
5. See the response!

### Response Format
All endpoints return JSON in this format:
\`\`\`json
{
  "success": true,
  "data": [ /* your data here */ ],
  "message": "Optional success message"
}
\`\`\`

Or on error:
\`\`\`json
{
  "success": false,
  "error": {
    "message": "Description of what went wrong"
  }
}
\`\`\`

## 📊 Data Flow

\`\`\`
Mobile App (React Native) → REST API (You are here!) → Supabase (PostgreSQL)
                                 ↓
                         Statistics Engine
                                 ↓
                         Rankings & Analysis
\`\`\`

## 🏆 Competition Workflow

1. **Pre-Competition**: Import teams from The Blue Alliance
2. **Pit Scouting**: Collect robot capabilities data
3. **Match Scouting**: Record performance (Auto → Teleop → Endgame)
4. **Statistics**: Calculate accuracy, averages, rankings
5. **Alliance Selection**: Use data to pick optimal partners

## 📚 Core Concepts

### Teams
Base entity representing FRC teams. Each team has a number (e.g., 589) and participates in regionals.

### Matches
Performance data for one team in one match. Includes:
- **Pregame**: Starting position
- **Autonomous**: Scoring in first 15 seconds
- **Teleoperated**: Human-controlled period
- **Endgame**: Climbing and trap scoring
- **Postgame**: Ratings, notes, observations

### Robot Info (Pit Scouting)
Physical characteristics and capabilities discovered before matches start.

### Statistics
Calculated metrics from match data:
- Accuracy percentages (scored/attempts)
- Averages per match
- Rankings within regional

## 🔗 External Integrations

**The Blue Alliance (TBA)**: Official FRC data source
- Import team rosters
- Get event schedules
- Historical competition data

## 💡 Tips for Frontend Development

- Use the "Try it out" button to test before coding
- Check the response schemas to understand data structure
- Always handle both success and error cases
- Use query parameters to filter large datasets
- POST requests require \`Content-Type: application/json\` header

## 🆘 Support

**Backend Team**: Check with your mentor or backend team lead
**Documentation Issues**: Report bugs in team Slack/Discord
**API Errors**: Check response error message first, then ask for help

---

Built with ❤️ by Team 589 Falkon Robotics students
      `,
      contact: {
        name: 'Team 589 Falkon Robotics',
        email: '589falkonrobotics@gmail.com',
        url: 'https://www.cvrobots.com/'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server (local)'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'API base path'
      }
    ],
    tags: [
      {
        name: 'Teams',
        description: 'Team roster management - CRUD operations for FRC teams'
      },
      {
        name: 'Matches',
        description: 'Match scouting data - Performance tracking for individual matches'
      },
      {
        name: 'Robot Info',
        description: 'Pit scouting - Robot capabilities and physical characteristics'
      },
      {
        name: 'Statistics',
        description: 'Analytics - Calculated metrics and rankings'
      },
      {
        name: 'Dashboard',
        description: 'Overview data - Summary statistics and recent activity'
      },
      {
        name: 'TBA Integration',
        description: 'The Blue Alliance - Import official FRC competition data'
      },
      {
        name: 'System',
        description: 'Health checks and system information'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication. Use `dev-key-123` for development.'
        }
      },
      schemas: {
        // Success response wrapper
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data (type varies by endpoint)'
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        },

        // Error response wrapper
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Description of what went wrong'
                }
              }
            }
          }
        },

        // Team schema
        Team: {
          type: 'object',
          required: ['team_number', 'regional'],
          properties: {
            id: {
              type: 'integer',
              description: 'Database auto-generated ID',
              example: 1
            },
            team_number: {
              type: 'integer',
              description: 'FRC team number (1-99999)',
              example: 589,
              minimum: 1,
              maximum: 99999
            },
            team_name: {
              type: 'string',
              description: 'Team nickname',
              example: 'Falkon Robotics',
              maxLength: 100
            },
            regional: {
              type: 'string',
              description: 'Regional competition name',
              example: 'Orange County',
              maxLength: 50
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'When this team was added to database'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last modification time'
            }
          }
        },

        // Match schema
        Match: {
          type: 'object',
          required: ['team_number', 'match_number', 'regional'],
          properties: {
            id: {
              type: 'integer',
              description: 'Database auto-generated ID',
              example: 1
            },
            team_number: {
              type: 'integer',
              description: 'FRC team number being scouted',
              example: 589
            },
            match_number: {
              type: 'integer',
              description: 'Match number (usually 1-100+)',
              example: 15,
              minimum: 1
            },
            regional: {
              type: 'string',
              description: 'Regional competition name',
              example: 'Orange County'
            },
            scouter_name: {
              type: 'string',
              description: 'Name of student who collected this data',
              example: 'John Doe'
            },

            // Pregame
            starting_position: {
              type: 'string',
              enum: ['Amp', 'Middle', 'Source'],
              description: 'Robot starting position on field'
            },

            // Autonomous
            auto_taxi: {
              type: 'boolean',
              description: 'Did robot leave starting zone? (2 points)',
              example: true
            },
            auto_m1: {
              type: 'integer',
              description: 'Auto: Notes scored in amp from position M1',
              minimum: 0,
              default: 0
            },
            auto_m2: {
              type: 'integer',
              description: 'Auto: Notes scored in amp from position M2',
              minimum: 0,
              default: 0
            },
            auto_m3: {
              type: 'integer',
              description: 'Auto: Notes scored in amp from position M3',
              minimum: 0,
              default: 0
            },
            auto_m4: {
              type: 'integer',
              description: 'Auto: Notes scored in amp from position M4',
              minimum: 0,
              default: 0
            },
            auto_m5: {
              type: 'integer',
              description: 'Auto: Notes scored in amp from position M5',
              minimum: 0,
              default: 0
            },
            auto_s1: {
              type: 'integer',
              description: 'Auto: Notes scored in speaker from position S1',
              minimum: 0,
              default: 0
            },
            auto_s2: {
              type: 'integer',
              description: 'Auto: Notes scored in speaker from position S2',
              minimum: 0,
              default: 0
            },
            auto_s3: {
              type: 'integer',
              description: 'Auto: Notes scored in speaker from position S3',
              minimum: 0,
              default: 0
            },
            auto_r: {
              type: 'integer',
              description: 'Auto: Notes scored from random/other positions',
              minimum: 0,
              default: 0
            },

            // Teleop
            teleop_amp_attempts: {
              type: 'integer',
              description: 'Teleop: Total amp scoring attempts',
              minimum: 0,
              default: 0
            },
            teleop_amp_scored: {
              type: 'integer',
              description: 'Teleop: Successful amp scores (1 point each)',
              minimum: 0,
              default: 0
            },
            teleop_speaker_attempts: {
              type: 'integer',
              description: 'Teleop: Total speaker scoring attempts',
              minimum: 0,
              default: 0
            },
            teleop_speaker_scored: {
              type: 'integer',
              description: 'Teleop: Successful speaker scores (2 points each)',
              minimum: 0,
              default: 0
            },
            teleop_ground_intake: {
              type: 'integer',
              description: 'Teleop: Notes picked up from ground',
              minimum: 0,
              default: 0
            },
            teleop_source_intake: {
              type: 'integer',
              description: 'Teleop: Notes taken from human player',
              minimum: 0,
              default: 0
            },

            // Endgame
            endgame_climb: {
              type: 'string',
              enum: ['Nothing', 'Park', 'Single Climb', 'Double Climb', 'Triple Climb'],
              description: 'Endgame climbing achievement'
            },
            endgame_trap_count: {
              type: 'integer',
              description: 'Number of notes scored in trap (0-3)',
              minimum: 0,
              maximum: 3,
              default: 0
            },

            // Postgame
            driver_rating: {
              type: 'integer',
              description: 'Driver skill rating (1=poor, 5=excellent)',
              minimum: 1,
              maximum: 5,
              example: 4
            },
            robot_disabled: {
              type: 'boolean',
              description: 'Was robot disabled during match?',
              default: false
            },
            played_defense: {
              type: 'boolean',
              description: 'Did robot play defense?',
              default: false
            },
            comments: {
              type: 'string',
              description: 'Additional observations',
              example: 'Excellent autonomous, struggled with ground intake',
              maxLength: 500
            },

            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Robot Info schema
        RobotInfo: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            team_id: {
              type: 'integer',
              description: 'Foreign key to teams table'
            },
            regional: {
              type: 'string',
              example: 'Orange County'
            },

            // Capabilities
            can_score_amp: {
              type: 'boolean',
              description: 'Can robot score in amp?'
            },
            can_score_speaker: {
              type: 'boolean',
              description: 'Can robot score in speaker?'
            },
            can_ground_intake: {
              type: 'boolean',
              description: 'Can robot pick up notes from ground?'
            },
            can_source_intake: {
              type: 'boolean',
              description: 'Can robot get notes from source?'
            },
            can_climb: {
              type: 'boolean',
              description: 'Can robot climb?'
            },
            max_climb_level: {
              type: 'string',
              enum: ['None', 'Park', 'Single', 'Double', 'Triple'],
              description: 'Maximum climb capability'
            },

            // Physical
            robot_weight: {
              type: 'number',
              format: 'decimal',
              description: 'Robot weight in pounds',
              example: 120.5
            },
            robot_height: {
              type: 'number',
              format: 'decimal',
              description: 'Robot height in inches',
              example: 54.0
            },
            drive_type: {
              type: 'string',
              description: 'Type of drivetrain',
              example: 'Swerve Drive'
            },

            notes: {
              type: 'string',
              description: 'Additional notes about robot'
            },
            scouter_name: {
              type: 'string',
              description: 'Who collected this pit scouting data'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Pagination info
        Pagination: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
              example: 50
            },
            offset: {
              type: 'integer',
              example: 0
            },
            total: {
              type: 'integer',
              example: 150
            }
          }
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ]
  },
  apis: [
    './src/server.js',
    './src/routes/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
