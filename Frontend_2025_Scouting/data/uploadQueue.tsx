import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseService } from './supabaseService';
import { DeviceEventEmitter } from 'react-native';

/**
 * Upload Queue Manager
 *
 * Handles offline-first data submission with persistent queuing, retry logic,
 * and robust confirmation of database ingestion. Designed for spotty FRC
 * competition WiFi/cellular conditions.
 *
 * Features:
 * - Persistent queue (survives app restarts)
 * - Exponential backoff with jitter
 * - Write verification (confirms DB received data)
 * - Background sync attempts
 * - Duplicate prevention
 */

// Queue item types
export type QueueItemType = 'pit_scouting' | 'match_pregame' | 'match_auto' | 'match_tele' | 'match_postgame' | 'match_complete';

export interface QueueItem {
  id: string; // UUID for tracking
  type: QueueItemType;
  data: any; // The actual data to upload
  createdAt: number; // Timestamp
  attempts: number; // Retry count
  lastAttemptAt?: number; // Last retry timestamp
  error?: string; // Last error message
  status: 'pending' | 'uploading' | 'failed' | 'succeeded';
}

// Event names for queue updates
export const QUEUE_UPDATED_EVENT = 'upload_queue_updated';
export const QUEUE_ITEM_SUCCEEDED_EVENT = 'upload_queue_item_succeeded';
export const QUEUE_ITEM_FAILED_EVENT = 'upload_queue_item_failed';

// Storage keys
const QUEUE_STORAGE_KEY = '@upload_queue';
const QUEUE_STATS_STORAGE_KEY = '@upload_queue_stats';

// Retry configuration
const MAX_RETRY_ATTEMPTS = 10; // Keep trying for a long time
const INITIAL_BACKOFF_MS = 2000; // Start with 2 seconds
const MAX_BACKOFF_MS = 300000; // Cap at 5 minutes
const JITTER_FACTOR = 0.3; // Add ±30% randomness to prevent thundering herd

/**
 * Upload Queue Statistics
 */
export interface QueueStats {
  totalQueued: number;
  pending: number;
  uploading: number;
  succeeded: number;
  failed: number;
  lastSyncAttempt?: number;
  lastSuccessfulSync?: number;
}

