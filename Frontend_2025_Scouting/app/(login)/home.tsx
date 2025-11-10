import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, Pressable, StyleSheet, Dimensions } from "react-native";

import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import {PieChart} from "react-native-chart-kit";
import { getDemoMode, robotApiService } from "@/data/processing";
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { DemoBorderWrapper } from "@/components/DemoBorderWrapper";
import { useCompetition } from "@/contexts/CompetitionContext";

const API_URL = "ec2-18-220-35-32.us-east-2.compute.amazonaws.com";
//const API_URL = "localhost:8000"

const teamPhotoYear = 2025;

const Home = () => {
  const router = useRouter();
  const { activeCompetition } = useCompetition();
  const [firstTeamImage, setFirstTeamImage] = useState(null);
  const [firstPlaceTeam, setFirstPlaceTeam] = useState<string | null>(null);

  const [secondTeamImage, setSecondTeamImage] = useState(null);
  const [secondPlaceTeam, setSecondPlaceTeam] = useState<string | null>(null);

  const [thirdTeamImage, setThirdTeamImage] = useState(null);
  const [thirdPlaceTeam, setThirdPlaceTeam] = useState<string | null>(null);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;  // Defined here

  const [fontLoaded] = useFonts({
    Koulen: require("../../assets/fonts/Koulen-Regular.ttf"),
    InterBold: require("../../assets/fonts/Inter_18pt-Bold.ttf"),
    InterExtraBold: require("../../assets/fonts/Inter_18pt-ExtraBold.ttf"),
  });

  // const winfo = [
  //   {
  //     name: "Deep Climb",
  //     population: 20,
  //     color: "#0072BC",
  //     legendFontColor: "#7F7F7F",
  //     legendFontSize: 15
  //   },
  //   {
  //     name: "Shallow Climb",
  //     population: 30,
  //     color: "#CE2029",
  //     legendFontColor: "#7F7F7F",
  //     legendFontSize: 15
  //   },
  // ]
  useEffect(() => {
    // Component mounted
  }, []);

  useEffect(() => {
    const getLeaderboardData = async () => {
      try {
        const competition = activeCompetition || 'default';

        // Use robotApiService which has built-in fallback to mock data
        const data = await robotApiService.getSortedRobots({
          "RANK": true,
          "ALGAE_SCORED": false,
          "ALGAE_REMOVED": false,
          "ALGAE_PROCESSED": false,
          "ALGAE_AVG": false,
          "CORAL_L1": false,
          "CORAL_L2": false,
          "CORAL_L3": false,
          "CORAL_L4": false,
          "CORAL_AVG": false
        }, competition);

        if (data && data.length >= 3) {
          setFirstPlaceTeam(data[0].team_num.toString());
          setSecondPlaceTeam(data[1].team_num.toString());
          setThirdPlaceTeam(data[2].team_num.toString());
        }
      } catch (error) {
        // Error already handled by robotApiService fallback
      } finally {
        setIsLoading(false);
      }
    };

    getLeaderboardData();
  }, [activeCompetition]);
  // The Doughnut Chart component that takes in an array of percentages
  // const Ring = ({ data }) => {
  //   const total = data.reduce((acc, value) => acc + value, 0);
  //   let offset = 0;
  
  

  //   return (
  //     <View style={styles.outerCircle}>
  //       {data.map((percentage, index) => {
  //         const sliceAngle = (percentage / total) * 360;
  //         const sliceColor = index % 2 === 0 ? "#0071BC" : "#CE2029"; // Alternating between red and blue
          
  //         const rotation = offset;

  //         offset += sliceAngle;

  //         return (
  //           <View
  //             key={index}
  //             style={[styles.slice, { transform: [{ rotate: `${rotation}deg` }] }]} >
  //             <View
  //               style={[styles.sliceFill, { backgroundColor: sliceColor, transform: [{ rotate: `${sliceAngle}deg` }] }]} >
  //             </View>
  //           </View>
  //         );
  //       })}
  //       <View style={styles.innerCircle} />
  //     </View>
  //   );
  // };

  // if (!fontLoaded) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  return (
    <DemoBorderWrapper>
      <AppHeader />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        <View style={styles.container}>
        <Text style={styles.subtitle}>Scouting</Text>
        <View style={styles.group}>
          <Pressable
            style={styles.button}
            onPress={() => router.push("../(login)/(regional)/(Scouting)/PitScouting")}>
            <Text style={styles.text}>Pit</Text>
            <Image
              source={require("../../assets/images/Diver Helmet.png")}
              style={styles.buttonImage}
            />
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={() => router.push("../(login)/(regional)/(Scouting)/(MatchScouting)/Pregame")}>
            <Text style={styles.text}>Match</Text>
            <Image
              source={require("../../assets/images/Coral icon.png")}
              style={styles.buttonImage}
            />
          </Pressable>
        </View>
  
        <View style={styles.rankingContainer}>
          <Text style={styles.subtitle}>Ranking</Text>
          <Pressable onPress={() => router.push("../(login)/(regional)/(TeamInfo)/Leaderboard")}>
            <Image
              source={require("../../assets/images/Back.png")} 
              style={styles.rankingImage}
            />
          </Pressable>
        </View>
  
  {!isLoading && (
        <View style={styles.group}>
          <Pressable
            style={styles.bigButton}
            onPress={() => router.push("../(login)/(regional)/(TeamInfo)/Leaderboard")}>
            <View style={styles.barContainer}> 
              {/* Second Bar with Circle */}
              <View style={styles.barWrapper}>
                <View style={styles.bar2nd}></View>
                <Text style={styles.barText2nd} id="secondLeaderboardText">{secondPlaceTeam || ''}</Text>
                {/* <View style={styles.iconCircle}>
                  {/* <Image
                    source={{ uri: `data:image/png;base64,${secondTeamImage}` }}
                    style={styles.iconImage}
                  />
                  <Text>{secondPlaceTeam}</Text>
                </View> */}
                {/* New 2nd Icon on top of bar2nd */}
                <View style={styles.iconOverlay}>
                  {/* Background Circle */}
                  <View style={styles.backgroundCircleSilver}></View>
                  <Image
                    source={require("../../assets/images/2nd.png")} // New icon
                    style={styles.iconImageOverlay}
                  />
                </View>
                {/* {secondTeamImage && (
                  // <Image
                  //   source={{ uri: `data:image/png;base64,${secondTeamImage}` }}
                  //   style={styles.teamImage}
                  // />
                  <View>
                  <Text>{secondPlaceTeam}</Text>
                )} */}
              </View>

              {/* First Bar with Circle */}
              <View style={styles.barWrapper}>
                <View style={styles.bar1st}></View>
                <Text style={styles.barText1st} id="firstLeaderboardText">{firstPlaceTeam || ''}</Text>
                {/* <View style={styles.iconCircle}>
                  {/* <Image
                    source={{ uri: `data:image/png;base64,${firstTeamImage}` }}
                    style={styles.iconImage}
                  />
                  <Text>{firstPlaceTeam}</Text>
                </View> */}
                {/* New 1st Icon on top of bar1st */}
                <View style={styles.iconOverlay}>
                  {/* Background Circle */}
                  <View style={styles.backgroundCircleGold}></View>
                  <Image
                    source={require("../../assets/images/1st.png")} // New icon
                    style={styles.iconImageOverlay}
                  />
                </View>
                {/* {firstTeamImage && (
                  // <Image
                  //   source={{ uri: `data:image/png;base64,${firstTeamImage}` }}
                  //   style={styles.teamImage}
                  // />
                  <Text>{firstPlaceTeam}</Text>

                )} */}
              </View>

              {/* Third Bar with Circle */}
              
              <View style={styles.barWrapper}>
                <View style={styles.bar3rd}></View>
                {/* {thirdPlaceTeam && (
                  <View>
                    <Text style={styles.barText3rd} id="thirdLeaderboardText">{thirdPlaceTeam}</Text>
                  </View>
                )} */}
                  {/* <View style={styles.iconCircle}> */}
                  {/* <Image
                    source={{ uri: `data:image/png;base64,${thirdTeamImage}` }}
                    style={styles.iconImage}
                  /> */}
                  <Text style={styles.barText3rd}>{thirdPlaceTeam || ''}</Text>
                {/* </View> */}
                {/* New 3rd Icon on top of bar3rd */}
                <View style={styles.iconOverlay}>
                  {/* Background Circle */}
                  <View style={styles.backgroundCircleBronze}></View>
                  <Image
                    source={require("../../assets/images/3rd.png")} // New icon
                    style={styles.iconImageOverlay}
                  />
                </View>
                {/* {thirdTeamImage && (
                  // <Image
                  //   source={{ uri: `data:image/png;base64,${thirdTeamImage}` }}
                  //   style={styles.teamImage}
                  // />
                  <Text>{thirdPlaceTeam}</Text>
                )} */}
              </View>
            </View>
          </Pressable>
        </View>
      )}
        {/* <Pressable style={styles.upcomingContainer} onPress={() => router.push("/(login)/projection")}>
            <Text style={styles.subtitle}>Upcoming</Text>
              <View style={styles.line2}></View> */}
        
        {/* <View style={styles.layoutContainer}> */}
          {/* Left Numbers (Red) */}
          {/* <View style={styles.numbersColumn}>
            <Text style={[styles.number, { color: "#CE2029" }]}>00000</Text>
            <Text style={[styles.number, { color: "#CE2029" }]}>00000</Text>
            <Text style={[styles.number, { color: "#CE2029" }]}>00000</Text>
          </View>

          <PieChart
    data={winfo}  // Make sure 'winfo' has the data for this pie chart as well
    width={170}    // Adjust the width/height to fit your design
    height={170}
    hasLegend={false}
    chartConfig={{
      backgroundGradientFrom: "#1E2923",
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: "#08130D",
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
    }}
    accessor={"population"}
    backgroundColor={"transparent"}
    center={[45, 0]}
    absolute
  />  */}

          {/* Right Numbers (Blue) */}
          {/* <View style={styles.numbersColumn}>
            <Text style={[styles.number, { color: "#0071BC" }]}>00000</Text>
            <Text style={[styles.number, { color: "#0071BC" }]}>00000</Text>
            <Text style={[styles.number, { color: "#0071BC" }]}>00000</Text>
          </View>
        </View>
        </Pressable> */}

        {/* <View style={styles.container}></View> */}


        {/* <View style = {styles.group}> */}
          {/* <Pressable
            style={styles.button}
            onPress={() => router.push("../(login)/(regional)/(TeamInfo)/(tabs)/RobotDisplay")}>
            <Text style={styles.text}>ROBOT DISPLAY</Text>
          </Pressable> */}

          {/* <Pressable
            style={styles.button}
            onPress={() => router.push("../(login)/(regional)/(TeamInfo)/(tabs)/MatchData")}>
            <Text style={styles.text}>MATCH DATA</Text>
          </Pressable> */}
        {/* </View>
        <Pressable
            style={styles.button}
            onPress={() => router.push("../(login)/(regional)/(TeamInfo)/(tabs)/QualData")}>
            <Text style={styles.text}>QUAL DATA</Text>
          </Pressable> */}
      </View>
    </ScrollView>
    <AppFooter />
    </DemoBorderWrapper>
  );
}

