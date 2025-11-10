import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Image, Pressable, PanResponder } from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { BarChart } from "react-native-chart-kit";
import { robotApiService } from "@/data/processing";
import AppCache from "@/data/cache";
import { AppHeader } from "@/components/AppHeader";
import { useCompetition } from "@/contexts/CompetitionContext";

const QualData = () => {
  const { team } = useGlobalSearchParams<{ team: string }>();
  const router = useRouter();
  const { activeCompetition } = useCompetition();

  const [robot, setRobot] = useState<Robot | null>(null);
  const [availableMatches, setAvailableMatches] = useState<TeamMatchResponse[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [matchData, setMatchData] = useState<TeamMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Default: show only total values (indices 0-5 are auto, 6-11 are tele, 12-17 are total)
  const [visibleMetrics, setVisibleMetrics] = useState<boolean[]>([
    false, false, false, false, false, false, // Auto (hidden)
    false, false, false, false, false, false, // Tele (hidden)
    true, true, true, true, true, true,       // Total (visible)
  ]);
  const [showDropdown, setShowDropdown] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const legend = [
    // Auto metrics (0-5)
    { label: "Auto Algae Processed", color: "#0d6b32", group: "auto" },
    { label: "Auto Algae Removed", color: "#098564", group: "auto" },
    { label: "Auto L1", color: "#0090c0", group: "auto" },
    { label: "Auto L2", color: "#0c7ab8", group: "auto" },
    { label: "Auto L3", color: "#1563b0", group: "auto" },
    { label: "Auto L4", color: "#2d4da8", group: "auto" },
    // Tele metrics (6-11)
    { label: "Tele Algae Processed", color: "#129448", group: "tele" },
    { label: "Tele Algae Removed", color: "#0cad85", group: "tele" },
    { label: "Tele L1", color: "#00bcf0", group: "tele" },
    { label: "Tele L2", color: "#11a4ed", group: "tele" },
    { label: "Tele L3", color: "#1f8ded", group: "tele" },
    { label: "Tele L4", color: "#3f65d9", group: "tele" },
    // Total metrics (12-17)
    { label: "Total Algae Processed", color: "#1bb85c", group: "total" },
    { label: "Total Algae Removed", color: "#10d0a0", group: "total" },
    { label: "Total L1", color: "#00e8ff", group: "total" },
    { label: "Total L2", color: "#15c0ff", group: "total" },
    { label: "Total L3", color: "#2aa8ff", group: "total" },
    { label: "Total L4", color: "#4f80ff", group: "total" },
  ];

  const toggleMetric = (index: number) => {
    const newVisibleMetrics = [...visibleMetrics];
    newVisibleMetrics[index] = !newVisibleMetrics[index];
    setVisibleMetrics(newVisibleMetrics);
  };

  const toggleGroup = (group: 'auto' | 'tele' | 'total') => {
    const newVisibleMetrics = [...visibleMetrics];

    // Turn off all metrics first
    for (let i = 0; i < newVisibleMetrics.length; i++) {
      newVisibleMetrics[i] = false;
    }

    // Turn on only the selected group
    if (group === 'auto') {
      // Indices 0-5 are auto metrics
      for (let i = 0; i < 6; i++) {
        newVisibleMetrics[i] = true;
      }
    } else if (group === 'tele') {
      // Indices 6-11 are tele metrics
      for (let i = 6; i < 12; i++) {
        newVisibleMetrics[i] = true;
      }
    } else if (group === 'total') {
      // Indices 12-17 are total metrics
      for (let i = 12; i < 18; i++) {
        newVisibleMetrics[i] = true;
      }
    }

    setVisibleMetrics(newVisibleMetrics);
  };

  const [fontLoaded] = useFonts({
    Koulen: require("../../../../../assets/fonts/Koulen-Regular.ttf"),
    InterBold: require("../../../../../assets/fonts/Inter_18pt-Bold.ttf"),
    InterExtraBold: require("../../../../../assets/fonts/Inter_18pt-ExtraBold.ttf"),
  });

  // Load robot data and available matches
  useEffect(() => {
    const loadRobotData = async () => {
      try {
        setLoading(true);

        const regionalValue = activeCompetition || 'Test Competition'; // Use active competition from database

        console.log('🔍 QualData - Loading with params:', { team, regionalValue });

        // Load robot data
        const robotData = await robotApiService.getRobot(Number(team), regionalValue);
        setRobot(robotData);

        // Fetch all matches for this team
        const matches = await robotApiService.fetchAllTeamMatchData(regionalValue, Number(team));
        console.log('🔍 QualData - Loaded matches:', matches);
        setAvailableMatches(matches);

        // Set first match as default if available
        if (matches && matches.length > 0) {
          const firstMatchNum = matches[0].match_num || matches[0].match_number;
          setSelectedMatch(firstMatchNum);
        }
      } catch (err) {
        console.error('❌ QualData - Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch robot data');
      } finally {
        setLoading(false);
      }
    };

    if (team) {
      loadRobotData();
    }
  }, [team]);

  // Load specific match data when a match is selected
  useEffect(() => {
    const loadMatchData = async () => {
      if (!selectedMatch || !team) return;

      try {
        const regionalValue = activeCompetition || 'Test Competition'; // Use active competition from database

        console.log('🔍 QualData - Loading match data:', { team, match: selectedMatch, regionalValue });

        const data = await robotApiService.fetchTeamMatchData(regionalValue, Number(team), selectedMatch);
        setMatchData(data);
      } catch (err) {
        console.error('❌ QualData - Error loading match data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch match data');
      }
    };

    loadMatchData();
  }, [selectedMatch, team]);

  // Prepare chart data - only show visible metrics
  const getChartData = () => {
    if (!matchData) return null;

    // Note: algae_scored is "NET" scoring, algae_processed is "PROCESSOR" scoring
    // algae_removed is removed from reef
    const autoAlgaeScored = matchData.auto_algae_scored || 0; // Algae scored in NET (auto)
    const teleAlgaeScored = matchData.tele_algae_scored || 0; // Algae scored in NET (tele)
    const totalAlgaeScored = matchData.total_algae_scored || 0; // Total algae in NET
    const algaeProcessed = matchData.algae_processed || 0; // Algae through PROCESSOR
    const algaeRemoved = matchData.algae_removed || 0; // Algae removed from reef

    const allDataPoints = [
      // Auto values (algae = scored in net)
      autoAlgaeScored,
      0, // Auto algae removed not tracked separately
      matchData.auto_l1_scored || 0,
      matchData.auto_l2_scored || 0,
      matchData.auto_l3_scored || 0,
      matchData.auto_l4_scored || 0,
      // Tele values (algae = scored in net)
      teleAlgaeScored,
      0, // Tele algae removed not tracked separately
      matchData.tele_l1_scored || 0,
      matchData.tele_l2_scored || 0,
      matchData.tele_l3_scored || 0,
      matchData.tele_l4_scored || 0,
      // Total values
      totalAlgaeScored, // Total NET scoring
      algaeRemoved, // Total removed from reef
      matchData.total_l1_scored || 0,
      matchData.total_l2_scored || 0,
      matchData.total_l3_scored || 0,
      matchData.total_l4_scored || 0,
    ];

    const allLabels = legend.map(item => {
      if (item.label.includes("Algae Processed")) return item.label.replace("Algae Processed", "Algae").replace("Total ", "T-").replace("Auto ", "A-").replace("Tele ", "Te-");
      if (item.label.includes("Algae Removed")) return item.label.replace("Algae Removed", "Rem").replace("Total ", "T-").replace("Auto ", "A-").replace("Tele ", "Te-");
      return item.label.replace("Total ", "T-").replace("Auto ", "A-").replace("Tele ", "Te-");
    });

    // Filter data based on visible metrics
    const filteredData = allDataPoints.filter((_, index) => visibleMetrics[index]);
    const filteredLabels = allLabels.filter((_, index) => visibleMetrics[index]);
    const filteredColors = legend.filter((_, index) => visibleMetrics[index]).map(item => item.color);

    // If no metrics are visible, show a placeholder
    if (filteredData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          colors: [() => '#CCCCCC'],
        }],
        visibleCount: 0,
      };
    }

    return {
      labels: filteredLabels,
      datasets: [{
        data: filteredData,
        colors: filteredColors.map(color => () => color),
      }],
      visibleCount: filteredData.length,
    };
  };

  // Swipe gesture handler
  const swipeGesture = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 3;
        const hasSignificantMovement = Math.abs(gestureState.dx) > 30;
        return isHorizontal && hasSignificantMovement;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (evt, gestureState) => {
        const screenWidth = Dimensions.get('window').width;
        const swipeThreshold = screenWidth * 0.125;
        const velocityThreshold = 0.5;

        const shouldNavigateRight = gestureState.dx > swipeThreshold ||
                                   (gestureState.dx > 50 && gestureState.vx > velocityThreshold);

        if (shouldNavigateRight) {
          setImmediate(() => router.push(`./MatchData?team=${team}`));
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

  const chartData = getChartData();

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
            <Text style={styles.title}>Team {Array.isArray(team) ? team[0] : team || 'Unknown'}</Text>
          </View>

          {/* Match Selector Dropdown */}
          <Text style={styles.subtitle}>Select Match</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdown(!showDropdown)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedMatch ? `Match ${selectedMatch}` : 'Select a match'}
            </Text>
            <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownList}>
              {availableMatches.length > 0 ? (
                availableMatches.map((match, index) => {
                  const matchNum = match.match_num || match.match_number;
                  return (
                    <TouchableOpacity
                      key={matchNum || index}
                      style={[
                        styles.dropdownItem,
                        selectedMatch === matchNum && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        setSelectedMatch(matchNum);
                        setShowDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedMatch === matchNum && styles.dropdownItemTextSelected
                      ]}>
                        Match {matchNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>No matches available</Text>
                </View>
              )}
            </View>
          )}

          {selectedMatch && matchData ? (
            <>
              <Text style={styles.subtitle}>Match Performance</Text>

              {/* Bar Chart */}
              {chartData && chartData.datasets[0].data.length > 0 ? (
                <View style={styles.chartContainer}>
                  <BarChart
                    data={chartData}
                    width={screenWidth - 30} // Full width minus padding
                    height={375}
                    yAxisLabel=""
                    yAxisSuffix=""
                    withInnerLines={true}
                    withVerticalLabels={true}
                    chartConfig={{
                      backgroundColor: "#ffffff",
                      backgroundGradientFrom: "#ffffff",
                      backgroundGradientTo: "#f0f0f0",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 113, 188, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: 'rgba(0, 0, 0, 0.1)',
                      },
                      propsForLabels: {
                        fontSize: 10,
                      },
                      paddingLeft: 5,
                      paddingRight: 5,
                      barRadius: 8,
                    }}
                    style={[styles.chart, {
                      marginBottom: 0,
                      marginLeft: -15,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 5,
                      elevation: 8,
                    }]}
                    fromZero
                    showValuesOnTopOfBars
                    withCustomBarColorFromData
                    verticalLabelRotation={90}
                  />
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No data for this match</Text>
                </View>
              )}

              {/* Values Display - Interactive Legend with Groups */}
              <Text style={styles.subtitle}>Match Values</Text>

              {/* Auto Section */}
              <TouchableOpacity
                onPress={() => toggleGroup('auto')}
                activeOpacity={0.7}
              >
                <Text style={styles.groupHeader}>Autonomous</Text>
              </TouchableOpacity>
              <View style={styles.valuesContainer}>
                {legend.slice(0, 6).map((item, index) => {
                  const actualIndex = index;
                  const autoAlgaeProcessed = matchData.auto_algae_scored || 0;
                  const dataValues = [
                    autoAlgaeProcessed,
                    0,
                    matchData.auto_l1_scored,
                    matchData.auto_l2_scored,
                    matchData.auto_l3_scored,
                    matchData.auto_l4_scored,
                  ];

                  const value = dataValues[index];
                  const isVisible = visibleMetrics[actualIndex];

                  return (
                    <TouchableOpacity
                      key={actualIndex}
                      style={styles.valueRow}
                      onPress={() => toggleMetric(actualIndex)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.valueColorBox,
                        { backgroundColor: isVisible ? item.color : '#CCCCCC' }
                      ]} />
                      <Text style={[
                        styles.valueLabel,
                        !isVisible && styles.valueTextDisabled
                      ]}>{item.label.replace("Auto ", "")}:</Text>
                      <Text style={[
                        styles.valueText,
                        !isVisible && styles.valueTextDisabled
                      ]}>
                        {value !== null && value !== undefined ? value : 'N/A'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tele Section */}
              <TouchableOpacity
                onPress={() => toggleGroup('tele')}
                activeOpacity={0.7}
              >
                <Text style={styles.groupHeader}>Teleop</Text>
              </TouchableOpacity>
              <View style={styles.valuesContainer}>
                {legend.slice(6, 12).map((item, index) => {
                  const actualIndex = index + 6;
                  const teleAlgaeProcessed = matchData.tele_algae_scored || 0;
                  const dataValues = [
                    teleAlgaeProcessed,
                    0,
                    matchData.tele_l1_scored,
                    matchData.tele_l2_scored,
                    matchData.tele_l3_scored,
                    matchData.tele_l4_scored,
                  ];

                  const value = dataValues[index];
                  const isVisible = visibleMetrics[actualIndex];

                  return (
                    <TouchableOpacity
                      key={actualIndex}
                      style={styles.valueRow}
                      onPress={() => toggleMetric(actualIndex)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.valueColorBox,
                        { backgroundColor: isVisible ? item.color : '#CCCCCC' }
                      ]} />
                      <Text style={[
                        styles.valueLabel,
                        !isVisible && styles.valueTextDisabled
                      ]}>{item.label.replace("Tele ", "")}:</Text>
                      <Text style={[
                        styles.valueText,
                        !isVisible && styles.valueTextDisabled
                      ]}>
                        {value !== null && value !== undefined ? value : 'N/A'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Total Section */}
              <TouchableOpacity
                onPress={() => toggleGroup('total')}
                activeOpacity={0.7}
              >
                <Text style={styles.groupHeader}>Total</Text>
              </TouchableOpacity>
              <View style={styles.valuesContainer}>
                {legend.slice(12, 18).map((item, index) => {
                  const actualIndex = index + 12;
                  const totalAlgaeProcessed = matchData.total_algae_scored || 0;
                  const totalAlgaeRemoved = matchData.algae_removed || 0;
                  const dataValues = [
                    totalAlgaeProcessed,
                    totalAlgaeRemoved,
                    matchData.total_l1_scored,
                    matchData.total_l2_scored,
                    matchData.total_l3_scored,
                    matchData.total_l4_scored,
                  ];

                  const value = dataValues[index];
                  const isVisible = visibleMetrics[actualIndex];

                  return (
                    <TouchableOpacity
                      key={actualIndex}
                      style={styles.valueRow}
                      onPress={() => toggleMetric(actualIndex)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.valueColorBox,
                        { backgroundColor: isVisible ? item.color : '#CCCCCC' }
                      ]} />
                      <Text style={[
                        styles.valueLabel,
                        !isVisible && styles.valueTextDisabled
                      ]}>{item.label.replace("Total ", "")}:</Text>
                      <Text style={[
                        styles.valueText,
                        !isVisible && styles.valueTextDisabled
                      ]}>
                        {value !== null && value !== undefined ? value : 'N/A'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Match Details Section */}
              <Text style={styles.subtitle}>Match Details</Text>

              {/* Climb Section */}
              <Text style={styles.sectionLabel}>Endgame</Text>
              <View style={styles.badgeColumn}>
                <View style={[styles.capabilityBadge, { backgroundColor: matchData.climb_deep ? '#4CAF50' : '#F44336' }]}>
                  <Text style={styles.badgeLabel}>Deep Climb</Text>
                  <Text style={styles.badgeIcon}>{matchData.climb_deep ? '✓' : '✗'}</Text>
                </View>
                <View style={[styles.capabilityBadge, { backgroundColor: matchData.climb_shallow ? '#4CAF50' : '#F44336' }]}>
                  <Text style={styles.badgeLabel}>Shallow Climb</Text>
                  <Text style={styles.badgeIcon}>{matchData.climb_shallow ? '✓' : '✗'}</Text>
                </View>
                <View style={[styles.capabilityBadge, { backgroundColor: matchData.park ? '#4CAF50' : '#F44336' }]}>
                  <Text style={styles.badgeLabel}>Park</Text>
                  <Text style={styles.badgeIcon}>{matchData.park ? '✓' : '✗'}</Text>
                </View>
              </View>

              {/* Status Section */}
              <Text style={styles.sectionLabel}>Status</Text>
              <View style={styles.badgeColumn}>
                <View style={[styles.capabilityBadge, { backgroundColor: matchData.defence ? '#4CAF50' : '#CCCCCC' }]}>
                  <Text style={styles.badgeLabel}>Defense</Text>
                  <Text style={styles.badgeIcon}>{matchData.defence ? '✓' : ''}</Text>
                </View>
                <View style={[styles.capabilityBadge, { backgroundColor: matchData.disabled ? '#F44336' : '#CCCCCC' }]}>
                  <Text style={styles.badgeLabel}>Disabled</Text>
                  <Text style={styles.badgeIcon}>{matchData.disabled ? '✗' : ''}</Text>
                </View>
                <View style={[styles.capabilityBadge, { backgroundColor: matchData.malfunction ? '#F44336' : '#CCCCCC' }]}>
                  <Text style={styles.badgeLabel}>Malfunction</Text>
                  <Text style={styles.badgeIcon}>{matchData.malfunction ? '✗' : ''}</Text>
                </View>
                <View style={[styles.capabilityBadge, { backgroundColor: matchData.no_show ? '#F44336' : '#CCCCCC' }]}>
                  <Text style={styles.badgeLabel}>No Show</Text>
                  <Text style={styles.badgeIcon}>{matchData.no_show ? '✗' : ''}</Text>
                </View>
              </View>

              {/* Driver Rating */}
              <Text style={styles.sectionLabel}>Driver Rating</Text>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingText}>{matchData.driver_rating || 0}</Text>
              </View>

              {/* Starting Position */}
              {matchData.auto_starting_position !== null && matchData.auto_starting_position !== undefined && (
                <>
                  <Text style={styles.sectionLabel}>Auto Starting Position</Text>
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingText}>{matchData.auto_starting_position}</Text>
                  </View>
                </>
              )}

              {/* Comments */}
              {matchData.comments && (
                <>
                  <Text style={styles.sectionLabel}>Comments</Text>
                  <View style={styles.commentsBox}>
                    <Text style={styles.commentsText}>{matchData.comments}</Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                {availableMatches.length === 0 ? 'No matches available for this team' : 'Select a match to view data'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#E6F4FF',
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
    justifyContent: 'flex-start',
    width: '100%',
    gap: 15,
    marginTop: 0,
    marginBottom: 20,
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
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: 'Koulen',
    fontSize: 32,
    color: '#0071BC',
    textAlign: "left",
    marginTop: 10,
    marginBottom: 10,
  },
  groupHeader: {
    fontFamily: 'InterBold',
    fontSize: 20,
    color: '#0071BC',
    textAlign: "left",
    marginTop: 10,
    marginBottom: 5,
  },
  sectionLabel: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: '#0071BC',
    textAlign: "left",
    marginTop: 15,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#0071BC',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#0071BC',
    fontFamily: 'InterBold',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#0071BC',
    fontFamily: 'InterBold',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0071BC',
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownItemSelected: {
    backgroundColor: '#E6F4FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'InterBold',
  },
  dropdownItemTextSelected: {
    color: '#0071BC',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  chart: {
    borderRadius: 16,
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
    textAlign: 'center',
  },
  valuesContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  valueColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
  },
  valueLabel: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'InterBold',
  },
  valueText: {
    fontSize: 18,
    color: '#0071BC',
    fontFamily: 'InterBold',
  },
  valueTextDisabled: {
    color: '#CCCCCC',
  },
  badgeColumn: {
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
  },
  capabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginVertical: 3,
    width: 150,
  },
  badgeLabel: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  badgeIcon: {
    fontFamily: 'InterBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  ratingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 36,
    color: '#0071BC',
    fontFamily: 'InterBold',
  },
  commentsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  commentsText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'InterBold',
  },
});

export default QualData;
