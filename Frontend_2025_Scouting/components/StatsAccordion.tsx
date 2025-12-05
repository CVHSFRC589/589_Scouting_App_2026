import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { useFonts } from "expo-font";
import { router } from 'expo-router';
import { supabaseService } from '../data/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { useCompetition } from '../contexts/CompetitionContext';


// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface StatsAccordionProps {
  stats: RobotStats;
  title?: string;
  sortField?: string; // The currently selected sort field
  userStarred?: boolean; // Initial user star state
  adminStarred?: boolean; // Initial admin star state
  onStarChange?: () => void; // Callback when star state changes
}

const StatsAccordion: React.FC<StatsAccordionProps> = ({
  stats,
  title = "Robot Statistics",
  sortField = "Rank",
  userStarred = false,
  adminStarred = false,
  onStarChange
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hasUserStar, setHasUserStar] = useState(userStarred);
  const [hasAdminStar, setHasAdminStar] = useState(adminStarred);
  const [isTogglingstar, setIsTogglingstar] = useState(false);

  const { userProfile } = useAuth();
  const { activeCompetition } = useCompetition();
  const isAdmin = userProfile?.is_admin || false;

  // Update local state when props change
  useEffect(() => {
    setHasUserStar(userStarred);
    setHasAdminStar(adminStarred);
  }, [userStarred, adminStarred]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // console.log("Toggling expand with robot stats: ", stats);
    setExpanded(!expanded);
  };

  /**
   * Handle star tap
   * For admins: First tap = user star, second tap (when user star exists) = admin star
   * For regular users: Toggle user star only
   */
  const handleStarPress = async () => {
    if (isTogglingstar || !activeCompetition) return;

    setIsTogglingstar(true);

    try {
      const teamNumber = stats.team_num;
      const regional = activeCompetition;

      if (isAdmin) {
        // Admin logic: First tap = user star, second tap = admin star
        if (!hasUserStar) {
          // First tap: Add user star
          const added = await supabaseService.toggleUserStar(teamNumber, regional);
          setHasUserStar(added);
          console.log(`Admin added user star for team ${teamNumber}`);
        } else if (!hasAdminStar) {
          // Second tap: Add admin star (user star already exists)
          const added = await supabaseService.toggleAdminStar(teamNumber, regional);
          setHasAdminStar(added);
          console.log(`Admin ${added ? 'added' : 'removed'} admin star for team ${teamNumber}`);
        } else {
          // Third tap: Remove both stars
          await supabaseService.toggleAdminStar(teamNumber, regional); // Remove admin star
          setHasAdminStar(false);
          await supabaseService.toggleUserStar(teamNumber, regional); // Remove user star
          setHasUserStar(false);
          console.log(`Admin removed both stars for team ${teamNumber}`);
        }
      } else {
        // Regular user: Toggle user star only
        const added = await supabaseService.toggleUserStar(teamNumber, regional);
        setHasUserStar(added);
        console.log(`User ${added ? 'added' : 'removed'} star for team ${teamNumber}`);
      }

      // Notify parent component of change
      if (onStarChange) {
        onStarChange();
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      // Revert optimistic updates on error
      setHasUserStar(userStarred);
      setHasAdminStar(adminStarred);
    } finally {
      setIsTogglingstar(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  // Get the value to display based on the current sort field (rounded to nearest whole number)
  const getSortValue = () => {
    switch (sortField) {
      case "Rank":
        return Math.round(stats.rank_value || 0).toString();
      case "Algae Scored":
        return Math.round(stats.avg_algae_scored || 0).toString();
      case "Algae Removed":
        return Math.round(stats.avg_algae_removed || 0).toString();
      case "Algae Processed":
        return Math.round(stats.avg_algae_processed || 0).toString();
      case "Algae Average":
        return Math.round(stats.avg_algae || 0).toString();
      case "Coral L1":
        return Math.round(stats.avg_L1 || 0).toString();
      case "Coral L2":
        return Math.round(stats.avg_L2 || 0).toString();
      case "Coral L3":
        return Math.round(stats.avg_L3 || 0).toString();
      case "Coral L4":
        return Math.round(stats.avg_L4 || 0).toString();
      case "Coral Average":
        return Math.round(stats.avg_coral || 0).toString();
      default:
        return Math.round(stats.rank_value || 0).toString();
    }
  };

  const [fontLoaded] = useFonts({
      Koulen: require("../assets/fonts/Koulen-Regular.ttf"),
      InterBold: require("../assets/fonts/Inter_18pt-Bold.ttf"),
      InterExtraBold: require("../assets/fonts/Inter_18pt-ExtraBold.ttf"),
    });
  
    if (!fontLoaded) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    }
  const statsList = [
    // { label: 'Rank', value: stats.rank_value },
    // { label: 'Algae Scored', value: stats.avg_algae_scored },
    { label: 'Algae Removed', value: stats.avg_algae_removed },
    { label: 'Algae Processed', value: stats.avg_algae_processed },
    // { label: 'Average Algae', value: stats.avg_algae },
    { label: 'Coral L1', value: stats.avg_L1 },
    { label: 'Coral L2', value: stats.avg_L2 },
    { label: 'Coral L3', value: stats.avg_L3 },
    { label: 'Coral L4', value: stats.avg_L4 },
    // { label: 'Average Coral', value: stats.avg_coral },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          {/* Team Number - First */}
          <Pressable
            onPress={() => router.push(`../(TeamInfo)/(tabs)/RobotDisplay?team=${encodeURIComponent(title)}`)}
            style={styles.teamNumberContainer}
          >
            <Text style={styles.headerText}>{title}</Text>
          </Pressable>

          {/* Score - Second */}
          <Text style={styles.scoreText}>{getSortValue()}</Text>

          {/* Star - Third */}
          <Pressable onPress={handleStarPress} disabled={isTogglingstar}>
            <Image
              source={
                hasAdminStar
                  ? require('../assets/images/fullStar.png') // Blue star (we'll tint it blue)
                  : hasUserStar
                  ? require('../assets/images/fullStar.png') // Yellow star
                  : require('../assets/images/outlineStar.png') // Outline star
              }
              style={[
                styles.star,
                hasAdminStar && styles.blueStar, // Apply blue tint for admin stars
                hasUserStar && !hasAdminStar && styles.yellowStar, // Apply yellow tint for user stars
                isTogglingstar && styles.starDisabled // Dimmed when processing
              ]}
            />
          </Pressable>

          {/* Expand Arrow - Last */}
          <Pressable onPress={() => toggleExpand()}>
            <Image
              source={require('../assets/images/arrow.png')}
              style={[styles.arrow, { transform: [{ rotate: expanded ? '180deg' : '0deg' }] }]}
            />
          </Pressable>
        </View>
      <View style={styles.borderline}></View>
      
      {expanded && (
      <View style={styles.content}>
        <View style={styles.statsGrid}>
          {stats.avg_L1 ? (
            statsList.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{formatNumber(stat.value)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.statValue}>No data available.</Text>
          )}
        </View>
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#fff',
    overflow: 'hidden',
    // marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    // backgroundColor: 'white',
    width: '100%',
  },
  headerPressed: {
    opacity: 0.9,
  },
  teamNumberContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerText: {
    fontSize: 35,
    fontWeight: '600',
    color: '#000',
    textAlign: "left",
  },
  scoreText: {
    fontSize: 30,
    color: '#0071bc',
    fontFamily: 'InterBold',
    marginRight: 12,
    minWidth: 50,
    textAlign: 'right',
  },
  star: {
    width: 35,
    height: 35,
    marginHorizontal: 8,
  },
  yellowStar: {
    tintColor: '#FFD700', // Gold/yellow color for user stars
  },
  blueStar: {
    tintColor: '#0071bc', // Blue color for admin stars (matches app theme)
  },
  starDisabled: {
    opacity: 0.5, // Dim while processing
  },
  arrow:{
    width: 35,
    height: 35,
    marginHorizontal: 8,
  },
  expandIcon: {
    fontSize: 35,
    color: '#0071bc',
    fontFamily: 'InterBold',
  },
  content: {
    padding: 16,
    backgroundColor: '#DAEFF7',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
  },
  statLabel: {
    fontSize: 14,
    color: 'black',
    marginBottom: 4,
    fontFamily: 'InterBold',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0071bc',
  },
  borderline:{
    width: '90%',
    height: 3,
    borderRadius: 100,
    backgroundColor:'#0071BC',
    opacity: 0.5,
    alignSelf: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  }
});

export default StatsAccordion;