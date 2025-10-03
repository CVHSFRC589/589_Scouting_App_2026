/**
 * The Blue Alliance API Integration Routes
 * Handles fetching team data from TBA and saving to local database
 *
 * @swagger
 * tags:
 *   name: TBA Integration
 *   description: |
 *     Import official FRC competition data from The Blue Alliance.
 *
 *     **What is TBA?** The Blue Alliance is the official data source for FRC competitions.
 *     It provides team rosters, match results, and event schedules.
 *
 *     **Setup Required**: Add `TBA_AUTH_KEY` to your `.env` file.
 *     Get your key at: https://www.thebluealliance.com/account
 */

const express = require('express');
const { supabase } = require('../config/database');
const router = express.Router();

// TBA API configuration
const TBA_BASE_URL = 'https://www.thebluealliance.com/api/v3';
const TBA_AUTH_KEY = process.env.TBA_API_KEY || process.env.TBA_AUTH_KEY; // Support both variable names

// Logging function reference (will be set by dashboard module)
let dashboardLogger = null;

router.setLogger = function(loggerFn) {
    dashboardLogger = loggerFn;
};

/**
 * Helper function to fetch data from The Blue Alliance API
 */
async function fetchFromTBA(endpoint) {
    if (!TBA_AUTH_KEY) {
        throw new Error('TBA_AUTH_KEY not configured. Please set your The Blue Alliance API key in environment variables.');
    }

    // Log the TBA API call
    if (dashboardLogger) {
        dashboardLogger('tba', `GET ${endpoint}`);
    }

    const response = await fetch(`${TBA_BASE_URL}${endpoint}`, {
        headers: {
            'X-TBA-Auth-Key': TBA_AUTH_KEY,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`TBA API error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
}

/**
 * GET /api/tba/status
 * Check if TBA API is available and responding
 */
router.get('/status', async (req, res) => {
    try {
        if (!TBA_AUTH_KEY) {
            return res.json({
                success: false,
                message: 'TBA API key not configured'
            });
        }

        // Make a simple request to check TBA API status
        await fetchFromTBA('/status');

        res.json({
            success: true,
            message: 'TBA API is responding'
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/tba/team/:teamNumber
 * Fetch team information from The Blue Alliance
 */
router.get('/team/:teamNumber', async (req, res) => {
    try {
        const { teamNumber } = req.params;
        const teamKey = `frc${teamNumber}`;

        // Fetch team data from TBA
        const teamData = await fetchFromTBA(`/team/${teamKey}`);

        // Also fetch 2025 events for this team
        let events2025 = [];
        try {
            events2025 = await fetchFromTBA(`/team/${teamKey}/events/2025`);
        } catch (error) {
            console.log(`No 2025 events found for team ${teamNumber}:`, error.message);
        }

        res.json({
            success: true,
            data: {
                team: teamData,
                events2025: events2025
            }
        });

    } catch (error) {
        console.error('Error fetching team from TBA:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/tba/team/:teamNumber/save
 * Save TBA team data to local Supabase database
 */
router.post('/team/:teamNumber/save', async (req, res) => {
    try {
        const { teamNumber } = req.params;
        const { regional } = req.body;

        if (!regional) {
            return res.status(400).json({
                success: false,
                error: 'Regional is required to save team data'
            });
        }

        const teamKey = `frc${teamNumber}`;

        // Fetch team data from TBA
        const teamData = await fetchFromTBA(`/team/${teamKey}`);

        // Map TBA data to our database schema
        const teamRecord = {
            team_number: parseInt(teamNumber),
            team_name: teamData.nickname || teamData.name || `Team ${teamNumber}`,
            regional: regional
        };

        // Insert into Supabase (or update if exists)
        const { data, error } = await supabase
            .from('teams')
            .upsert(teamRecord, {
                onConflict: 'team_number',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: `Team ${teamNumber} saved successfully`,
            data: data[0],
            tbaData: {
                name: teamData.name,
                nickname: teamData.nickname,
                city: teamData.city,
                state_prov: teamData.state_prov,
                country: teamData.country,
                website: teamData.website,
                rookie_year: teamData.rookie_year
            }
        });

    } catch (error) {
        console.error('Error saving team from TBA:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/tba/events/2025
 * Get all 2025 FRC events
 */
router.get('/events/2025', async (req, res) => {
    try {
        const events = await fetchFromTBA('/events/2025');

        res.json({
            success: true,
            data: events
        });

    } catch (error) {
        console.error('Error fetching 2025 events:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/tba/event/:eventKey/teams
 * Get all teams participating in a specific event
 */
router.get('/event/:eventKey/teams', async (req, res) => {
    try {
        const { eventKey } = req.params;
        const teams = await fetchFromTBA(`/event/${eventKey}/teams`);

        res.json({
            success: true,
            data: teams
        });

    } catch (error) {
        console.error('Error fetching event teams:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/tba/event/:eventKey/import-teams
 * Import all teams from an event into the local database
 */
router.post('/event/:eventKey/import-teams', async (req, res) => {
    try {
        const { eventKey } = req.params;
        const { regional } = req.body;

        if (!regional) {
            return res.status(400).json({
                success: false,
                error: 'Regional is required to import teams'
            });
        }

        // Fetch teams from the event
        const teams = await fetchFromTBA(`/event/${eventKey}/teams`);

        const teamRecords = teams.map(team => ({
            team_number: team.team_number,
            team_name: team.nickname || team.name || `Team ${team.team_number}`,
            regional: regional
        }));

        // Bulk insert into Supabase
        const { data, error } = await supabase
            .from('teams')
            .upsert(teamRecords, {
                onConflict: 'team_number',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: `Successfully imported ${data.length} teams from ${eventKey}`,
            data: data
        });

    } catch (error) {
        console.error('Error importing teams from event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/tba/teams/all
 * Get all FRC team numbers (simplified list for dropdown)
 * Returns team numbers in ascending order
 */
router.get('/teams/all', async (req, res) => {
    try {
        const allTeams = [];
        let page = 0;
        let hasMore = true;

        // TBA returns teams in pages of ~500 teams
        // Fetch all pages (there are about 8000+ teams total)
        while (hasMore && page < 20) { // Limit to 20 pages (10,000 teams) for safety
            const teams = await fetchFromTBA(`/teams/${page}`);

            if (teams && teams.length > 0) {
                // Extract just the team numbers
                const teamNumbers = teams.map(team => team.team_number);
                allTeams.push(...teamNumbers);
                page++;
            } else {
                hasMore = false;
            }
        }

        // Sort in ascending order (lowest team numbers first)
        allTeams.sort((a, b) => a - b);

        res.json({
            success: true,
            data: allTeams,
            count: allTeams.length
        });

    } catch (error) {
        console.error('Error fetching all teams:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/tba/teams/season/:year
 * Get all FRC team numbers that participated in a specific season
 * Returns team numbers in ascending order
 */
router.get('/teams/season/:year', async (req, res) => {
    try {
        const { year } = req.params;
        const allTeams = [];
        let page = 0;
        let hasMore = true;

        // TBA returns teams in pages of ~500 teams per year
        while (hasMore && page < 20) {
            const teams = await fetchFromTBA(`/teams/${year}/${page}`);

            if (teams && teams.length > 0) {
                // Extract just the team numbers
                const teamNumbers = teams.map(team => team.team_number);
                allTeams.push(...teamNumbers);
                page++;
            } else {
                hasMore = false;
            }
        }

        // Sort in ascending order (lowest team numbers first)
        allTeams.sort((a, b) => a - b);

        res.json({
            success: true,
            data: allTeams,
            count: allTeams.length,
            year: parseInt(year)
        });

    } catch (error) {
        console.error('Error fetching teams for season:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/tba/team/:teamNumber/event/:eventKey/matches
 * Get all matches for a specific team at a specific event
 */
router.get('/team/:teamNumber/event/:eventKey/matches', async (req, res) => {
    try {
        const { teamNumber, eventKey } = req.params;
        const teamKey = `frc${teamNumber}`;

        // Fetch all matches at the event
        const eventMatches = await fetchFromTBA(`/event/${eventKey}/matches`);

        // Filter matches that include this team
        const teamMatches = eventMatches.filter(match => {
            const redTeams = match.alliances?.red?.team_keys || [];
            const blueTeams = match.alliances?.blue?.team_keys || [];
            return [...redTeams, ...blueTeams].includes(teamKey);
        });

        // Sort by match order
        teamMatches.sort((a, b) => {
            const order = { qm: 1, qf: 2, sf: 3, f: 4 };
            if (a.comp_level !== b.comp_level) {
                return order[a.comp_level] - order[b.comp_level];
            }
            return a.match_number - b.match_number;
        });

        res.json({
            success: true,
            data: teamMatches,
            count: teamMatches.length
        });

    } catch (error) {
        console.error('Error fetching team matches:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/tba/team/:teamNumber/event/:eventKey/matches/save
 * Save team match data to tba_matches table
 */
router.post('/team/:teamNumber/event/:eventKey/matches/save', async (req, res) => {
    try {
        const { teamNumber, eventKey } = req.params;
        const teamKey = `frc${teamNumber}`;

        // First, fetch and save the event data to satisfy foreign key constraint
        const eventData = await fetchFromTBA(`/event/${eventKey}`);

        const eventRecord = {
            event_key: eventData.key,
            name: eventData.name,
            event_code: eventData.event_code,
            event_type: eventData.event_type,
            event_type_string: eventData.event_type_string,
            year: eventData.year,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            city: eventData.city,
            state_prov: eventData.state_prov,
            country: eventData.country
        };

        // Upsert event (create or update if exists)
        const { error: eventError } = await supabase
            .from('events')
            .upsert(eventRecord, {
                onConflict: 'event_key',
                ignoreDuplicates: false
            });

        if (eventError) {
            console.error('Error saving event:', eventError);
            throw new Error(`Failed to save event: ${eventError.message}`);
        }

        // Fetch all matches at the event
        const eventMatches = await fetchFromTBA(`/event/${eventKey}/matches`);

        // Filter matches that include this team
        const teamMatches = eventMatches.filter(match => {
            const redTeams = match.alliances?.red?.team_keys || [];
            const blueTeams = match.alliances?.blue?.team_keys || [];
            return [...redTeams, ...blueTeams].includes(teamKey);
        });

        if (teamMatches.length === 0) {
            return res.json({
                success: true,
                message: 'No matches found to save',
                saved: 0
            });
        }

        // Transform matches to database format
        const matchRecords = teamMatches.map(match => ({
            match_key: match.key,
            event_key: eventKey,
            comp_level: match.comp_level,
            set_number: match.set_number,
            match_number: match.match_number,
            alliances: match.alliances,
            winning_alliance: match.winning_alliance,
            score_breakdown: match.score_breakdown,
            videos: match.videos || [],
            predicted_time: match.predicted_time,
            actual_time: match.actual_time,
            post_result_time: match.post_result_time
        }));

        // Bulk upsert into Supabase tba_matches table
        const { data, error } = await supabase
            .from('tba_matches')
            .upsert(matchRecords, {
                onConflict: 'match_key',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: `Successfully saved ${data.length} matches for team ${teamNumber} at ${eventKey}`,
            saved: data.length,
            data: data
        });

    } catch (error) {
        console.error('Error saving team matches:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/tba/team/:teamNumber/events/:year
 * Get all events a team participated in for a specific year
 */
router.get('/team/:teamNumber/events/:year', async (req, res) => {
    try {
        const { teamNumber, year } = req.params;
        const teamKey = `frc${teamNumber}`;
        const events = await fetchFromTBA(`/team/${teamKey}/events/${year}`);

        // Enrich with event details
        const enrichedEvents = events.map(event => ({
            event_key: event.key,
            name: event.name,
            event_type_string: event.event_type_string,
            start_date: event.start_date,
            end_date: event.end_date,
            city: event.city,
            state_prov: event.state_prov,
            country: event.country,
            week: event.week
        }));

        res.json({
            success: true,
            data: enrichedEvents,
            count: enrichedEvents.length
        });

    } catch (error) {
        console.error('Error fetching Team 589 events:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/tba/admin/import-event-full
 * ADMIN ENDPOINT: Import complete event data (teams + match results) for frontend development
 * This creates realistic sample data from actual competition results
 */
router.post('/admin/import-event-full', async (req, res) => {
    try {
        const { eventKey, regional } = req.body;

        if (!eventKey || !regional) {
            return res.status(400).json({
                success: false,
                error: 'eventKey and regional are required'
            });
        }

        const importLog = {
            eventKey,
            regional,
            teams_imported: 0,
            matches_imported: 0,
            errors: []
        };

        // Step 1: Import all teams from the event
        console.log(`📥 Importing teams from ${eventKey}...`);
        const teams = await fetchFromTBA(`/event/${eventKey}/teams`);

        const teamRecords = teams.map(team => ({
            team_number: team.team_number,
            team_name: team.nickname || team.name || `Team ${team.team_number}`,
            regional: regional
        }));

        const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .upsert(teamRecords, { onConflict: 'team_number' })
            .select();

        if (teamsError) throw teamsError;
        importLog.teams_imported = teamsData.length;

        // Step 2: Fetch match results from TBA
        console.log(`📊 Fetching match data from ${eventKey}...`);
        const matches = await fetchFromTBA(`/event/${eventKey}/matches`);

        // Step 3: Transform TBA match format to our schema
        const matchRecords = [];
        for (const match of matches) {
            // Only import qualification and playoff matches
            if (!['qm', 'sf', 'f'].includes(match.comp_level)) continue;

            // Process each alliance (red and blue)
            for (const allianceColor of ['red', 'blue']) {
                const alliance = match.alliances[allianceColor];
                const score = alliance.score;

                // Process each team in the alliance
                for (const teamKey of alliance.team_keys) {
                    const teamNumber = parseInt(teamKey.replace('frc', ''));

                    // Get team_id from our database
                    const { data: teamData } = await supabase
                        .from('teams')
                        .select('id')
                        .eq('team_number', teamNumber)
                        .eq('regional', regional)
                        .single();

                    if (!teamData) {
                        importLog.errors.push(`Team ${teamNumber} not found in database`);
                        continue;
                    }

                    // Map TBA score breakdown to our schema
                    // Note: This is approximate since TBA doesn't track individual robot actions
                    const scoreBreakdown = match.score_breakdown?.[allianceColor] || {};

                    const matchRecord = {
                        team_id: teamData.id,
                        match_number: match.match_number,
                        regional: regional,
                        scouter_name: 'TBA Import (Historical Data)',

                        // Autonomous (estimated from TBA data)
                        auto_taxi: scoreBreakdown.autoLeavePoints > 0,
                        auto_m1: Math.floor((scoreBreakdown.autoAmpNoteCount || 0) / 3),
                        auto_s1: Math.floor((scoreBreakdown.autoSpeakerNoteCount || 0) / 3),

                        // Teleop (estimated averages from alliance score)
                        teleop_amp_attempts: Math.floor((scoreBreakdown.teleopAmpNoteCount || 0) / 3) + 2,
                        teleop_amp_scored: Math.floor((scoreBreakdown.teleopAmpNoteCount || 0) / 3),
                        teleop_speaker_attempts: Math.floor((scoreBreakdown.teleopSpeakerNoteCount || 0) / 3) + 3,
                        teleop_speaker_scored: Math.floor((scoreBreakdown.teleopSpeakerNoteCount || 0) / 3),

                        // Endgame
                        endgame_climb: mapTBAEndgameToSchema(scoreBreakdown),
                        endgame_trap_count: Math.floor((scoreBreakdown.trapNoteCount || 0) / 3),

                        // Postgame
                        driver_rating: 3, // Default middle rating
                        robot_disabled: false,
                        played_defense: false,
                        comments: `Imported from TBA: ${match.comp_level}${match.match_number} (${allianceColor} alliance, score: ${score})`
                    };

                    matchRecords.push(matchRecord);
                }
            }
        }

        // Step 4: Bulk insert matches
        if (matchRecords.length > 0) {
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .insert(matchRecords)
                .select();

            if (matchesError) {
                console.error('Error inserting matches:', matchesError);
                importLog.errors.push(matchesError.message);
            } else {
                importLog.matches_imported = matchesData.length;
            }
        }

        res.json({
            success: true,
            message: `Event ${eventKey} imported successfully`,
            summary: importLog,
            note: 'TBA data provides alliance-level statistics. Individual robot performance is estimated as averages.'
        });

    } catch (error) {
        console.error('Error importing event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/tba/admin/589-history/{year}:
 *   get:
 *     summary: (ADMIN) Get Team 589's competition history
 *     description: |
 *       **For Mentors**: Shows which events Team 589 attended and import status.
 *
 *       **Use Case**: Discover which regionals to import for development data.
 *     tags: [TBA Integration]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2025
 *     responses:
 *       200:
 *         description: Event history with import status
 */
router.get('/admin/589-history/:year', async (req, res) => {
    try {
        const { year } = req.params;

        // Fetch 589's events for the year
        const events = await fetchFromTBA(`/team/frc589/events/${year}`);

        // Check which events have data in our database
        const eventStatus = await Promise.all(events.map(async event => {
            const { count } = await supabase
                .from('matches')
                .select('*', { count: 'exact', head: true })
                .eq('regional', event.name);

            return {
                event_key: event.key,
                event_name: event.name,
                start_date: event.start_date,
                city: `${event.city}, ${event.state_prov}`,
                has_data: count > 0,
                match_count: count || 0,
                import_command: `POST /api/tba/admin/import-event-full with body: { "eventKey": "${event.key}", "regional": "${event.name}" }`
            };
        }));

        res.json({
            success: true,
            year: year,
            team: 'FRC 589 Falkon Robotics',
            events: eventStatus,
            summary: {
                total_events: eventStatus.length,
                events_with_data: eventStatus.filter(e => e.has_data).length,
                events_to_import: eventStatus.filter(e => !e.has_data).length
            }
        });

    } catch (error) {
        console.error('Error fetching 589 history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Helper function to map TBA endgame status to our schema
 */
function mapTBAEndgameToSchema(scoreBreakdown) {
    // TBA uses: None, Parked, Onstage (which could be single, double, triple harmony)
    if (!scoreBreakdown.endGameRobot1 && !scoreBreakdown.endGameRobot2 && !scoreBreakdown.endGameRobot3) {
        return 'Nothing';
    }

    // Count onstage robots for harmony detection
    const onstageCount = [
        scoreBreakdown.endGameRobot1,
        scoreBreakdown.endGameRobot2,
        scoreBreakdown.endGameRobot3
    ].filter(status => status === 'Onstage').length;

    if (onstageCount === 3) return 'Triple Climb';
    if (onstageCount === 2) return 'Double Climb';
    if (onstageCount === 1) return 'Single Climb';

    // Check for parked
    const parkedCount = [
        scoreBreakdown.endGameRobot1,
        scoreBreakdown.endGameRobot2,
        scoreBreakdown.endGameRobot3
    ].filter(status => status === 'Parked').length;

    return parkedCount > 0 ? 'Park' : 'Nothing';
}

module.exports = router;