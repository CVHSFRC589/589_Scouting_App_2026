/**
 * User Management Page (Admin Only)
 *
 * Allows admins to:
 * - View all registered users
 * - Grant admin privileges to users
 * - Revoke admin privileges from users
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/data/supabaseClient';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { DemoBorderWrapper } from '@/components/DemoBorderWrapper';

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  team_number: number | null;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

export default function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Load all users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        Alert.alert('Error', 'Failed to load users.');
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Exception loading users:', error);
      Alert.alert('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  // Toggle admin status
  const toggleAdminStatus = async (userId: string, currentStatus: boolean, userEmail: string) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'grant admin privileges to' : 'revoke admin privileges from';

    Alert.alert(
      'Confirm Change',
      `Are you sure you want to ${action} ${userEmail}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: newStatus ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setUpdatingUserId(userId);

              const { error } = await supabase
                .from('user_profiles')
                .update({ is_admin: newStatus })
                .eq('id', userId);

              if (error) {
                console.error('Error updating admin status:', error);
                Alert.alert('Error', 'Failed to update admin status.');
                return;
              }

              Alert.alert(
                'Success',
                `Successfully ${newStatus ? 'granted' : 'revoked'} admin privileges ${newStatus ? 'to' : 'from'} ${userEmail}`
              );
              await loadUsers();
            } catch (error) {
              console.error('Exception updating admin status:', error);
              Alert.alert('Error', 'Failed to update admin status.');
            } finally {
              setUpdatingUserId(null);
            }
          },
        },
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <DemoBorderWrapper>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
        <AppFooter />
      </DemoBorderWrapper>
    );
  }

  return (
    <DemoBorderWrapper>
      <AppHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066cc']}
            tintColor="#0066cc"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(login)/home');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#0066cc" />
          </TouchableOpacity>
          <Text style={styles.title}>User Management</Text>
        </View>

        {/* User Count */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statCard}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              Alert.alert(
                'Admin Privileges',
                'Admin users can manage competitions, grant admin privileges to other users, and access all administrative functions. Regular users can only scout and view data.',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Text style={styles.statNumber}>
              {users.filter(u => u.is_admin).length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </TouchableOpacity>
        </View>

        {/* User List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Users</Text>
          <Text style={styles.sectionSubtitle}>
            Tap the toggle to grant or revoke admin privileges
          </Text>

          {users.length === 0 ? (
            <Text style={styles.noDataText}>No users found</Text>
          ) : (
            users.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  {/* Top row: Display name and email */}
                  <View style={styles.topRow}>
                    <Text style={styles.userName}>
                      {user.display_name || user.email}
                    </Text>
                    {user.is_admin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>ADMIN</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>

                  {/* Bottom row: Joined and last login */}
                  <View style={styles.bottomRow}>
                    <View style={styles.metaSection}>
                      <Text style={styles.userMetaText}>
                        Joined {formatDate(user.created_at)}
                      </Text>
                      <Text style={styles.userMetaText}>
                        Last login {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        user.is_admin && styles.toggleButtonActive,
                        updatingUserId === user.id && styles.toggleButtonDisabled,
                      ]}
                      onPress={() => toggleAdminStatus(user.id, user.is_admin, user.email)}
                      disabled={updatingUserId === user.id}
                    >
                      {updatingUserId === user.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons
                            name={user.is_admin ? 'shield-checkmark' : 'shield-outline'}
                            size={20}
                            color="#fff"
                          />
                          <Text style={styles.toggleButtonText}>
                            {user.is_admin ? 'Revoke' : 'Grant'} Admin
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
      <AppFooter />
    </DemoBorderWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4FF',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F4FF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
    flexWrap: 'wrap',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0071BC',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaSection: {
    flex: 1,
    gap: 4,
  },
  userMetaText: {
    fontSize: 12,
    color: '#999',
  },
  adminBadge: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#DC3545',
  },
  toggleButtonDisabled: {
    opacity: 0.6,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
