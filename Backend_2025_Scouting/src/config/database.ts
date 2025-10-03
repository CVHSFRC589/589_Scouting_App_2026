/**
 * Database Configuration (TypeScript)
 * Modern Supabase client setup with secret key and type safety
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Missing required Supabase environment variables. Please check your .env file.');
}

// Validate secret key format (should start with sb_secret_)
if (!supabaseSecretKey.startsWith('sb_secret_')) {
    throw new Error('Invalid Supabase secret key format. Should start with "sb_secret_"');
}

// Create type-safe Supabase client with secret key for backend operations
// Secret keys provide elevated privileges and bypass Row Level Security
export const supabase = createClient<Database>(supabaseUrl, supabaseSecretKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    global: {
        headers: {
            'User-Agent': '589-FRC-Scouting-Backend/1.0.0'
        }
    }
});

/**
 * Test database connection
 * Useful for startup health checks
 */
export async function testConnection(): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('count')
            .limit(1);

        if (error) throw error;
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', (error as Error).message);
        return false;
    }
}

/**
 * Get database client with type safety
 * Use this in your route handlers for full TypeScript support
 */
export function getTypedSupabase() {
    return supabase;
}

// Export types for use in other modules
export type { Database } from '../types/database.types';