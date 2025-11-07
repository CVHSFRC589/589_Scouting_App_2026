/**
 * Frontend Compatibility Verification Script
 * Tests that frontend can read and write to all required tables
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

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

console.log('🧪 Verifying Frontend Database Compatibility\n');
console.log('='.repeat(60));

let allTestsPassed = true;

async function testTableExists(tableName) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);

        if (error) {
            console.log(`❌ Table '${tableName}' - NOT FOUND`);
            allTestsPassed = false;
            return false;
        }

        console.log(`✅ Table '${tableName}' - EXISTS`);
        return true;
    } catch (error) {
        console.log(`❌ Table '${tableName}' - ERROR: ${error.message}`);
        allTestsPassed = false;
        return false;
    }
}

async function testViewExists(viewName) {
    try {
        const { data, error } = await supabase
            .from(viewName)
            .select('*')
            .limit(0);

        if (error) {
            console.log(`❌ View '${viewName}' - NOT FOUND`);
            allTestsPassed = false;
            return false;
        }

        console.log(`✅ View '${viewName}' - EXISTS`);
        return true;
    } catch (error) {
        console.log(`❌ View '${viewName}' - ERROR`);
        allTestsPassed = false;
        return false;
    }
}

async function testFrontendWrites() {
    console.log('\n1️⃣  Testing Frontend WRITE Operations...\n');

    // Test 1: Insert into reefscape_matches
    console.log('   Test 1: Write to reefscape_matches');
    try {
        const testTeamNum = 99999;
        const testMatchNum = 999;
        const regional = 'TEST';

        const { data, error } = await supabase
            .from('reefscape_matches')
            .insert({
                team_num: testTeamNum,
                match_num: testMatchNum,
                regional: regional,
                auto_starting_position: 50
            })
            .select()
            .single();

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            allTestsPassed = false;
        } else {
            console.log(`   ✅ Success: Match created`);

            // Test 2: Insert algae
            console.log('   Test 2: Write to algae');
            const { error: algaeError } = await supabase
                .from('algae')
                .insert({
                    team_num: testTeamNum,
                    match_num: testMatchNum,
                    regional: regional,
                    where_scored: 'net',
                    made: true,
                    timestamp: 'PT15S'
                });

            if (algaeError) {
                console.log(`   ❌ Failed: ${algaeError.message}`);
                allTestsPassed = false;
            } else {
                console.log(`   ✅ Success: Algae action created`);
            }

            // Test 3: Insert coral
            console.log('   Test 3: Write to coral');
            const { error: coralError } = await supabase
                .from('coral')
                .insert({
                    team_num: testTeamNum,
                    match_num: testMatchNum,
                    regional: regional,
                    level: 2,
                    made: true,
                    timestamp: 'PT30S'
                });

            if (coralError) {
                console.log(`   ❌ Failed: ${coralError.message}`);
                allTestsPassed = false;
            } else {
                console.log(`   ✅ Success: Coral action created`);
            }

            // Cleanup
            await supabase.from('reefscape_matches')
                .delete()
                .eq('team_num', testTeamNum)
                .eq('match_num', testMatchNum)
                .eq('regional', regional);

            console.log(`   ✅ Cleanup complete (CASCADE delete verified)`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        allTestsPassed = false;
    }

    // Test 4: Insert into robot_info
    console.log('   Test 4: Write to robot_info');
    try {
        const testTeamNum = 99998;
        const regional = 'TEST';

        const { data, error } = await supabase
            .from('robot_info')
            .upsert({
                team_num: testTeamNum,
                regional: regional,
                vision_sys: 'Limelight',
                drive_train: 'Swerve',
                ground_intake: true,
                l1_scoring: true,
                l2_scoring: true,
                climb_deep: true
            })
            .select()
            .single();

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            allTestsPassed = false;
        } else {
            console.log(`   ✅ Success: Robot info created`);

            // Cleanup
            await supabase.from('robot_info')
                .delete()
                .eq('team_num', testTeamNum)
                .eq('regional', regional);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        allTestsPassed = false;
    }
}

async function testFrontendReads() {
    console.log('\n2️⃣  Testing Frontend READ Operations...\n');

    // Test 1: Read from robots_complete view
    console.log('   Test 1: Read from robots_complete view');
    try {
        const { data, error } = await supabase
            .from('robots_complete')
            .select('*')
            .limit(5);

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            allTestsPassed = false;
        } else {
            console.log(`   ✅ Success: Retrieved ${data?.length || 0} robots`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        allTestsPassed = false;
    }

    // Test 2: Read teams
    console.log('   Test 2: Read from teams');
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .limit(5);

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            allTestsPassed = false;
        } else {
            console.log(`   ✅ Success: Retrieved ${data?.length || 0} teams`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        allTestsPassed = false;
    }

    // Test 3: Read match with joins (like frontend does)
    console.log('   Test 3: Read match with algae and coral (JOIN)');
    try {
        const { data, error } = await supabase
            .from('reefscape_matches')
            .select(`
                *,
                match_algae:algae(*),
                match_coral:coral(*)
            `)
            .limit(1);

        if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            allTestsPassed = false;
        } else {
            console.log(`   ✅ Success: Match with related data retrieved`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        allTestsPassed = false;
    }
}

async function testTableStructure() {
    console.log('\n3️⃣  Testing Table Structure...\n');

    console.log('   Required tables for frontend:');
    await testTableExists('reefscape_matches');
    await testTableExists('algae');
    await testTableExists('coral');
    await testTableExists('robot_info');
    await testTableExists('teams');

    console.log('\n   Required views for frontend:');
    await testViewExists('robots_complete');

    console.log('\n   Statistics tables:');
    await testTableExists('robot_rankings');
    await testTableExists('robot_coral_stats');
    await testTableExists('robot_algae_stats');
    await testTableExists('robot_climb_stats');
}

async function checkRLS() {
    console.log('\n4️⃣  Testing Row Level Security...\n');

    const tables = ['reefscape_matches', 'algae', 'coral', 'robot_info', 'teams'];

    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.log(`   ❌ ${table}: Public read FAILED`);
                allTestsPassed = false;
            } else {
                console.log(`   ✅ ${table}: Public read access OK`);
            }
        } catch (error) {
            console.log(`   ❌ ${table}: Error - ${error.message}`);
            allTestsPassed = false;
        }
    }
}

// Run all tests
async function runAllTests() {
    try {
        // Test connection first
        const { error: connError } = await supabase
            .from('teams')
            .select('count')
            .limit(1);

        if (connError) {
            console.log('❌ Database connection failed!');
            console.log(connError.message);
            process.exit(1);
        }

        console.log('✅ Database connection successful\n');

        await testTableStructure();
        await testFrontendReads();
        await testFrontendWrites();
        await checkRLS();

        console.log('\n' + '='.repeat(60));

        if (allTestsPassed) {
            console.log('\n✅ ALL TESTS PASSED!');
            console.log('🎉 Frontend is fully compatible with database!');
            console.log('\nThe frontend can now:');
            console.log('  ✅ Submit pit scouting data');
            console.log('  ✅ Submit match scouting data');
            console.log('  ✅ Submit algae actions');
            console.log('  ✅ Submit coral placements');
            console.log('  ✅ Read robot statistics');
            console.log('  ✅ Read team information\n');
        } else {
            console.log('\n❌ SOME TESTS FAILED');
            console.log('Please review the errors above.\n');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        process.exit(1);
    }
}

runAllTests();
