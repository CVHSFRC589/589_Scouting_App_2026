/**
 * 589 FRC Scouting API Server
 * Educational backend for high school robotics team
 *
 * This file demonstrates basic Express.js server setup and REST API concepts
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Import our route modules
const teamsRoutes = require('./routes/teams');
const matchesRoutes = require('./routes/matches');
const robotInfoRoutes = require('./routes/robotInfo');
const dashboardRoutes = require('./routes/dashboard');
const tbaRoutes = require('./routes/tba');
// const seasonsRoutes = require('./routes/seasons'); // Table not yet created in database
// const { router: statisticsRoutes } = require('./routes/statistics');

// 2025 Reefscape routes
const scoutingRoutes = require('./routes/scouting');
const robotsRoutes = require('./routes/robots');
const reefscapeMatchesRoutes = require('./routes/reefscape_matches');
const reefscapeStatsRoutes = require('./routes/reefscape_stats');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandling');
const { validateApiKey, validateApiKeyForWrites } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware with relaxed CSP for development
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS - allow our mobile app and web interface to connect
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:19006'],
    credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Custom activity logger middleware (log API requests to dashboard)
app.use((req, res, next) => {
    // Skip logging for static files and health checks
    if (req.path.startsWith('/api/') && req.path !== '/api/dashboard/activity') {
        const logMessage = `${req.method} ${req.path}`;
        // We'll add this to dashboard logs after routes are loaded
        if (dashboardRoutes.addLog) {
            dashboardRoutes.addLog('request', logMessage, {
                method: req.method,
                path: req.path,
                ip: req.ip || req.connection.remoteAddress
            });
        }
    }
    next();
});

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// ============================================================================
// ROUTES
// ============================================================================

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Team 589 Scouting API Docs',
    customfavIcon: '/favicon.ico'
}));

// Swagger JSON endpoint (for external tools)
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: |
 *       **For DevOps/Deployment**: Quick endpoint to verify server is running.
 *       Used by monitoring tools, load balancers, and deployment scripts.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * @swagger
 * /api/info:
 *   get:
 *     summary: API information and available endpoints
 *     description: |
 *       Returns basic information about the API and lists all available endpoints.
 *       Good starting point for discovering the API structure.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 team:
 *                   type: string
 *                 version:
 *                   type: string
 *                 endpoints:
 *                   type: object
 *                 documentation:
 *                   type: string
 */
app.get('/api/info', (req, res) => {
    res.json({
        message: 'Team 589 Falkon Robotics - Scouting API (2025 Reefscape)',
        team: 'Team 589 Falkon Robotics',
        version: '2.0.0',
        game: '2025 Reefscape',
        endpoints: {
            // Legacy 2024 routes
            teams: '/api/teams',
            matches: '/api/matches',
            robotInfo: '/api/robot-info',

            // 2025 Reefscape routes
            scouting: '/api/scouting',
            robots: '/api/robots',
            match: '/api/match',
            stats: '/api/stats',
            climbing: '/api/climbing',

            // System
            dashboard: '/api/dashboard',
            tba: '/api/tba'
        },
        documentation: '/api-docs'
    });
});

// API Routes with validation middleware
// Read operations (GET) are public, write operations (POST/PUT/DELETE) require API key

// Legacy 2024 routes
app.use('/api/teams', validateApiKeyForWrites, teamsRoutes);
app.use('/api/matches', validateApiKeyForWrites, matchesRoutes);
app.use('/api/robot-info', validateApiKeyForWrites, robotInfoRoutes);

// 2025 Reefscape routes
app.use('/api/scouting', validateApiKeyForWrites, scoutingRoutes);
app.use('/api/robots', validateApiKeyForWrites, robotsRoutes);
app.use('/api/match', validateApiKeyForWrites, reefscapeMatchesRoutes);
app.use('/api/matches', validateApiKeyForWrites, reefscapeMatchesRoutes); // Also accessible via /matches
app.use('/api/stats', validateApiKeyForWrites, reefscapeStatsRoutes);
app.use('/api/climbing', validateApiKeyForWrites, reefscapeStatsRoutes); // Climbing is part of stats

// System routes
app.use('/api/dashboard', validateApiKeyForWrites, dashboardRoutes);
app.use('/api/tba', validateApiKeyForWrites, tbaRoutes);

// app.use('/api/seasons', validateApiKeyForWrites, seasonsRoutes); // Table not yet created
// app.use('/api/statistics', validateApiKeyForWrites, statisticsRoutes);

// Set up TBA logger (after dashboard route is loaded)
if (tbaRoutes.setLogger && dashboardRoutes.addLog) {
    tbaRoutes.setLogger(dashboardRoutes.addLog);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
    console.log(`🚀 FRC Scouting API running on port ${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}`);
    console.log(`🔧 Health check at http://localhost:${PORT}/health`);
    console.log(`📖 API Documentation at http://localhost:${PORT}/api-docs`);
    console.log(`📄 OpenAPI Spec at http://localhost:${PORT}/api-docs.json`);

    if (process.env.NODE_ENV === 'development') {
        console.log(`\n💡 Frontend students: Share this URL for API docs!`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;