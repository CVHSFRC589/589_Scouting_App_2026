import React from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { ConnectionHeader } from './ConnectionHeader';
import { useCompetition } from '@/contexts/CompetitionContext';

/**
 * App Header
 *
 * Persistent header shown on all screens with:
 * - Home icon (tap to navigate home)
 * - Connection indicator
 * - Upload queue indicator
 * - Demo mode toggle
 */
export const AppHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeCompetition } = useCompetition();

  // Don't show on login screen
  if (pathname === '/' || pathname === '/index') {
    return null;
  }

  const handleHomePress = () => {
    // Only navigate if not already on home
    if (pathname !== '/(login)/home') {
      router.push('/(login)/home');
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <Pressable onPress={handleHomePress} style={styles.homeButton}>
          <Image
            source={require('../assets/images/589_logo.png')}
            style={styles.homeIcon}
          />
        </Pressable>
        <View style={styles.rightSection}>
          <ConnectionHeader />
          {activeCompetition && (
            <View style={styles.competitionBadge}>
              <Text style={styles.competitionText} numberOfLines={1}>
                {activeCompetition}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.line}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 0,
    width: '100%',
    backgroundColor: '#E6F4FF',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  homeButton: {
    padding: 4,
  },
  homeIcon: {
    width: 64,
    height: 64,
  },
  competitionBadge: {
    // No background styling - just plain text like display name
  },
  competitionText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  line: {
    height: 2,
    backgroundColor: '#000',
    marginTop: 5,
    marginLeft: 25,
    marginRight: 25,
  },
});
