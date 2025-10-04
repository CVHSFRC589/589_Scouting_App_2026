/**
 * Reefscape Statistics Routes - Statistics Calculation (2025)
 * Handles calculation and retrieval of team statistics
 */

const express = require('express');
const { supabase } = require('../config/database');

const router = express.Router();

// ============================================================================
// STATISTICS CALCULATION ENDPOINTS
// ============================================================================

/**
 * PUT /api/stats/coral/:team/:regional/avg
 * Recalculates coral statistics for a team
 *
 * Calls the recalculate_coral_stats() database function
 */
router.put('/coral/:team/:regional/avg', async (req, res) => {
    try {
        const team_num = parseInt(req.params.team);
        const { regional } = req.params;

        // Call the database function
        const { error } = await supabase
            .rpc('recalculate_coral_stats', {
                p_team_num: team_num,
                p_regional: regional
            });

        if (error) {
            console.error('Coral stats calculation error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        // Fetch the updated stats
        const { data, error: fetchError } = await supabase
            .from('robot_coral_stats')
            .select('*')
            .eq('team_num', team_num)
            .eq('regional', regional)
            .single();

        if (fetchError) throw fetchError;

        res.json({
            success: true,
            data,
            message: 'Coral statistics recalculated successfully'
        });

    } catch (error) {
        console.error('Coral stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/stats/algae/:team/:regional/avg
 * Recalculates algae statistics for a team
 *
 * Calls the recalculate_algae_stats() database function
 */
router.put('/algae/:team/:regional/avg', async (req, res) => {
    try {
        const team_num = parseInt(req.params.team);
        const { regional } = req.params;

        // Call the database function
        const { error } = await supabase
            .rpc('recalculate_algae_stats', {
                p_team_num: team_num,
                p_regional: regional
            });

        if (error) {
            console.error('Algae stats calculation error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        // Fetch the updated stats
        const { data, error: fetchError } = await supabase
            .from('robot_algae_stats')
            .select('*')
            .eq('team_num', team_num)
            .eq('regional', regional)
            .single();

        if (fetchError) throw fetchError;

        res.json({
            success: true,
            data,
            message: 'Algae statistics recalculated successfully'
        });

    } catch (error) {
        console.error('Algae stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/stats/climb/:team/:regional
 * Recalculates climb statistics for a team
 *
 * Calls the recalculate_climb_stats() database function
 */
router.put('/climb/:team/:regional', async (req, res) => {
    try {
        const team_num = parseInt(req.params.team);
        const { regional } = req.params;

        // Call the database function
        const { error } = await supabase
            .rpc('recalculate_climb_stats', {
                p_team_num: team_num,
                p_regional: regional
            });

        if (error) {
            console.error('Climb stats calculation error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        // Fetch the updated stats
        const { data, error: fetchError } = await supabase
            .from('robot_climb_stats')
            .select('*')
            .eq('team_num', team_num)
            .eq('regional', regional)
            .single();

        if (fetchError) throw fetchError;

        res.json({
            success: true,
            data,
            message: 'Climb statistics recalculated successfully'
        });

    } catch (error) {
        console.error('Climb stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/stats/recalculate-all/:regional
 * Recalculates all statistics for all teams in a regional
 * Useful after importing data or making bulk updates
 */
router.post('/recalculate-all/:regional', async (req, res) => {
    try {
        const { regional } = req.params;

        // Get all teams in this regional
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('team_number')
            .eq('regional', regional);

        if (teamsError) throw teamsError;

        const results = {
            success: [],
            failed: []
        };

        // Recalculate for each team
        for (const team of teams) {
            try {
                // Coral stats
                await supabase.rpc('recalculate_coral_stats', {
                    p_team_num: team.team_number,
                    p_regional: regional
                });

                // Algae stats
                await supabase.rpc('recalculate_algae_stats', {
                    p_team_num: team.team_number,
                    p_regional: regional
                });

                // Climb stats
                await supabase.rpc('recalculate_climb_stats', {
                    p_team_num: team.team_number,
                    p_regional: regional
                });

                results.success.push(team.team_number);
            } catch (teamError) {
                console.error(`Error recalculating for team ${team.team_number}:`, teamError);
                results.failed.push({
                    team_num: team.team_number,
                    error: teamError.message
                });
            }
        }

        res.json({
            success: true,
            message: `Recalculated statistics for ${results.success.length} teams`,
            results
        });

    } catch (error) {
        console.error('Bulk recalculation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// CLIMBING STATISTICS ENDPOINT
// ============================================================================

/**
 * GET /api/climbing/:regional/:team
 * Gets climb statistics for a team
 *
 * Response: ClimbData
 * {
 *   deep_count: number,
 *   shallow_count: number,
 *   park_count: number,
 *   total_matches: number
 * }
 */
router.get('/:regional/:team', async (req, res) => {
    try {
        const { regional, team } = req.params;
        const team_num = parseInt(team);

        const { data, error } = await supabase
            .from('robot_climb_stats')
            .select('*')
            .eq('team_num', team_num)
            .eq('regional', regional)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No stats yet, return zeros
                return res.json({
                    success: true,
                    data: {
                        deep_count: 0,
                        shallow_count: 0,
                        park_count: 0,
                        total_matches: 0
                    }
                });
            }
            throw error;
        }

        res.json({
            success: true,
            data: {
                deep_count: data.deep_count,
                shallow_count: data.shallow_count,
                park_count: data.park_count,
                total_matches: data.total_matches
            }
        });

    } catch (error) {
        console.error('Climb stats retrieval error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
