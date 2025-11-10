/**
 * Authentication Context for FRC Scouting App
 *
 * Manages user authentication state and provides auth functions throughout the app.
 * Uses Supabase Auth for secure email/password authentication.
 *
 * Learn more:
 * - React Context: https://react.dev/learn/passing-data-deeply-with-context
 * - Supabase Auth: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../data/supabaseClient';

// TypeScript interface for user profile
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  team_number: number | null;
  is_admin: boolean;
  default_competition: string | null;
  created_at: string;
  last_login: string | null;
}

// Auth context interface
interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 *
 * Wraps the entire app to provide authentication state.
 * Automatically loads user session on app start.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load user profile from database
   */
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Error loading profile:', error);
        return;
      }

      setUserProfile(data);

      // Update last login timestamp
      await supabase.rpc('update_last_login');
    } catch (err) {
      console.error('[Auth] Exception loading profile:', err);
    }
  };

  /**
   * Initialize auth state on app load
   */
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        loadUserProfile(session.user.id);
      }

      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth] State changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('[Auth] Sign in error:', error);
        return { error };
      }

      console.log('[Auth] Sign in successful');
      return { error: null };
    } catch (err) {
      console.error('[Auth] Sign in exception:', err);
      return { error: err };
    }
  };

  /**
   * Sign up new user
   */
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation redirect
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        console.error('[Auth] Sign up error:', error);
        return { error };
      }

      console.log('[Auth] Sign up successful');

      // Return both error and session data so caller can check if user can immediately sign in
      return { error: null, session: data.session };
    } catch (err) {
      console.error('[Auth] Sign up exception:', err);
      return { error: err };
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[Auth] Sign out error:', error);
      } else {
        console.log('[Auth] Sign out successful');
        setUserProfile(null);
      }
    } catch (err) {
      console.error('[Auth] Sign out exception:', err);
    }
  };

  /**
   * Manually refresh user profile (useful after profile updates)
   */
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 *
 * Usage:
 * const { user, signIn, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook to check if current user is admin
 *
 * Usage:
 * const isAdmin = useIsAdmin();
 */
export function useIsAdmin(): boolean {
  const { userProfile } = useAuth();
  return userProfile?.is_admin ?? false;
}