//     commenting out for v1. Will implement in v2.   
//     .then(data => {
//         console.log(data);
//         const firstLeaderboardText = document.getElementById("firstLeaderboardText");
//         const secondLeaderboardText = document.getElementById("secondLeaderboardText");
//         const thirdLeaderboardText = document.getElementById("thirdLeaderboardText");
//         if (firstLeaderboardText) {
//           var currentTeamNum = data[0].team_num
//           firstLeaderboardText.innerHTML = currentTeamNum;
//           fetch(`http://${API_URL}/tests/blue/team/frc${currentTeamNum}/media/${teamPhotoYear}`, {
//             method: 'GET',
//             headers: {
//               'accept': 'application/json',
//               'Content-Type': 'application/json'
//             },
//           })
//           .then(response => response.json())
//           .then(data => {
//             console.log(data[0].details.base64Image);
//             setFirstTeamImage(data[0].details.base64Image);
//           })
//         }
//         if (secondLeaderboardText) {
//           secondLeaderboardText.innerHTML = data[1].team_num;
//           var currentTeamNum = data[1].team_num
//           fetch(`http://${API_URL}/tests/blue/team/frc${currentTeamNum}/media/${teamPhotoYear}`, {
//             method: 'GET',
//             headers: {
//               'accept': 'application/json',
//               'Content-Type': 'application/json'
//             },
//           })
//           .then(response => response.json())
//           .then(data => {
//             console.log(data[0].details.base64Image);
//             setSecondTeamImage(data[0].details.base64Image);
//           })
//         }
//         if (thirdLeaderboardText) {
//           thirdLeaderboardText.innerHTML = data[2].team_num;
//           var currentTeamNum = data[2].team_num
//           fetch(`http://${API_URL}/tests/blue/team/frc${currentTeamNum}/media/${teamPhotoYear}`, {
//             method: 'GET',
//             headers: {
//               'accept': 'application/json',
//               'Content-Type': 'application/json'
//             },
//           })
//           .then(response => response.json())
//           .then(data => {
//             console.log(data[0].details.base64Image);
//             setThirdTeamImage(data[0].details.base64Image);
//           })
//         }
//       })
//       .catch(error => {
//         console.error('Error fetching leaderboard data:', error);
//       });
//   }
// };

