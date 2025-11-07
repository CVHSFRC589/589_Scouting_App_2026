/**
 * Check if frontend tables exist in Supabase
 */

require('dotenv').config();
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

console.log('🔍 Checking Frontend Table Compatibility\n');

async function checkTable(tableName) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);

        if (error) {
            console.log(`❌ ${tableName} - DOES NOT EXIST`);
            console.log(`   Error: ${error.message}`);
            return false;
        } else {
            console.log(`✅ ${tableName} - EXISTS`);
            return true;
        }
    } catch (error) {
        console.log(`❌ ${tableName} - ERROR: ${error.message}`);
        return false;
    }
}

async function checkView(viewName) {
    try {
        const { data, error } = await supabase
            .from(viewName)
            .select('*')
            .limit(0);

        if (error) {
            console.log(`❌ VIEW ${viewName} - DOES NOT EXIST`);
            return false;
        } else {
            console.log(`✅ VIEW ${viewName} - EXISTS`);
            return true;
        }
    } catch (error) {
        console.log(`❌ VIEW ${viewName} - ERROR`);
        return false;
    }
}

async function main() {
    console.log('Tables Frontend Writes To:');
    console.log('─'.repeat(40));

    const reefscapeMatches = await checkTable('reefscape_matches');
    const algae = await checkTable('algae');
    const coral = await checkTable('coral');
    const robotInfo = await checkTable('robot_info');

    console.log('\nTables Frontend Reads From:');
    console.log('─'.repeat(40));

    const robotsComplete = await checkView('robots_complete');
    const teams = await checkTable('teams');

    console.log('\nCurrent Supabase Tables (Actual):');
    console.log('─'.repeat(40));

    await checkTable('team_matches');
    await checkTable('algae_actions');
    await checkTable('coral_actions');

    console.log('\n' + '='.repeat(60));
    console.log('ANALYSIS:');
    console.log('='.repeat(60));

    if (!reefscapeMatches) {
        console.log('❌ Frontend CANNOT write match data');
        console.log('   Frontend expects: reefscape_matches');
        console.log('   Supabase has: team_matches');
    }

    if (!algae) {
        console.log('❌ Frontend CANNOT write algae data');
        console.log('   Frontend expects: algae');
        console.log('   Supabase has: algae_actions');
    }

    if (!coral) {
        console.log('❌ Frontend CANNOT write coral data');
        console.log('   Frontend expects: coral');
        console.log('   Supabase has: coral_actions');
    }

    if (!robotsComplete) {
        console.log('❌ Frontend CANNOT read robot statistics');
        console.log('   Frontend expects: robots_complete VIEW');
        console.log('   Supabase has: (missing)');
    }

    if (robotInfo) {
        console.log('✅ Frontend CAN write pit scouting data');
    }

    if (reefscapeMatches && algae && coral && robotsComplete && robotInfo) {
        console.log('\n✅ Frontend is FULLY COMPATIBLE with current Supabase schema');
    } else {
        console.log('\n❌ Frontend is INCOMPATIBLE with current Supabase schema');
        console.log('   Frontend writes will FAIL!');
    }
}

main().then(() => process.exit(0));
