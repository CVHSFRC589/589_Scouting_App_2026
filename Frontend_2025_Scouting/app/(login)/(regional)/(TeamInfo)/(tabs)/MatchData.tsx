import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Image, Pressable, PanResponder } from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { BarChart } from "react-native-chart-kit";
import { robotApiService } from "@/data/processing";
import AppCache from "@/data/cache";
import { AppHeader } from "@/components/AppHeader";
import { useCompetition } from "@/contexts/CompetitionContext";

const matchData = () => {
  const { team } = useGlobalSearchParams<{ team: string }>();
  const router = useRouter();
  const { activeCompetition } = useCompetition();

  const [robot, setRobot] = useState<Robot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMetrics, setVisibleMetrics] = useState<boolean[]>([true, true, true, true, true, true]);

  const screenWidth = Dimensions.get('window').width;

  const legend = [
    { label: "Algae Processed", color: "#129448" },
    { label: "Algae Removed", color: "#0cad85" },
    { label: "L1", color: "#00bcf0" },
    { label: "L2", color: "#11a4ed" },
    { label: "L3", color: "#1f8ded" },
    { label: "L4", color: "#3f65d9" },
  ];

  const toggleMetric = (index: number) => {
    const newVisibleMetrics = [...visibleMetrics];
    newVisibleMetrics[index] = !newVisibleMetrics[index];
    setVisibleMetrics(newVisibleMetrics);
  };

  const [fontLoaded] = useFonts({
    Koulen: require("../../../../../assets/fonts/Koulen-Regular.ttf"),
    InterBold: require("../../../../../assets/fonts/Inter_18pt-Bold.ttf"),
    InterExtraBold: require("../../../../../assets/fonts/Inter_18pt-ExtraBold.ttf"),
  });

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

  // Prepare chart data - only show visible metrics
  const getChartData = () => {
    if (!robot) return null;

    const allDataPoints = [
      robot.avg_algae_processed || 0,
      robot.avg_algae_removed || 0,
      robot.avg_L1 || 0,
      robot.avg_L2 || 0,
      robot.avg_L3 || 0,
      robot.avg_L4 || 0,
    ];

    const allLabels = legend.map(item => {
      // Shorten labels for chart display
      if (item.label === "Algae Processed") return "Processed";
      if (item.label === "Algae Removed") return "Removed";
      return item.label;
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

          <Text style={styles.subtitle}>Average Performance</Text>

        {/* Bar Chart */}
        {chartData && chartData.datasets[0].data.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={screenWidth - 50}
              height={375}
              yAxisLabel=""
              yAxisSuffix=""
              withInnerLines={true}
              withVerticalLabels={true}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#f0f0f0",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 113, 188, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '', // solid lines
                  stroke: 'rgba(0, 0, 0, 0.1)',
                },
                propsForLabels: {
                  fontSize: 10,
                },
                paddingLeft: 0,
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
            <Text style={styles.noDataText}>No data selected</Text>
          </View>
        )}

        {/* Average Values Display - Interactive Legend */}
        <Text style={styles.subtitle}>Average Values</Text>
        <View style={styles.valuesContainer}>
          {legend.map((item, index) => {
            const dataValues = [
              robot?.avg_algae_processed,
              robot?.avg_algae_removed,
              robot?.avg_L1,
              robot?.avg_L2,
              robot?.avg_L3,
              robot?.avg_L4,
            ];

            const value = dataValues[index];
            const isVisible = visibleMetrics[index];

            return (
              <TouchableOpacity
                key={index}
                style={styles.valueRow}
                onPress={() => toggleMetric(index)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.valueColorBox,
                  { backgroundColor: isVisible ? item.color : '#CCCCCC' }
                ]} />
                <Text style={[
                  styles.valueLabel,
                  !isVisible && styles.valueTextDisabled
                ]}>{item.label}:</Text>
                <Text style={[
                  styles.valueText,
                  !isVisible && styles.valueTextDisabled
                ]}>
                  {value !== null && value !== undefined ? value.toFixed(2) : 'N/A'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 10,
  },
  legendCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: "#000",
    fontFamily: 'InterBold',
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
  },
  valuesContainer: {
    marginTop: 10,
    marginBottom: 20,
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
});

export default matchData;
