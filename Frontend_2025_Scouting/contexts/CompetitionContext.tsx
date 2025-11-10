/**
 * Competition Context
 *
 * Provides global access to active competition state with:
 * - Periodic updates via CompetitionManager
 * - Automatic subscription management
 * - Hook for easy access in components
 */

import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { competitionManager, CompetitionState, COMPETITION_CHANGED_EVENT } from '@/data/competitionManager';

interface CompetitionContextType {
  activeCompetition: string | null;
  availableCompetitions: string[];
  lastUpdated: Date;
  source: 'polling' | 'initial';
  loading: boolean;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

/**
 * Competition Provider Component
 *
 * Wraps the app to provide competition state
 */
export function CompetitionProvider({ children }: { children: React.ReactNode }) {
  const [competitionState, setCompetitionState] = useState<CompetitionState>({
    activeCompetition: null,
    availableCompetitions: [],
    lastUpdated: new Date(),
    source: 'initial',
  });
  const [loading, setLoading] = useState(true);
  const subscribedRef = useRef(false);

  useEffect(() => {
    // Subscribe to competition manager
    const initialState = competitionManager.subscribe();
    setCompetitionState(initialState);
    setLoading(false);
    subscribedRef.current = true;

    // Listen for competition changes
    const subscription = DeviceEventEmitter.addListener(
      COMPETITION_CHANGED_EVENT,
      (newState: CompetitionState) => {
        setCompetitionState(newState);
      }
    );

    // Cleanup on unmount
    return () => {
      subscription.remove();
      if (subscribedRef.current) {
        competitionManager.unsubscribe();
        subscribedRef.current = false;
      }
    };
  }, []);

  const value: CompetitionContextType = {
    activeCompetition: competitionState.activeCompetition,
    availableCompetitions: competitionState.availableCompetitions,
    lastUpdated: competitionState.lastUpdated,
    source: competitionState.source,
    loading,
  };

  return (
    <CompetitionContext.Provider value={value}>
      {children}
    </CompetitionContext.Provider>
  );
}

/**
 * Hook to use competition context
 *
 * Usage:
 * const { activeCompetition, availableCompetitions } = useCompetition();
 */
export function useCompetition() {
  const context = useContext(CompetitionContext);

  if (context === undefined) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }

  return context;
}
