import { Link, router, useRouter } from "expo-router";
import BackButton from '../../../backButton';
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, TouchableOpacity, Dimensions, TextInput, Image } from "react-native";
import { robotApiService } from '../../../../data/processing';
import { useFonts } from 'expo-font';

import LeaderboardView from '../../../../components/RobotLeaderboard';
import AppCache from "@/data/cache";

const Leaderboard = () => {
  const router = useRouter();
  const { width, height } = Dimensions.get('window');
  const [fontLoaded] = useFonts({
    'Koulen': require('../../../../assets/fonts/Koulen-Regular.ttf'),
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

  // New function to update sorting and fetch sorted robots immediately
  const updateSorting = async (newSortField: string) => {
    // Update the selected value for the modal
    setSelectedValue(newSortField);

    const cache = await AppCache.getData();
    const regional = cache!.regional;

    // Update the search parameters for the new sort field
    setSearchParams(prevParams => ({
      ...prevParams,
      RANK: newSortField === "Rank", // Reset RANK to true when Rank is selected, or false for others
      // ALGAE_SCORED: newSortField === "Algae Scored",
      ALGAE_REMOVED: newSortField === "Algae Removed",
      ALGAE_PROCESSED: newSortField === "Algae Processed",
      // ALGAE_AVG: newSortField === "Algae Average",
      CORAL_L1: newSortField === "Coral L1",
      CORAL_L2: newSortField === "Coral L2",
      CORAL_L3: newSortField === "Coral L3",
      CORAL_L4: newSortField === "Coral L4",
      // CORAL_AVG: newSortField === "Coral Average",
    }));

    // Fetch the sorted robots with the updated search params immediately after selection
    const sortedRobots = await robotApiService.getSortedRobots(searchParams, regional);
    setSorted(sortedRobots);
    setFiltered(sortedRobots);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton buttonName="Home Page" />
      <Text style={styles.title}>Leaderboard</Text>

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

      <LeaderboardView sortedStats={filtered} showLeaderboard={showLeaderboard} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 25,
  },
  title: {
    fontFamily: 'Koulen',
    fontSize: 40,
    marginBottom: 0,
    textAlign: 'left',
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
