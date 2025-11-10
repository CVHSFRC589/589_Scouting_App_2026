/**
 * Supabase Connection Test Script
 *
 * This script tests the connection to your Supabase database
 * and verifies that the schema is properly set up.
 *
 * Usage: node test-supabase-connection.js
 */

// Load environment variables from .env file
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Validate environment variables
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

console.log(`${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║  Supabase Connection Test                 ║${colors.reset}`);
console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

// Check for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(`${colors.red}❌ Missing Supabase environment variables!${colors.reset}\n`);
  console.error('Please check your .env file has:');
  console.error('  - PUBLIC_SUPABASE_URL');
  console.error('  - PUBLIC_SUPABASE_KEY (recommended: sb_publishable_...)');
  console.error('    OR PUBLIC_SUPABASE_ANON_KEY (legacy: eyJ...)\n');

  if (!supabaseUrl) console.error(`${colors.red}  Missing: PUBLIC_SUPABASE_URL${colors.reset}`);
  if (!supabaseKey) console.error(`${colors.red}  Missing: PUBLIC_SUPABASE_KEY${colors.reset}`);

  console.log(`\n${colors.yellow}ℹ️  See docs/SUPABASE_SETUP_GUIDE.md for setup instructions${colors.reset}\n`);
  process.exit(1);
}

