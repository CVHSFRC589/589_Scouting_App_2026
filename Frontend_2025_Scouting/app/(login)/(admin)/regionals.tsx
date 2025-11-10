/**
 * Regional Management Page (Admin Only)
 *
 * Allows admins to:
 * - View available regionals
 * - Add new regionals
 * - Set the active regional for all apps
 * - Remove regionals from the list
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

interface RegionalData {
  active_regional: string | null;
  available_regionals: string[];
}

export default function RegionalsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regionalData, setRegionalData] = useState<RegionalData>({
    active_regional: null,
    available_regionals: [],
  });
  const [newRegionalName, setNewRegionalName] = useState('');
  const [addingRegional, setAddingRegional] = useState(false);

  // Load regional data from app_metadata
  const loadRegionalData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_metadata')
        .select('active_regional, available_regionals')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error loading regional data:', error);
        Alert.alert('Error', 'Failed to load regional data.');
        return;
      }

      setRegionalData({
        active_regional: data.active_regional,
        available_regionals: data.available_regionals || [],
      });
    } catch (error) {
      console.error('Exception loading regional data:', error);
      Alert.alert('Error', 'Failed to load regional data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegionalData();
  }, []);

  // Set the active regional
  const setActiveRegional = async (regionalName: string) => {
    try {
      setSaving(true);
      const { error } = await supabase.rpc('set_active_regional', {
        regional_name: regionalName,
      });

      if (error) {
        console.error('Error setting active regional:', error);
        Alert.alert('Error', 'Failed to set active regional.');
        return;
      }

      Alert.alert('Success', `Active regional set to: ${regionalName}`);
      await loadRegionalData();
    } catch (error) {
      console.error('Exception setting active regional:', error);
      Alert.alert('Error', 'Failed to set active regional.');
    } finally {
      setSaving(false);
    }
  };

  // Add a new regional
  const addRegional = async () => {
    if (!newRegionalName.trim()) {
      Alert.alert('Validation Error', 'Please enter a regional name.');
      return;
    }

    // Check if already exists
    if (regionalData.available_regionals.includes(newRegionalName.trim())) {
      Alert.alert('Already Exists', 'This regional already exists in the list.');
      return;
    }

    try {
      setAddingRegional(true);
      const { error } = await supabase.rpc('add_regional', {
        regional_name: newRegionalName.trim(),
      });

      if (error) {
        console.error('Error adding regional:', error);
        Alert.alert('Error', 'Failed to add regional.');
        return;
      }

      Alert.alert('Success', `Added regional: ${newRegionalName.trim()}`);
      setNewRegionalName('');
      await loadRegionalData();
    } catch (error) {
      console.error('Exception adding regional:', error);
      Alert.alert('Error', 'Failed to add regional.');
    } finally {
      setAddingRegional(false);
    }
  };

  // Remove a regional
  const removeRegional = async (regionalName: string) => {
    // Don't allow removing the active regional
    if (regionalName === regionalData.active_regional) {
      Alert.alert(
        'Cannot Remove',
        'Cannot remove the currently active regional. Please set a different regional as active first.'
      );
      return;
    }

    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove "${regionalName}" from the list?`,
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
              const { error } = await supabase.rpc('remove_regional', {
                regional_name: regionalName,
              });

              if (error) {
                console.error('Error removing regional:', error);
                Alert.alert('Error', 'Failed to remove regional.');
                return;
              }

              Alert.alert('Success', `Removed regional: ${regionalName}`);
              await loadRegionalData();
            } catch (error) {
              console.error('Exception removing regional:', error);
              Alert.alert('Error', 'Failed to remove regional.');
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
          <Text style={styles.loadingText}>Loading regional data...</Text>
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
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0066cc" />
          </TouchableOpacity>
          <Text style={styles.title}>Regional Management</Text>
        </View>

        {/* Active Regional Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Regional</Text>
          <Text style={styles.sectionSubtitle}>
            All scouting apps will use this regional
          </Text>

          {regionalData.active_regional ? (
            <View style={styles.activeRegionalCard}>
              <Ionicons name="checkmark-circle" size={32} color="#28A745" />
              <Text style={styles.activeRegionalText}>
                {regionalData.active_regional}
              </Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>No active regional set</Text>
          )}
        </View>

        {/* Add New Regional Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Regional</Text>
          <View style={styles.addRegionalContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter regional name (e.g., East Bay Regional)"
              placeholderTextColor="#999"
              value={newRegionalName}
              onChangeText={setNewRegionalName}
              editable={!addingRegional}
            />
            <TouchableOpacity
              style={[styles.addButton, addingRegional && styles.buttonDisabled]}
              onPress={addRegional}
              disabled={addingRegional}
            >
              {addingRegional ? (
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

        {/* Available Regionals List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Regionals</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a regional to set it as active
          </Text>

          {regionalData.available_regionals.length === 0 ? (
            <Text style={styles.noDataText}>
              No regionals available. Add one above.
            </Text>
          ) : (
            regionalData.available_regionals.map((regional) => (
              <View
                key={regional}
                style={[
                  styles.regionalCard,
                  regional === regionalData.active_regional && styles.regionalCardActive,
                ]}
              >
                <View style={styles.regionalCardLeft}>
                  <TouchableOpacity
                    style={styles.regionalCardContent}
                    onPress={() => setActiveRegional(regional)}
                    disabled={saving || regional === regionalData.active_regional}
                  >
                    {regional === regionalData.active_regional ? (
                      <Ionicons name="radio-button-on" size={24} color="#0066cc" />
                    ) : (
                      <Ionicons name="radio-button-off" size={24} color="#999" />
                    )}
                    <Text
                      style={[
                        styles.regionalName,
                        regional === regionalData.active_regional &&
                          styles.regionalNameActive,
                      ]}
                    >
                      {regional}
                    </Text>
                  </TouchableOpacity>
                </View>

                {regional !== regionalData.active_regional && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeRegional(regional)}
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
            When you set an active regional, all scouting apps will automatically
            use this regional for data collection and viewing.
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
  activeRegionalCard: {
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
  activeRegionalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  addRegionalContainer: {
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
  regionalCard: {
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
  regionalCardActive: {
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  regionalCardLeft: {
    flex: 1,
  },
  regionalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionalName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  regionalNameActive: {
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
