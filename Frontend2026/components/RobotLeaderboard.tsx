import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import StatsAccordion from './StatsAccordion'; // Import the previously created accordion

interface LeaderboardProps {
  sortedStats: RobotStats[];
  showLeaderboard: boolean;
  isLoading?: boolean;
  error?: string;
}

const LeaderboardView: React.FC<LeaderboardProps> = ({
  sortedStats,
  showLeaderboard,
  isLoading = false,
  error
}) => {
  // If not meant to be shown, return null
  if (!showLeaderboard) {
    return null;
  }

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Handle empty state
  if (!sortedStats || sortedStats.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No robot statistics available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Robot Performance Leaderboard</Text> */}
      <ScrollView style={styles.scrollView}>
        {sortedStats.map((robotStat, index) => (
          <View key={index} style={styles.rankContainer}>
            
            <View style={styles.accordionContainer}>
            {/* <View style={styles.rankBadge}> */}
              {/* <Text style={styles.rankText}>#{index + 1}</Text> */}
            {/* </View> */}
              <StatsAccordion
                stats={robotStat}
                title={` ${robotStat.team_num}`}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'pink',
    // padding: 16,
    width: '120%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  teamNum:{
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'left',
  },
  scrollView: {
    flex: 1,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 12,
  },
  // rankBadge: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: 'red',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginRight: 12,
  // },
  // rankText: {
  //   color: '#000',
  //   fontSize: 16,
  //   fontWeight: 'bold',
  // },
  accordionContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LeaderboardView;