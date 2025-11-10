import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, DeviceEventEmitter, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabaseService } from '@/data/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSchemaCompatible, getSchemaCompatibilityMessage, logSchemaVersion } from '@/data/schemaVersion';
import { uploadQueue, QUEUE_UPDATED_EVENT, QueueStats } from '@/data/uploadQueue';
import { connectionManager, CONNECTION_STATUS_CHANGED_EVENT, ConnectionState } from '@/data/connectionManager';
import { useAuth } from '@/contexts/AuthContext';

const DEMO_MODE_KEY = '@demo_mode_enabled';
const CONFIRMED_PAUSED_KEY = '@database_confirmed_paused';
const CONNECTION_CHECK_INTERVAL = 30000; // Check every 30 seconds (legacy - now managed by ConnectionManager)
export const DEMO_MODE_CHANGED_EVENT = 'DEMO_MODE_CHANGED';

interface ConnectionHeaderProps {
  onDemoModeChange?: (isDemoMode: boolean) => void;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'demo';

// Component instance counter for debugging
let componentInstanceCounter = 0;

export const ConnectionHeader: React.FC<ConnectionHeaderProps> = ({ onDemoModeChange }) => {
  const router = useRouter();
  const { userProfile } = useAuth();

  // Generate unique ID for this component instance
  const instanceId = useRef(++componentInstanceCounter);
  const componentName = `ConnectionHeader#${instanceId.current}`;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
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

  // Load demo mode preference from storage
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`📱 [${timestamp}] [${componentName}] Component mounted (page loaded)`);

    const loadDemoMode = async () => {
      try {
        const value = await AsyncStorage.getItem(DEMO_MODE_KEY);
        const enabled = value === 'true';
        setDemoModeEnabled(enabled);
        if (enabled) {
          setConnectionStatus('demo');
        }
      } catch (error) {
        console.error('Error loading demo mode:', error);
      }
    };
    loadDemoMode();

