/**
 * Check what tables actually exist in the database
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

async function checkSchema() {
    console.log('📊 Checking actual database schema...\n');

    // Try to query some common tables that should exist
    const tablesToCheck = [
        'teams',
        'matches',
        'team_matches',
        'robot_info',
        'team_statistics',
        'coral_actions',
        'algae_actions',
        'events',
        'tba_matches'
    ];

    for (const table of tablesToCheck) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(0);

            if (error) {
                console.log(`❌ ${table} - Does not exist or not accessible`);
            } else {
                console.log(`✅ ${table} - EXISTS`);
            }
        } catch (error) {
            console.log(`❌ ${table} - Error: ${error.message}`);
        }
    }

    // Check team structure
    console.log('\n📋 Checking teams table structure...');
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .limit(1);

        if (!error && data && data.length > 0) {
            console.log('\nTeams table columns:');
            console.log(Object.keys(data[0]).join(', '));
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
}

checkSchema().then(() => process.exit(0));
