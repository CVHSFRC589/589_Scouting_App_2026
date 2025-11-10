/**
 * Admin Dashboard (Admin Only)
 *
 * Central hub for all admin functions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { DemoBorderWrapper } from '@/components/DemoBorderWrapper';

export default function AdminDashboard() {
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
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>

        {/* Admin Cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(login)/(admin)/competitions')}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="trophy" size={40} color="#0066cc" />
            </View>
            <Text style={styles.cardTitle}>Competition Management</Text>
            <Text style={styles.cardDescription}>
              Manage available competitions and set the active competition for all apps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(login)/(admin)/users')}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="people" size={40} color="#0066cc" />
            </View>
            <Text style={styles.cardTitle}>User Management</Text>
            <Text style={styles.cardDescription}>
              Manage user accounts and grant admin privileges
            </Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
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
  cardContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconDisabled: {
    backgroundColor: '#f5f5f5',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardTitleDisabled: {
    color: '#999',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