class UploadQueueManager {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueue();
    this.startBackgroundSync();
  }

  /**
   * Generate UUID for queue items
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate backoff delay with exponential backoff and jitter
   */
  private calculateBackoff(attempts: number): number {
    // Exponential: 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 300s (capped)
    const exponential = Math.min(
      INITIAL_BACKOFF_MS * Math.pow(2, attempts),
      MAX_BACKOFF_MS
    );

    // Add jitter: ±30% randomness
    const jitter = exponential * JITTER_FACTOR * (Math.random() * 2 - 1);

    return Math.floor(exponential + jitter);
  }

  /**
   * Load queue from persistent storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`📥 Loaded ${this.queue.length} items from upload queue`);

        // Reset any items stuck in 'uploading' state (app was closed mid-upload)
        this.queue.forEach(item => {
          if (item.status === 'uploading') {
            item.status = 'pending';
          }
        });

        await this.saveQueue();
        this.emitQueueUpdate();
      }
    } catch (error) {
      console.error('Failed to load upload queue:', error);
    }
  }

  /**
   * Save queue to persistent storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      await this.updateStats();
    } catch (error) {
      console.error('Failed to save upload queue:', error);
    }
  }

  /**
   * Update queue statistics
   */
  private async updateStats(): Promise<void> {
    const stats: QueueStats = {
      totalQueued: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      uploading: this.queue.filter(i => i.status === 'uploading').length,
      succeeded: this.queue.filter(i => i.status === 'succeeded').length,
      failed: this.queue.filter(i => i.status === 'failed').length,
    };

    try {
      await AsyncStorage.setItem(QUEUE_STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save queue stats:', error);
    }
  }

  /**
   * Emit queue update event for UI components
   */
  private emitQueueUpdate(): void {
    const stats = {
      totalQueued: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      uploading: this.queue.filter(i => i.status === 'uploading').length,
      succeeded: this.queue.filter(i => i.status === 'succeeded').length,
      failed: this.queue.filter(i => i.status === 'failed').length,
    };
    DeviceEventEmitter.emit(QUEUE_UPDATED_EVENT, stats);
  }

  /**
   * Add item to upload queue
   */
  async enqueue(type: QueueItemType, data: any): Promise<string> {
    const item: QueueItem = {
      id: this.generateId(),
      type,
      data,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending',
    };

    this.queue.push(item);
    await this.saveQueue();
    this.emitQueueUpdate();

    console.log(`📤 Queued ${type} (ID: ${item.id})`);

    // Trigger immediate processing attempt
    this.processQueue();

    return item.id;
  }

  /**
   * Process a single queue item
   */
  private async processItem(item: QueueItem): Promise<boolean> {
    // Check if enough time has passed since last attempt (backoff)
    if (item.lastAttemptAt) {
      const backoffDelay = this.calculateBackoff(item.attempts);
      const timeSinceLastAttempt = Date.now() - item.lastAttemptAt;

      if (timeSinceLastAttempt < backoffDelay) {
        // Still in backoff period
        return false;
      }
    }

    // Mark as uploading
    item.status = 'uploading';
    item.attempts += 1;
    item.lastAttemptAt = Date.now();
    await this.saveQueue();
    this.emitQueueUpdate();

    try {
      console.log(`⬆️ Uploading ${item.type} (ID: ${item.id}, attempt ${item.attempts})`);
      console.log(`   Data:`, JSON.stringify(item.data, null, 2));
      let result;

      // Call appropriate Supabase service based on type
      switch (item.type) {
        case 'pit_scouting':
          result = await supabaseService.updatePitData(
            item.data.team_num,
            item.data.regional,
            item.data,
            item.data.submitted_by
          );
          break;

        case 'match_pregame':
          result = await supabaseService.sendPregameData(item.data);
          break;

        case 'match_auto':
          result = await supabaseService.sendAutoData(item.data);
          break;

        case 'match_tele':
          result = await supabaseService.sendTeleData(item.data);
          break;

        case 'match_postgame':
          result = await supabaseService.updatePostGame(item.data);
          break;

        case 'match_complete':
          // Submit complete match data (pregame + auto + tele + postgame)
          result = await supabaseService.submitCompleteMatch(item.data);
          break;

        default:
          throw new Error(`Unknown queue item type: ${item.type}`);
      }

      // Verify we got acknowledgment from database
      if (!result || !result.acknowledgment) {
        throw new Error('No acknowledgment from database - upload may have failed');
      }

      // Success!
      item.status = 'succeeded';
      item.error = undefined;
      await this.saveQueue();
      this.emitQueueUpdate();

      DeviceEventEmitter.emit(QUEUE_ITEM_SUCCEEDED_EVENT, {
        id: item.id,
        type: item.type,
      });

      console.log(`✅ Uploaded ${item.type} (ID: ${item.id}) - attempt ${item.attempts}`);

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Upload error for ${item.type} (ID: ${item.id}):`, error);
      console.error(`   Error message:`, errorMessage);

      // Check if this is a permanent failure (e.g., validation error)
      const isPermanentError =
        errorMessage.includes('violates check constraint') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('Match not found');

      if (isPermanentError || item.attempts >= MAX_RETRY_ATTEMPTS) {
        // Give up on this item
        item.status = 'failed';
        item.error = errorMessage;
        console.error(`❌ Failed ${item.type} permanently (ID: ${item.id}): ${errorMessage}`);

        DeviceEventEmitter.emit(QUEUE_ITEM_FAILED_EVENT, {
          id: item.id,
          type: item.type,
          error: errorMessage,
          attempts: item.attempts,
        });
      } else {
        // Temporary failure - will retry
        item.status = 'pending';
        item.error = errorMessage;

        const nextRetryIn = this.calculateBackoff(item.attempts);
        console.warn(
          `⚠️ Failed ${item.type} (ID: ${item.id}) - attempt ${item.attempts}/${MAX_RETRY_ATTEMPTS}. ` +
          `Retry in ${Math.round(nextRetryIn / 1000)}s. Error: ${errorMessage}`
        );
      }

      await this.saveQueue();
      this.emitQueueUpdate();

      return false;
    }
  }

  /**
   * Process all pending items in the queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing
    }

    this.isProcessing = true;

    try {
      const pendingItems = this.queue.filter(
        item => item.status === 'pending' || item.status === 'uploading'
      );

      if (pendingItems.length === 0) {
        return;
      }

      console.log(`🔄 Processing ${pendingItems.length} pending upload(s)...`);

      // Process items sequentially (could be parallel, but sequential is safer)
      for (const item of pendingItems) {
        await this.processItem(item);
      }

      // Clean up succeeded items older than 24 hours
      await this.pruneSucceededItems();

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Remove old succeeded items to prevent queue bloat
   */
  private async pruneSucceededItems(): Promise<void> {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - ONE_DAY_MS;

    const originalLength = this.queue.length;
    this.queue = this.queue.filter(item => {
      // Keep failed and pending items indefinitely
      if (item.status !== 'succeeded') return true;

      // Keep succeeded items less than 24 hours old
      return item.lastAttemptAt ? item.lastAttemptAt > cutoff : true;
    });

    if (this.queue.length < originalLength) {
      const pruned = originalLength - this.queue.length;
      console.log(`🧹 Pruned ${pruned} old succeeded items from queue`);
      await this.saveQueue();
      this.emitQueueUpdate();
    }
  }

  /**
   * Start background sync - attempts upload every 30 seconds
   */
  private startBackgroundSync(): void {
    // Process immediately
    this.processQueue();

    // Then every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 30000); // 30 seconds
  }

  /**
   * Stop background sync
   */
  stopBackgroundSync(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Get current queue statistics
   */
  async getStats(): Promise<QueueStats> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STATS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load queue stats:', error);
    }

    return {
      totalQueued: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      uploading: this.queue.filter(i => i.status === 'uploading').length,
      succeeded: this.queue.filter(i => i.status === 'succeeded').length,
      failed: this.queue.filter(i => i.status === 'failed').length,
    };
  }

  /**
   * Get all queue items (for debugging/UI)
   */
  getQueue(): QueueItem[] {
    return [...this.queue];
  }

  /**
   * Get pending count
   */
  getPendingCount(): number {
    return this.queue.filter(i => i.status === 'pending' || i.status === 'uploading').length;
  }

  /**
   * Retry a failed item
   */
  async retryItem(id: string): Promise<void> {
    const item = this.queue.find(i => i.id === id);
    if (!item) {
      throw new Error(`Queue item ${id} not found`);
    }

    if (item.status === 'failed') {
      item.status = 'pending';
      item.attempts = 0; // Reset attempts
      item.lastAttemptAt = undefined;
      item.error = undefined;

      await this.saveQueue();
      this.emitQueueUpdate();

      // Trigger immediate processing
      this.processQueue();
    }
  }

  /**
   * Clear all succeeded items
   */
  async clearSucceeded(): Promise<void> {
    this.queue = this.queue.filter(i => i.status !== 'succeeded');
    await this.saveQueue();
    this.emitQueueUpdate();
  }

  /**
   * Clear entire queue (use with caution!)
   */
  async clearAll(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    this.emitQueueUpdate();
  }

  /**
   * Clear entire queue and reset statistics
   */
  async clearAllAndResetStats(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    await AsyncStorage.removeItem(QUEUE_STATS_STORAGE_KEY);

    // Emit update with zero stats
    this.emitQueueUpdate();

    console.log('🗑️ Upload queue and statistics cleared');
  }
}

// Export singleton instance
export const uploadQueue = new UploadQueueManager();
