/**
 * Scouting Routes - Match and Pit Scouting Endpoints
 * Handles data submission from mobile scouting apps
 */

const express = require('express');
const { supabase } = require('../config/database');

const router = express.Router();

// ============================================================================
// MATCH SCOUTING ENDPOINTS
// ============================================================================

/**
 * POST /api/scouting/send-data/match/pregame
 * Creates a new match record with pregame data (starting position)
 *
 * Body: TeamMatchPregame
 * {
 *   team_num: number,
 *   match_num: number,
 *   regional: string,
 *   auto_starting_position: number (0-100)
 * }
 */
router.post('/send-data/match/pregame', async (req, res) => {
    try {
        const { team_num, match_num, regional, auto_starting_position } = req.body;

        // Validate required fields
        if (!team_num || !match_num || !regional) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: team_num, match_num, regional'
            });
        }

        // Ensure team exists, create if needed
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('team_number', team_num)
            .eq('regional', regional)
            .single();

        if (teamError && teamError.code === 'PGRST116') {
            // Team doesn't exist, create it
            await supabase
                .from('teams')
                .insert({
                    team_number: team_num,
                    team_name: `Team ${team_num}`,
                    regional: regional
                });
        }

        // Insert or update match record
        const { data, error } = await supabase
            .from('team_matches')
            .upsert({
                team_num,
                match_num,
                regional,
                auto_starting_position: auto_starting_position || 0
            }, {
                onConflict: 'team_num,match_num,regional'
            })
            .select()
            .single();

        if (error) {
            console.error('Pregame insert error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            data,
            message: 'Pregame data saved successfully'
        });

    } catch (error) {
        console.error('Pregame error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/scouting/match/auto
 * Updates match with autonomous period data (coral and algae arrays)
 *
 * Body: TeamMatchAuto
 * {
 *   team_num: number,
 *   match_num: number,
 *   regional: string,
 *   coral: Coral[],    // { level: 1-4, made: boolean, timestamp: string }
 *   algae: Algae[]     // { where_scored: 'removed'|'processed'|'net', made: boolean, timestamp: string }
 * }
 */
router.put('/match/auto', async (req, res) => {
    try {
        const { team_num, match_num, regional, coral = [], algae = [] } = req.body;

        if (!team_num || !match_num || !regional) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: team_num, match_num, regional'
            });
        }

        // Verify match exists
        const { data: match, error: matchError } = await supabase
            .from('team_matches')
            .select('*')
            .eq('team_num', team_num)
            .eq('match_num', match_num)
            .eq('regional', regional)
            .single();

        if (matchError) {
            return res.status(404).json({
                success: false,
                error: 'Match not found. Create pregame data first.'
            });
        }

        // Delete existing auto coral/algae actions for this match
        await supabase
            .from('coral')
            .delete()
            .eq('team_num', team_num)
            .eq('match_num', match_num)
            .eq('regional', regional);

        await supabase
            .from('algae')
            .delete()
            .eq('team_num', team_num)
            .eq('match_num', match_num)
            .eq('regional', regional);

        // Insert coral actions
        if (coral.length > 0) {
            const coralRecords = coral.map(c => ({
                team_num,
                match_num,
                regional,
                level: c.level,
                made: c.made,
                timestamp: c.timestamp
            }));

            const { error: coralError } = await supabase
                .from('coral')
                .insert(coralRecords);

            if (coralError) {
                console.error('Coral insert error:', coralError);
                return res.status(500).json({
                    success: false,
                    error: `Coral insert failed: ${coralError.message}`
                });
            }
        }

        // Insert algae actions
        if (algae.length > 0) {
            const algaeRecords = algae.map(a => ({
                team_num,
                match_num,
                regional,
                where_scored: a.where_scored,
                made: a.made,
                timestamp: a.timestamp
            }));

            const { error: algaeError } = await supabase
                .from('algae')
                .insert(algaeRecords);

            if (algaeError) {
                console.error('Algae insert error:', algaeError);
                return res.status(500).json({
                    success: false,
                    error: `Algae insert failed: ${algaeError.message}`
                });
            }
        }

        res.json({
            success: true,
            message: 'Auto data saved successfully',
            counts: {
                coral: coral.length,
                algae: algae.length
            }
        });

    } catch (error) {
        console.error('Auto error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/scouting/match/tele
 * Updates match with teleop period data (coral, algae, and climb)
 *
 * Body: TeamMatchTele
 * {
 *   team_num: number,
 *   match_num: number,
 *   regional: string,
 *   coral: Coral[],
 *   algae: Algae[],
 *   climb: ClimbData { climb_deep: boolean, climb_shallow: boolean, park: boolean }
 * }
 */
router.put('/match/tele', async (req, res) => {
    try {
        const { team_num, match_num, regional, coral = [], algae = [], climb } = req.body;

        if (!team_num || !match_num || !regional) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: team_num, match_num, regional'
            });
        }

        // Insert coral and algae (same as auto, but these are teleop actions)
        if (coral.length > 0) {
            const coralRecords = coral.map(c => ({
                team_num,
                match_num,
                regional,
                level: c.level,
                made: c.made,
                timestamp: c.timestamp
            }));

            await supabase
                .from('coral')
                .insert(coralRecords);
        }

        if (algae.length > 0) {
            const algaeRecords = algae.map(a => ({
                team_num,
                match_num,
                regional,
                where_scored: a.where_scored,
                made: a.made,
                timestamp: a.timestamp
            }));

            await supabase
                .from('algae')
                .insert(algaeRecords);
        }

        // Update climb data in team_matches
        if (climb) {
            const { error: climbError } = await supabase
                .from('team_matches')
                .update({
                    climb_deep: climb.climb_deep || false,
                    climb_shallow: climb.climb_shallow || false,
                    park: climb.park || false
                })
                .eq('team_num', team_num)
                .eq('match_num', match_num)
                .eq('regional', regional);

            if (climbError) {
                console.error('Climb update error:', climbError);
            }
        }

        res.json({
            success: true,
            message: 'Teleop data saved successfully',
            counts: {
                coral: coral.length,
                algae: algae.length,
                climb: climb ? 'updated' : 'not provided'
            }
        });

    } catch (error) {
        console.error('Tele error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/scouting/match/postgame
 * Updates match with postgame evaluation data
 *
 * Body: TeamMatchPostGame
 * {
 *   team_num: number,
 *   match_num: number,
 *   regional: string,
 *   driver_rating: number (1-5),
 *   disabled: boolean,
 *   defence: boolean,
 *   malfunction: boolean,
 *   no_show: boolean,
 *   comments: string
 * }
 */
router.put('/match/postgame', async (req, res) => {
    try {
        const {
            team_num,
            match_num,
            regional,
            driver_rating,
            disabled,
            defence,
            malfunction,
            no_show,
            comments
        } = req.body;

        if (!team_num || !match_num || !regional) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: team_num, match_num, regional'
            });
        }

        // Log the submission to console for dashboard visibility
        console.log('📊 [SCOUTING SUBMISSION]', {
            timestamp: new Date().toISOString(),
            team: team_num,
            match: match_num,
            regional: regional,
            driver_rating: driver_rating,
            tags: {
                disabled: disabled || false,
                defence: defence || false,
                malfunction: malfunction || false,
                no_show: no_show || false
            }
        });

        const { data, error } = await supabase
            .from('team_matches')
            .update({
                driver_rating,
                disabled: disabled || false,
                defence: defence || false,
                malfunction: malfunction || false,
                no_show: no_show || false,
                comments: comments || '',
                updated_at: new Date().toISOString()
            })
            .eq('team_num', team_num)
            .eq('match_num', match_num)
            .eq('regional', regional)
            .select()
            .single();

        if (error) {
            console.error('❌ [SCOUTING ERROR] Postgame update failed:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        // Recalculate statistics after submission
        console.log('🔄 [STATS UPDATE] Recalculating statistics for Team', team_num);

        await supabase.rpc('recalculate_coral_stats', {
            p_team_num: team_num,
            p_regional: regional
        });

        await supabase.rpc('recalculate_climb_stats', {
            p_team_num: team_num,
            p_regional: regional
        });

        console.log('✅ [SCOUTING SUCCESS] Match data processed for Team', team_num, 'Match', match_num);

        res.json({
            success: true,
            data,
            message: 'Postgame data saved successfully',
            acknowledgment: {
                received: true,
                timestamp: new Date().toISOString(),
                team: team_num,
                match: match_num,
                regional: regional
            }
        });

    } catch (error) {
        console.error('❌ [SCOUTING ERROR] Postgame error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// PIT SCOUTING ENDPOINT
// ============================================================================

/**
 * PUT /api/scouting/pit/:team
 * Updates or creates pit scouting data for a team
 *
 * Body: RobotPitData
 * {
 *   team_num: number,
 *   regional: string,
 *   vision_sys: string,
 *   drive_train: string,
 *   ground_intake: boolean,
 *   source_intake: boolean,
 *   L1_scoring: boolean,
 *   L2_scoring: boolean,
 *   L3_scoring: boolean,
 *   L4_scoring: boolean,
 *   remove: boolean,
 *   processor: boolean,
 *   net: boolean,
 *   climb_deep: boolean,
 *   climb_shallow: boolean,
 *   comments: string
 * }
 */
router.put('/pit/:team', async (req, res) => {
    try {
        const teamNumber = parseInt(req.params.team);
        const {
            regional,
            vision_sys,
            drive_train,
            ground_intake,
            source_intake,
            L1_scoring,
            L2_scoring,
            L3_scoring,
            L4_scoring,
            remove,
            processor,
            net,
            climb_deep,
            climb_shallow,
            comments
        } = req.body;

        if (!regional) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: regional'
            });
        }

        // Ensure team exists
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('team_number', teamNumber)
            .eq('regional', regional)
            .single();

        if (teamError && teamError.code === 'PGRST116') {
            // Create team
            await supabase
                .from('teams')
                .insert({
                    team_number: teamNumber,
                    team_name: `Team ${teamNumber}`,
                    regional: regional
                });
        }

        // Upsert robot info
        const { data, error } = await supabase
            .from('robot_info')
            .upsert({
                team_num: teamNumber,
                regional,
                vision_sys,
                drive_train,
                ground_intake: ground_intake || false,
                source_intake: source_intake || false,
                l1_scoring: L1_scoring || false,
                l2_scoring: L2_scoring || false,
                l3_scoring: L3_scoring || false,
                l4_scoring: L4_scoring || false,
                remove: remove || false,
                processor: processor || false,
                net: net || false,
                climb_deep: climb_deep || false,
                climb_shallow: climb_shallow || false,
                comments: comments || '',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'team_num,regional'
            })
            .select()
            .single();

        if (error) {
            console.error('Pit scouting error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            data,
            message: 'Pit scouting data saved successfully'
        });

    } catch (error) {
        console.error('Pit scouting error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
