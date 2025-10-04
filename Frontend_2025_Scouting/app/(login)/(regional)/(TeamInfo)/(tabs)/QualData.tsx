import React, { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, Image, Text, Pressable, StyleSheet, TouchableOpacity, TextInput, FlatList, Animated, PanResponder, Dimensions } from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import BackButton from "@/app/backButton";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import { robotApiService } from "@/data/processing";
import AppCache from "@/data/cache";

const qualData = () => {
  const router = useRouter();
  
  //wherever redirects to this page needs to add ?team={teamnum}&match={matchnum} 
  //at the end of the url in its router.push
  const {team} = useGlobalSearchParams<{ team :string } > ();
  
  //need to use a state match because of tabs structure
  // const {match} = useGlobalSearchParams<{ match :string } > ();
  const [match, setMatch] = useState<string | undefined>(undefined);

  const [matchData, setMatchData] = useState<TeamMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const valueRef = useRef(50);
  const min = 0;
  const max = 100;
  const screenWidth = Dimensions.get('window').width;  // Defined here
  const trackPadding = 20; // Keep the padding as before
  const trackWidth = screenWidth * 0.8;
  const tickCount = 5;
  const tickSpacing = screenWidth / (tickCount); // Use full screen width for tick spacing
  
  //Qualification Matches? What are we sorting by there
  const queryOptions = [/*'Qualification Matches'*/'L1 Coral', 'L2 Coral', 'L3 Coral', 'L4 Coral', 'All Coral', 'Removed Algae', 'Processed Algae', 'All Algae']; // MUST ONLY BE NUMBERS, OR BAD STUFF HAPPENS
  const pan = useRef(new Animated.Value(0)).current;
  const tickPositions = [0, tickSpacing, tickSpacing * 3]; // First, second, fourth tick
  const selectedTick = 1; // Change this to 0, 1, or 2 to move the thumb

  const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
          let newX = gestureState.dx + pan._value;
          if (newX < 0) newX = 0;
          if (newX > trackWidth - 20) newX = trackWidth - 20; // Clamp thumb to track width minus thumb width
      
          const nearestTick = Math.round(newX / tickSpacing) * tickSpacing;
          Animated.timing(pan, {
              toValue: nearestTick,
              duration: 80,
              useNativeDriver: false,
          }).start();
      
          valueRef.current = Math.round((nearestTick / trackWidth) * (max - min) + min);
      },
      onPanResponderRelease: () => {
          const nearestTick = Math.round(pan._value / tickSpacing) * tickSpacing;
          Animated.spring(pan, {
              toValue: nearestTick,
              useNativeDriver: false,
          }).start();
          valueRef.current = Math.round((nearestTick / screenWidth) * (max - min) + min);
      },
  });
  
  // Ensure ticks are placed correctly inside the track
  const renderTicks = () => {
      return Array.from({ length: tickCount }).map((_, index) => {
          return (
              <View
                  key={index}
                  style={[ 
                      styles.tick,
                      { 
                          left: `${(index / (tickCount - 1)) * 100}%`, // Position ticks as a percentage of track width
                      },
                  ]}
              />
          );
      });
  };
  
  var selectedTeam: number | null = null;