    // Cleanup on unmount
    return () => {
      const unmountTime = new Date().toISOString();
      console.log(`📱 [${unmountTime}] [${componentName}] Component unmounted (page unloaded)`);
    };
  }, [componentName]);

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
    // Don't subscribe if demo mode is enabled
    if (demoModeEnabled) {
      setConnectionStatus('demo');
      setLastError(null);
      return;
    }

    const timestamp = new Date().toISOString();
    console.log(`📡 [${timestamp}] [${componentName}] Subscribing to ConnectionManager`);

    // Subscribe to connection manager
    const currentState = connectionManager.subscribe();

    // Update local state from manager state
    const updateFromManagerState = (state: ConnectionState) => {
      setConnectionStatus(state.status === 'checking' ? connectionStatus : state.status);
      setSchemaVersion(state.schemaVersion);
      setIsChecking(state.status === 'checking');

      // Handle errors and schema compatibility
      if (state.status === 'connected' && state.schemaVersion) {
        logSchemaVersion(state.schemaVersion, `${componentName}`);

        if (!isSchemaCompatible(state.schemaVersion)) {
          const { message } = getSchemaCompatibilityMessage(state.schemaVersion);
          setLastError(`Schema mismatch: ${message}`);
        } else {
          setLastError(null);
        }
      } else if (state.status === 'disconnected') {
        // Handle error types
        if (state.errorType === 'database_paused') {
          setLastError('Database is paused');
        } else if (state.errorType === 'network_error') {
          setLastError('Network error');
        } else if (state.errorType === 'database_unreachable') {
          setLastError('Database unreachable');
        } else {
          setLastError('Disconnected');
        }
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
      console.log(`📡 [${unsubTime}] [${componentName}] Unsubscribing from ConnectionManager`);
      subscription.remove();
      connectionManager.unsubscribe();
    };
  }, [demoModeEnabled, componentName, connectionStatus]);

  // Toggle demo mode
  const toggleDemoMode = async () => {
    const newValue = !demoModeEnabled;
    setDemoModeEnabled(newValue);

    try {
      await AsyncStorage.setItem(DEMO_MODE_KEY, newValue.toString());
    } catch (error) {
      console.error('Error saving demo mode:', error);
    }

    // Update connection status immediately
    if (newValue) {
      setConnectionStatus('demo');
    } else {
      // Trigger a connection check
      const { connected } = await supabaseService.checkConnection();
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    }

    // Emit event for border wrapper and other components
    DeviceEventEmitter.emit(DEMO_MODE_CHANGED_EVENT, { isDemoMode: newValue });

    // Notify parent component
    if (onDemoModeChange) {
      onDemoModeChange(newValue);
    }
  };

  // Get indicator color based on status
  const getIndicatorColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#28A745'; // Green
      case 'disconnected':
        return '#DC3545'; // Red
      case 'demo':
        return '#6C757D'; // Grey
      default:
        return '#6C757D';
    }
  };

  // Get indicator icon
  const getIndicatorIcon = () => {
    if (isChecking) {
      return 'hourglass-outline';
    }
    switch (connectionStatus) {
      case 'connected':
        return 'checkmark-circle';
      case 'disconnected':
        return 'close-circle';
      case 'demo':
        return 'pause-circle';
      default:
        return 'help-circle';
    }
  };

  // Handle indicator tap - show status dialog
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
          ? `Reason: ${lastError}\n\nPlease check your internet connection or verify Supabase credentials.`
          : 'Cannot connect to database.\n\nPlease check your internet connection.';
        break;

      case 'demo':
        title = '⚫ Demo Mode';
        message = 'Demo mode is enabled.\n\nData is not being saved to the database. All operations use mock data.\n\nTap the DEMO button to disable.';
        break;
    }

    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  };

  const pendingCount = queueStats.pending + queueStats.uploading;
  const hasFailed = queueStats.failed > 0;

  return (
    <View style={styles.container}>
      {/* Admin Button - Only visible to admins */}
      {userProfile?.is_admin && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push('/(login)/(admin)')}
          activeOpacity={0.7}
        >
          <Text style={styles.adminButtonText}>
            ADMIN
          </Text>
        </TouchableOpacity>
      )}

      {/* Demo Mode Toggle */}
      <TouchableOpacity
        style={[
          styles.toggle,
          demoModeEnabled ? styles.toggleActive : styles.toggleInactive
        ]}
        onPress={toggleDemoMode}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.toggleText,
          demoModeEnabled ? styles.toggleTextActive : styles.toggleTextInactive
        ]}>
          DEMO
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  adminButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    borderColor: '#E85A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  adminButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleActive: {
    backgroundColor: '#28A745',
    borderColor: '#1E7E34',
  },
  toggleInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DEE2E6',
  },
  toggleText: {
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#6C757D',
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  warningText: {
    marginTop: 8,
    fontSize: 14,
    color: '#DC3545',
    textAlign: 'center',
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#0071BC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Export function to get current demo mode status
export const getDemoModeFromStorage = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(DEMO_MODE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error reading demo mode:', error);
    return false;
  }
};

// Export function to check if we should use demo mode
export const shouldUseDemoMode = async (): Promise<boolean> => {
  const manuallyEnabled = await getDemoModeFromStorage();
  if (manuallyEnabled) {
    return true;
  }

  // If not manually enabled, check connection
  const { connected } = await supabaseService.checkConnection();
  return !connected;
};

// Helper functions for confirmed paused state (shared across all ConnectionHeader instances)
const getConfirmedPausedFromStorage = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(CONFIRMED_PAUSED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error reading confirmed paused state:', error);
    return false;
  }
};

const setConfirmedPausedInStorage = async (isPaused: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(CONFIRMED_PAUSED_KEY, isPaused.toString());
  } catch (error) {
    console.error('Error saving confirmed paused state:', error);
  }
};
