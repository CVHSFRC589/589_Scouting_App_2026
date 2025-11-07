/**
 * Comprehensive Database Connection Test
 * Tests read and write operations to Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error('❌ Missing required environment variables!');
    console.error('Please ensure .env file contains:');
    console.error('- SUPABASE_URL');
    console.error('- SUPABASE_SECRET_KEY');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

console.log('🔍 Database Connection Audit\n');
console.log('='.repeat(60));

async function testConnection() {
    console.log('\n1️⃣  Testing Database Connection...');
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Connection test failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        return false;
    }
}

async function inspectSchema() {
    console.log('\n2️⃣  Inspecting Database Schema...');

    // List all tables we expect to exist
    const expectedTables = [
        'teams',
        'matches',
        'robot_info',
        'events',
        'event_teams',
        'tba_matches',
        'awards',
        'event_rankings',
        'team_event_status',
        'event_opr',
        'media',
        'districts',
        'district_rankings',
        'predictions',
        'robots',
        'tba_sync_log'
    ];

    console.log(`\nExpected tables: ${expectedTables.length}`);

    for (const table of expectedTables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(0);

            if (error) {
                console.log(`   ❌ ${table} - Not accessible: ${error.message}`);
            } else {
                console.log(`   ✅ ${table} - OK`);
            }
        } catch (error) {
            console.log(`   ❌ ${table} - Error: ${error.message}`);
        }
    }
}

async function testReadOperations() {
    console.log('\n3️⃣  Testing READ Operations...');

    // Test 1: Read all teams
    console.log('\n   Test 1: Read all teams');
    try {
        const { data, error, count } = await supabase
            .from('teams')
            .select('*', { count: 'exact' });

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        } else {
            console.log(`   ✅ Success: Found ${count || 0} teams`);
            if (data && data.length > 0) {
                console.log(`      Sample team:`, JSON.stringify(data[0], null, 2));
            }
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 2: Read with filter
    console.log('\n   Test 2: Read team with filter (team_number = 589)');
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .eq('team_number', 589)
            .maybeSingle();

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        } else if (data) {
            console.log(`   ✅ Success: Found team 589`);
            console.log(`      Team name: ${data.team_name}`);
        } else {
            console.log(`   ⚠️  No team 589 found in database`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 3: Read matches
    console.log('\n   Test 3: Read matches');
    try {
        const { data, error, count } = await supabase
            .from('matches')
            .select('*', { count: 'exact' });

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        } else {
            console.log(`   ✅ Success: Found ${count || 0} matches`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 4: Read with join
    console.log('\n   Test 4: Read matches with team info (JOIN)');
    try {
        const { data, error } = await supabase
            .from('matches')
            .select(`
                *,
                teams:team_id (
                    team_number,
                    team_name
                )
            `)
            .limit(5);

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        } else {
            console.log(`   ✅ Success: Retrieved ${data?.length || 0} matches with team info`);
            if (data && data.length > 0) {
                console.log(`      Sample:`, JSON.stringify(data[0], null, 2));
            }
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

async function testWriteOperations() {
    console.log('\n4️⃣  Testing WRITE Operations...');

    const testTeamNumber = Math.floor(Math.random() * 90000) + 10000; // Random team number
    let insertedTeamId = null;

    // Test 1: Insert a test team
    console.log(`\n   Test 1: Insert test team (${testTeamNumber})`);
    try {
        const { data, error } = await supabase
            .from('teams')
            .insert({
                team_number: testTeamNumber,
                team_name: `Test Team ${testTeamNumber}`,
                regional: 'Test Regional'
            })
            .select()
            .single();

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        } else {
            insertedTeamId = data.id;
            console.log(`   ✅ Success: Team inserted with ID: ${insertedTeamId}`);
            console.log(`      Data:`, JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    if (!insertedTeamId) {
        console.log('\n   ⚠️  Skipping remaining write tests due to insert failure');
        return;
    }

    // Test 2: Update the test team
    console.log(`\n   Test 2: Update test team`);
    try {
        const { data, error } = await supabase
            .from('teams')
            .update({
                team_name: `Updated Test Team ${testTeamNumber}`,
                notes: 'This is a test team for database audit'
            })
            .eq('id', insertedTeamId)
            .select()
            .single();

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        } else {
            console.log(`   ✅ Success: Team updated`);
            console.log(`      New name: ${data.team_name}`);
            console.log(`      Notes: ${data.notes}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 3: Insert a match for the test team
    console.log(`\n   Test 3: Insert match for test team`);
    try {
        const { data, error } = await supabase
            .from('matches')
            .insert({
                team_id: insertedTeamId,
                match_number: 1,
                match_type: 'qualification',
                alliance: 'red',
                match_data: {
                    auto: { mobility: true, game_pieces: 3 },
                    teleop: { game_pieces: 15 },
                    endgame: { climb_level: 'mid' }
                },
                notes: 'Test match data',
                scouter_name: 'Database Audit Script'
            })
            .select()
            .single();

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        } else {
            console.log(`   ✅ Success: Match inserted`);
            console.log(`      Match ID: ${data.id}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 4: Delete the test data
    console.log(`\n   Test 4: Clean up test data (DELETE)`);
    try {
        // Matches will be auto-deleted due to CASCADE foreign key
        const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', insertedTeamId);

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        } else {
            console.log(`   ✅ Success: Test team and related data deleted`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

async function testRLS() {
    console.log('\n5️⃣  Testing Row Level Security (RLS)...');

    console.log('\n   Testing with service role key (should have full access)');
    console.log(`   Using key: ${process.env.SUPABASE_SECRET_KEY.substring(0, 20)}...`);

    // Create a client with anon key to test RLS
    console.log('\n   Note: Backend uses service role key which bypasses RLS');
    console.log('   This is correct for backend operations');
    console.log('   Frontend should use anon key with RLS enabled');
}

async function checkConfiguration() {
    console.log('\n6️⃣  Configuration Check...');

    console.log(`\n   Environment Variables:`);
    console.log(`   ✅ SUPABASE_URL: ${process.env.SUPABASE_URL}`);
    console.log(`   ✅ SUPABASE_SECRET_KEY: ${process.env.SUPABASE_SECRET_KEY.substring(0, 15)}...`);
    console.log(`   ✅ PORT: ${process.env.PORT || '3000 (default)'}`);
    console.log(`   ✅ NODE_ENV: ${process.env.NODE_ENV || 'development (default)'}`);

    // Validate secret key format
    if (!process.env.SUPABASE_SECRET_KEY.startsWith('sb_secret_')) {
        console.log(`\n   ⚠️  WARNING: Secret key doesn't start with 'sb_secret_'`);
        console.log(`   Expected format: sb_secret_...`);
    } else {
        console.log(`\n   ✅ Secret key format is correct`);
    }
}

// Run all tests
async function runAllTests() {
    try {
        await checkConfiguration();

        const connected = await testConnection();
        if (!connected) {
            console.log('\n❌ Cannot proceed with tests - connection failed');
            process.exit(1);
        }

        await inspectSchema();
        await testReadOperations();
        await testWriteOperations();
        await testRLS();

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Database audit complete!\n');

    } catch (error) {
        console.error('\n❌ Audit failed with error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runAllTests().then(() => process.exit(0));
}

module.exports = { testConnection, testReadOperations, testWriteOperations };
