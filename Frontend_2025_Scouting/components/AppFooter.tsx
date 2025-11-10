import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Pressable, Text, TouchableOpacity, Modal, DeviceEventEmitter, Alert } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppCache from '@/data/cache';
import { supabaseService } from '@/data/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSchemaCompatible, getSchemaCompatibilityMessage } from '@/data/schemaVersion';
import { uploadQueue, QUEUE_UPDATED_EVENT, QueueStats } from '@/data/uploadQueue';
import { connectionManager, CONNECTION_STATUS_CHANGED_EVENT, ConnectionState } from '@/data/connectionManager';
import { useAuth } from '@/contexts/AuthContext';

const DEMO_MODE_KEY = '@demo_mode_enabled';
const CONFIRMED_PAUSED_KEY = '@database_confirmed_paused';
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

export type ConnectionStatus = 'connected' | 'disconnected' | 'demo';

const setConfirmedPausedInStorage = async (confirmed: boolean) => {
  try {
    await AsyncStorage.setItem(CONFIRMED_PAUSED_KEY, confirmed.toString());
  } catch (error) {
    console.error('Error saving confirmed paused state:', error);
  }
};

const getConfirmedPausedFromStorage = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(CONFIRMED_PAUSED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error loading confirmed paused state:', error);
    return false;
  }
};

/**
 * App Footer
 *
 * Persistent footer shown on all screens with:
 * - Logout button (clears cache and returns to login)
 * - Connection indicator
 * - Upload queue indicator
 */
