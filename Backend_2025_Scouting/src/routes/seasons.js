/**
 * Seasons Routes
 * Season management and Firebase compatibility layer
 */

const express = require('express');
const { supabase } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandling');

const router = express.Router();

// GET /api/seasons - List all seasons
router.get('/', asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('season_year', { ascending: false });

    if (error) throw new Error(`Database error: ${error.message}`);

    res.json({ success: true, data });
}));

// GET /api/seasons/:year - Get specific season with regionals
router.get('/:year', asyncHandler(async (req, res) => {
    const { year } = req.params;

    const { data, error } = await supabase
        .from('seasons')
        .select(`
            *,
            regionals (
                id,
                regional_name,
                regional_code,
                start_date,
                end_date
            )
        `)
        .eq('season_year', year)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                error: { message: 'Season not found' }
            });
        }
        throw new Error(`Database error: ${error.message}`);
    }

    res.json({ success: true, data });
}));

// GET /api/seasons/:year/regionals/:regional/teams - Firebase compatibility
// Mimics Firebase path: season/regional/teams
router.get('/:year/regionals/:regional/teams', asyncHandler(async (req, res) => {
    const { year, regional } = req.params;

    const { data, error } = await supabase
        .from('firebase_stats_percentage')
        .select(`
            team_number,
            pregame_amp_percent,
            pregame_middle_percent,
            pregame_source_percent,
            auto_taxi_percent,
            auto_m1_percent,
            auto_m2_percent,
            auto_m3_percent,
            auto_m4_percent,
            auto_m5_percent,
            auto_s1_percent,
            auto_s2_percent,
            auto_s3_percent,
            auto_r_percent,
            teleop_amp_percent,
            teleop_ground_intake_percent,
            teleop_source_intake_percent,
            teleop_speaker_percent,
            endgame_nothing_percent,
            endgame_park_percent,
            endgame_single_climb_percent,
            endgame_double_climb_percent,
            endgame_triple_climb_percent,
            endgame_0_trap_percent,
            endgame_1_trap_percent,
            endgame_2_trap_percent,
            endgame_3_trap_percent,
            postgame_driver_rating_avg,
            postgame_disabled_percent,
            postgame_defense_percent
        `)
        .eq('season_year', year)
        .eq('regional_name', regional);

    if (error) throw new Error(`Database error: ${error.message}`);

    res.json({ success: true, data });
}));

// GET /api/seasons/:year/regionals/:regional/teams/:teamNumber/stats/:type/:category/:stat
// Firebase compatibility for individual stats
// Example: /api/seasons/2025/regionals/Orange County/teams/589/stats/percentage/auto/m1
router.get('/:year/regionals/:regional/teams/:teamNumber/stats/:type/:category/:stat', asyncHandler(async (req, res) => {
    const { year, regional, teamNumber, type, category, stat } = req.params;

    // Build the column name based on Firebase path structure
    const columnName = `${category}_${stat}_${type === 'percentage' ? 'percent' : 'fraction'}`;

    const viewName = type === 'percentage' ? 'firebase_stats_percentage' : 'firebase_stats_fraction';

    const { data, error } = await supabase
        .from(viewName)
        .select(columnName)
        .eq('season_year', year)
        .eq('regional_name', regional)
        .eq('team_number', teamNumber)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                error: { message: 'Team stats not found' }
            });
        }
        throw new Error(`Database error: ${error.message}`);
    }

    // Return in Firebase-style format
    res.json({
        success: true,
        data: data[columnName],
        path: `${year}/${regional}/teams/${teamNumber}/Stats/${type === 'percentage' ? 'Percentage' : 'Fraction'}/${category}/${stat}`
    });
}));

// GET /api/seasons/:year/regionals/:regional/teams/:teamNumber/stats/rank
// Firebase compatibility for rankings
router.get('/:year/regionals/:regional/teams/:teamNumber/stats/rank', asyncHandler(async (req, res) => {
    const { year, regional, teamNumber } = req.params;

    const { data, error } = await supabase
        .from('firebase_rankings')
        .select(`
            overall_rank,
            auto_rank,
            teleop_rank,
            endgame_rank,
            overall_score,
            auto_score,
            teleop_score,
            endgame_score,
            matches_played
        `)
        .eq('season_year', year)
        .eq('regional_name', regional)
        .eq('team_number', teamNumber)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                error: { message: 'Team ranking not found' }
            });
        }
        throw new Error(`Database error: ${error.message}`);
    }

    res.json({
        success: true,
        data,
        path: `${year}/${regional}/teams/${teamNumber}/Stats/Rank`
    });
}));

// POST /api/seasons - Create new season
router.post('/', asyncHandler(async (req, res) => {
    const { season_year, season_name, game_name, start_date, end_date } = req.body;

    if (!season_year || !season_name) {
        return res.status(400).json({
            success: false,
            error: { message: 'season_year and season_name are required' }
        });
    }

    const { data, error } = await supabase
        .from('seasons')
        .insert({
            season_year,
            season_name,
            game_name,
            start_date,
            end_date,
            is_active: false // New seasons start inactive
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: { message: 'Season already exists' }
            });
        }
        throw new Error(`Database error: ${error.message}`);
    }

    res.status(201).json({
        success: true,
        data,
        message: 'Season created successfully'
    });
}));

// PUT /api/seasons/:year/activate - Activate a season (deactivate others)
router.put('/:year/activate', asyncHandler(async (req, res) => {
    const { year } = req.params;

    // Start transaction to ensure atomicity
    const { error: deactivateError } = await supabase
        .from('seasons')
        .update({ is_active: false })
        .neq('season_year', year);

    if (deactivateError) throw new Error(`Database error: ${deactivateError.message}`);

    const { data, error: activateError } = await supabase
        .from('seasons')
        .update({ is_active: true })
        .eq('season_year', year)
        .select()
        .single();

    if (activateError) {
        if (activateError.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                error: { message: 'Season not found' }
            });
        }
        throw new Error(`Database error: ${activateError.message}`);
    }

    res.json({
        success: true,
        data,
        message: `Season ${year} activated successfully`
    });
}));

module.exports = router;