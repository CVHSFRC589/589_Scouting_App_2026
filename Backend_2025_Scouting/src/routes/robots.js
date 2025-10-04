/**
 * Robots Routes - Robot Data Retrieval and Rankings
 * Handles queries for robot statistics, rankings, and leaderboards
 */

const express = require('express');
const { supabase } = require('../config/database');

const router = express.Router();

// ============================================================================
// ROBOT RETRIEVAL ENDPOINTS
// ============================================================================

/**
 * GET /api/robots/:regional
 * Gets all robots for a regional with complete statistics
 *
 * Response: RobotStats[]
 * Uses the robots_complete view which joins all relevant data
 */
router.get('/:regional', async (req, res) => {
    try {
        const { regional } = req.params;

        const { data, error } = await supabase
            .from('robots_complete')
            .select('*')
            .eq('regional', regional)
            .order('rank_value', { ascending: true });

        if (error) {
            console.error('Robots retrieval error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        // Transform to match frontend RobotStats interface
        const robots = data.map(robot => ({
            team_num: robot.team_num,
            team_name: robot.team_name,
            regional: robot.regional,
            rank_value: robot.rank_value,

            // Pit scouting
            vision_sys: robot.vision_sys,
            drive_train: robot.drive_train,
            ground_intake: robot.ground_intake,
            source_intake: robot.source_intake,
            l1_scoring: robot.l1_scoring,
            l2_scoring: robot.l2_scoring,
            l3_scoring: robot.l3_scoring,
            l4_scoring: robot.l4_scoring,
            remove: robot.remove,
            processor: robot.processor,
            net: robot.net,
            climb_deep: robot.climb_deep,
            climb_shallow: robot.climb_shallow,
            comments: robot.comments,
            picture_path: robot.picture_path,

            // Statistics
            avg_l1: parseFloat(robot.avg_l1) || 0,
            avg_l2: parseFloat(robot.avg_l2) || 0,
            avg_l3: parseFloat(robot.avg_l3) || 0,
            avg_l4: parseFloat(robot.avg_l4) || 0,
            avg_coral: parseFloat(robot.avg_coral) || 0,
            avg_algae_scored: parseFloat(robot.avg_algae_scored) || 0,
            avg_algae_removed: parseFloat(robot.avg_algae_removed) || 0,
            avg_algae_processed: parseFloat(robot.avg_algae_processed) || 0,
            avg_algae: parseFloat(robot.avg_algae) || 0,

            // Matches array
            matches: robot.matches || []
        }));

        res.json({
            success: true,
            data: robots,
            count: robots.length
        });

    } catch (error) {
        console.error('Robots retrieval error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/robots/ranking/sorted/:regional
 * Gets robots sorted by a specific field
 *
 * Body: SortFieldParams
 * {
 *   RANK: boolean,
 *   ALGAE_SCORED: boolean,
 *   ALGAE_REMOVED: boolean,
 *   ALGAE_PROCESSED: boolean,
 *   ALGAE_AVG: boolean,
 *   CORAL_L1: boolean,
 *   CORAL_L2: boolean,
 *   CORAL_L3: boolean,
 *   CORAL_L4: boolean,
 *   CORAL_AVG: boolean
 * }
 */
router.post('/ranking/sorted/:regional', async (req, res) => {
    try {
        const { regional } = req.params;
        const sortParams = req.body;

        // Determine which field to sort by (first true value)
        let orderByField = 'rank_value';
        let ascending = true;

        if (sortParams.RANK) {
            orderByField = 'rank_value';
            ascending = true;
        } else if (sortParams.ALGAE_SCORED) {
            orderByField = 'avg_algae_scored';
            ascending = false;
        } else if (sortParams.ALGAE_REMOVED) {
            orderByField = 'avg_algae_removed';
            ascending = false;
        } else if (sortParams.ALGAE_PROCESSED) {
            orderByField = 'avg_algae_processed';
            ascending = false;
        } else if (sortParams.ALGAE_AVG) {
            orderByField = 'avg_algae';
            ascending = false;
        } else if (sortParams.CORAL_L1) {
            orderByField = 'avg_l1';
            ascending = false;
        } else if (sortParams.CORAL_L2) {
            orderByField = 'avg_l2';
            ascending = false;
        } else if (sortParams.CORAL_L3) {
            orderByField = 'avg_l3';
            ascending = false;
        } else if (sortParams.CORAL_L4) {
            orderByField = 'avg_l4';
            ascending = false;
        } else if (sortParams.CORAL_AVG) {
            orderByField = 'avg_coral';
            ascending = false;
        }

        const { data, error } = await supabase
            .from('robots_complete')
            .select('*')
            .eq('regional', regional)
            .order(orderByField, { ascending });

        if (error) {
            console.error('Sorted robots retrieval error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        // Transform to match frontend format
        const robots = data.map(robot => ({
            team_num: robot.team_num,
            team_name: robot.team_name,
            regional: robot.regional,
            rank_value: robot.rank_value,
            vision_sys: robot.vision_sys,
            drive_train: robot.drive_train,
            ground_intake: robot.ground_intake,
            source_intake: robot.source_intake,
            l1_scoring: robot.l1_scoring,
            l2_scoring: robot.l2_scoring,
            l3_scoring: robot.l3_scoring,
            l4_scoring: robot.l4_scoring,
            remove: robot.remove,
            processor: robot.processor,
            net: robot.net,
            climb_deep: robot.climb_deep,
            climb_shallow: robot.climb_shallow,
            comments: robot.comments,
            picture_path: robot.picture_path,
            avg_l1: parseFloat(robot.avg_l1) || 0,
            avg_l2: parseFloat(robot.avg_l2) || 0,
            avg_l3: parseFloat(robot.avg_l3) || 0,
            avg_l4: parseFloat(robot.avg_l4) || 0,
            avg_coral: parseFloat(robot.avg_coral) || 0,
            avg_algae_scored: parseFloat(robot.avg_algae_scored) || 0,
            avg_algae_removed: parseFloat(robot.avg_algae_removed) || 0,
            avg_algae_processed: parseFloat(robot.avg_algae_processed) || 0,
            avg_algae: parseFloat(robot.avg_algae) || 0,
            matches: robot.matches || []
        }));

        res.json({
            success: true,
            data: robots,
            count: robots.length,
            sorted_by: orderByField
        });

    } catch (error) {
        console.error('Sorted robots error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/robot/rank/:regional
 * Updates robot rankings from TBA (placeholder for future TBA integration)
 *
 * Body: { team_rankings: { [team_num]: rank_value } }
 */
router.put('/rank/:regional', async (req, res) => {
    try {
        const { regional } = req.params;
        const { team_rankings } = req.body;

        if (!team_rankings || typeof team_rankings !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'team_rankings object required'
            });
        }

        const updates = [];
        for (const [team_num, rank_value] of Object.entries(team_rankings)) {
            updates.push({
                team_num: parseInt(team_num),
                regional,
                rank_value: parseFloat(rank_value),
                last_updated: new Date().toISOString()
            });
        }

        const { data, error } = await supabase
            .from('robot_rankings')
            .upsert(updates, {
                onConflict: 'team_num,regional'
            });

        if (error) {
            console.error('Rankings update error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: `Updated rankings for ${updates.length} teams`,
            updated_count: updates.length
        });

    } catch (error) {
        console.error('Rankings update error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
