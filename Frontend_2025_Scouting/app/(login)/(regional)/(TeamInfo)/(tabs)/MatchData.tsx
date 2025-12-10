import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Image, Pressable, PanResponder } from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { robotApiService } from "@/data/processing";
import AppCache from "@/data/cache";
import { AppHeader } from "@/components/AppHeader";
import { useCompetition } from "@/contexts/CompetitionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseService } from "@/data/supabaseService";
import Svg, { Path, Circle } from "react-native-svg";

const matchData = () => {
  const { team } = useGlobalSearchParams<{ team: string }>();
  const router = useRouter();
  const { activeCompetition } = useCompetition();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || false;
  const [matchData, setMatchData] = useState<TeamMatchResponse | null>(null);
  

  const [robot, setRobot] = useState<Robot | null>(null);
  const [availableMatches, setAvailableMatches] = useState<TeamMatchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMetrics, setVisibleMetrics] = useState<boolean[]>([true, true, true, true, true, true]);
  const [visibleClimbTypes, setVisibleClimbTypes] = useState<boolean[]>([true, true, true, true]);

  // Star state
  const [hasUserStar, setHasUserStar] = useState(false);
  const [hasAdminStar, setHasAdminStar] = useState(false);
  const [isTogglingStar, setIsTogglingStar] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const legend = [
    { label: "Processed", color: "#129448" },
    { label: "Removed", color: "#0cad85" },
    { label: "L1", color: "#00bcf0" },
    { label: "L2", color: "#11a4ed" },
    { label: "L3", color: "#1f8ded" },
    { label: "L4", color: "#3f65d9" },
  ];

  const climbLegend = [
    { label: "Deep Climb", color: "#00BCF0" },
    { label: "Shallow Climb", color: "#0071BC" },
    { label: "Park", color: "#041347" },
    { label: "None", color: "#BDBDBD" },
  ];

  const toggleMetric = (index: number) => {
    const newVisibleMetrics = [...visibleMetrics];
    newVisibleMetrics[index] = !newVisibleMetrics[index];
    setVisibleMetrics(newVisibleMetrics);
  };

  const toggleClimbType = (index: number) => {
    const newVisibleClimbTypes = [...visibleClimbTypes];
   newVisibleClimbTypes[index] = !newVisibleClimbTypes[index];
    setVisibleClimbTypes(newVisibleClimbTypes);
  };

  const [fontLoaded] = useFonts({
    Koulen: require("../../../../../assets/fonts/Koulen-Regular.ttf"),
    InterBold: require("../../../../../assets/fonts/Inter_18pt-Bold.ttf"),
    InterExtraBold: require("../../../../../assets/fonts/Inter_18pt-ExtraBold.ttf"),
  });

  // Load star status
  const loadStarStatus = async () => {
    if (!activeCompetition || !team) return;

    try {
      const teamNum = Number(team);
      const [userStar, adminStar] = await Promise.all([
        supabaseService.checkUserStar(teamNum, activeCompetition),
        supabaseService.checkAdminStar(teamNum, activeCompetition)
      ]);

      setHasUserStar(userStar);
      setHasAdminStar(adminStar);
    } catch (error) {
      console.error('Error loading star status:', error);
    }
  };

  // Handle star press with same logic as StatsAccordion
  const handleStarPress = async () => {
    if (isTogglingStar || !activeCompetition || !team) return;

    setIsTogglingStar(true);

    try {
      const teamNumber = Number(team);
      const regional = activeCompetition;

      if (isAdmin) {
        // Admin logic: First tap = user star, second tap = admin star
        if (!hasUserStar) {
          const added = await supabaseService.toggleUserStar(teamNumber, regional);
          setHasUserStar(added);
        } else if (!hasAdminStar) {
          const added = await supabaseService.toggleAdminStar(teamNumber, regional);
          setHasAdminStar(added);
        } else {
          // Third tap: Remove both stars
          await supabaseService.toggleAdminStar(teamNumber, regional);
          setHasAdminStar(false);
          await supabaseService.toggleUserStar(teamNumber, regional);
          setHasUserStar(false);
        }
      } else {
        // Regular user: Toggle user star only
        const added = await supabaseService.toggleUserStar(teamNumber, regional);
        setHasUserStar(added);
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    } finally {
      setIsTogglingStar(false);
    }
  };

  useEffect(() => {
    loadStarStatus();
  }, [team, activeCompetition]);

  useEffect(() => {
    const loadRobotData = async () => {
      try {
        setLoading(true);

        const regionalValue = activeCompetition || 'Test Competition'; // Use active competition from database

        console.log('🔍 MatchData - Loading with params:', { team, regionalValue });

        const robotData = await robotApiService.getRobot(Number(team), regionalValue);

        console.log('🔍 MatchData - Loaded robot data:', {
          team_num: robotData?.team_num,
          avg_algae_processed: robotData?.avg_algae_processed,
          avg_algae_removed: robotData?.avg_algae_removed,
          avg_L1: robotData?.avg_L1,
          avg_L2: robotData?.avg_L2,
          avg_L3: robotData?.avg_L3,
          avg_L4: robotData?.avg_L4,
        });

        setRobot(robotData);

        // Fetch all matches for this team
        const matches = await robotApiService.fetchAllTeamMatchData(regionalValue, Number(team));
        console.log('🔍 MatchData - Loaded matches:', matches);
        setAvailableMatches(matches);
      } catch (err) {
        console.error('❌ MatchData - Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch robot data');
      } finally {
        setLoading(false);
      }
    };

    if (team) {
      loadRobotData();
    }
  }, [team]);

  const getClimbStats = () => {
    if (availableMatches.length === 0) return { deepClimb: 0, shallowClimb: 0, park: 0, none: 0};

    // should all be set to zero initially
    let deepClimb = 0;
    let shallowClimb = 0;
    let park = 0;
    let none = 0;

    // THIS PART DOESNT WOOOORKKK
    availableMatches.forEach(match => {
      // Use strict comparison to true, fallback to 0 if undefined
      if (match.climb_deep === true || match.climb_deep === 1) deepClimb++;
      else if (match.climb_shallow === true || match.climb_shallow === 1) shallowClimb++;
      else if (match.park === true || match.park === 1) park++;
      else none++;
    });
    return { deepClimb, shallowClimb, park, none};
  };

  const renderPieChart = () => {
    const stats = getClimbStats();
    // Always include all types, but only show if visible
    const data = [
      { value: stats.deepClimb, color: climbLegend[0].color, visible: visibleClimbTypes[0] },
      { value: stats.shallowClimb, color: climbLegend[1].color, visible: visibleClimbTypes[1] },
      { value: stats.park, color: climbLegend[2].color, visible: visibleClimbTypes[2] },
      { value: stats.none, color: climbLegend[3].color, visible: visibleClimbTypes[3] }, // 'None' is not toggleable, always hidden in chart
    ];

    // Only show slices that are visible and have value > 0
    const filteredData = data.filter(item => item.visible && item.value > 0);
   

    // If no visible slices, show "No Data"
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);

    if (filteredData.length === 0 || total === 0) {
      return (
        <View style={styles.pieChartContainer}>
          <View style={styles.emptyPieChart} />
          <Text style={styles.emptyPieText}>No Data</Text>
        </View>
      );
    }
  
    
    const size = 160;
    const center = size / 2;
    const radius = size / 2 - 5;

    if (filteredData.length === 1) {
    return (
      <View style={styles.pieChartContainer}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} fill={filteredData[0].color} />
        </Svg>
      </View>
    );
  }

    let currentAngle = -Math.PI / 2; // Start from top

    const paths = filteredData.map((item, index) => {
      const angle = (item.value / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      currentAngle = endAngle;

      return (
        <Path
          key={index}
          d={pathData}
          fill={item.color}
        />
      );
    });

    return (
      <View style={styles.pieChartContainer}>
        <Svg width={size} height={size}>
          {paths}
        </Svg>
      </View>
    );
  };

  // Render stacked bar chart
  const renderStackedBarChart = () => {
    if (availableMatches.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No match data available</Text>
        </View>
      );
    }

    const chartHeight = 450;
    const barWidth = Math.min(60, (screenWidth - 80) / availableMatches.length);
    const chartWidth = Math.max(screenWidth - 50, barWidth * availableMatches.length + 60);
    
    // Find max total to scale bars
    let maxTotal = 0;
    availableMatches.forEach(match => {
      const values = [
        visibleMetrics[0] ? (match.total_algae_scored || 0) : 0,
        visibleMetrics[1] ? (match.algae_removed || 0) : 0,
        visibleMetrics[2] ? (match.total_l1_scored || 0) : 0,
        visibleMetrics[3] ? (match.total_l2_scored || 0) : 0,
        visibleMetrics[4] ? (match.total_l3_scored || 0) : 0,
        visibleMetrics[5] ? (match.total_l4_scored || 0) : 0,
      ];
      const total = values.reduce((sum, val) => sum + val, 0);
      if (total > maxTotal) maxTotal = total;
    });

    const graphHeight = chartHeight - 70; // Usable height for bars (450 - 15 top - 55 bottom)
    
    // Calculate nice y-axis labels
    const getYAxisLabels = (max: number) => {
      if (max === 0) return [0, 0, 0, 0, 0];
      
      // Determine increment based on scale
      let increment = 5;
      if (max > 50) increment = 10;
      if (max > 100) increment = 20;
      if (max > 200) increment = 50;
      if (max > 500) increment = 100;
      
      // Round max up to nearest increment
      const roundedMax = Math.ceil(max / increment) * increment;
      
      return [
        roundedMax,
        roundedMax * 0.75,
        roundedMax * 0.5,
        roundedMax * 0.25,
        0
      ];
    };

    const yAxisLabels = getYAxisLabels(maxTotal);
    const displayMax = yAxisLabels[0];
    const displayScale = displayMax > 0 ? graphHeight / displayMax : 1;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScrollContainer}>
        <View style={[styles.chartContainer, { width: chartWidth }]}>
          <View style={styles.chartArea}>
            {/* Grid lines and bars */}
            <View style={styles.gridContainer}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.gridLine, 
                    { top: 15 + (i * ((450 - 15 - 55) / 4)) }
                  ]} 
                />
              ))}

              {/* Y-axis labels - positioned at exact grid line locations */}
              <View style={styles.yAxisLabelsContainer}>
                {yAxisLabels.map((label, i) => (
                  <Text 
                    key={i} 
                    style={[
                      styles.yAxisLabel,
                      { top: 15 + (i * ((450 - 15 - 55) / 4)) - 6 }
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>

              {/* Bars */}
              <View style={styles.barsContainer}>
                {availableMatches.map((match, matchIndex) => {
                  const values = [
                    visibleMetrics[0] ? (match.total_algae_scored || 0) : 0,
                    visibleMetrics[1] ? (match.algae_removed || 0) : 0,
                    visibleMetrics[2] ? (match.total_l1_scored || 0) : 0,
                    visibleMetrics[3] ? (match.total_l2_scored || 0) : 0,
                    visibleMetrics[4] ? (match.total_l3_scored || 0) : 0,
                    visibleMetrics[5] ? (match.total_l4_scored || 0) : 0,
                  ];

                  const total = values.reduce((sum, val) => sum + val, 0);
                  let cumulativeHeight = 0;

                  return (
                    <View key={matchIndex} style={[styles.barColumn, { width: barWidth }]}>
                      <View style={styles.barWrapper}>
                        {values.map((value, i) => {
                          if (value === 0) return null;
                          
                          const segmentHeight = value * displayScale;
                          const segment = (
                            <View
                              key={i}
                              style={[
                                styles.barSegment,
                                {
                                  height: segmentHeight,
                                  backgroundColor: legend[i].color,
                                  bottom: cumulativeHeight,
                                }
                              ]}
                            >
                              {value > 0 && segmentHeight > 18 && (
                                <Text style={styles.segmentValue}>{value}</Text>
                              )}
                            </View>
                          );
                          
                          cumulativeHeight += segmentHeight;
                          return segment;
                        })}
                        
                        {/* Total value on top */}
                        {total > 0 && (
                          <View style={[styles.totalLabel, { bottom: cumulativeHeight + 2 }]}>
                            <Text style={styles.totalValue}>{total}</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Match label */}
                      <Text style={styles.matchLabel}>M{match.match_num || match.match_number}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Swipe gesture handler - same pattern as Match Scouting
  const swipeGesture = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to primarily horizontal gestures
        // Require horizontal movement to be 3x greater than vertical
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 3;
        const hasSignificantMovement = Math.abs(gestureState.dx) > 30;
        return isHorizontal && hasSignificantMovement;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (evt, gestureState) => {
        const screenWidth = Dimensions.get('window').width;
        const swipeThreshold = screenWidth * 0.125; // 1/8 of screen width
        const velocityThreshold = 0.5; // Minimum velocity for quick swipes

        // Check if swipe distance OR velocity exceeds threshold
        const shouldNavigateRight = gestureState.dx > swipeThreshold ||
                                   (gestureState.dx > 50 && gestureState.vx > velocityThreshold);
        const shouldNavigateLeft = gestureState.dx < -swipeThreshold ||
                                  (gestureState.dx < -50 && gestureState.vx < -velocityThreshold);

        // Swipe right - go back to RobotDisplay
        if (shouldNavigateRight) {
          setImmediate(() => router.back());
        }
        // Swipe left - go to QualData
        else if (shouldNavigateLeft) {
          setImmediate(() => router.push(`./QualData?team=${team}`));
        }
      },
    })
  ).current;

  if (!fontLoaded) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0071BC" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0071BC" />
        <Text style={styles.loadingText}>Loading match data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <AppHeader />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <View {...swipeGesture.panHandlers}>
          {/* Header Section */}
          <View style={styles.titleRow}>
            <Pressable
              style={styles.backButtonInline}
              onPress={() => {
                router.replace('/(login)/(regional)/Leaderboard');
              }}
            >
              <Image style={styles.backButtonIcon} source={require('../../../../../assets/images/back_arrow.png')} />
            </Pressable>
            <Text style={styles.title}>Team{Array.isArray(team) ? team[0] : team || 'Unknown'}</Text>

            {/* Star Button */}
            <Pressable onPress={handleStarPress} disabled={isTogglingStar} style={styles.starButton}>
              <Image
                source={
                  hasAdminStar
                    ? require('../../../../../assets/images/fullStar.png')
                    : hasUserStar
                    ? require('../../../../../assets/images/fullStar.png')
                    : require('../../../../../assets/images/outlineStar.png')
                }
                style={[
                  styles.starIcon,
                  hasAdminStar && styles.blueStarTint,
                  hasUserStar && !hasAdminStar && styles.yellowStarTint,
                  isTogglingStar && styles.starDisabled
                ]}
              />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>Total Performance</Text>

          {/* Stacked Bar Chart */}
          {renderStackedBarChart()}

          {/* Average Values Display - Interactive Legend */}
          <View style={styles.valuesGrid}>
            {/* Left Column - Algae metrics */}
            <View style={styles.valuesColumn}>
              {legend.slice(0, 2).map((item, index) => {
                const isVisible = visibleMetrics[index];

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.valueRowSmall}
                    onPress={() => toggleMetric(index)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.valueColorBox,
                      { backgroundColor: isVisible ? item.color : '#CCCCCC' }
                    ]} />
                    <Text style={[
                      styles.valueLabelSmall,
                      !isVisible && styles.valueTextDisabled
                    ]}>{item.label}</Text>
                    <Text style={[
                      styles.checkmark,
                      !isVisible && styles.valueTextDisabled
                    ]}>
                      {isVisible ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Right Column - L1-L4 in 2x2 grid */}
            <View style={styles.valuesColumn}>
              <View style={styles.twoColumnRow}>
                {legend.slice(2, 4).map((item, idx) => {
                  const index = idx + 2;
                  const isVisible = visibleMetrics[index];

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.valueRowSmall}
                      onPress={() => toggleMetric(index)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.valueColorBox,
                        { backgroundColor: isVisible ? item.color : '#CCCCCC' }
                      ]} />
                      <Text style={[
                        styles.valueLabelSmall,
                        !isVisible && styles.valueTextDisabled
                      ]}>{item.label}</Text>
                      <Text style={[
                        styles.checkmark,
                        !isVisible && styles.valueTextDisabled
                      ]}>
                        {isVisible ? '✓' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.twoColumnRow}>
                {legend.slice(4, 6).map((item, idx) => {
                  const index = idx + 4;
                  const isVisible = visibleMetrics[index];

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.valueRowSmall}
                      onPress={() => toggleMetric(index)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.valueColorBox,
                        { backgroundColor: isVisible ? item.color : '#CCCCCC' }
                      ]} />
                      <Text style={[
                        styles.valueLabelSmall,
                        !isVisible && styles.valueTextDisabled
                      ]}>{item.label}</Text>
                      <Text style={[
                        styles.checkmark,
                        !isVisible && styles.valueTextDisabled
                      ]}>
                        {isVisible ? '✓' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
          <Text style={styles.subtitle}>Average Climb</Text>
          {/* Pie Chart */}
          <View style={styles.pieChartSection}>
          <View style={styles.pieChartContainer}>
            {renderPieChart()}
          </View>

          {/* Climb Type Legend */}
          <View style={styles.pieLegendContainer}>
            {climbLegend.map((item, index) => {
              const isVisible = visibleClimbTypes[index];

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.valueRowSmall}
                  onPress={() => toggleClimbType(index)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.valueColorBox,
                    { backgroundColor: isVisible ? item.color : '#CCCCCC' }
                  ]} />
                  <Text style={[
                    styles.valueLabelSmall,
                    !isVisible && styles.valueTextDisabled
                  ]}>{item.label}</Text>
                  <Text style={[
                    styles.checkmark,
                    !isVisible && styles.valueTextDisabled
                  ]}>
                    {isVisible ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            }
            )}
          </View>
        </View>
        <Text style={styles.subtitle}>Status Count</Text>
        <Text style={styles.subtitle}>Driver Rating</Text>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 35, // Increased from 10 for more side space
    backgroundColor: '#E6F4FF',
    },
    pieChartSection: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row', // Arrange pie and legend side by side
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    },
    pieChartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    },
    pieLegendContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
    },
    centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F4FF',
    },
    loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'InterBold',
    },
    errorText: {
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
    padding: 20,
    fontFamily: 'InterBold',
    },
    titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
    marginTop: 0,
    marginBottom: 10,
    paddingTop: 0,
    paddingBottom: 0,
    },
    backButtonInline: {
    width: 20,
    height: 20,
    padding: 0,
    margin: 0,
    },
    backButtonIcon: {
    width: 20,
    height: 20,
    },
    title: {
    fontFamily: "InterBold",
    fontSize: 30,
    textAlign: "left",
    color: '#0071BC',
    margin: 0,
    padding: 0,
    lineHeight: 30,
    flex: 1,
    },
    starButton: {
    padding: 5,
    },
    starIcon: {
    width: 30,
    height: 30,
    },
    yellowStarTint: {
    tintColor: '#FFD700',
    },
    blueStarTint: {
    tintColor: '#0071bc',
    },
    starDisabled: {
    opacity: 0.5,
    },
    subtitle: {
    fontFamily: 'Koulen',
    fontSize: 32,
    color: '#0071BC',
    textAlign: "left",
    marginTop: 5,
    marginBottom: 5,
    },
    chartScrollContainer: {
    marginVertical: 10,
    marginHorizontal: -15, // Extend beyond container padding
  },
  chartContainer: {
    paddingHorizontal: 5, // Reduced from 10
    minWidth: '100%',
  },
  chartArea: {
    flexDirection: 'row',
    height: 450,
  },
  yAxisLabelsContainer: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 35,
    zIndex: 10,
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
    fontFamily: 'InterBold',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 2,
  },
  gridContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    paddingLeft: 45, // Make room for y-axis labels
    marginLeft: -5,
    marginRight: 5,
  },
  gridLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    position: 'absolute',
    left: 45,
    right: 15,
    bottom: 55,
    height: 380, // 450 - 15 (top) - 55 (bottom)
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 3,
  },
  barWrapper: {
    position: 'relative',
    width: '85%',
    alignItems: 'center',
  },
  barSegment: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 3,
  },
  segmentValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'InterBold',
  },
  totalLabel: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  totalValue: {
    color: '#0071BC',
    fontSize: 13,
    fontFamily: 'InterBold',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchLabel: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'InterBold',
    marginTop: 8,
    position: 'absolute',
    bottom: -40,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'InterBold',
  },
  valuesGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '106%',
    marginLeft: -15,
  },
  valuesColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  valueRowSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
  },
  valueColorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  valueLabel: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'InterBold',
  },
  valueLabelSmall: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontFamily: 'InterBold',
  },
  checkmark: {
    fontSize: 0,
    color: '#4CAF50',
    fontFamily: 'InterBold',
  },
  valueTextDisabled: {
    color: '#CCCCCC',
  },
  emptyPieChart: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF',
  },
  emptyPieText: {
    color: '#999999',
    fontSize: 16,
    fontFamily: 'InterBold',
    position: 'absolute',
  },

});

export default matchData;