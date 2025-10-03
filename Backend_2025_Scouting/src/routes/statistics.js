const express = require('express');
const { supabase } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandling');

const router = express.Router();

async function calculateTeamStatistics(teamId, regionalId) {
    try {
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('team_id', teamId)
            .eq('regional_id', regionalId);

        if (matchError) throw new Error(`Match query error: ${matchError.message}`);

        if (!matches || matches.length === 0) {
            await initializeEmptyStatistics(teamId, regionalId);
            return;
        }

        const totalMatches = matches.length;
        const stats = calculateStatsFromMatches(matches, totalMatches);

        await updateTeamStatsPercentage(teamId, regionalId, stats.percentages);
        await updateTeamStatsFraction(teamId, regionalId, stats.fractions);
        await updateTeamRankings(teamId, regionalId, stats.scores, totalMatches);

        console.log(`Statistics updated for team ${teamId} in regional ${regionalId}`);
    } catch (error) {
        console.error('Error calculating team statistics:', error);
        throw error;
    }
}

function calculateStatsFromMatches(matches, totalMatches) {
    const counters = {
        pregame: { amp: 0, middle: 0, source: 0 },
        auto: { taxi: 0, m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, s1: 0, s2: 0, s3: 0, r: 0 },
        teleop: { amp_attempts: 0, amp_scored: 0, speaker_attempts: 0, speaker_scored: 0, ground: 0, source: 0 },
        endgame: { climb: { nothing: 0, park: 0, single: 0, double: 0, triple: 0 }, trap: { zero: 0, one: 0, two: 0, three: 0 } },
        postgame: { driver_total: 0, disabled: 0, defense: 0 }
    };

    matches.forEach(match => {
        if (match.starting_position === 'Amp') counters.pregame.amp++;
        else if (match.starting_position === 'Middle') counters.pregame.middle++;
        else if (match.starting_position === 'Source') counters.pregame.source++;

        if (match.auto_taxi) counters.auto.taxi++;
        counters.auto.m1 += match.auto_m1 || 0;
        counters.auto.m2 += match.auto_m2 || 0;
        counters.auto.m3 += match.auto_m3 || 0;
        counters.auto.m4 += match.auto_m4 || 0;
        counters.auto.m5 += match.auto_m5 || 0;
        counters.auto.s1 += match.auto_s1 || 0;
        counters.auto.s2 += match.auto_s2 || 0;
        counters.auto.s3 += match.auto_s3 || 0;
        counters.auto.r += match.auto_r || 0;

        counters.teleop.amp_attempts += match.teleop_amp_attempts || 0;
        counters.teleop.amp_scored += match.teleop_amp_scored || 0;
        counters.teleop.speaker_attempts += match.teleop_speaker_attempts || 0;
        counters.teleop.speaker_scored += match.teleop_speaker_scored || 0;
        counters.teleop.ground += match.teleop_ground_intake || 0;
        counters.teleop.source += match.teleop_source_intake || 0;

        switch (match.endgame_climb) {
            case 'Nothing': counters.endgame.climb.nothing++; break;
            case 'Park': counters.endgame.climb.park++; break;
            case 'Single Climb': counters.endgame.climb.single++; break;
            case 'Double Climb': counters.endgame.climb.double++; break;
            case 'Triple Climb': counters.endgame.climb.triple++; break;
        }

        const trapCount = match.endgame_trap_count || 0;
        switch (trapCount) {
            case 0: counters.endgame.trap.zero++; break;
            case 1: counters.endgame.trap.one++; break;
            case 2: counters.endgame.trap.two++; break;
            case 3: counters.endgame.trap.three++; break;
        }

        counters.postgame.driver_total += match.driver_rating || 0;
        if (match.robot_disabled) counters.postgame.disabled++;
        if (match.played_defense) counters.postgame.defense++;
    });

    return {
        percentages: {
            pregame_amp_percent: (counters.pregame.amp / totalMatches) * 100,
            pregame_middle_percent: (counters.pregame.middle / totalMatches) * 100,
            pregame_source_percent: (counters.pregame.source / totalMatches) * 100,
            auto_taxi_percent: (counters.auto.taxi / totalMatches) * 100,
            auto_m1_percent: Math.min((counters.auto.m1 / totalMatches) * 100, 100),
            auto_m2_percent: Math.min((counters.auto.m2 / totalMatches) * 100, 100),
            auto_m3_percent: Math.min((counters.auto.m3 / totalMatches) * 100, 100),
            auto_m4_percent: Math.min((counters.auto.m4 / totalMatches) * 100, 100),
            auto_m5_percent: Math.min((counters.auto.m5 / totalMatches) * 100, 100),
            auto_s1_percent: Math.min((counters.auto.s1 / totalMatches) * 100, 100),
            auto_s2_percent: Math.min((counters.auto.s2 / totalMatches) * 100, 100),
            auto_s3_percent: Math.min((counters.auto.s3 / totalMatches) * 100, 100),
            auto_r_percent: Math.min((counters.auto.r / totalMatches) * 100, 100),
            teleop_amp_percent: counters.teleop.amp_attempts > 0 ? (counters.teleop.amp_scored / counters.teleop.amp_attempts) * 100 : 0,
            teleop_speaker_percent: counters.teleop.speaker_attempts > 0 ? (counters.teleop.speaker_scored / counters.teleop.speaker_attempts) * 100 : 0,
            teleop_ground_intake_percent: (counters.teleop.ground / totalMatches) * 100,
            teleop_source_intake_percent: (counters.teleop.source / totalMatches) * 100,
            endgame_nothing_percent: (counters.endgame.climb.nothing / totalMatches) * 100,
            endgame_park_percent: (counters.endgame.climb.park / totalMatches) * 100,
            endgame_single_climb_percent: (counters.endgame.climb.single / totalMatches) * 100,
            endgame_double_climb_percent: (counters.endgame.climb.double / totalMatches) * 100,
            endgame_triple_climb_percent: (counters.endgame.climb.triple / totalMatches) * 100,
            endgame_0_trap_percent: (counters.endgame.trap.zero / totalMatches) * 100,
            endgame_1_trap_percent: (counters.endgame.trap.one / totalMatches) * 100,
            endgame_2_trap_percent: (counters.endgame.trap.two / totalMatches) * 100,
            endgame_3_trap_percent: (counters.endgame.trap.three / totalMatches) * 100,
            postgame_driver_rating_avg: counters.postgame.driver_total / totalMatches,
            postgame_disabled_percent: (counters.postgame.disabled / totalMatches) * 100,
            postgame_defense_percent: (counters.postgame.defense / totalMatches) * 100
        },
        fractions: {
            pregame_amp_fraction: `${counters.pregame.amp}/${totalMatches}`,
            pregame_middle_fraction: `${counters.pregame.middle}/${totalMatches}`,
            pregame_source_fraction: `${counters.pregame.source}/${totalMatches}`,
            pregame_total: totalMatches,
            auto_taxi_fraction: `${counters.auto.taxi}/${totalMatches}`,
            auto_m1_fraction: `${counters.auto.m1}/${totalMatches}`,
            auto_m2_fraction: `${counters.auto.m2}/${totalMatches}`,
            auto_m3_fraction: `${counters.auto.m3}/${totalMatches}`,
            auto_m4_fraction: `${counters.auto.m4}/${totalMatches}`,
            auto_m5_fraction: `${counters.auto.m5}/${totalMatches}`,
            auto_s1_fraction: `${counters.auto.s1}/${totalMatches}`,
            auto_s2_fraction: `${counters.auto.s2}/${totalMatches}`,
            auto_s3_fraction: `${counters.auto.s3}/${totalMatches}`,
            auto_r_fraction: `${counters.auto.r}/${totalMatches}`,
            auto_total: counters.auto.m1 + counters.auto.m2 + counters.auto.m3 + counters.auto.m4 + counters.auto.m5 + counters.auto.s1 + counters.auto.s2 + counters.auto.s3 + counters.auto.r,
            teleop_amp_fraction: `${counters.teleop.amp_scored}/${counters.teleop.amp_attempts}`,
            teleop_speaker_fraction: `${counters.teleop.speaker_scored}/${counters.teleop.speaker_attempts}`,
            teleop_ground_intake_fraction: `${counters.teleop.ground}/${totalMatches}`,
            teleop_source_intake_fraction: `${counters.teleop.source}/${totalMatches}`,
            teleop_amp_total: counters.teleop.amp_scored,
            teleop_intake_total: counters.teleop.ground + counters.teleop.source,
            teleop_speaker_total: counters.teleop.speaker_scored,
            endgame_nothing_fraction: `${counters.endgame.climb.nothing}/${totalMatches}`,
            endgame_park_fraction: `${counters.endgame.climb.park}/${totalMatches}`,
            endgame_single_climb_fraction: `${counters.endgame.climb.single}/${totalMatches}`,
            endgame_double_climb_fraction: `${counters.endgame.climb.double}/${totalMatches}`,
            endgame_triple_climb_fraction: `${counters.endgame.climb.triple}/${totalMatches}`,
            endgame_0_trap_fraction: `${counters.endgame.trap.zero}/${totalMatches}`,
            endgame_1_trap_fraction: `${counters.endgame.trap.one}/${totalMatches}`,
            endgame_2_trap_fraction: `${counters.endgame.trap.two}/${totalMatches}`,
            endgame_3_trap_fraction: `${counters.endgame.trap.three}/${totalMatches}`,
            endgame_total: totalMatches,
            postgame_disabled_fraction: `${counters.postgame.disabled}/${totalMatches}`,
            postgame_defense_fraction: `${counters.postgame.defense}/${totalMatches}`,
            postgame_total: totalMatches
        },
        scores: {
            auto_score: (counters.auto.m1 + counters.auto.m2 + counters.auto.m3 + counters.auto.m4 + counters.auto.m5) * 2 +
                       (counters.auto.s1 + counters.auto.s2 + counters.auto.s3) * 5 +
                       counters.auto.r * 3 + (counters.auto.taxi * 2),
            teleop_score: counters.teleop.amp_scored * 1 + counters.teleop.speaker_scored * 2,
            endgame_score: (counters.endgame.climb.single * 3) + (counters.endgame.climb.double * 10) + (counters.endgame.climb.triple * 20) +
                          (counters.endgame.trap.one * 5) + (counters.endgame.trap.two * 10) + (counters.endgame.trap.three * 15),
            get overall_score() { return this.auto_score + this.teleop_score + this.endgame_score; }
        }
    };
}

