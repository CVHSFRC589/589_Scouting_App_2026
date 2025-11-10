/**
 * Competition Management Page (Admin Only)
 *
 * Allows admins to:
 * - View available competitions
 * - Add new competitions
 * - Set the active competition for all apps
 * - Remove competitions from the list
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/data/supabaseClient';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { DemoBorderWrapper } from '@/components/DemoBorderWrapper';
import { competitionManager } from '@/data/competitionManager';

interface CompetitionData {
  active_competition: string | null;
  available_competitions: string[];
}

export default function CompetitionsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [competitionData, setCompetitionData] = useState<CompetitionData>({
    active_competition: null,
    available_competitions: [],
  });
  const [newCompetitionName, setNewCompetitionName] = useState('');
  const [addingCompetition, setAddingCompetition] = useState(false);

  // Load competition data from app_metadata
  const loadCompetitionData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_metadata')
        .select('active_competition, available_competitions')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error loading competition data:', error);
        Alert.alert('Error', 'Failed to load competition data.');
        return;
      }

      setCompetitionData({
        active_competition: data.active_competition,
        available_competitions: data.available_competitions || [],
      });
    } catch (error) {
      console.error('Exception loading competition data:', error);
      Alert.alert('Error', 'Failed to load competition data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitionData();
  }, []);

  // Set the active competition
  const setActiveCompetition = async (competitionName: string) => {
    try {
      setSaving(true);
      const { error } = await supabase.rpc('set_active_competition', {
        competition_name: competitionName,
      });

      if (error) {
        console.error('Error setting active competition:', error);
        Alert.alert('Error', 'Failed to set active competition.');
        return;
      }

      Alert.alert('Success', `Active competition set to: ${competitionName}`);
      await loadCompetitionData();

      // Immediately refresh the CompetitionManager so the admin app updates
      await competitionManager.refresh();
    } catch (error) {
      console.error('Exception setting active competition:', error);
      Alert.alert('Error', 'Failed to set active competition.');
    } finally {
      setSaving(false);
    }
  };

  // Add a new competition
  const addCompetition = async () => {
    if (!newCompetitionName.trim()) {
      Alert.alert('Validation Error', 'Please enter a competition name.');
      return;
    }

    // Check if already exists
    if (competitionData.available_competitions.includes(newCompetitionName.trim())) {
      Alert.alert('Already Exists', 'This competition already exists in the list.');
      return;
    }

    try {
      setAddingCompetition(true);
      const { error } = await supabase.rpc('add_competition', {
        competition_name: newCompetitionName.trim(),
      });

      if (error) {
        console.error('Error adding competition:', error);
        Alert.alert('Error', 'Failed to add competition.');
        return;
      }

      Alert.alert('Success', `Added competition: ${newCompetitionName.trim()}`);
      setNewCompetitionName('');
      await loadCompetitionData();

      // Immediately refresh the CompetitionManager
      await competitionManager.refresh();
    } catch (error) {
      console.error('Exception adding competition:', error);
      Alert.alert('Error', 'Failed to add competition.');
    } finally {
      setAddingCompetition(false);
    }
  };

  // Remove a competition
  const removeCompetition = async (competitionName: string) => {
    // Don't allow removing the active competition
    if (competitionName === competitionData.active_competition) {
      Alert.alert(
        'Cannot Remove',
        'Cannot remove the currently active competition. Please set a different competition as active first.'
      );
      return;
    }

    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove "${competitionName}" from the list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const { error } = await supabase.rpc('remove_competition', {
                competition_name: competitionName,
              });

              if (error) {
                console.error('Error removing competition:', error);
                Alert.alert('Error', 'Failed to remove competition.');
                return;
              }

              Alert.alert('Success', `Removed competition: ${competitionName}`);
              await loadCompetitionData();

              // Immediately refresh the CompetitionManager
              await competitionManager.refresh();
            } catch (error) {
              console.error('Exception removing competition:', error);
              Alert.alert('Error', 'Failed to remove competition.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <DemoBorderWrapper>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading competition data...</Text>
        </View>
        <AppFooter />
      </DemoBorderWrapper>
    );
  }

  return (
    <DemoBorderWrapper>
      <AppHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
          <Text style={styles.title}>Competition Management</Text>
        </View>

        {/* Active Competition Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Competition</Text>
          <Text style={styles.sectionSubtitle}>
            All scouting apps will use this competition
          </Text>

          {competitionData.active_competition ? (
            <View style={styles.activeCompetitionCard}>
              <Ionicons name="checkmark-circle" size={32} color="#28A745" />
              <Text style={styles.activeCompetitionText}>
                {competitionData.active_competition}
              </Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>No active competition set</Text>
          )}
        </View>

        {/* Add New Competition Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Competition</Text>
          <View style={styles.addCompetitionContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter competition name (e.g., World Championship)"
              placeholderTextColor="#999"
              value={newCompetitionName}
              onChangeText={setNewCompetitionName}
              editable={!addingCompetition}
            />
            <TouchableOpacity
              style={[styles.addButton, addingCompetition && styles.buttonDisabled]}
              onPress={addCompetition}
              disabled={addingCompetition}
            >
              {addingCompetition ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Add</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Competitions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Competitions</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a competition to set it as active
          </Text>

          {competitionData.available_competitions.length === 0 ? (
            <Text style={styles.noDataText}>
              No competitions available. Add one above.
            </Text>
          ) : (
            competitionData.available_competitions.map((competition) => (
              <View
                key={competition}
                style={[
                  styles.competitionCard,
                  competition === competitionData.active_competition && styles.competitionCardActive,
                ]}
              >
                <View style={styles.competitionCardLeft}>
                  <TouchableOpacity
                    style={styles.competitionCardContent}
                    onPress={() => setActiveCompetition(competition)}
                    disabled={saving || competition === competitionData.active_competition}
                  >
                    {competition === competitionData.active_competition ? (
                      <Ionicons name="radio-button-on" size={24} color="#0066cc" />
                    ) : (
                      <Ionicons name="radio-button-off" size={24} color="#999" />
                    )}
                    <Text
                      style={[
                        styles.competitionName,
                        competition === competitionData.active_competition &&
                          styles.competitionNameActive,
                      ]}
                    >
                      {competition}
                    </Text>
                  </TouchableOpacity>
                </View>

                {competition !== competitionData.active_competition && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeCompetition(competition)}
                    disabled={saving}
                  >
                    <Ionicons name="trash-outline" size={20} color="#DC3545" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color="#0066cc" />
          <Text style={styles.infoText}>
            When you set an active competition, all scouting apps will automatically
            use this competition for data collection and viewing. This supports
            regional competitions, world championships, practice events, and more.
          </Text>
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
    marginTop: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
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
  activeCompetitionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#28A745',
  },
  activeCompetitionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  addCompetitionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0066cc',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  competitionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  competitionCardActive: {
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  competitionCardLeft: {
    flex: 1,
  },
  competitionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  competitionName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  competitionNameActive: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
  removeButton: {
    padding: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
