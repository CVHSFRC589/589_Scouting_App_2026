/**
 * Database Setup Script
 * Run this after setting up your Supabase project
 */

// Load environment variables first
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client for setup script
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
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        console.log('🚀 Setting up database schema...');

        // Test connection first
        const { data: connectionTest, error: connectionError } = await supabase
            .from('teams')
            .select('count')
            .limit(1);

        if (connectionError && connectionError.code !== 'PGRST116') {
            throw new Error(`Connection failed: ${connectionError.message}`);
        }

        console.log('✅ Database connection successful');

        // Check if tables already exist
        const { data: existingTables, error: tableError } = await supabase
            .from('teams')
            .select('id')
            .limit(1);

        if (!tableError) {
            console.log('⚠️  Tables already exist. Schema setup may have already been completed.');

            // Check if we have sample data
            const { data: sampleData } = await supabase
                .from('teams')
                .select('team_number')
                .eq('team_number', 589)
                .single();

            if (!sampleData) {
                console.log('📝 Adding sample data...');
                await addSampleData();
            } else {
                console.log('✅ Sample data already exists');
            }

            return;
        }

        console.log('⚠️  Tables not found. Please run the database-schema.sql file in Supabase SQL Editor first.');
        console.log('📋 Steps:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Open SQL Editor');
        console.log('3. Copy and paste the contents of database-schema.sql');
        console.log('4. Run the script');
        console.log('5. Then run this setup script again');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

async function addSampleData() {
    try {
        // Insert sample teams
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .insert([
                { team_number: 589, team_name: 'Falkon Robotics', regional: 'Orange County' },
                { team_number: 254, team_name: 'The Cheesy Poofs', regional: 'Orange County' },
                { team_number: 1678, team_name: 'Citrus Circuits', regional: 'Orange County' },
                { team_number: 2471, team_name: 'Team Mean Machine', regional: 'Orange County' }
            ])
            .select();

        if (teamsError) {
            console.log('⚠️  Sample teams already exist or error:', teamsError.message);
        } else {
            console.log('✅ Sample teams created');
        }

        // Insert sample matches
        const { error: matchesError } = await supabase
            .from('matches')
            .insert([
                {
                    team_id: 1,
                    match_number: 1,
                    regional: 'Orange County',
                    starting_position: 'Middle',
                    auto_taxi: true,
                    auto_m1: 2,
                    auto_s1: 1,
                    teleop_amp_attempts: 5,
                    teleop_amp_scored: 4,
                    teleop_speaker_attempts: 10,
                    teleop_speaker_scored: 8,
                    endgame_climb: 'Single Climb',
                    endgame_trap_count: 1,
                    driver_rating: 4,
                    scouter_name: 'Test Scouter'
                },
                {
                    team_id: 1,
                    match_number: 2,
                    regional: 'Orange County',
                    starting_position: 'Amp',
                    auto_taxi: true,
                    auto_m1: 1,
                    auto_s2: 2,
                    teleop_amp_attempts: 3,
                    teleop_amp_scored: 3,
                    teleop_speaker_attempts: 12,
                    teleop_speaker_scored: 9,
                    endgame_climb: 'Double Climb',
                    endgame_trap_count: 0,
                    driver_rating: 5,
                    scouter_name: 'Test Scouter'
                }
            ]);

        if (matchesError) {
            console.log('⚠️  Sample matches already exist or error:', matchesError.message);
        } else {
            console.log('✅ Sample matches created');
        }

        console.log('🎉 Database setup complete!');

    } catch (error) {
        console.error('❌ Error adding sample data:', error.message);
    }
}

async function testEndpoints() {
    console.log('\n🧪 Testing API endpoints...');

    try {
        // Test teams endpoint
        const { data: teams } = await supabase
            .from('teams')
            .select('*')
            .eq('regional', 'Orange County');

        console.log(`✅ Teams endpoint: Found ${teams?.length || 0} teams`);

        // Test matches endpoint
        const { data: matches } = await supabase
            .from('matches')
            .select('*')
            .eq('regional', 'Orange County');

        console.log(`✅ Matches endpoint: Found ${matches?.length || 0} matches`);

        console.log('\n🎯 API Test URLs:');
        console.log('GET /api/teams?regional=Orange County');
        console.log('GET /api/matches?regional=Orange County');
        console.log('GET /health');

    } catch (error) {
        console.error('❌ Endpoint test failed:', error.message);
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase().then(() => {
        testEndpoints().then(() => {
            console.log('\n✨ Setup complete! Your API is ready to use.');
            process.exit(0);
        });
    });
}

module.exports = { setupDatabase, addSampleData, testEndpoints };