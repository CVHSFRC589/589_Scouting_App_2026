/**
 * Competition Manager
 *
 * Singleton service that manages active competition state with:
 * - Periodic polling via ConnectionManager
 * - Event emission for UI updates
 */

import { DeviceEventEmitter } from 'react-native';
import { supabase } from './supabaseClient';

export const COMPETITION_CHANGED_EVENT = 'COMPETITION_CHANGED';

export interface CompetitionState {
  activeCompetition: string | null;
  availableCompetitions: string[];
  lastUpdated: Date;
  source: 'polling' | 'initial';
}

class CompetitionManager {
  private static instance: CompetitionManager;
  private competitionState: CompetitionState = {
    activeCompetition: null,
    availableCompetitions: [],
    lastUpdated: new Date(),
    source: 'initial',
  };
  private subscribers = 0;
  private isInitialized = false;

  private constructor() {
    console.log('[CompetitionManager] Instance created');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): CompetitionManager {
    if (!CompetitionManager.instance) {
      CompetitionManager.instance = new CompetitionManager();
    }
    return CompetitionManager.instance;
  }

  /**
   * Subscribe to competition updates
   * Returns current state
   */
  subscribe(): CompetitionState {
    this.subscribers++;
    console.log(`[CompetitionManager] Subscriber added (total: ${this.subscribers})`);

    // Initialize on first subscriber
    if (this.subscribers === 1 && !this.isInitialized) {
      console.log('[CompetitionManager] First subscriber - initializing...');
      this.initialize();
    }

    return { ...this.competitionState };
  }

  /**
   * Unsubscribe from competition updates
   */
  unsubscribe(): void {
    this.subscribers--;
    console.log(`[CompetitionManager] Subscriber removed (total: ${this.subscribers})`);

    // Cleanup when no subscribers
    if (this.subscribers === 0) {
      this.cleanup();
    }
  }

  /**
   * Initialize the manager
   */
  private async initialize(): Promise<void> {
    console.log('[CompetitionManager] Initializing...');
    this.isInitialized = true;

    // Fetch initial state
    await this.fetchCompetitionData('initial');
  }

  /**
   * Fetch competition data from database
   */
  async fetchCompetitionData(source: 'polling' | 'initial' = 'polling'): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('app_metadata')
        .select('active_competition, available_competitions')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('[CompetitionManager] Error fetching competition data:', error);
        return;
      }

      const newState: CompetitionState = {
        activeCompetition: data.active_competition || null,
        availableCompetitions: data.available_competitions || [],
        lastUpdated: new Date(),
        source,
      };

      // Check if competition actually changed
      const hasChanged =
        newState.activeCompetition !== this.competitionState.activeCompetition ||
        JSON.stringify(newState.availableCompetitions) !== JSON.stringify(this.competitionState.availableCompetitions);

      if (hasChanged) {
        console.log(
          `[CompetitionManager] Competition changed (${source}):`,
          `"${this.competitionState.activeCompetition}" -> "${newState.activeCompetition}"`
        );

        this.competitionState = newState;

        // Emit event to notify subscribers
        DeviceEventEmitter.emit(COMPETITION_CHANGED_EVENT, this.competitionState);
      } else {
        // Update timestamp and source even if data didn't change
        this.competitionState.lastUpdated = newState.lastUpdated;
        this.competitionState.source = source;
      }
    } catch (err) {
      console.error('[CompetitionManager] Exception fetching competition data:', err);
    }
  }

  /**
   * Cleanup when no subscribers
   */
  private cleanup(): void {
    console.log('[CompetitionManager] Cleaning up...');
    this.isInitialized = false;
  }

  /**
   * Get current state (without subscribing)
   */
  getCurrentState(): CompetitionState {
    return { ...this.competitionState };
  }

  /**
   * Force refresh competition data
   */
  async refresh(): Promise<void> {
    await this.fetchCompetitionData('polling');
  }
}

// Export singleton instance
export const competitionManager = CompetitionManager.getInstance();
