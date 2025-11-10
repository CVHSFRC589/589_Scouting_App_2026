import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Validate environment variables
// Supports both legacy anon key and new publishable key
// Read from expo-constants (loaded from app.config.js which reads .env)
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env file has:');
  console.error('- PUBLIC_SUPABASE_URL');
  console.error('- PUBLIC_SUPABASE_KEY (recommended: sb_publishable_...)');
  console.error('  OR PUBLIC_SUPABASE_ANON_KEY (legacy: eyJ...)');
}

// Create Supabase client with React Native optimizations
// Works with both publishable keys (sb_publishable_...) and legacy anon keys (eyJ...)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      // Use AsyncStorage for session persistence
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      // Configure real-time subscriptions
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-client-info': 'frc-589-scouting-app/1.0.0'
      }
    }
  }
);

// Test connection on initialization
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('robot_stats')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// Export types helper for TypeScript
export type Database = any; // Will be generated from Supabase CLI if needed
