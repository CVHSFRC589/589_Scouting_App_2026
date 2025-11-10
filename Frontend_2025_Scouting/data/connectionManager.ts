/**
 * Singleton Connection Manager
 *
 * Manages a single connection check interval across the entire application,
 * regardless of how many ConnectionHeader components are mounted.
 *
 * This prevents having 17+ simultaneous intervals when multiple screens
 * are kept alive by React Navigation.
 */

import { DeviceEventEmitter } from 'react-native';
import { supabaseService } from './supabaseService';
import { competitionManager } from './competitionManager';

// Event fired when connection status changes
export const CONNECTION_STATUS_CHANGED_EVENT = 'CONNECTION_STATUS_CHANGED';

// Connection check interval (30 seconds)
const CONNECTION_CHECK_INTERVAL = 30000;

export interface ConnectionState {
  status: 'connected' | 'disconnected' | 'checking';
  schemaVersion: string | null;
  errorType?: string;
  lastChecked: number | null;
}

class ConnectionManager {
  private static instance: ConnectionManager;

  private interval: NodeJS.Timeout | null = null;
  private subscribers = 0;
  private state: ConnectionState = {
    status: 'disconnected',
    schemaVersion: null,
    lastChecked: null,
  };

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  /**
   * Subscribe to connection checks
   * Returns the current connection state
   *
   * Call this when a component mounts
   */
  public subscribe(): ConnectionState {
    this.subscribers++;
    const timestamp = new Date().toISOString();
    console.log(`🔗 [${timestamp}] [ConnectionManager] Subscriber added (total: ${this.subscribers})`);

    // Start the interval if this is the first subscriber
    if (this.subscribers === 1) {
      this.startChecking();
    } else {
      // Immediately return current state to new subscribers
      this.emitState();
    }

    return this.state;
  }

  /**
   * Unsubscribe from connection checks
   *
   * Call this when a component unmounts
   */
  public unsubscribe(): void {
    this.subscribers--;
    const timestamp = new Date().toISOString();
    console.log(`🔗 [${timestamp}] [ConnectionManager] Subscriber removed (total: ${this.subscribers})`);

    // Stop the interval if there are no more subscribers
    if (this.subscribers <= 0) {
      this.stopChecking();
      this.subscribers = 0; // Ensure it doesn't go negative
    }
  }

  /**
   * Get current connection state without subscribing
   */
  public getState(): ConnectionState {
    return { ...this.state };
  }

  /**
   * Manually trigger a connection check
   */
  public async checkNow(): Promise<ConnectionState> {
    await this.performCheck('manual trigger');
    return this.getState();
  }

  /**
   * Start periodic connection checking
   */
  private startChecking(): void {
    const timestamp = new Date().toISOString();
    console.log(`🔗 [${timestamp}] [ConnectionManager] Starting connection checks`);

    // Perform initial check immediately
    this.performCheck('initial check');

    // Set up periodic checks
    this.interval = setInterval(() => {
      this.performCheck('30s interval');
    }, CONNECTION_CHECK_INTERVAL);
  }

  /**
   * Stop periodic connection checking
   */
  private stopChecking(): void {
    const timestamp = new Date().toISOString();
    console.log(`🔗 [${timestamp}] [ConnectionManager] Stopping connection checks`);

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Perform a connection check
   */
  private async performCheck(reason: string): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [ConnectionManager] Connection check triggered (reason: ${reason})`);

    // Update state to checking
    this.state.status = 'checking';
    this.emitState();

    try {
      // Check connection
      const { connected, errorType } = await supabaseService.checkConnection();

      // Update state
      this.state.status = connected ? 'connected' : 'disconnected';
      this.state.errorType = errorType;
      this.state.lastChecked = Date.now();

      // Get schema version if connected
      if (connected) {
        const version = await supabaseService.getSchemaVersion();
        this.state.schemaVersion = version;

        // Also refresh competition data while we're at it (periodic polling)
        competitionManager.refresh().catch(err => {
          console.error('[ConnectionManager] Failed to refresh competition data:', err);
        });
      } else {
        this.state.schemaVersion = null;
      }

      // Emit updated state
      this.emitState();

      const completeTime = new Date().toISOString();
      console.log(`✓ [${completeTime}] [ConnectionManager] Connection check completed (status: ${this.state.status})`);
    } catch (error) {
      console.error('Connection check error:', error);
      this.state.status = 'disconnected';
      this.state.errorType = 'check_failed';
      this.state.lastChecked = Date.now();
      this.emitState();
    }
  }

  /**
   * Emit current state to all listeners
   */
  private emitState(): void {
    DeviceEventEmitter.emit(CONNECTION_STATUS_CHANGED_EVENT, this.state);
  }
}

// Export singleton instance
export const connectionManager = ConnectionManager.getInstance();
