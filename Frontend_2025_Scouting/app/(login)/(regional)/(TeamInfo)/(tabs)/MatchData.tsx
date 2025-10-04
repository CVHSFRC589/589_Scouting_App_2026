import React, { ReactElement, useEffect, useRef, useState } from "react";
import { View, ScrollView, Image, Text, Pressable, StyleSheet, TouchableOpacity, TextInput, FlatList, Animated, PanResponder, Dimensions } from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import BackButton from "@/app/backButton";
import {
  PieChart,
  StackedBarChart
} from "react-native-chart-kit";
import { robotApiService } from "@/data/processing";
import AppCache from "@/data/cache";
// import { ComplexAnimationBuilder } from "react-native-reanimated";

interface ClimbPieChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

const matchData = () => {
  const router = useRouter();

  //wherever redirects to this page needs to add ?team={teamnum}&match={matchnum} 
  //at the end of the url in its router.push
  const {team} = useGlobalSearchParams<{ team :string } > ();
  const {match} = useGlobalSearchParams<{ match :string } > ();
  // const regional = AppCache.getData().then((data) => data!.regional);
  const [regional, setRegional] = useState<string | null>(null);

  const [matchData, setMatchData] = useState<TeamMatchResponse[] | null>(null);
  const [climbData, setClimbData] = useState<ClimbData | null>(null);
  const [rawData, setRawData] = useState<number[][] | undefined>(undefined);
  const [climbPieChartVals, setClimbPieChartVals] = useState<ClimbPieChartData[] | null>(null);
  const [filteredData, setFilteredData] = useState<number[][]>([]); // Initialize with a default value
  const [matchLabels, setMatchLabels] = useState<string[]>([]); // Initialize with an empty array

  //bar chart active quantities
  const [activeLegend, setActiveLegend] = useState([true, true, true, true, true, true]); // All legend items active by default
  const legend = [
    { label: "Algae Processed", color: "#129448" },
    { label: "Algae Removed", color: "#0cad85" },
    { label: "L1", color: "#00bcf0" },
    { label: "L2", color: "#11a4ed" },
    { label: "L3", color: "#1f8ded" },
    { label: "L4", color: "#3f65d9" },

  ];

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

const [readyForData, setReadyForData] = useState(false);

//bandaid fix to graph issue:
// useEffect(() => {
//   const wait = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

//   const antiRaceCondition = async () => {
//     await wait(2000);
//     console.log("After wait");
//     setReadyForData(true);
//   };

//   antiRaceCondition();
// }, [])

useEffect(() => {
  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // 1. Get regional first
      const params = await AppCache.getData();
      if (!params?.regional) {
        throw new Error('Regional value not found in cache');
      }
      
      const regionalValue = params.regional;
      setRegional(regionalValue);
      
      // 2. Now use the value directly (not from state)
      const [matchDataResult, climbDataResult, robotDataResult] = await Promise.all([
        robotApiService.fetchAllTeamMatchData(regionalValue, Number(team)),
        robotApiService.getClimbStats(Number(team), regionalValue),
        robotApiService.getRobot(Number(team), regionalValue) // Fetch robot data for averages
      ]);
      
      // 3. Set all state at once
      if (matchDataResult && readyForData) {
        setMatchData(matchDataResult);
        let labels = matchDataResult.map((match) => match.match_num.toString());
        setMatchLabels(labels);
        setRobot(robotDataResult); // Set the robot data for averages
      }
      
      // console.log('Climb Data Results ' + JSON.stringify(climbDataResult))
      // console.log('Match Data Results ' + JSON.stringify(matchDataResult))


      // setClimbData(climbDataResult);

      setClimbPieChartVals([
      {
          name: "% Deep",
          population: (climbDataResult.deep / matchData!.length) * 100,
          color: "#0f3eab",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
          name: "% Shallow",
          population: (climbDataResult.shallow / matchData!.length) * 100,
          color: "#076ddb",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
          name: "% Park",
          // Fixed: Using park instead of deep
          population: (climbDataResult.park / matchData!.length) * 100, 
          color: "#029ef2",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
          name: "% None",
          population: 100 - (climbDataResult.total / matchData!.length) * 100,
          color: "#00bcf0",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
      ]);
    } catch (err) {
      // Error loading data
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  loadAllData();
}, [team, readyForData]);
// 2. Process match data after it's loaded
// order: processed, removed, L1, L2, L3, L4
useEffect(() => {
  if (matchData) {
    const processedData = matchData.map((match) => [
      match.match_algae.processed,
      match.match_algae.removed,
      match.match_coral.L1.total_made,
      match.match_coral.L2.total_made,
      match.match_coral.L3.total_made,
      match.match_coral.L4.total_made,
    ]);
    setRawData(processedData);
  }
}, [matchData]);

// //climbdata use effect
// useEffect(() => {
//   console.log("Pie chart effect running:", 
//     "climbData =", climbData, 
//     "matchData length =", matchData?.length);
  
//   // Use conditional execution instead of early return
//   if (climbData && matchData && matchData.length > 0) {
//     console.log("Calculating pie chart with valid data");
    
//     setClimbPieChartVals([
//       {
//         name: "Deep Climb",
//         population: (climbData.deep / matchData.length) * 100,
//         color: "#0f3eab",
//         legendFontColor: "#7F7F7F",
//         legendFontSize: 15
//       },
//       {
//         name: "Shallow Climb",
//         population: (climbData.shallow / matchData.length) * 100,
//         color: "#076ddb",
//         legendFontColor: "#7F7F7F",
//         legendFontSize: 15
//       },
//       {
//         name: "Park",
//         // Fixed: Using park instead of deep
//         population: (climbData.park / matchData.length) * 100, 
//         color: "#029ef2",
//         legendFontColor: "#7F7F7F",
//         legendFontSize: 15
//       },
//       {
//         name: "N/A",
//         population: 100 - (climbData.total / matchData.length) * 100,
//         color: "#00bcf0",
//         legendFontColor: "#7F7F7F",
//         legendFontSize: 15
//       },
//     ]);
    
//     console.log("Pie chart data set successfully");
//   } else {
//     console.log("Skipping pie chart calculation - data not ready");
//     // Optionally set a default/empty state if needed
//     // setClimbPieChartVals([]);
//   }
// }, [climbData, matchData]);
//filter data useeffect:
useEffect(() => {
  if (rawData) {
    const filteredData = rawData.map((data) => {
      return data.filter((_, index) => activeLegend[index]);
    });
    setFilteredData(filteredData);
  }
}, [activeLegend, rawData]);

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

/*
  const legend = [
    { label: "Algae Processed", color: "#129448" },
    { label: "Algae Removed", color: "#0cad85" },
    { label: "L1", color: "#00bcf0" },
    { label: "L2", color: "#11a4ed" },
    { label: "L3", color: "#1f8ded" },
    { label: "L4", color: "#3f65d9" },
  ];
*/

// A component which displays the data for the selected legend items.
const LegendDataViewerComponent = (): ReactElement => {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.text}>Displayed Data:</Text>
      {activeLegend.map((isActive, index) => {
        let avg = -1; // Default value if no data is available
        if(isActive) {
          const label = legend[index].label
          if (label == "Algae Processed") {
            avg = robot?.avg_algae_processed || -1;
          }
          else if (label == "Algae Removed") {
            avg = robot?.avg_algae_removed || -1;
          }
          else if (label == "L1") {
            avg = robot?.avg_L1 || -1;
          }
          else if (label == "L2") {
            avg = robot?.avg_L2 || -1;
          }
          else if (label == "L3") {
            avg = robot?.avg_L3 || -1;
          }
          else if (label == "L4") {
            avg = robot?.avg_L4 || -1;
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





  // Filter bar chart data based on activeLegend
  

return(
    <ScrollView>
        <View style={styles.container}>
        <BackButton buttonName="Home Page" />
            <Text style={styles.title}>{team} MATCH DATA</Text>
            {/* <Text style={styles.miniSubtitle}>Match Number: {matchData?.match_num || '80'}</Text> */}

            {/* <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownButtonText}>
                        {selectedOption || 'Select Category'}
                    </Text>
                    <Text style={styles.dropdownArrow}>
                        {isDropdownVisible ? '∧' : '∨'}
                    </Text>
                </View>
            </TouchableOpacity>


            {/* What we're searching for */}
            {/* {isDropdownVisible && (
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
        {/* </View> */}
        <View style={styles.legendContainer}>
          {legend.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.legendItem}
              onPress={() => {
                // Toggle legend item
                legendHandler(index);
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
          {readyForData && (
            // <ScrollView
            // horizontal={true} // Enable horizontal scrolling for the bar chart
            // >
            <StackedBarChart
              data={{
                labels: matchLabels, // Add your labels here
                data: filteredData,
                barColors: legend.map((item) => item.color),
                legend: legend.map((item) => item.label),
              }}
              width={Dimensions.get("window").width - 50}
              height={400}
              hideLegend={true}
              chartConfig={{
                // backgroundGradientFrom: "#e8e6e6",
                // backgroundGradientTo: "#e8e6e6",
                // decimalPlaces: 1,
                // color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                // labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                backgroundGradientFrom: "#34495e",
                backgroundGradientTo: "#2c3e50",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { 
                  borderRadius: 20, 
                },
              }}
              style={{ marginBottom: "-8%", marginTop: "15%" }}
              barPercentage={1}
            />
            // </ScrollView>
          )}
          {/* </View> */}

          <Pressable
            style={styles.smallBox}
            onPress={() => {
              setReadyForData(!readyForData);
              }
            }
          >
            <Text style={styles.text}>Load Graph</Text>
          </Pressable>

        {/* display the data selected in the graph's legend */}
        {readyForData && (
          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>Average Values:</Text>
            {/* Display the data for the selected legend items */}
            {/* <LegendDataViewerComponent /> */}
      {activeLegend.map((isActive, index) => {
        let avg = -1; // Default value if no data is available
        if(isActive) {
          const label = legend[index].label
          if (label == "Algae Processed") {
            avg = robot?.avg_algae_processed || -1;
          }
          else if (label == "Algae Removed") {
            avg = robot?.avg_algae_removed || -1;
          }
          else if (label == "L1") {
            avg = robot?.avg_L1 || -1;
          }
          else if (label == "L2") {
            avg = robot?.avg_L2 || -1;
          }
          else if (label == "L3") {
            avg = robot?.avg_L3 || -1;
          }
          else if (label == "L4") {
            avg = robot?.avg_L4 || -1;
          }
        
          return (
            <Text key={index} style={styles.text}>
              {legend[index].label}: {avg !== -1 ? avg : "N/A"}    
            </Text>
          );
        }
        
        
        return null; // Return null for inactive items
      })}
          </View>
        )}


        {/* <View style={styles.box}></View> */}
        {/* <View style = {styles.container}></View> */}
        {/* This is the climb in a single match. Wouldn't
        it be better to include the pie chart in the robotDisplay? */}
        <Text style={styles.subtitle}>Climb</Text> 
            <View style = {{alignItems: 'center', justifyContent: 'center', alignContent: 'center'}}>
            {readyForData && climbPieChartVals && climbPieChartVals.length > 0 ? (
              <PieChart
                data={climbPieChartVals}
                paddingLeft="15"
                width={screenWidth - 50}
                height={190}
                chartConfig={{
                  backgroundGradientFrom: "#1E2923",
                  backgroundGradientFromOpacity: 0,
                  backgroundGradientTo: "#08130D",
                  backgroundGradientToOpacity: 0.5,
                  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                  strokeWidth: 2,
                  barPercentage: 0.5,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                center={[0, 0]}
                absolute
                style={{ alignSelf: 'center', marginBottom: "10%" }}
              />
            ) : (
              <Text>Loading climb data...</Text>
            )}
            </View>
            {/*
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
            */}

{/* commenting out temporarily to work on errors */}
            {/* </View>
            <View style = {styles.container}>
            <Text style={styles.subtitle}>Average Starting Position</Text>
            <View style={styles.sliderContainer}>
                <View style={[styles.track, { width: trackWidth }]}>
                    {renderTicks()}
                    {tickPositions.map((position, index) => (
                        <View
                        key={index}
                        style={[
                            styles.thumb,
                            { transform: [{ translateX: Math.round(
                              matchData!.reduce((sum, match) => sum + (match.auto_starting_position || 0), 0) / (matchData?.length || 1)
                            ) * (trackWidth / max) }] },,
                        ]}
                        />
                    ))}
                    </View>
                </View> */}

            {/* <View style={styles.rowContainer}>
                <Text style={[styles.text, { flex: 1, textAlign: 'left' }]}>Opposite</Text>
                <Text style={[styles.text, { flex: 1, textAlign: 'right' }]}>Processor</Text>
            </View>
          </View> */}

          {/* individual match stats: */}
            {/* <Text style={styles.subtitle}>Quick Tags</Text>
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
          </View> */}

{/*           random .reduce error
          <Text style={styles.subtitle}>Driver Rating</Text>
          <View style={styles.box}>
            <Text style={[styles.text, { fontSize: 48, color: '#fff' }]}>
              {Math.round(
  matchData!.reduce((sum, match) => sum + (match.driverRating || 0), 0) / (matchData?.length || 1)
)}
            </Text>
          </View> */}

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
            </View>
            </View> */}
        </View>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        paddingHorizontal: 25,
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
        marginTop: 0,
        marginLeft: -10
      },
      subtitle: {
        fontFamily: 'Koulen',
        fontSize: 36,
        color: '#0071BC',
        textAlign: "left",
        marginTop: -10,

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
      justifyContent: "space-between",
      alignItems: 'center',
      marginBottom: 10,
      marginTop: -5,
      // width: '100%',
      // backgroundColor: 'green',

      // gap: '1%',
      // paddingHorizontal: '5%',
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 10,
      marginTop: 10,
      justifyContent: 'center',
      // backgroundColor: 'yellow',
      // width: '40%',
      // gap: '9%'
    },
    legendCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 6,
      // marginLeft: 12,
    },
    legendText: {
      fontSize: 14,
      color: "#000",
      fontFamily: 'Inter',
      // marginRight: 12
    },
    drating:{
      fontSize: 30,
      fontFamily: 'InterBold',
      color: "",
      marginTop: 8,
    }
       });

export default matchData;