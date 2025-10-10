/**
 * Dashboard Routes
 * Web interface for database management
 */

/** 
 * @swagger
 * /api/dashboard:
 *  get:
 *    summary: Backend Dashboard Home Page
 *    description: Accessable via browser at /, serves an HTML file
 *    tags: [Dashboard]
 * /api/dashboard/stats:
 *  get:
 *    summary: Dashboard Statistics
 *    description: Retrieve key statistics for the scouting app
 *    tags: [Dashboard]
 *    responses:
 *      200:
 *        description: Statistics retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  example: true
 *                data:
 *                  type: object
 *                  properties:
 *                    totalTeams:
 *                      type: integer
 *                      example: 42
 *                    totalMatches:
 *                      type: integer
 *                      example: 120
 *                    totalSeasons:
 *                      type: integer
 *                      example: 1
 *                    activeSeasons:
 *                      type: integer
 *                      example: 1
 *                    totalRegionals:
 *                      type: integer
 *                      example: 1
 * 
 * /api/dashboard/activity:
 *   get:
 *     summary: Server Activity Logs
 *     description: Retrieve recent server activity logs
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           description: Number of log entries to retrieve (default 50)
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T12:00:00Z"
 *                       type:
 *                         type: string
 *                         example: "info"
 *                       message:
 *                         type: string
 *                         example: "Server started"
 *                       details:
 *                         type: object
 *                         additionalProperties: true
 * 
 * /api/dashboard/api-key:
 *   get:
 *     summary: Get API Key for Dashboard Write Operations
 *     description: Retrieve the API key for performing write operations on the dashboard. Only accessible from localhost.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: API key retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     apiKey:
 *                       type: string
 *                       example: "your-api-key"
 */

const express = require('express');
const path = require('path');
const { supabase, setLogger: setDatabaseLogger } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandling');

const router = express.Router();

// In-memory server activity log (last 100 entries)
const serverLogs = [];
const MAX_LOGS = 100;

// Helper function to add log entry
function addLog(type, message, details = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        type, // 'info', 'success', 'warning', 'error', 'request', 'supabase', 'tba'
        message,
        details,
        id: Date.now() + Math.random()
    };

    serverLogs.unshift(logEntry); // Add to beginning
    if (serverLogs.length > MAX_LOGS) {
        serverLogs.pop(); // Remove oldest
    }

    return logEntry;
}

// Export addLog for use in other modules
router.addLog = addLog;

// Set up logger for database module
setDatabaseLogger(addLog);

// Initialize with startup log
addLog('success', 'Dashboard module initialized');

// Dashboard home page (served from static files)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Get dashboard overview statistics
router.get('/stats', asyncHandler(async (req, res) => {
    try {
        // Get teams count
        const { count: teamsCount } = await supabase
            .from('teams')
            .select('*', { count: 'exact', head: true });

        // Get matches count
        const { count: matchesCount } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true });

        res.json({
            success: true,
            data: {
                totalTeams: teamsCount || 0,
                totalMatches: matchesCount || 0,
                totalSeasons: 1,
                activeSeasons: 1,
                totalRegionals: 1
            }
        });

    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.json({
            success: true,
            data: {
                totalTeams: 0,
                totalMatches: 0,
                totalSeasons: 1,
                activeSeasons: 1,
                totalRegionals: 1
            }
        });
    }
}));

// Get server activity logs
router.get('/activity', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;

    res.json({
        success: true,
        data: serverLogs.slice(0, limit)
    });
}));

// Get API key for dashboard write operations
router.get('/api-key', asyncHandler(async (req, res) => {
    // Only provide API key if request is from localhost
    const isLocal = req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';

    if (!isLocal) {
        return res.status(403).json({
            success: false,
            error: 'API key only available from localhost'
        });
    }

    res.json({
        success: true,
        data: {
            apiKey: process.env['589_API_KEY'] || 'not-configured'
        }
    });
}));

// Middleware to log all requests to this router
router.use((req, res, next) => {
    const logMessage = `${req.method} ${req.originalUrl}`;
    addLog('request', logMessage, {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip
    });
    next();
});

module.exports = router;