async function updateTeamStatsPercentage(teamId, regionalId, percentages) {
    const { error } = await supabase.from('team_stats_percentage').upsert({
        team_id: teamId, regional_id: regionalId, ...percentages, last_calculated: new Date().toISOString()
    }, { onConflict: 'team_id,regional_id' });
    if (error) throw new Error(`Error updating percentages: ${error.message}`);
}

async function updateTeamStatsFraction(teamId, regionalId, fractions) {
    const { error } = await supabase.from('team_stats_fraction').upsert({
        team_id: teamId, regional_id: regionalId, ...fractions, last_calculated: new Date().toISOString()
    }, { onConflict: 'team_id,regional_id' });
    if (error) throw new Error(`Error updating fractions: ${error.message}`);
}

async function updateTeamRankings(teamId, regionalId, scores, totalMatches) {
    const { error } = await supabase.from('team_rankings').upsert({
        team_id: teamId, regional_id: regionalId, overall_score: scores.overall_score,
        auto_score: scores.auto_score, teleop_score: scores.teleop_score, endgame_score: scores.endgame_score,
        matches_played: totalMatches, last_calculated: new Date().toISOString()
    }, { onConflict: 'team_id,regional_id' });
    if (error) throw new Error(`Error updating rankings: ${error.message}`);
}