const styles = StyleSheet.create({

  scrollContainer: {
    flexGrow: 1,
    padding: 25,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 25,
    backgroundColor: '#E6F4FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  connectionIndicator: {
    backgroundColor: '#DC3545',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingContainer: {
    width: "100%",
    justifyContent: "center",
    paddingVertical: 15,
    // marginTop: 10,
  },
  title: {
    fontFamily: "Koulen",
    fontSize: 40,
    textAlign: "left",
    marginRight: 10,
  },
  subtitle: {
    fontFamily: "InterBold",
    fontSize: 30,
    textAlign: "left",
    marginTop: 20,
    marginBottom: 5,
    color: "#0071BC",
    flex: 1,
  },
  text: {
    fontFamily: "InterBold",
    fontSize: 15,
    textAlign: "left",
    color: "#fff",
  },
  text2: {
    fontFamily: "Koulen",
    fontSize: 25,
    textAlign: "left",
    color: "#949494",
  },
  line: {
    width: "100%",
    height: 2,
    backgroundColor: "#000",
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
  },
  line2: {
    width: "100%",
    height: 2.5,
    backgroundColor: "#0071BC",
    marginTop: -5,
    borderRadius: 5,
  },
  group: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    width: "48%",
    height: 120,
    backgroundColor: "#0071BC",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bigButton: {
    width: "100%",
    height: 300,
    backgroundColor: "#0071BC",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rankingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    paddingRight: 5,
  },
  rankingImage: {
    width: 30,
    height: 30,
    marginBottom: -10,
  },
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end",
    width: "100%",
    height: 300, 
    position: "relative",
  },
  barWrapper: {
    alignItems: "center",
    position: "relative",
    width: "30%",
  },
  bar1st: {
    width: '85%',
    height: 200,
    backgroundColor: "#FFD454",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  bar2nd: {
    width: '85%',
    height: 150,
    backgroundColor: "#D9D9D9",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  bar3rd: {
    width: '85%',
    height: 100,
    backgroundColor: "#C6753C",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  iconCircle: {
    width: 65,
    height: 65,
    backgroundColor: "white",
    borderRadius: 50,
    position: "absolute",
    top: -75,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: '80%',  
    height: '80%',
    borderRadius: 50,
  },
  iconOverlay: {
    position: "absolute",
    top: 10,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  backgroundCircleGold: {
    width: 40,
    height: 40,
    backgroundColor: "#E4A236",  // Background color (can be changed)
    borderRadius: 25,  // To make it round
    position: "absolute",
    zIndex: -1,  // Places the circle behind the icon

  },
  backgroundCircleSilver: {
    width: 40,
    height: 40,
    backgroundColor: "#949494",  // Background color (can be changed)
    borderRadius: 25,  // To make it round
    position: "absolute",
    zIndex: -1,  // Places the circle behind the icon
  },
  backgroundCircleBronze: {
    width: 40,
    height: 40,
    backgroundColor: "#9F4D21",  // Background color (can be changed)
    borderRadius: 25,  // To make it round
    position: "absolute",
    zIndex: -1,  // Places the circle behind the icon
  },

  iconImageOverlay: {
    width: 40,  // Icon size
    height: 40,  // Icon size
  },
  barText1st: {
    position: "absolute",
    fontFamily: "Koulen",
    fontSize: 30,
    top: 40,
    color: "#ffffff", // Text color
    textShadowColor: "#E4A236", // Outline color
    textShadowOffset: { width: 2, height: 2 }, // Shadow offset
    textShadowRadius: 5,
  },
  barText2nd: {
    position: "absolute",
    fontFamily: "Koulen",
    fontSize: 30,
    top: 40,
    color: "#ffffff", // Text color
    textShadowColor: "#949494", // Outline color
    textShadowOffset: { width: 2, height: 2 }, // Shadow offset
    textShadowRadius: 5,
  },
  barText3rd: {
    position: "absolute",
    fontFamily: "Koulen",
    fontSize: 30,
    top: 40,
    color: "#ffffff", // Text color
    textShadowColor: "#9F4D21", // Outline color
    textShadowOffset: { width: 2, height: 2 }, // Shadow offset
    textShadowRadius: 5,
    // marginBottom: 50
  },
  layoutContainer: {
    flexDirection: "row",  // Keep the layout as row (side-by-side)
    alignItems: "center",  // Center vertically
    justifyContent: "center",  // Center horizontally
    width: "100%",  // Full width available
    height: 180,  // Keep the height as is
    // marginTop: 15,  // Space from the previous section
  },
  numbersColumn: {
    flex: 1,  // Ensures it takes up the remaining space and centers its content
    alignItems: "center",  // Center content horizontally
  },
  number: {
    fontSize: 20,
    fontFamily: "InterBold",
    color: "#fff",
    textAlign: "right",
    marginBottom: 10,
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd", // Gray background for the doughnut ring
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  slice: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 50,
    top: 0,
    left: 0,
  },
  sliceFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    borderRadius: 50,
    transform: [{ rotate: "0deg" }],
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white", // White center hole
    position: "absolute",
  },
  // layoutContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "space-between",
  //   width: "100%",
  //   height: 180,
  //   marginTop: 15,
  // },
  buttonImage: {
    width: 70,
    height: 70,
  },
  buttonImage3: {
    width: 30,
    height: 30,
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 20,
  },
});

export default Home;

