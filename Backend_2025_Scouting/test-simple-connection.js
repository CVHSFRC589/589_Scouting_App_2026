/**
 * Simple connection test with detailed error logging
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Simple Database Connection Test\n');

console.log('Environment Check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SECRET_KEY exists:', !!process.env.SUPABASE_SECRET_KEY);
console.log('SUPABASE_SECRET_KEY prefix:', process.env.SUPABASE_SECRET_KEY?.substring(0, 15));
console.log('');

// Create client
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

async function test() {
    console.log('Attempting connection...\n');

    try {
        // Try a simple query
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .limit(1);

        if (error) {
            console.log('❌ Supabase query error:');
            console.log('   Code:', error.code);
            console.log('   Message:', error.message);
            console.log('   Details:', error.details);
            console.log('   Hint:', error.hint);
            console.log('\nFull error object:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Connection successful!');
            console.log('   Rows returned:', data?.length || 0);
            if (data && data.length > 0) {
                console.log('   Sample data:', JSON.stringify(data[0], null, 2));
            } else {
                console.log('   (No data in teams table)');
            }
        }
    } catch (error) {
        console.log('❌ Exception caught:');
        console.log('   Name:', error.name);
        console.log('   Message:', error.message);
        console.log('   Cause:', error.cause);
        console.log('\nFull error:', error);

        if (error.cause) {
            console.log('\nError cause details:');
            console.log(error.cause);
        }
    }
}

test().then(() => {
    console.log('\nTest complete.');
    process.exit(0);
}).catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