export const AppFooter: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, userProfile } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isChecking, setIsChecking] = useState(false);
  const [schemaVersion, setSchemaVersion] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalQueued: 0,
    pending: 0,
    uploading: 0,
    succeeded: 0,
    failed: 0,
  });
  const [showQueueModal, setShowQueueModal] = useState(false);

  const handleLogout = async () => {
    try {
      // Clear local cache
      await AppCache.clearData();

      // Sign out from Supabase Auth
      await signOut();

      // Redirect to login
      console.log('[AppFooter] User logged out, redirecting to login');
      router.replace('/login');
    } catch (error) {
      console.error('[AppFooter] Logout error:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  // Load queue stats and listen for updates
  useEffect(() => {
    uploadQueue.getStats().then(setQueueStats);

    const subscription = DeviceEventEmitter.addListener(
      QUEUE_UPDATED_EVENT,
      (updatedStats: QueueStats) => {
        setQueueStats(updatedStats);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Subscribe to singleton connection manager
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`📡 [${timestamp}] [AppFooter] Subscribing to ConnectionManager`);

    // Subscribe to connection manager
    const currentState = connectionManager.subscribe();

    // Update local state from manager state
    const updateFromManagerState = (state: ConnectionState) => {
      setConnectionStatus(state.status === 'checking' ? connectionStatus : state.status);
      setSchemaVersion(state.schemaVersion);
      setIsChecking(state.status === 'checking');

      // Handle errors and schema compatibility
      if (state.status === 'connected' && state.schemaVersion) {
        if (!isSchemaCompatible(state.schemaVersion)) {
          const { message } = getSchemaCompatibilityMessage(state.schemaVersion);
          setLastError(`Schema mismatch: ${message}`);
        } else {
          setLastError(null);
        }
      } else if (state.status === 'disconnected') {
        setLastError('Database not responding');
      }
    };

    // Set initial state
    updateFromManagerState(currentState);

    // Listen for state changes
    const subscription = DeviceEventEmitter.addListener(
      CONNECTION_STATUS_CHANGED_EVENT,
      updateFromManagerState
    );

    return () => {
      const unsubTime = new Date().toISOString();
      console.log(`📡 [${unsubTime}] [AppFooter] Unsubscribing from ConnectionManager`);
      subscription.remove();
      connectionManager.unsubscribe();
    };
  }, [connectionStatus]); // Only run on mount, not on pathname changes

  const getIndicatorColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#28A745';
      case 'disconnected': return '#DC3545';
      case 'demo': return '#6C757D';
      default: return '#6C757D';
    }
  };

  const getIndicatorIcon = () => {
    if (isChecking) return 'hourglass-outline';
    switch (connectionStatus) {
      case 'connected': return 'checkmark-circle';
      case 'disconnected': return 'close-circle';
      case 'demo': return 'pause-circle';
      default: return 'help-circle';
    }
  };

  const handleIndicatorPress = () => {
    let title = '';
    let message = '';

    switch (connectionStatus) {
      case 'connected':
        title = '✅ Connected';
        message = schemaVersion
          ? `Database schema version: ${schemaVersion}\n\nConnection is working properly.`
          : 'Database connection is active.';
        break;
      case 'disconnected':
        title = '❌ Disconnected';
        message = lastError
          ? `Reason: ${lastError}\n\nPlease check your internet connection.`
          : 'Cannot connect to database.';
        break;
      case 'demo':
        title = '⚫ Demo Mode';
        message = 'Demo mode is enabled.';
        break;
    }

    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  };

  const pendingCount = queueStats.pending + queueStats.uploading;
  const hasFailed = queueStats.failed > 0;

  // Don't show on login screen
  if (pathname === '/' || pathname === '/index') {
    return null;
  }

  return (
    <>
      <View style={styles.outerContainer}>
        <View style={styles.line}></View>
        <View style={styles.container}>
          <View style={styles.leftSection}>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Image
                source={require('../assets/images/Logout Rounded Left.png')}
                style={styles.logoutIcon}
              />
            </Pressable>
            {userProfile?.display_name && (
              <Text style={styles.displayName}>
                {userProfile.display_name}
              </Text>
            )}
          </View>

          <View style={styles.statusContainer}>
            {/* Connection Indicator */}
            <TouchableOpacity
              style={[styles.indicator, { backgroundColor: getIndicatorColor() }]}
              activeOpacity={0.7}
              disabled={isChecking}
              onPress={handleIndicatorPress}
            >
              <Ionicons
                name={getIndicatorIcon()}
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Upload Queue Button */}
            <TouchableOpacity
              style={[
                styles.queueButton,
                hasFailed && styles.queueButtonFailed
              ]}
              onPress={() => setShowQueueModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={hasFailed ? 'warning' : 'cloud-upload'}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.queueButtonText}>
                {pendingCount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Queue Details Modal */}
      <Modal
        visible={showQueueModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQueueModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Queue Status</Text>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Pending:</Text>
              <Text style={styles.statsValue}>{queueStats.pending}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Uploading:</Text>
              <Text style={styles.statsValue}>{queueStats.uploading}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Succeeded:</Text>
              <Text style={[styles.statsValue, styles.succeeded]}>{queueStats.succeeded}</Text>
            </View>

            {queueStats.failed > 0 && (
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Failed:</Text>
                <Text style={[styles.statsValue, styles.failed]}>{queueStats.failed}</Text>
              </View>
            )}

            <Text style={styles.infoText}>
              {pendingCount > 0
                ? `${pendingCount} upload(s) in progress. Data will be uploaded automatically when network is available.`
                : 'All uploads complete!'}
            </Text>

            {queueStats.failed > 0 && (
              <Text style={styles.warningText}>
                Some uploads failed permanently. Check console logs for details.
              </Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={async () => {
                  Alert.alert(
                    'Clear Upload Queue',
                    'This will permanently delete all queued uploads and reset statistics. Are you sure?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      },
                      {
                        text: 'Clear All',
                        style: 'destructive',
                        onPress: async () => {
                          await uploadQueue.clearAllAndResetStats();
                          setShowQueueModal(false);
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.clearButtonText}>Clear Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowQueueModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#E6F4FF',
  },
  line: {
    height: 2,
    backgroundColor: '#000',
    marginLeft: 25,
    marginRight: 25,
  },
  container: {
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoutIcon: {
    width: 30,
    height: 30,
  },
  displayName: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indicator: {
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  queueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#00BCF0',
    minWidth: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  queueButtonFailed: {
    backgroundColor: '#DC3545',
  },
  queueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#0071BC',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsLabel: {
    fontSize: 16,
    color: '#333',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  succeeded: {
    color: '#28A745',
  },
  failed: {
    color: '#DC3545',
  },
  infoText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  warningText: {
    marginTop: 10,
    fontSize: 14,
    color: '#DC3545',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#0071BC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
