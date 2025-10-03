import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { useFonts } from "expo-font";
import { router } from 'expo-router';


// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface StatsAccordionProps {
  stats: RobotStats;
  title?: string;
}

const StatsAccordion: React.FC<StatsAccordionProps> = ({ stats, title = "Robot Statistics" }) => {
  const [expanded, setExpanded] = useState(false);
  const [starred, setStarred] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // console.log("Toggling expand with robot stats: ", stats);
    setExpanded(!expanded);
  };

  const formatNumber = (num: number) => {
    return num.toFixed(2);
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
          <Text style={styles.ranktext}>{stats.rank_value}.</Text>
            <Pressable 
              onPress={() => router.push(`../(TeamInfo)/(tabs)/RobotDisplay?team=${encodeURIComponent(title)}`)} 
              style={{ flex: 1 }}
            >
              <Text style={styles.headerText}>{title}</Text>
            </Pressable>

          <Pressable onPress={() => setStarred(!starred)}> 
            <Image
              source={starred ? require('../assets/images/fullStar.png') : require('../assets/images/outlineStar.png')}
              style={styles.star}
            />
          </Pressable>

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
  star: {
    width: 35,  
    height: 35, 
    marginHorizontal: "3%",
  },
  arrow:{
    width: 35,  
    height: 35,
    marginHorizontal: "3%",
  },
  headerText: {
    fontSize: 35,
    fontWeight: '600',
    color: '#000',
    textAlign: "left",
    flex: 1,
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
  ranktext:{
    fontSize: 30,
    color:'#0071bc',
    fontFamily: 'InterBold',
    paddingRight: "5%",
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  }
});

export default StatsAccordion;