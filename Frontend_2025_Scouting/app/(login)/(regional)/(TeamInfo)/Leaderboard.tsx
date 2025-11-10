import { Link, router, useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, TouchableOpacity, Dimensions, TextInput, Image, PanResponder } from "react-native";
import { robotApiService } from '../../../../data/processing';
import { useFonts } from 'expo-font';

import LeaderboardView from '../../../../components/RobotLeaderboard';
import { ConnectionHeader } from "@/components/ConnectionHeader";
import { DemoBorderWrapper } from "@/components/DemoBorderWrapper";
import { useCompetition } from "@/contexts/CompetitionContext";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

const Leaderboard = () => {
  const router = useRouter();
  const { activeCompetition } = useCompetition();
  const { width, height } = Dimensions.get('window');
  const [fontLoaded] = useFonts({
    'Koulen': require('../../../../assets/fonts/Koulen-Regular.ttf'),
    'InterBold': require('../../../../assets/fonts/Inter_18pt-Bold.ttf'),
  });
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true); // Show leaderboard by default
  const [showFields, setShowFields] = useState<boolean>(true); // Keep navigation bar visible
  const [searchParams, setSearchParams] = useState<SortFieldParams>({
    RANK: true, // Default to true for Rank
    ALGAE_SCORED: false,
    ALGAE_REMOVED: false,
    ALGAE_PROCESSED: false,
    ALGAE_AVG: false,
    CORAL_L1: false,
    CORAL_L2: false,
    CORAL_L3: false,
    CORAL_L4: false,
    CORAL_AVG: false
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filtered, setFiltered] = useState<RobotStats[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>("Rank");
  const [items] = useState([
    { label: "Rank", value: "RANK" },
    { label: "Algae Scored", value: "ALGAE_SCORED" },
    { label: "Algae Removed", value: "ALGAE_REMOVED" },
    { label: "Algae Processed", value: "ALGAE_PROCESSED" },
    { label: "Algae Average", value: "ALGAE_AVG" },
    { label: "Coral L1", value: "CORAL_L1" },
    { label: "Coral L2", value: "CORAL_L2" },
    { label: "Coral L3", value: "CORAL_L3" },
    { label: "Coral L4", value: "CORAL_L4" },
    { label: "Coral Average", value: "CORAL_AVG" },
  ]);

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
  };

  const handleParams = async () => {
    setSearchParams({
      RANK: searchParams.RANK,
      ALGAE_SCORED: searchParams.ALGAE_SCORED,
      ALGAE_REMOVED: searchParams.ALGAE_REMOVED,
      ALGAE_PROCESSED: searchParams.ALGAE_PROCESSED,
      ALGAE_AVG: searchParams.ALGAE_AVG,
      CORAL_L1: searchParams.CORAL_L1,
      CORAL_L2: searchParams.CORAL_L2,
      CORAL_L3: searchParams.CORAL_L3,
      CORAL_L4: searchParams.CORAL_L4,
      CORAL_AVG: searchParams.CORAL_AVG,
    });
  };

  const clearAllBools = () => {
    setSearchParams({
      RANK: false,
      ALGAE_SCORED: false,
      ALGAE_REMOVED: false,
      ALGAE_PROCESSED: false,
      ALGAE_AVG: false,
      CORAL_L1: false,
      CORAL_L2: false,
      CORAL_L3: false,
      CORAL_L4: false,
      CORAL_AVG: false,
    });
  };

  const [sorted, setSorted] = useState<RobotStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New function to update sorting and fetch sorted robots immediately
  const updateSorting = async (newSortField: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update the selected value for the modal
      setSelectedValue(newSortField);

      const competition = activeCompetition || 'Test Competition'; // Use active competition from database

      console.log('🔍 Leaderboard - Fetching data for competition:', competition);
      console.log('🔍 Leaderboard - Sort field:', newSortField);

      // Build the new search parameters for the sort field
      const newSearchParams: SortFieldParams = {
        RANK: newSortField === "Rank",
        ALGAE_SCORED: newSortField === "Algae Scored",
        ALGAE_REMOVED: newSortField === "Algae Removed",
        ALGAE_PROCESSED: newSortField === "Algae Processed",
        ALGAE_AVG: newSortField === "Algae Average",
        CORAL_L1: newSortField === "Coral L1",
        CORAL_L2: newSortField === "Coral L2",
        CORAL_L3: newSortField === "Coral L3",
        CORAL_L4: newSortField === "Coral L4",
        CORAL_AVG: newSortField === "Coral Average",
      };

      // Update state with new search params
      setSearchParams(newSearchParams);

      // Fetch the sorted robots with the NEW search params
      const sortedRobots = await robotApiService.getSortedRobots(newSearchParams, competition);
      console.log('🔍 Leaderboard - Fetched robots:', sortedRobots.length, 'teams');
      console.log('🔍 Leaderboard - Demo mode:', robotApiService.isDemoMode);

      setSorted(sortedRobots);
      setFiltered(sortedRobots);
    } catch (err) {
      console.error('❌ Leaderboard - Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // UseEffect to trigger sorting when the component mounts
  useEffect(() => {
    updateSorting("Rank"); // Default to sorting by Rank when the component is mounted
  }, []); // Empty dependency array ensures it runs once on mount

  useEffect(() => {
    const filteredSorted = sorted.filter((robot) => {
      return robot.team_num.toString().includes(searchQuery);
    })

    setFiltered(filteredSorted);
  }, [searchQuery])

  // Swipe gesture handler for back navigation
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
        const shouldNavigateBack = gestureState.dx > swipeThreshold ||
                                   (gestureState.dx > 50 && gestureState.vx > velocityThreshold);

        // Swipe right - go back to home
        if (shouldNavigateBack) {
          setImmediate(() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(login)/home');
            }
          });
        }
      },
    })
  ).current;

  return (
    <DemoBorderWrapper>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <View {...swipeGesture.panHandlers}>
        <View style={styles.titleContainer}>
          <Pressable
            style={styles.backButtonOverride}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(login)/home');
              }
            }}
          >
            <Image style={styles.backButtonIcon} source={require('../../../../assets/images/back_arrow.png')} />
          </Pressable>
          <Text style={styles.title}>Leaderboard</Text>
        </View>

      {showFields && (
        <>
          <View style={styles.navigationBar}>
            <View style={styles.inputContainer}>
              <View style={styles.imagebox}>
                <Image
                  source={require('../../../../assets/images/search.png')}
                  style={styles.icon}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search Team"
                keyboardType="numeric"
                onChangeText={handleSearch}
                maxLength={5}
              />
            </View>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.selectedText}>
                {selectedValue ? `${selectedValue} >` : "Rank >"} {/* Always shows Rank > */}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {items.map(({ label, value }) => {
                  // const state = searchParams[value];
                  return (
                    <TouchableOpacity
                      style={styles.modalItem}
                      key={value}
                      onPress={() => {
                        // Update the sorting and fetch the sorted leaderboard immediately
                        updateSorting(label);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
                {/* <TouchableOpacity onPress={clearAllBools}>
                  <Text style={styles.modalItemText}>Clear Sorting</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}

      <LeaderboardView
        sortedStats={filtered}
        showLeaderboard={showLeaderboard}
        isLoading={isLoading}
        error={error}
        sortField={selectedValue || "Rank"}
      />
      </View>
    </ScrollView>
    <AppFooter />
    </DemoBorderWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 25,
    backgroundColor: '#E6F4FF',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 0,
    marginBottom: 5,
    paddingTop: 0,
    paddingBottom: 0,
    gap: 15,
  },
  backButtonOverride: {
    width: 20,
    height: 20,
    margin: 0,
    padding: 0,
  },
  backButtonIcon: {
    width: 20,
    height: 20,
  },
  title: {
    fontFamily: 'InterBold',
    fontSize: 30,
    margin: 0,
    padding: 0,
    lineHeight: 30,
    textAlign: 'left',
    color: '#0071BC',
  },
  buttonOne: {
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#0072bc',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
    fontFamily: 'InterBold',
  },
  dropdownButton: {
    backgroundColor: "#0071bc",
    borderRadius: 10,
    width: '49%',
    height: 35,
    justifyContent: 'center',
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "70%",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalItemText: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: 'Inter',
    paddingVertical: 5,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'InterBold',
  },
  navigationBar: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width + 6,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderColor: '#0071bc',
    borderWidth: 3,
    flexDirection: 'row',
    gap: '2%',
    marginTop:20,
  },
  input: {
    fontSize: 12,
    alignSelf: 'center',
    height: 35,
  },
  icon: {
    width: 25,
    height: 25,
  },
  imagebox: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0071bc',
    height: 35,
    width: 35,
    marginLeft: -2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '49%',
    height: 35,
    borderColor: '#0071bc',
    borderWidth: 2,
    textAlign: 'left',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Leaderboard;
