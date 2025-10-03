/**
 * Teams Routes
 * Simple CRUD operations for team management
 */

const express = require('express');
const { supabase } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandling');

const router = express.Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     description: |
 *       **Learning Note**: This demonstrates a basic GET request with query parameters.
 *
 *       Returns a list of all teams in the database. You can filter by regional competition
 *       using the `regional` query parameter.
 *
 *       **Use Case**: Build a team selection dropdown, display team roster, search functionality.
 *
 *       **Try it**: Click "Execute" without parameters to see all teams, or add a regional filter.
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: regional
 *         schema:
 *           type: string
 *         description: Filter teams by regional competition name
 *         example: Orange County
 *     responses:
 *       200:
 *         description: List of teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Team'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   team_number: 589
 *                   team_name: "Falkon Robotics"
 *                   regional: "Orange County"
 *                   created_at: "2025-09-30T12:00:00Z"
 *                 - id: 2
 *                   team_number: 254
 *                   team_name: "The Cheesy Poofs"
 *                   regional: "Orange County"
 *                   created_at: "2025-09-30T12:00:00Z"
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', asyncHandler(async (req, res) => {
    const { regional } = req.query;

    let query = supabase.from('teams').select('*').order('team_number');

    if (regional) {
        query = query.eq('regional', regional);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Database error: ${error.message}`);

    res.json({ success: true, data });
}));

/**
 * @swagger
 * /api/teams/{teamNumber}:
 *   get:
 *     summary: Get a specific team by number
 *     description: |
 *       **Learning Note**: This demonstrates URL parameters (path variables).
 *
 *       Retrieves detailed information about a single team using their FRC team number.
 *
 *       **Use Case**: Display team profile page, lookup team details before scouting.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: FRC team number
 *         example: 589
 *       - in: query
 *         name: regional
 *         schema:
 *           type: string
 *         description: Optional regional filter
 *         example: Orange County
 *     responses:
 *       200:
 *         description: Team found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "Team not found"
 */
router.get('/:teamNumber', asyncHandler(async (req, res) => {
    const { teamNumber } = req.params;
    const { regional } = req.query;

    let query = supabase
        .from('teams')
        .select('*')
        .eq('team_number', teamNumber);

    if (regional) {
        query = query.eq('regional', regional);
    }

    const { data, error } = await query.single();

    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                error: { message: 'Team not found' }
            });
        }
        throw new Error(`Database error: ${error.message}`);
    }

    res.json({ success: true, data });
}));

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     description: |
 *       **Learning Note**: This demonstrates POST requests with request body validation.
 *
 *       Adds a new team to the database. The `team_number` must be unique.
 *       If `team_name` is not provided, it defaults to "Team {number}".
 *
 *       **Use Case**: Manually add teams before competition, import from TBA.
 *
 *       **Try it**: Create Team 589 if it doesn't exist yet!
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_number
 *               - regional
 *             properties:
 *               team_number:
 *                 type: integer
 *                 description: FRC team number (must be unique)
 *                 example: 589
 *               team_name:
 *                 type: string
 *                 description: Team nickname (optional)
 *                 example: "Falkon Robotics"
 *               regional:
 *                 type: string
 *                 description: Regional competition name
 *                 example: "Orange County"
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Team'
 *                     message:
 *                       type: string
 *                       example: "Team created successfully"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Team already exists (duplicate team_number)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "Team already exists in this regional"
 */
router.post('/', asyncHandler(async (req, res) => {
    const { team_number, team_name, regional } = req.body;

    if (!team_number || !regional) {
        return res.status(400).json({
            success: false,
            error: { message: 'team_number and regional are required' }
        });
    }

    const { data, error } = await supabase
        .from('teams')
        .insert({
            team_number,
            team_name: team_name || `Team ${team_number}`,
            regional
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: { message: 'Team already exists in this regional' }
            });
        }
        throw new Error(`Database error: ${error.message}`);
    }

    res.status(201).json({
        success: true,
        data,
        message: 'Team created successfully'
    });
}));

module.exports = router;