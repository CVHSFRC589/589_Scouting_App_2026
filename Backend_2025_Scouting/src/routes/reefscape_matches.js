/**
 * Reefscape Matches Routes - Match Data Retrieval (2025)
 * Handles queries for match data and match-related statistics
 */

const express = require('express');
const { supabase } = require('../config/database');

const router = express.Router();

// ============================================================================
// MATCH RETRIEVAL ENDPOINTS
// ============================================================================

/**
 * GET /api/match/:regional/:team/:match
 * Gets complete match data including coral and algae actions
 *
 * Response: TeamMatchResponse
 * {
 *   team_num, match_num, regional,
 *   auto_starting_position,
 *   climb_deep, climb_shallow, park,
 *   driver_rating, disabled, defence, malfunction, no_show, comments,
 *   coral: Coral[],
 *   algae: Algae[]
 * }
 */
router.get('/:regional/:team/:match', async (req, res) => {
    try {
        const { regional, team, match } = req.params;
        const team_num = parseInt(team);
        const match_num = parseInt(match);

        // Get match summary (includes aggregated counts)
        const { data: matchData, error: matchError } = await supabase
            .from('match_summaries')
            .select('*')
            .eq('team_num', team_num)
            .eq('match_num', match_num)
            .eq('regional', regional)
            .single();

        if (matchError) {
            if (matchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Match not found'
                });
            }
            throw matchError;
        }

        // Get individual coral actions
        const { data: coralData, error: coralError } = await supabase
            .from('coral')
            .select('*')
            .eq('team_num', team_num)
            .eq('match_num', match_num)
            .eq('regional', regional)
            .order('timestamp', { ascending: true });

        if (coralError) throw coralError;

        // Get individual algae actions
        const { data: algaeData, error: algaeError } = await supabase
            .from('algae')
            .select('*')
            .eq('team_num', team_num)
            .eq('match_num', match_num)
            .eq('regional', regional)
            .order('timestamp', { ascending: true });

        if (algaeError) throw algaeError;

        // Transform to frontend format
        const response = {
            team_num: matchData.team_num,
            match_num: matchData.match_num,
            regional: matchData.regional,
            auto_starting_position: matchData.auto_starting_position,
            climb_deep: matchData.climb_deep,
            climb_shallow: matchData.climb_shallow,
            park: matchData.park,
            driver_rating: matchData.driver_rating,
            disabled: matchData.disabled,
            defence: matchData.defence,
            malfunction: matchData.malfunction,
            no_show: matchData.no_show,
            comments: matchData.comments,
            coral: coralData.map(c => ({
                level: c.level,
                made: c.made,
                timestamp: c.timestamp
            })),
            algae: algaeData.map(a => ({
                where_scored: a.where_scored,
                made: a.made,
                timestamp: a.timestamp
            }))
        };

        res.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Match retrieval error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/matches/all/:regional/:team
 * Gets all matches for a specific team in a regional
 *
 * Response: TeamMatchResponse[]
 */
router.get('/all/:regional/:team', async (req, res) => {
    try {
        const { regional, team } = req.params;
        const team_num = parseInt(team);

        // Get all matches for the team
        const { data: matches, error: matchError } = await supabase
            .from('match_summaries')
            .select('*')
            .eq('team_num', team_num)
            .eq('regional', regional)
            .order('match_num', { ascending: true });

        if (matchError) throw matchError;

        // Get all coral actions for this team
        const { data: allCoral, error: coralError } = await supabase
            .from('coral')
            .select('*')
            .eq('team_num', team_num)
            .eq('regional', regional)
            .order('match_num', { ascending: true })
            .order('timestamp', { ascending: true });

        if (coralError) throw coralError;

        // Get all algae actions for this team
        const { data: allAlgae, error: algaeError } = await supabase
            .from('algae')
            .select('*')
            .eq('team_num', team_num)
            .eq('regional', regional)
            .order('match_num', { ascending: true })
            .order('timestamp', { ascending: true });

        if (algaeError) throw algaeError;

        // Group coral and algae by match
        const coralByMatch = {};
        allCoral.forEach(c => {
            if (!coralByMatch[c.match_num]) coralByMatch[c.match_num] = [];
            coralByMatch[c.match_num].push({
                level: c.level,
                made: c.made,
                timestamp: c.timestamp
            });
        });

        const algaeByMatch = {};
        allAlgae.forEach(a => {
            if (!algaeByMatch[a.match_num]) algaeByMatch[a.match_num] = [];
            algaeByMatch[a.match_num].push({
                where_scored: a.where_scored,
                made: a.made,
                timestamp: a.timestamp
            });
        });

        // Combine into complete match objects
        const response = matches.map(m => ({
            team_num: m.team_num,
            match_num: m.match_num,
            regional: m.regional,
            auto_starting_position: m.auto_starting_position,
            climb_deep: m.climb_deep,
            climb_shallow: m.climb_shallow,
            park: m.park,
            driver_rating: m.driver_rating,
            disabled: m.disabled,
            defence: m.defence,
            malfunction: m.malfunction,
            no_show: m.no_show,
            comments: m.comments,
            coral: coralByMatch[m.match_num] || [],
            algae: algaeByMatch[m.match_num] || []
        }));

        res.json({
            success: true,
            data: response,
            count: response.length
        });

    } catch (error) {
        console.error('Matches retrieval error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/matches/remaining/:regional/:team
 * Gets remaining (unplayed) matches for a team
 * NOTE: This requires TBA integration to know the match schedule
 * For now, returns empty array - students can implement TBA integration
 *
 * Response: number[] (array of match numbers)
 */
router.get('/remaining/:regional/:team', async (req, res) => {
    try {
        const { regional, team } = req.params;
        const team_num = parseInt(team);

        // Get matches that have been scouted
        const { data: scoutedMatches, error } = await supabase
            .from('team_matches')
            .select('match_num')
            .eq('team_num', team_num)
            .eq('regional', regional)
            .order('match_num', { ascending: true });

        if (error) throw error;

        // TODO: Get full match schedule from TBA
        // For now, we'll return an empty array
        // Students can implement TBA integration to get actual schedule

        const scoutedMatchNumbers = scoutedMatches.map(m => m.match_num);

        res.json({
            success: true,
            data: [],
            scouted: scoutedMatchNumbers,
            message: 'TBA integration needed for full match schedule'
        });

    } catch (error) {
        console.error('Remaining matches error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
