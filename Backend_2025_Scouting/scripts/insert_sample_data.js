/**
 * Insert Sample Data for East Bay Regional
 * Run this script to populate the database with test data
 *
 * Usage: node scripts/insert_sample_data.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

async function insertSampleData() {
    console.log('🚀 Starting sample data insertion for East Bay Regional...\n');

    try {
        // ========================================================================
        // STEP 1: Insert Teams
        // ========================================================================
        console.log('📋 Inserting teams...');
        const teams = [
            { team_number: 199, team_name: 'Deep Blue', regional: 'be', nickname: 'Deep Blue' },
            { team_number: 253, team_name: 'Boba Bots', regional: 'be', nickname: 'Boba Bots' },
            { team_number: 254, team_name: 'The Cheesy Poofs', regional: 'be', nickname: 'The Cheesy Poofs' },
            { team_number: 589, team_name: 'Falkon Robotics', regional: 'be', nickname: 'Falkon Robotics' },
            { team_number: 649, team_name: 'MSET Fish', regional: 'be', nickname: 'MSET Fish' },
            { team_number: 668, team_name: 'The Apes of Wrath', regional: 'be', nickname: 'The Apes of Wrath' },
            { team_number: 766, team_name: 'M-A Bears', regional: 'be', nickname: 'M-A Bears' },
            { team_number: 841, team_name: 'The BioMechs', regional: 'be', nickname: 'The BioMechs' },
            { team_number: 972, team_name: 'Iron Claw', regional: 'be', nickname: 'Iron Claw' },
            { team_number: 1280, team_name: 'Ragin\' C-Biscuits', regional: 'be', nickname: 'Ragin\' C-Biscuits' },
            { team_number: 1351, team_name: 'TKO', regional: 'be', nickname: 'TKO' },
            { team_number: 1678, team_name: 'Citrus Circuits', regional: 'be', nickname: 'Citrus Circuits' },
            { team_number: 1868, team_name: 'Space Cookies', regional: 'be', nickname: 'Space Cookies' },
            { team_number: 2141, team_name: 'Spartronics', regional: 'be', nickname: 'Spartronics' },
            { team_number: 2204, team_name: 'Rambots', regional: 'be', nickname: 'Rambots' },
            { team_number: 2551, team_name: 'Penguin Empire', regional: 'be', nickname: 'Penguin Empire' },
            { team_number: 2854, team_name: 'The Prototypes', regional: 'be', nickname: 'The Prototypes' },
            { team_number: 3390, team_name: 'ANATOLIAN EAGLEBOTS', regional: 'be', nickname: 'ANATOLIAN EAGLEBOTS' },
            { team_number: 3482, team_name: 'Arrowbotics', regional: 'be', nickname: 'Arrowbotics' },
            { team_number: 4171, team_name: 'BayBots', regional: 'be', nickname: 'BayBots' },
            { team_number: 4186, team_name: 'Alameda Aztechs', regional: 'be', nickname: 'Alameda Aztechs' }
        ];

        const { error: teamsError } = await supabase.from('teams').upsert(teams, { onConflict: 'team_number,regional' });
        if (teamsError) throw teamsError;
        console.log(`✅ Inserted ${teams.length} teams\n`);

        // ========================================================================
        // STEP 2: Insert Rankings
        // ========================================================================
        console.log('🏆 Inserting robot rankings...');
        const rankings = [
            { team_num: 254, regional: 'be', rank_value: 1.0 },
            { team_num: 1678, regional: 'be', rank_value: 2.0 },
            { team_num: 589, regional: 'be', rank_value: 3.0 },
            { team_num: 649, regional: 'be', rank_value: 4.0 },
            { team_num: 1868, regional: 'be', rank_value: 5.0 },
            { team_num: 972, regional: 'be', rank_value: 6.0 },
            { team_num: 2854, regional: 'be', rank_value: 7.0 },
            { team_num: 253, regional: 'be', rank_value: 8.0 },
            { team_num: 199, regional: 'be', rank_value: 9.0 },
            { team_num: 2141, regional: 'be', rank_value: 10.0 },
            { team_num: 668, regional: 'be', rank_value: 11.0 },
            { team_num: 766, regional: 'be', rank_value: 12.0 },
            { team_num: 841, regional: 'be', rank_value: 13.0 },
            { team_num: 1280, regional: 'be', rank_value: 14.0 },
            { team_num: 1351, regional: 'be', rank_value: 15.0 },
            { team_num: 2204, regional: 'be', rank_value: 16.0 },
            { team_num: 2551, regional: 'be', rank_value: 17.0 },
            { team_num: 3390, regional: 'be', rank_value: 18.0 },
            { team_num: 3482, regional: 'be', rank_value: 19.0 },
            { team_num: 4171, regional: 'be', rank_value: 20.0 },
            { team_num: 4186, regional: 'be', rank_value: 21.0 }
        ];

        const { error: rankingsError } = await supabase.from('robot_rankings').upsert(rankings, { onConflict: 'team_num,regional' });
        if (rankingsError) throw rankingsError;
        console.log(`✅ Inserted ${rankings.length} rankings\n`);

        // ========================================================================
        // STEP 3: Insert Pit Scouting Data
        // ========================================================================
        console.log('🔧 Inserting pit scouting data...');
        const pitData = [
            {
                team_num: 589, regional: 'be', vision_sys: 'Limelight', drive_train: 'Swerve',
                ground_intake: true, source_intake: true,
                l1_scoring: true, l2_scoring: true, l3_scoring: true, l4_scoring: true,
                remove: true, processor: true, net: true,
                climb_deep: true, climb_shallow: false,
                comments: 'Excellent all-around robot with strong coral and algae capabilities'
            },
            {
                team_num: 254, regional: 'be', vision_sys: 'PhotonVision', drive_train: 'Swerve',
                ground_intake: true, source_intake: false,
                l1_scoring: true, l2_scoring: true, l3_scoring: true, l4_scoring: true,
                remove: true, processor: false, net: true,
                climb_deep: false, climb_shallow: true,
                comments: 'Fast swerve drive, focuses on coral scoring'
            },
            {
                team_num: 1678, regional: 'be', vision_sys: 'Limelight', drive_train: 'Swerve',
                ground_intake: true, source_intake: true,
                l1_scoring: true, l2_scoring: true, l3_scoring: true, l4_scoring: false,
                remove: true, processor: true, net: true,
                climb_deep: true, climb_shallow: true,
                comments: 'Very consistent, excellent at algae processing'
            },
            {
                team_num: 649, regional: 'be', vision_sys: 'Limelight', drive_train: 'West Coast',
                ground_intake: true, source_intake: false,
                l1_scoring: true, l2_scoring: true, l3_scoring: false, l4_scoring: false,
                remove: false, processor: false, net: true,
                climb_deep: false, climb_shallow: true,
                comments: 'Simple and effective design, reliable'
            },
            {
                team_num: 1868, regional: 'be', vision_sys: 'PhotonVision', drive_train: 'Swerve',
                ground_intake: true, source_intake: true,
                l1_scoring: true, l2_scoring: true, l3_scoring: true, l4_scoring: true,
                remove: true, processor: true, net: true,
                climb_deep: true, climb_shallow: false,
                comments: 'High scorer, excellent autonomous'
            },
            {
                team_num: 972, regional: 'be', vision_sys: 'None', drive_train: 'West Coast',
                ground_intake: true, source_intake: false,
                l1_scoring: true, l2_scoring: true, l3_scoring: true, l4_scoring: false,
                remove: true, processor: false, net: false,
                climb_deep: false, climb_shallow: false,
                comments: 'Good defense robot'
            }
        ];

        const { error: pitError } = await supabase.from('robot_info').upsert(pitData, { onConflict: 'team_num,regional' });
        if (pitError) throw pitError;
        console.log(`✅ Inserted ${pitData.length} pit scouting records\n`);

        // ========================================================================
        // STEP 4: Insert Match Data for Team 589
        // ========================================================================
        console.log('🎮 Inserting match data for Team 589...');

        // Match 1
        const match1 = {
            team_num: 589, match_num: 1, regional: 'be',
            auto_starting_position: 75, driver_rating: 5,
            disabled: false, defence: false, malfunction: false, no_show: false,
            climb_deep: true, climb_shallow: false, park: false,
            comments: 'Great match! Scored high on all levels'
        };

        const { error: match1Error } = await supabase.from('team_matches').upsert(match1, { onConflict: 'team_num,match_num,regional' });
        if (match1Error) throw match1Error;

        const coral1 = [
            { team_num: 589, match_num: 1, regional: 'be', level: 1, made: true, timestamp: 'PT10S' },
            { team_num: 589, match_num: 1, regional: 'be', level: 2, made: true, timestamp: 'PT25S' },
            { team_num: 589, match_num: 1, regional: 'be', level: 2, made: true, timestamp: 'PT40S' },
            { team_num: 589, match_num: 1, regional: 'be', level: 3, made: true, timestamp: 'PT55S' },
            { team_num: 589, match_num: 1, regional: 'be', level: 3, made: true, timestamp: 'PT70S' },
            { team_num: 589, match_num: 1, regional: 'be', level: 4, made: true, timestamp: 'PT85S' }
        ];

        const { error: coral1Error } = await supabase.from('coral_actions').insert(coral1);
        if (coral1Error) throw coral1Error;

        const algae1 = [
            { team_num: 589, match_num: 1, regional: 'be', where_scored: 'removed', made: true, timestamp: 'PT15S' },
            { team_num: 589, match_num: 1, regional: 'be', where_scored: 'processed', made: true, timestamp: 'PT30S' },
            { team_num: 589, match_num: 1, regional: 'be', where_scored: 'net', made: true, timestamp: 'PT45S' },
            { team_num: 589, match_num: 1, regional: 'be', where_scored: 'removed', made: true, timestamp: 'PT60S' },
            { team_num: 589, match_num: 1, regional: 'be', where_scored: 'processed', made: true, timestamp: 'PT75S' }
        ];

        const { error: algae1Error } = await supabase.from('algae_actions').insert(algae1);
        if (algae1Error) throw algae1Error;

        // Match 2
        const match2 = {
            team_num: 589, match_num: 2, regional: 'be',
            auto_starting_position: 50, driver_rating: 4,
            disabled: false, defence: false, malfunction: false, no_show: false,
            climb_deep: false, climb_shallow: true, park: false,
            comments: 'Good match, minor intake issues'
        };

        const { error: match2Error } = await supabase.from('team_matches').upsert(match2, { onConflict: 'team_num,match_num,regional' });
        if (match2Error) throw match2Error;

        const coral2 = [
            { team_num: 589, match_num: 2, regional: 'be', level: 1, made: true, timestamp: 'PT12S' },
            { team_num: 589, match_num: 2, regional: 'be', level: 1, made: true, timestamp: 'PT28S' },
            { team_num: 589, match_num: 2, regional: 'be', level: 2, made: true, timestamp: 'PT44S' },
            { team_num: 589, match_num: 2, regional: 'be', level: 3, made: true, timestamp: 'PT60S' },
            { team_num: 589, match_num: 2, regional: 'be', level: 3, made: false, timestamp: 'PT76S' }
        ];

        const { error: coral2Error } = await supabase.from('coral_actions').insert(coral2);
        if (coral2Error) throw coral2Error;

        const algae2 = [
            { team_num: 589, match_num: 2, regional: 'be', where_scored: 'removed', made: true, timestamp: 'PT20S' },
            { team_num: 589, match_num: 2, regional: 'be', where_scored: 'removed', made: true, timestamp: 'PT35S' },
            { team_num: 589, match_num: 2, regional: 'be', where_scored: 'processed', made: true, timestamp: 'PT50S' },
            { team_num: 589, match_num: 2, regional: 'be', where_scored: 'net', made: true, timestamp: 'PT65S' }
        ];

        const { error: algae2Error } = await supabase.from('algae_actions').insert(algae2);
        if (algae2Error) throw algae2Error;

        // Match 3
        const match3 = {
            team_num: 589, match_num: 3, regional: 'be',
            auto_starting_position: 100, driver_rating: 5,
            disabled: false, defence: false, malfunction: false, no_show: false,
            climb_deep: true, climb_shallow: false, park: false,
            comments: 'Perfect match!'
        };

        const { error: match3Error } = await supabase.from('team_matches').upsert(match3, { onConflict: 'team_num,match_num,regional' });
        if (match3Error) throw match3Error;

        const coral3 = [
            { team_num: 589, match_num: 3, regional: 'be', level: 1, made: true, timestamp: 'PT8S' },
            { team_num: 589, match_num: 3, regional: 'be', level: 2, made: true, timestamp: 'PT22S' },
            { team_num: 589, match_num: 3, regional: 'be', level: 2, made: true, timestamp: 'PT36S' },
            { team_num: 589, match_num: 3, regional: 'be', level: 3, made: true, timestamp: 'PT50S' },
            { team_num: 589, match_num: 3, regional: 'be', level: 3, made: true, timestamp: 'PT64S' },
            { team_num: 589, match_num: 3, regional: 'be', level: 4, made: true, timestamp: 'PT78S' },
            { team_num: 589, match_num: 3, regional: 'be', level: 4, made: true, timestamp: 'PT92S' }
        ];

        const { error: coral3Error } = await supabase.from('coral_actions').insert(coral3);
        if (coral3Error) throw coral3Error;

        const algae3 = [
            { team_num: 589, match_num: 3, regional: 'be', where_scored: 'removed', made: true, timestamp: 'PT14S' },
            { team_num: 589, match_num: 3, regional: 'be', where_scored: 'processed', made: true, timestamp: 'PT28S' },
            { team_num: 589, match_num: 3, regional: 'be', where_scored: 'net', made: true, timestamp: 'PT42S' },
            { team_num: 589, match_num: 3, regional: 'be', where_scored: 'removed', made: true, timestamp: 'PT56S' },
            { team_num: 589, match_num: 3, regional: 'be', where_scored: 'processed', made: true, timestamp: 'PT70S' },
            { team_num: 589, match_num: 3, regional: 'be', where_scored: 'net', made: true, timestamp: 'PT84S' }
        ];

        const { error: algae3Error } = await supabase.from('algae_actions').insert(algae3);
        if (algae3Error) throw algae3Error;

        console.log('✅ Inserted 3 matches for Team 589\n');

        // ========================================================================
        // STEP 5: Recalculate Statistics
        // ========================================================================
        console.log('📊 Recalculating statistics...');

        const { error: statsError } = await supabase.rpc('recalculate_coral_stats', { p_team_num: 589, p_regional: 'be' });
        if (statsError) throw statsError;

        const { error: algaeStatsError } = await supabase.rpc('recalculate_algae_stats', { p_team_num: 589, p_regional: 'be' });
        if (algaeStatsError) throw algaeStatsError;

        const { error: climbStatsError } = await supabase.rpc('recalculate_climb_stats', { p_team_num: 589, p_regional: 'be' });
        if (climbStatsError) throw climbStatsError;

        console.log('✅ Statistics recalculated for Team 589\n');

        // ========================================================================
        // STEP 6: Verification
        // ========================================================================
        console.log('🔍 Verifying data...');

        const { data: robotsData, error: robotsError } = await supabase
            .from('robots_complete')
            .select('team_num, team_name, rank_value, avg_coral, avg_algae')
            .eq('regional', 'be')
            .order('rank_value', { ascending: true })
            .limit(5);

        if (robotsError) throw robotsError;

        console.log('\n📋 Top 5 Robots:');
        console.table(robotsData);

        console.log('\n🎉 SAMPLE DATA INSERTION COMPLETE!');
        console.log('You can now test the frontend with realistic East Bay Regional data.\n');

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
        process.exit(1);
    }
}

// Run the script
insertSampleData();