const [fontLoaded] = useFonts({
  Koulen: require("../../../../../assets/fonts/Koulen-Regular.ttf"),
  InterBold: require("../../../../../assets/fonts/Inter_18pt-Bold.ttf"),
  InterExtraBold: require("../../../../../assets/fonts/Inter_18pt-ExtraBold.ttf"),
});
const handleOptionSelect = (value: string) => {
  setSelectedOption(value);
  setDropdownVisible(false);
};
const handleOptionSearch = (query: string) => {
  setSearchQuery(query);
  if (query.trim() === '') {
      setFilteredOptions(queryOptions);
  } else {
      const filtered = queryOptions.filter((option) =>
          option.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOptions(filtered);
  }
};

const [robot, setRobot] = useState<Robot | null>(null);
const [isDropdownVisible, setDropdownVisible] = useState(false);
const [selectedOption, setSelectedOption] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState<string>('');
const [filteredOptions, setFilteredOptions] = useState<string[] | null>(null);

const [rawData, setRawData] = useState<number[]>([]);
const [filteredData, setFilteredData] = useState<number[]>([]);
const [displayedData, setDisplayedData] = useState<number[][]>([]);
const [activeLegend, setActiveLegend] = useState([true, true, true, true, true, true]); // All legend items active by default
const legend = [
  { label: "Algae Processed", color: "#10942b" },
  { label: "Algae Removed", color: "#0cad85" },
  { label: "L1", color: "#00bcf0" },
  { label: "L2", color: "#0f7bd4" },
  { label: "L3", color: "#124eb5" },
  { label: "L4", color: "#0e159c" },

];

useEffect(() => {
  const loadMatchData = async () => {
    try {
      const params = await AppCache.getData();
      
      let regional = params?.regional
      
      const data = await robotApiService.fetchTeamMatchData(regional!, Number(team), Number(match));
      // Data fetched successfully
      if (data) {
        setMatchData(data);
      

        setRawData([
          data.match_algae.processed,
          data.match_algae.removed,
          data.match_coral.L1.total_made,
          data.match_coral.L2.total_made,
          data.match_coral.L3.total_made,
          data.match_coral.L4.total_made,
          
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch match data');
    } finally {
      setLoading(false);
    }


  };


  loadMatchData();
}, [match]);

// const [shouldRenderChart, setShouldRenderChart] = useState(false);

// useEffect(() => {
//   // Reset render flag whenever data changes
//   setShouldRenderChart(false);
  
//   // Allow chart to render after a brief delay
//   const timer = setTimeout(() => {
//     setShouldRenderChart(true);
//   }, 100);
  
//   return () => clearTimeout(timer);
// }, [filteredData, displayedData, activeLegend]);

useEffect(() => {
  if (rawData.length > 0) {
    const filtered = rawData.map((value, index) => (activeLegend[index] ? value : 0));
    setFilteredData(filtered);
    setDisplayedData([filtered]);
  }
}, [rawData, activeLegend]);

const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
    setSearchQuery('');
    setFilteredOptions(queryOptions);
};

const legendHandler = (currentLegend: number) => {
  // Toggle legend item
  //check if only one item is selected. If so, block the change and grey out the remaining item
  if (activeLegend.filter((value) => (value == true)).length === 1 && activeLegend[currentLegend] === true) {  
    return;
  }
  
  const updatedLegend = [...activeLegend];
  updatedLegend[currentLegend] = !updatedLegend[currentLegend];
  setActiveLegend(updatedLegend);
}

if (!fontLoaded) {
  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}

const LegendDataViewerComponent = (): ReactElement => {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.text}>Displayed Data:</Text>
      {activeLegend.map((isActive, index) => {
        let avg = -1; // Default value if no data is available
        if(isActive) {
          const label = legend[index].label
          if (label == "Algae Processed") {
            avg = matchData?.match_algae.processed || -1;
          }
          else if (label == "Algae Removed") {
            avg = matchData?.match_algae.removed || -1;
          }
          else if (label == "L1") {
            avg = matchData?.match_coral.L1.total_made || -1;
          }
          else if (label == "L2") {
            avg = matchData?.match_coral.L2.total_made || -1;
          }
          else if (label == "L3") {
            avg = matchData?.match_coral.L3.total_made || -1;
          }
          else if (label == "L4") {
            avg = matchData?.match_coral.L4.total_made || -1;
          }
        
          return (
            <Text key={index} style={styles.text}>
              {legend[index].label}: {avg !== -1 ? avg : "No data available"}    
            </Text>
          );
        }
        
        
        return null; // Return null for inactive items
      })}
    </View>
  )
}



  //im guessing sample data?
  const data = [
    {
      name: "Deep Climb",
      population: 20,
      color: "#0f3eab",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Shallow Climb",
      population: 30,
      color: "#076ddb",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Park",
      population: 10,
      color: "#029ef2",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "N/A",
      population: 10,
      color: "#00bcf0",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
   
  ];

  //bar chart active quantities

  // Sample bar chart data
  // Also... is this across multiple matches? I thought the idea of this view
  // was just the one match
  const originalData = [
    [50, 10, 20, 10, 14, 12],
    [20, 30, 50, 10, 12, 4],
    [30, 20, 40, 1, 32, 4,],
    // [60, 10, 10, 0, 42, 1],
  ];

  // array: processed, removed, L1, L2, L3, L4, coral total, algae total
  // consider swapping to a map
  //rawData can't be initialized before the function call. Need to use state to set this.
  //Maybe create an interface and map it? But you need matchData initialized before you create this const.

  // const rawData: number[] = [matchData!.match_algae.processed, matchData!.match_algae.removed, matchData!.match_coral.L1.total_made, matchData!.match_coral.L2.total_made, matchData!.match_coral.L3.total_made, matchData!.match_coral.L4.total_made, matchData!.match_coral.total_made, matchData!.match_algae.total];
  // Filter bar chart data based on activeLegend
return(
    <ScrollView>
        <View style={styles.container}>
          <BackButton buttonName="Home Page" />
          <Text style={styles.title}>MATCH DATA</Text>
          <Text style={styles.MDsubtitle}>{matchData?.team_num || 'Enter Match Number Below'}</Text>
          {/* <Text style={styles.miniSubtitle}>Match Number: {matchData?.match_num || '80'}</Text> */}
          <TextInput
                      style={styles.searchInput}
                      placeholder="Enter Match Number"
                      value={match}
                      onChangeText={setMatch}
          />
{/* 
            <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownButtonText}>
                        {selectedOption || 'Select Category'}
                    </Text>
                    <Text style={styles.dropdownArrow}>
                        {isDropdownVisible ? '∧' : '∨'}
                    </Text>
                </View>
            </TouchableOpacity> */}


            {/* What we're searching for
            {isDropdownVisible && (
                <View style={styles.dropdownContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={handleOptionSearch}
                    />

                    <FlatList
                        //this dropdown contains strings only.
                        //handleSelect should take in strings
                        data={filteredOptions}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => handleOptionSelect(item)}
                            >
                                <Text style={styles.optionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={styles.noResultsText}>No results found</Text>
                        )}
                    />
                </View>
            )} */}
        
        <Text style={styles.subtitle}>Graph</Text> 
          
        <View style={styles.legendContainer}>
          {legend.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.legendItem}
              onPress={() => {
                // Toggle legend item
                //check if only one item is selected. If so, block the change and grey out the remaining item
                legendHandler(index)
              }}
            >
              <View
                style={[
                  styles.legendCircle,
                  {
                    backgroundColor: activeLegend[index]
                      ? item.color
                      : "transparent", // Hollow circle for deselected
                    borderColor: item.color,
                    borderWidth: 2,
                  },
                ]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          {/* Bar chart */}
          {activeLegend.some(isActive => isActive) ? (
          <StackedBarChart
          // data needs to be the matches array
            data={{
              labels: [matchData?.match_num.toString() || '9999'],
              data: displayedData,
              barColors: legend.map((item) => item.color),
              legend: legend.map((item) => item.label),
            }}
            hideLegend={true}
            width={Dimensions.get("window").width-50}
            height={400}

            chartConfig={{
              // backgroundColor: "#2c3e50",
              backgroundGradientFrom: "#34495e",
              backgroundGradientTo: "#2c3e50",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { 
                borderRadius: 20, 
              },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
            barPercentage={1} // Change the width of the bars
            />
          ) : (
              <Text style={styles.text}>Please select at least one item to display chart</Text>
          )}
          </View>

          {matchData && (
                    <View style={styles.contentContainer}>
                      <Text style={styles.text}>Average Values:</Text>
                      {/* Display the data for the selected legend items */}
                      {activeLegend.map((isActive, index) => {
                              let avg = -1; // Default value if no data is available
                              if(isActive) {
                                const label = legend[index].label
                                if (label == "Algae Processed") {
                                  avg = matchData.match_algae.processed || -1;
                                }
                                else if (label == "Algae Removed") {
                                  avg = matchData.match_algae.removed || -1;
                                }
                                else if (label == "L1") {
                                  avg = matchData.match_coral.L1.total_made || -1;
                                }
                                else if (label == "L2") {
                                  avg = matchData.match_coral.L2.total_made || -1;
                                }
                                else if (label == "L3") {
                                  avg = matchData.match_coral.L3.total_made || -1;
                                }
                                else if (label == "L4") {
                                  avg = matchData.match_coral.L4.total_made || -1;
                                }
                              
                                return (
                                  <View>
                                    <Text key={index} style={styles.text}>
                                      {legend[index].label}: {avg !== -1 ? avg : "N/A"}    
                                    </Text>
                                  </View>
                                );
                              }
                              
                              
                              return null; // Return null for inactive items
                            })}
                    </View>
          )}
          
        <Text style={styles.subtitle}>Climb</Text> 
          <View style={styles.quickTagsContainer}>
            <View style={styles.quickTagContainer}>
            <View style={[styles.quickTagBox, { backgroundColor: matchData?.climb_deep ? '#0071BC' : '#d3d3d3' }]}>
              <Text style={styles.quickTagText}>Deep</Text>
            </View>
            <View style={[styles.quickTagBox, { backgroundColor: matchData?.climb_shallow ? '#0071BC' : '#d3d3d3' }]}>
              <Text style={styles.quickTagText}>Shallow</Text>
            </View>
            </View>
            <View style={styles.quickTagContainer}>
            <View style={[styles.quickTagBox, { backgroundColor: matchData?.park ? '#0071BC' : '#d3d3d3' }]}>
              <Text style={styles.quickTagText}>Park</Text>
            </View>
            <View style={[styles.quickTagBox, { backgroundColor: !(matchData?.climb_deep || matchData?.climb_shallow || matchData?.park) ? '#0071BC' : '#d3d3d3' }]}>
              <Text style={styles.quickTagText}>None</Text>
            </View>
          </View>
          </View>
            </View>
          <View style = {styles.container}>
            <Text style={styles.SPsubtitle}>Starting Position</Text>
            <View style={styles.sliderContainer}>
                <View style={[styles.track, { width: trackWidth }]}>
                    {renderTicks()}
                    {tickPositions.map((position, index) => (
                        <View
                        key={index}
                        style={[
                            styles.thumb,
                            { transform: [{ translateX: (matchData?.auto_starting_position || 0) * (trackWidth / max) }] },,
                        ]}
                        />
                    ))}
                    </View>
                </View>

            <View style={styles.rowContainer}>
                <Text style={[styles.text, { flex: 1, textAlign: 'left' }]}>Opposite</Text>
                <Text style={[styles.text, { flex: 1, textAlign: 'right' }]}>Processor</Text>
            </View>
            <Text style={styles.QTsubtitle}>Quick Tags</Text>
          <View style={styles.quickTagsContainer}>
            <View style={styles.quickTagContainer}>
              <View style={[styles.quickTagBox, { backgroundColor: matchData?.disabled ? '#0071BC' : '#d3d3d3' }]}>
                <Text style={styles.quickTagText}>Disabled</Text>
              </View>
              <View style={[styles.quickTagBox, { backgroundColor: matchData?.noShow ? '#0071BC' : '#d3d3d3' }]}>
                <Text style={styles.quickTagText}>No Show</Text>
              </View>
            </View>
            <View style={styles.quickTagContainer}>
              <View style={[styles.quickTagBox, { backgroundColor: matchData?.defence ? '#0071BC' : '#d3d3d3' }]}>
                <Text style={styles.quickTagText}>Defense</Text>
              </View>
              <View style={[styles.quickTagBox, { backgroundColor: matchData?.malfunction ? '#0071BC' : '#d3d3d3' }]}>
                <Text style={styles.quickTagText}>Malfunction</Text>
              </View>
            </View>
          </View>
          <Text style={styles.DRsubtitle}>Driver Rating</Text>
          <View style={styles.box}>
            <Text style={[styles.text, { fontSize: 48, color: '#0071BC' }]}>
              {matchData?.driverRating || 0}
            </Text>
          </View>

{/* are these the top 3 comments? or 3 most recent? How does this work */}
                {/* <View style = {styles.container}></View>
                    <Text style={styles.subtitle}>Comments</Text>
                        <View>
                            <TextInput
                            style={styles.input}
                            placeholder="   Enter Comments"
                        />
                        <View>
                            <TextInput
                            style={styles.input}
                            placeholder="   Enter Comments"
                        />
                        <View>
                            <TextInput
                            style={styles.input}
                            placeholder="   Enter Comments"
                        />
                    </View>
                </View>
            </View>*/ }
            </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        padding: 25,
      },
      circle: {
        width: 130,
        height: 130,
        borderRadius: 100,
        backgroundColor: '#00BCF0',
      },
      track: {
        width: '100%', 
        height: 7,
        borderRadius: 5,
        backgroundColor: "#d3d3d3",
        position: "relative",
    },
    quickTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap", // This allows the 2x2 layout for Pressable boxes
        justifyContent: "space-between",
      },
      quickTagContainer: {
        width: "50%",
        alignItems: "center",
      },
      quickTagBox: {
        width: '95%',
        height: 35,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0071BC",
        borderRadius: 10,
        marginBottom: 5,
      },
      quickTagText: {
        fontFamily: "InterBold",
        fontSize: 14,
        color: "#F5FAFA",
      },
    sliderContainer: {
        position: "relative",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
    },
    tick: {
        width: 2,
        height: 6.5,
        position: "absolute",
        backgroundColor: "#000000",
    },
    thumb: {
        width: 20,
        height: 20,
        backgroundColor: "#0071BC",
        borderRadius: 10,
        position: "absolute",
        top: -7.5,
        left: -7, // Center thumb on the track
    },
      miniCircle:{
        width: 20,
        height: 20,
        borderRadius: 100,
        backgroundColor: '#00BCF0',
      },
      contentContainer: {
        // padding: 25,
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
      },
      titleContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      title: {
        fontFamily: "Koulen",
        fontSize: 40,
        textAlign: "left",
        marginTop: 20,
      },
      subtitle: {
        fontFamily: 'Koulen',
        fontSize: 36,
        color: '#0071BC',
        textAlign: "left",
        marginTop:-30,
      },
      QTsubtitle: {
        fontFamily: 'Koulen',
        fontSize: 36,
        color: '#0071BC',
        textAlign: "left",
        marginTop:10,
      },
      DRsubtitle: {
        fontFamily: 'Koulen',
        fontSize: 36,
        color: '#0071BC',
        textAlign: "left",
        marginTop:10,
      },
      SPsubtitle: {
        fontFamily: 'Koulen',
        fontSize: 36,
        color: '#0071BC',
        textAlign: "left",
        marginTop:0,
      },
      MDsubtitle: {
        fontFamily: 'Koulen',
        fontSize: 24,
        color: '#0071BC',
        textAlign: "left",
        marginTop:0,
      },
      teamnumber: {
        fontFamily: 'Koulen',
        fontSize: 36,
        color: 'black',
        textAlign: "left",
        marginTop:-30,
      },
      miniSubtitle: {
        fontFamily: 'InterBold',
        fontSize: 20,
        color: '#000',
        justifyContent: 'center',
    },
      text: {
        fontFamily: 'InterBold',
        fontSize: 20,
        color: '#0071BC',
        marginLeft: 10,
      },
      rowContainer: {
        flexDirection: 'row', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
      },
      textWithBoxContainer: {
        flexDirection: "row", 
        alignItems: "center",
      },
      AlgaeContainer: {
        width: 55,
        height: 55,
        marginTop: 5,
      },
      roundedBox: {
        backgroundColor: "#0071BC", 
        borderRadius: 8, 
        width: 70, 
        height: 70,
        alignItems: "center", 
        justifyContent: "center", 
        marginTop: 10,
      },
      StairsContainer: {
        width: 55,
        height: 55,
        marginTop: 4,
      },
      CoralContainer: {
        width: 55,
        height: 55,
        marginTop: 4,
      },
      VisionaryContainer: {
        width: 55,
        height: 55,
        marginTop: 2,
      },
      DriveTrainContainer: {
        width: 55,
        height: 55,
        marginTop: 1,
      },
      IntakeContainer: {
        width: 55,
        height: 55,
        marginTop: 1,
      },
      smallBox: {
        width: 90,
        height: 40,
        backgroundColor: '#00BCF0', 
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        padding: 10,
      },
      textinABox: {
        fontFamily: 'Inter',
        fontSize: 20,
        color: '#00000',
      },
      CoralinABox: {
        fontFamily: 'Inter',
        fontSize: 20,
        color: '#00000',
      },
      Coralbox: {
        width: 45,
        height: 40,
        backgroundColor: '#00BCF0', 
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        padding: 10,
        marginHorizontal:2,
      },
      textsmall: {
        fontFamily: 'Inter',
        fontSize: 20,
        color: '#00000',
        marginLeft: 10,
      },
      input: {
        width: '100%',
        height: 45,
        borderColor: 'gray',
        borderWidth: 1,
        marginLeft: 6,
        textAlign: 'left',
        marginBottom: 10,
        marginTop: 3,
        borderRadius: 8,
      },
      textComment: {
        fontFamily: "InterBold",
        fontSize: 16,
        textAlign: "center",
        color: "#000000",
      },
      Commenttext:{
        fontFamily: "InterBold",
        fontSize: 16,
        color: "#0071BC",
        marginTop: 15,
        textAlign: 'left',
        marginLeft: 5,
      },
      box: {
        width: '100%', 
        height: 70, 
        // backgroundColor: '#949494', 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 4,
        borderColor: '#0071bc',
        borderRadius: 10,
      },
      dropdownButton: {
        height: 45,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    dropdownContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownArrow: {
        fontSize: 18,
        color: '#000',
    },
    dropdownButtonText: {
        fontSize: 14,
        color: '#000',
    },
    dropdownContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
        marginTop: -16,
        maxHeight: 200,
        overflow: 'hidden',
    },
    searchInput: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#f8f8f8',
        marginBottom: 20,
        color: '#333',
    },
    option: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
    noResultsText: {
        textAlign: 'center',
        padding: 15,
        fontSize: 16,
        color: '#999',
    },
    legendContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-evenly",
      marginVertical: 10,
      gap: '2%',
    },
    
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 8,
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
      fontFamily: 'Inter'
    },
    drating:{
      fontSize: 30,
      fontFamily: 'InterBold'
    }
       });

export default qualData;