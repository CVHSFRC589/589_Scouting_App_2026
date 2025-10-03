/**
 * Robot Info Routes (Pit Scouting)
 * Educational implementation - students can expand this
 */

const express = require('express');
const Joi = require('joi');
const { supabase } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandling');

const router = express.Router();

// Validation schema for robot info
const robotInfoSchema = Joi.object({
    team_number: Joi.number().integer().min(1).max(99999).required(),
    regional: Joi.string().min(1).max(50).required(),
    can_score_amp: Joi.boolean().default(false),
    can_score_speaker: Joi.boolean().default(false),
    can_ground_intake: Joi.boolean().default(false),
    can_source_intake: Joi.boolean().default(false),
    can_climb: Joi.boolean().default(false),
    max_climb_level: Joi.string().valid('None', 'Park', 'Single', 'Double', 'Triple').default('None'),
    robot_weight: Joi.number().positive().allow(null),
    robot_height: Joi.number().positive().allow(null),
    drive_type: Joi.string().max(50).allow(''),
    notes: Joi.string().max(1000).allow(''),
    scouter_name: Joi.string().max(100).allow('')
});

// GET /api/robot-info/:teamNumber
router.get('/:teamNumber', asyncHandler(async (req, res) => {
    const { teamNumber } = req.params;
    const { regional } = req.query;

    if (!regional) {
        return res.status(400).json({
            success: false,
            error: { message: 'Regional parameter is required' }
        });
    }

    // Get team ID first
    const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('team_number', teamNumber)
        .eq('regional', regional)
        .single();

    if (!team) {
        return res.status(404).json({
            success: false,
            error: { message: 'Team not found' }
        });
    }

    // Get robot info
    const { data, error } = await supabase
        .from('robot_info')
        .select(`
            *,
            teams:team_id (
                team_number,
                team_name
            )
        `)
        .eq('team_id', team.id)
        .eq('regional', regional)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
        return res.status(404).json({
            success: false,
            error: { message: 'Robot info not found for this team' }
        });
    }

    res.json({
        success: true,
        data: data
    });
}));

// POST /api/robot-info
router.post('/', asyncHandler(async (req, res) => {
    // Validate input
    const { error: validationError, value } = robotInfoSchema.validate(req.body);
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
                team_name: `Team ${value.team_number}`
            })
            .select()
            .single();

        if (teamError) {
            throw new Error(`Error creating team: ${teamError.message}`);
        }

        team = newTeam;
    }

    // Create robot info record
    const robotData = { ...value, team_id: team.id };
    delete robotData.team_number; // Remove since we now have team_id

    const { data, error } = await supabase
        .from('robot_info')
        .upsert(robotData) // Use upsert to handle updates
        .select(`
            *,
            teams:team_id (
                team_number,
                team_name
            )
        `)
        .single();

    if (error) {
        throw new Error(`Error saving robot info: ${error.message}`);
    }

    res.status(201).json({
        success: true,
        data: data,
        message: 'Robot info saved successfully'
    });
}));

module.exports = router;