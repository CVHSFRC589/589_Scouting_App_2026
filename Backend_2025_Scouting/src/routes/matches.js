/**
 * Matches Routes
 * Educational example of REST API endpoints for match data
 *
 * This demonstrates:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Data validation
 * - Error handling
 * - SQL query examples
 */

const express = require('express');
const Joi = require('joi');
const { supabase } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandling');

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const matchSchema = Joi.object({
    team_number: Joi.number().integer().min(1).max(99999).required(),
    match_number: Joi.number().integer().min(1).required(),
    regional: Joi.string().min(1).max(50).required(),
    scouter_name: Joi.string().max(100),

    // Pregame
    starting_position: Joi.string().valid('Amp', 'Middle', 'Source'),

    // Autonomous
    auto_taxi: Joi.boolean().default(false),
    auto_m1: Joi.number().integer().min(0).default(0),
    auto_m2: Joi.number().integer().min(0).default(0),
    auto_m3: Joi.number().integer().min(0).default(0),
    auto_m4: Joi.number().integer().min(0).default(0),
    auto_m5: Joi.number().integer().min(0).default(0),
    auto_s1: Joi.number().integer().min(0).default(0),
    auto_s2: Joi.number().integer().min(0).default(0),
    auto_s3: Joi.number().integer().min(0).default(0),
    auto_r: Joi.number().integer().min(0).default(0),

    // Teleop
    teleop_amp_attempts: Joi.number().integer().min(0).default(0),
    teleop_amp_scored: Joi.number().integer().min(0).default(0),
    teleop_speaker_attempts: Joi.number().integer().min(0).default(0),
    teleop_speaker_scored: Joi.number().integer().min(0).default(0),
    teleop_ground_intake: Joi.number().integer().min(0).default(0),
    teleop_source_intake: Joi.number().integer().min(0).default(0),

    // Endgame
    endgame_climb: Joi.string().valid('Nothing', 'Park', 'Single Climb', 'Double Climb', 'Triple Climb'),
    endgame_trap_count: Joi.number().integer().min(0).max(3).default(0),

    // Postgame
    driver_rating: Joi.number().integer().min(1).max(5),
    robot_disabled: Joi.boolean().default(false),
    played_defense: Joi.boolean().default(false),
    comments: Joi.string().max(500).allow('')
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get match scouting data with filtering
 *     description: |
 *       **Learning Note**: This demonstrates complex query parameters and pagination.
 *
 *       Returns match scouting data with optional filters. Supports pagination to handle
 *       large datasets efficiently.
 *
 *       **Use Case**: Display match history, filter by team/regional, build analytics.
 *
 *       **Performance Tip**: Use `limit` and `offset` for large datasets (>100 matches).
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: team_number
 *         schema:
 *           type: integer
 *         description: Filter by team number
 *         example: 589
 *       - in: query
 *         name: regional
 *         schema:
 *           type: string
 *         description: Filter by regional competition
 *         example: Orange County
 *       - in: query
 *         name: match_number
 *         schema:
 *           type: integer
 *         description: Filter by specific match number
 *         example: 15
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip (for pagination)
 *     responses:
 *       200:
 *         description: Match data retrieved successfully
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
 *                         $ref: '#/components/schemas/Match'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 * 
 * /api/matches/{id}:
 *   get:
 *     summary: Get a specific match by ID
 *     description: Grab a specific match record using its unique ID.
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the match
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Match data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Match'
 * /api/matches:
 *   post:
 *     summary: Submit match scouting data
 *     description: |
 *       **Learning Note**: This is the most important endpoint! It demonstrates:
 *       - Complex data validation with Joi
 *       - Creating related records (team if doesn't exist)
 *       - Triggering side effects (statistics calculation)
 *
 *       **Use Case**: Mobile app submits match data collected during competition.
 *
 *       **Workflow**:
 *       1. Validates all field values
 *       2. Creates team if it doesn't exist
 *       3. Saves match data
 *       4. Triggers statistics recalculation (async)
 *       5. Returns saved match with team info
 *
 *       **Try it**: Submit a test match for Team 589!
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Match'
 *           example:
 *             team_number: 589
 *             match_number: 15
 *             regional: "Orange County"
 *             scouter_name: "John Doe"
 *             starting_position: "Middle"
 *             auto_taxi: true
 *             auto_m1: 2
 *             auto_s1: 1
 *             teleop_amp_attempts: 8
 *             teleop_amp_scored: 6
 *             teleop_speaker_attempts: 12
 *             teleop_speaker_scored: 9
 *             teleop_ground_intake: 5
 *             teleop_source_intake: 3
 *             endgame_climb: "Double Climb"
 *             endgame_trap_count: 1
 *             driver_rating: 4
 *             robot_disabled: false
 *             played_defense: false
 *             comments: "Excellent autonomous, good speaker accuracy"
 *     responses:
 *       201:
 *         description: Match data saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Match'
 *                     message:
 *                       type: string
 *                       example: "Match created successfully"
 *       400:
 *         description: Validation error (invalid field values)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "\"teleop_amp_scored\" must be less than or equal to ref:teleop_amp_attempts"
 */
router.get('/', asyncHandler(async (req, res) => {
    const { team_number, regional, match_number, limit = 50, offset = 0 } = req.query;

    let query = supabase
        .from('matches')
        .select(`
            *,
            teams:team_id (
                team_number,
                team_name
            )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Apply filters
    if (team_number) {
        // First get the team ID
        const { data: teamData } = await supabase
            .from('teams')
            .select('id')
            .eq('team_number', team_number)
            .single();

        if (teamData) {
            query = query.eq('team_id', teamData.id);
        }
    }

    if (regional) {
        query = query.eq('regional', regional);
    }

    if (match_number) {
        query = query.eq('match_number', match_number);
    }

    const { data, error, count } = await query;

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    res.json({
        success: true,
        data: data,
        pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: count
        }
    });
}));

/**
 * GET /api/matches/:id
 * Get a specific match by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('matches')
        .select(`
            *,
            teams:team_id (
                team_number,
                team_name
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // Not found
            return res.status(404).json({
                success: false,
                error: { message: 'Match not found' }
            });
        }
        throw new Error(`Database error: ${error.message}`);
    }

    res.json({
        success: true,
        data: data
    });
}));

router.post('/', asyncHandler(async (req, res) => {
    // Validate input data
    const { error: validationError, value } = matchSchema.validate(req.body);
    if (validationError) {
        return res.status(400).json({
            success: false,
            error: { message: validationError.details[0].message }
        });
    }

    // Get or create team
    let { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('team_number', value.team_number)
        .eq('regional', value.regional)
        .single();

    if (!team) {
        // Create team if it doesn't exist
        const { data: newTeam, error: teamError } = await supabase
            .from('teams')
            .insert({
                team_number: value.team_number,
                regional: value.regional,
                team_name: `Team ${value.team_number}` // Default name
            })
            .select()
            .single();

        if (teamError) {
            throw new Error(`Error creating team: ${teamError.message}`);
        }

        team = newTeam;
    }

    // Create match record
    const matchData = { ...value, team_id: team.id };
    delete matchData.team_number; // Remove since we now have team_id

    const { data, error } = await supabase
        .from('matches')
        .insert(matchData)
        .select(`
            *,
            teams:team_id (
                team_number,
                team_name
            )
        `)
        .single();

    if (error) {
        throw new Error(`Error creating match: ${error.message}`);
    }

    // Trigger statistics recalculation (async)
    // Note: In a real app, you might use a queue system for this
    try {
        await calculateTeamStatistics(team.id, value.regional);
    } catch (statsError) {
        console.error('Error calculating statistics:', statsError);
        // Don't fail the request if stats calculation fails
    }

    res.status(201).json({
        success: true,
        data: data,
        message: 'Match created successfully'
    });
}));

/**
 * PUT /api/matches/:id
 * Update an existing match
 */
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate input data (partial update allowed)
    const updateSchema = matchSchema.fork(Object.keys(matchSchema.describe().keys), (schema) => schema.optional());
    const { error: validationError, value } = updateSchema.validate(req.body);

    if (validationError) {
        return res.status(400).json({
            success: false,
            error: { message: validationError.details[0].message }
        });
    }

    // Update match
    const { data, error } = await supabase
        .from('matches')
        .update({ ...value, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
            *,
            teams:team_id (
                team_number,
                team_name
            )
        `)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // Not found
            return res.status(404).json({
                success: false,
                error: { message: 'Match not found' }
            });
        }
        throw new Error(`Database error: ${error.message}`);
    }

    // Trigger statistics recalculation
    try {
        await calculateTeamStatistics(data.team_id, data.regional);
    } catch (statsError) {
        console.error('Error calculating statistics:', statsError);
    }

    res.json({
        success: true,
        data: data,
        message: 'Match updated successfully'
    });
}));

/**
 * DELETE /api/matches/:id
 * Delete a match
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get match info before deletion for stats recalculation
    const { data: matchData } = await supabase
        .from('matches')
        .select('team_id, regional')
        .eq('id', id)
        .single();

    if (!matchData) {
        return res.status(404).json({
            success: false,
            error: { message: 'Match not found' }
        });
    }

    // Delete match
    const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    // Recalculate statistics
    try {
        await calculateTeamStatistics(matchData.team_id, matchData.regional);
    } catch (statsError) {
        console.error('Error calculating statistics:', statsError);
    }

    res.json({
        success: true,
        message: 'Match deleted successfully'
    });
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate team statistics based on match data
 * This will be expanded in the statistics module
 */
async function calculateTeamStatistics(teamId, regional) {
    // This is a placeholder - the full implementation will be in the statistics service
    console.log(`Recalculating statistics for team ${teamId} in ${regional}`);

    // Get all matches for this team
    const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('team_id', teamId)
        .eq('regional', regional);

    if (!matches || matches.length === 0) {
        return;
    }

    // Calculate basic statistics (this is a simplified example)
    const totalMatches = matches.length;
    const taxiRate = matches.filter(m => m.auto_taxi).length / totalMatches * 100;

    // Store statistics
    await supabase
        .from('team_statistics')
        .upsert({
            team_id: teamId,
            regional: regional,
            stat_category: 'auto',
            stat_name: 'taxi_rate',
            stat_value: taxiRate,
            stat_fraction: `${matches.filter(m => m.auto_taxi).length}/${totalMatches}`,
            total_matches: totalMatches
        });
}

module.exports = router;