// Display connection info (with partial key masking for security)
console.log(`${colors.blue}Connection Info:${colors.reset}`);
console.log(`  URL: ${supabaseUrl}`);
const keyPrefix = supabaseKey.substring(0, 20);
const keyType = supabaseKey.startsWith('sb_publishable_') ? 'Publishable Key' : 'Legacy Anon Key';
console.log(`  Key: ${keyPrefix}... (${keyType})`);
console.log('');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Main test function
async function testConnection() {
  const tests = [];
  let allPassed = true;

  console.log(`${colors.blue}Running tests...${colors.reset}\n`);

  // Test 1: Basic connection
  try {
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase
      .from('app_metadata')
      .select('count')
      .limit(1);

    if (error) throw error;

    console.log(`   ${colors.green}✅ Basic connection successful${colors.reset}`);
    tests.push({ name: 'Basic Connection', passed: true });
  } catch (error) {
    console.error(`   ${colors.red}❌ Connection failed: ${error.message}${colors.reset}`);
    tests.push({ name: 'Basic Connection', passed: false, error: error.message });
    allPassed = false;
  }

  // Test 2: Check required tables exist
  const requiredTables = [
    'app_metadata',
    'match_reports',
    'pit_reports',
    'robot_stats',
    'user_profiles'
  ];

  console.log('\n2. Checking required tables...');
  for (const tableName of requiredTables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('count')
        .limit(0);

      if (error && error.code === '42P01') {
        // Table doesn't exist
        console.log(`   ${colors.red}❌ Table missing: ${tableName}${colors.reset}`);
        tests.push({ name: `Table: ${tableName}`, passed: false, error: 'Table not found' });
        allPassed = false;
      } else if (error) {
        throw error;
      } else {
        console.log(`   ${colors.green}✅ ${tableName}${colors.reset}`);
        tests.push({ name: `Table: ${tableName}`, passed: true });
      }
    } catch (error) {
      console.error(`   ${colors.red}❌ Error checking ${tableName}: ${error.message}${colors.reset}`);
      tests.push({ name: `Table: ${tableName}`, passed: false, error: error.message });
      allPassed = false;
    }
  }

  // Test 3: Check required views exist
  const requiredViews = [
    'robots_complete',
    'admin_user_list'
  ];

  console.log('\n3. Checking required views...');
  for (const viewName of requiredViews) {
    try {
      const { error } = await supabase
        .from(viewName)
        .select('count')
        .limit(0);

      if (error && error.code === '42P01') {
        // View doesn't exist
        console.log(`   ${colors.yellow}⚠️  View missing: ${viewName}${colors.reset}`);
        tests.push({ name: `View: ${viewName}`, passed: false, error: 'View not found' });
        allPassed = false;
      } else if (error) {
        throw error;
      } else {
        console.log(`   ${colors.green}✅ ${viewName}${colors.reset}`);
        tests.push({ name: `View: ${viewName}`, passed: true });
      }
    } catch (error) {
      console.error(`   ${colors.yellow}⚠️  Error checking ${viewName}: ${error.message}${colors.reset}`);
      tests.push({ name: `View: ${viewName}`, passed: false, error: error.message });
      allPassed = false;
    }
  }

  // Test 4: Check app_metadata is initialized
  console.log('\n4. Checking app_metadata initialization...');
  try {
    const { data, error } = await supabase
      .from('app_metadata')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows found
      console.log(`   ${colors.yellow}⚠️  app_metadata not initialized (no data)${colors.reset}`);
      console.log(`   ${colors.yellow}   Run the initialization script in Step 4 of the setup guide${colors.reset}`);
      tests.push({ name: 'App Metadata Initialized', passed: false, error: 'No data found' });
      allPassed = false;
    } else if (error) {
      throw error;
    } else {
      console.log(`   ${colors.green}✅ app_metadata initialized${colors.reset}`);
      console.log(`      Active Competition: ${data.active_competition || '(not set)'}`);
      console.log(`      Schema Version: ${data.schema_version || '(not set)'}`);
      console.log(`      Game: ${data.game_name || 'REEFSCAPE'} ${data.game_year || '2025'}`);
      tests.push({ name: 'App Metadata Initialized', passed: true });
    }
  } catch (error) {
    console.error(`   ${colors.red}❌ Error checking app_metadata: ${error.message}${colors.reset}`);
    tests.push({ name: 'App Metadata Initialized', passed: false, error: error.message });
    allPassed = false;
  }

  // Test 5: Check schema version compatibility
  console.log('\n5. Checking schema version compatibility...');
  try {
    const { data, error } = await supabase.rpc('check_schema_compatibility', {
      client_version: '2.0.0'
    });

    if (error && error.code === '42883') {
      // Function doesn't exist
      console.log(`   ${colors.yellow}⚠️  check_schema_compatibility function not found${colors.reset}`);
      tests.push({ name: 'Schema Version Check', passed: false, error: 'Function not found' });
      allPassed = false;
    } else if (error) {
      throw error;
    } else {
      if (data) {
        console.log(`   ${colors.green}✅ Schema version compatible${colors.reset}`);
        tests.push({ name: 'Schema Version Check', passed: true });
      } else {
        console.log(`   ${colors.yellow}⚠️  Schema version mismatch${colors.reset}`);
        tests.push({ name: 'Schema Version Check', passed: false, error: 'Version mismatch' });
        allPassed = false;
      }
    }
  } catch (error) {
    console.error(`   ${colors.yellow}⚠️  Error checking schema version: ${error.message}${colors.reset}`);
    tests.push({ name: 'Schema Version Check', passed: false, error: error.message });
    allPassed = false;
  }

  // Print summary
  console.log(`\n${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Test Summary                              ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const passed = tests.filter(t => t.passed).length;
  const total = tests.length;

  if (allPassed) {
    console.log(`${colors.green}✅ All tests passed! (${passed}/${total})${colors.reset}\n`);
    console.log(`${colors.green}✅ Supabase connection successful${colors.reset}`);
    console.log(`${colors.green}✅ Database schema is ready${colors.reset}\n`);
    console.log(`${colors.blue}ℹ️  You can now proceed with the next steps in the setup guide${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed (${passed}/${total} passed)${colors.reset}\n`);

    const failedTests = tests.filter(t => !t.passed);
    console.log(`${colors.yellow}Failed tests:${colors.reset}`);
    failedTests.forEach(test => {
      console.log(`  - ${test.name}: ${test.error}`);
    });

    console.log(`\n${colors.yellow}ℹ️  Next steps:${colors.reset}`);
    console.log('  1. Check that you completed all steps in docs/SUPABASE_SETUP_GUIDE.md');
    console.log('  2. Verify your .env file has the correct credentials');
    console.log('  3. Run the schema creation script (Step 2) if tables are missing');
    console.log('  4. Run the app_metadata initialization (Step 4) if not initialized\n');

    process.exit(1);
  }
}

// Run tests
testConnection().catch((error) => {
  console.error(`\n${colors.red}❌ Unexpected error:${colors.reset}`, error);
  process.exit(1);
});