async function initializeEmptyStatistics(teamId, regionalId) {
    await Promise.all([
        supabase.from('team_stats_percentage').upsert({ team_id: teamId, regional_id: regionalId, last_calculated: new Date().toISOString() }, { onConflict: 'team_id,regional_id' }),
        supabase.from('team_stats_fraction').upsert({ team_id: teamId, regional_id: regionalId, last_calculated: new Date().toISOString() }, { onConflict: 'team_id,regional_id' }),
        supabase.from('team_rankings').upsert({ team_id: teamId, regional_id: regionalId, matches_played: 0, last_calculated: new Date().toISOString() }, { onConflict: 'team_id,regional_id' })
    ]);
}

router.post('/calculate/:teamId/:regionalId', asyncHandler(async (req, res) => {
    const { teamId, regionalId } = req.params;
    await calculateTeamStatistics(parseInt(teamId), parseInt(regionalId));
    res.json({ success: true, message: `Statistics calculated for team ${teamId} in regional ${regionalId}` });
}));

router.post('/calculate-all/:regionalId', asyncHandler(async (req, res) => {
    const { regionalId } = req.params;
    const { data: teams, error } = await supabase.from('team_regional_participation').select('team_id').eq('regional_id', regionalId);
    if (error) throw new Error(`Database error: ${error.message}`);

    const results = [];
    for (const team of teams) {
        try {
            await calculateTeamStatistics(team.team_id, parseInt(regionalId));
            results.push({ team_id: team.team_id, status: 'success' });
        } catch (error) {
            results.push({ team_id: team.team_id, status: 'error', error: error.message });
        }
    }
    res.json({ success: true, message: `Statistics calculated for ${teams.length} teams`, results });
}));

router.get('/regional/:regionalId/rankings', asyncHandler(async (req, res) => {
    const { regionalId } = req.params;
    const { data, error } = await supabase.from('team_rankings').select('*, teams (team_number, team_name)').eq('regional_id', regionalId).order('overall_score', { ascending: false });
    if (error) throw new Error(`Database error: ${error.message}`);
    const rankedData = data.map((team, index) => ({ ...team, overall_rank: index + 1 }));
    res.json({ success: true, data: rankedData });
}));

module.exports = { router, calculateTeamStatistics };