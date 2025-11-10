import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, DeviceEventEmitter, Pressable, Modal, ScrollView } from 'react-native';
import { uploadQueue, QUEUE_UPDATED_EVENT, QueueStats } from '@/data/uploadQueue';

/**
 * Upload Queue Indicator
 *
 * Shows a small badge with pending upload count
 * Tap to see detailed queue status
 */
export const UploadQueueIndicator: React.FC = () => {
  const [stats, setStats] = useState<QueueStats>({
    totalQueued: 0,
    pending: 0,
    uploading: 0,
    succeeded: 0,
    failed: 0,
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Load initial stats
    uploadQueue.getStats().then(setStats);

    // Listen for queue updates
    const subscription = DeviceEventEmitter.addListener(
      QUEUE_UPDATED_EVENT,
      (updatedStats: QueueStats) => {
        setStats(updatedStats);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const pendingCount = stats.pending + stats.uploading;

  if (pendingCount === 0 && stats.failed === 0) {
    // Nothing pending, don't show indicator
    return null;
  }

  return (
    <>
      {/* Small Badge */}
      <Pressable
        style={[
          styles.badge,
          stats.failed > 0 && styles.badgeFailed,
        ]}
        onPress={() => setShowDetails(true)}
      >
        <Text style={styles.badgeText}>
          {stats.failed > 0 ? '!' : '↑'} {pendingCount}
        </Text>
      </Pressable>

      {/* Detailed Modal */}
      <Modal
        visible={showDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Queue Status</Text>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Pending:</Text>
              <Text style={styles.statsValue}>{stats.pending}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Uploading:</Text>
              <Text style={styles.statsValue}>{stats.uploading}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Succeeded:</Text>
              <Text style={[styles.statsValue, styles.succeeded]}>{stats.succeeded}</Text>
            </View>

            {stats.failed > 0 && (
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Failed:</Text>
                <Text style={[styles.statsValue, styles.failed]}>{stats.failed}</Text>
              </View>
            )}

            <Text style={styles.infoText}>
              {pendingCount > 0
                ? `${pendingCount} upload(s) in progress. Data will be uploaded automatically when network is available.`
                : 'All uploads complete!'}
            </Text>

            {stats.failed > 0 && (
              <Text style={styles.warningText}>
                Some uploads failed permanently. Check console logs for details.
              </Text>
            )}

            <Pressable
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#00BCF0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  badgeFailed: {
    backgroundColor: '#DC3545',
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
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
