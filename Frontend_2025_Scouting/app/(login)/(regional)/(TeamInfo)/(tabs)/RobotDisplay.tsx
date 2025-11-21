import React, { useEffect, useState, useRef } from "react";
import { View, Image, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Dimensions, PanResponder } from "react-native";
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { robotApiService } from "@/data/processing";
import BackButton from "@/app/backButton";
import AppCache from "@/data/cache";
import { AppHeader } from "@/components/AppHeader";
import { useCompetition } from "@/contexts/CompetitionContext";

const robotDisplay = () => {
  const router = useRouter();
  const {team} = useGlobalSearchParams<{ team:string } > ();
  const { activeCompetition } = useCompetition();
  // Competition comes from CompetitionContext (database)
  const [fontLoaded] = useFonts({
    Koulen: require("../../../../../assets/fonts/Koulen-Regular.ttf"),
    InterBold: require("../../../../../assets/fonts/Inter_18pt-Bold.ttf"),
    InterExtraBold: require("../../../../../assets/fonts/Inter_18pt-ExtraBold.ttf"),
  });
  // const [comments, setComments] = useState('');
  if (!fontLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const [teamNumber, setTeamNumber] = useState('');
  const [robot, setRobot] = useState<Robot | null>(null);
  const [showButton, setShowButton] = useState(true);
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regional, setRegional] = useState<string>(''); // State to store the regional value
  // const { team } = useLocalSearchParams();

  const handleGetRobot = async (teamNum: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const regionalValue = activeCompetition || 'Test Competition'; // Use active competition from database
      setRegional(regionalValue);

      console.log('🔍 RobotDisplay - Fetching robot:', { teamNum, regionalValue });
      const response = await robotApiService.getRobot(teamNum, regionalValue);
      console.log('🔍 RobotDisplay - Received robot data:', {
        team_num: response?.team_num,
        remove: response?.remove,
        processor: response?.processor,
        net: response?.net,
      });
      setRobot(response);
      setShowButton(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch robot');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {

    // fetchRegional().then(() => {
    handleGetRobot(Number(team));
    if (robot) {
      setError(null); // Clear error if robot data is successfully fetched
    }
  }, [regional]); // Empty array ensures it runs only once on mount

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

        // Swipe right - no previous page (already on first tab)
        // Swipe left - go to MatchData
        if (shouldNavigateLeft) {
          setImmediate(() => router.push(`./MatchData?team=${team}`));
        }
      },
    })
  ).current;

  return (
    <>
      <AppHeader />
      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        <View {...swipeGesture.panHandlers}>
          {isLoading && <ActivityIndicator size="large" color="#0071BC" />}

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
          </View>

      {/* Algae Capabilities Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.textWithBoxContainer}>
          <View style={styles.roundedBox}>
            <Image
              source={require("../../../../../assets/images/algae.png")}
              style={styles.AlgaeContainer}
            />
          </View>
          <Text style={styles.text}>Algae:</Text>
        </View>

        {/* Algae capability badges - stacked vertically */}
        <View style={styles.badgeColumn}>
          {/* Remove Badge */}
          <View style={[styles.algaeBadges, { backgroundColor: robot?.remove ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>Remove</Text>
            <Text style={styles.badgeIcon}>{robot?.remove ? '✓' : '✗'}</Text>
          </View>

          {/* Process Badge */}
          <View style={[styles.algaeBadges, { backgroundColor: robot?.processor ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>Process</Text>
            <Text style={styles.badgeIcon}>{robot?.processor ? '✓' : '✗'}</Text>
          </View>

          {/* Net Badge */}
          <View style={[styles.algaeBadges, { backgroundColor: robot?.net ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>Net</Text>
            <Text style={styles.badgeIcon}>{robot?.net ? '✓' : '✗'}</Text>
          </View>
        </View>
      </View>

      {/* Climb Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.textWithBoxContainer}>
          <View style={styles.roundedBox}>
            <Image
              source={require("../../../../../assets/images/stairs.png")}
              style={styles.StairsContainer}
            />
          </View>
          <Text style={styles.text}>Climb:</Text>
        </View>

        {/* Climb capability badges - stacked vertically */}
        <View style={styles.climbContainer}>
          {/* Deep Badge */}
          <View style={[styles.capabilityBadge, { backgroundColor: robot?.climb_deep ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>Deep</Text>
            <Text style={styles.badgeIcon}>{robot?.climb_deep ? '✓' : '✗'}</Text>
          </View>

          {/* Shallow Badge */}
          <View style={[styles.capabilityBadge, { backgroundColor: robot?.climb_shallow ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>Shallow</Text>
            <Text style={styles.badgeIcon}>{robot?.climb_shallow ? '✓' : '✗'}</Text>
          </View>
        </View>
      </View>

      {/* Coral Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.textWithBoxContainer}>
          <View style={styles.roundedBox}>
            <Image
              source={require("../../../../../assets/images/FigmaCoral.png")}
              style={styles.CoralContainer}
            />
          </View>
          <Text style={styles.text}>Coral:</Text>
        </View>

        {/* Coral capability badges - stacked vertically */}
        <View style={styles.coralLevelcontainer}>
          {/* L4 Badge */}
          <View style={[styles.coralBadges, { backgroundColor: robot?.L4_scoring ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>L4</Text>
            <Text style={styles.badgeIcon}>{robot?.L4_scoring ? '✓' : '✗'}</Text>
          </View>

          {/* L3 Badge */}
          <View style={[styles.coralBadges, { backgroundColor: robot?.L3_scoring ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>L3</Text>
            <Text style={styles.badgeIcon}>{robot?.L3_scoring ? '✓' : '✗'}</Text>
          </View>

          {/* L2 Badge */}
          <View style={[styles.coralBadges, { backgroundColor: robot?.L2_scoring ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>L2</Text>
            <Text style={styles.badgeIcon}>{robot?.L2_scoring ? '✓' : '✗'}</Text>
          </View>

          {/* L1 Badge */}
          <View style={[styles.coralBadges, { backgroundColor: robot?.L1_scoring ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeLabel}>L1</Text>
            <Text style={styles.badgeIcon}>{robot?.L1_scoring ? '✓' : '✗'}</Text>
          </View>
        </View>
      </View>

      {/* Vision System Section */}
      <View style={styles.textWithBoxContainer}>
        <View style={styles.roundedBox}>
          <Image
            source={require("../../../../../assets/images/vision.png")}
            style={styles.VisionaryContainer}
          />
        </View>
        <Text style={styles.text}>Vision:</Text>
        <Text style={styles.textsmall}>{robot?.vision_sys || 'N/A'}</Text>
      </View>

      {/* Drive Train Section */}
      <View style={styles.textWithBoxContainer}>
        <View style={styles.roundedBox}>
          <Image
            source={require("../../../../../assets/images/wheel.png")}
            style={styles.DriveTrainContainer}
          />
        </View>
        <Text style={styles.text}>Drive Train:</Text>
        <Text style={styles.textsmall}>{robot?.drive_train || 'N/A'}</Text>
      </View>

      {/* Intake Section */}
      <View style={styles.textWithBoxContainer}>
        <View style={styles.roundedBox}>
          <Image
            source={require("../../../../../assets/images/enter-2.png")}
            style={styles.IntakeContainer}
          />
        </View>
        <Text style={styles.text}>Intake:</Text>
        <Text style={styles.textsmall}>
          {robot?.source_intake && robot?.ground_intake ? 'All' : robot?.source_intake ? 'Source' : robot?.ground_intake ? 'Ground' : 'None'}
        </Text>
      </View>

      <View>
        <View>
          <Text style={styles.Commenttext}>Comments:</Text>
        </View>
          <Text style={styles.textComment}>
            {robot?.comments || 'No Comments Available'}
          </Text>
        {/* <View>
          <Text style={styles.Commenttext}>Picture</Text>
        </View>
        <View style={styles.picturebox}>
          {robot?.picture_path ? (
            // <Image
            //   source={{ uri: robot.picture_path }}
            //   style={{ width: '100%', height: '100%' }}
            //   resizeMode="contain"
            // />
            <></>
          ) : (
            <Text style={styles.textComment}>No Picture Available</Text>
          )}
        </View> */}
        </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 25,
  },
  contentContainer: {
    padding: 25,
    flexGrow: 1,
    flex: 1,
    backgroundColor: '#E6F4FF',
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
  text: {
    fontFamily: 'InterBold',
    fontSize: 20,
    color: '#0071BC',
    marginLeft: 10,
  },
  sectionContainer: {
    marginBottom: 10,
    width: '100%',
  },
  textWithBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor :'pink',
    width: '100%',
  },
  badgeColumn: {
    flexDirection: 'row',    // arrange badges in a row
    flexWrap: 'wrap',        // allow wrapping to multiple rows
    justifyContent: 'flex-start', // use consistent margins for spacing
    width: '100%',
    marginTop: 10,
  },
  capabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 6,
    marginRight: 8,            // consistent horizontal gap
    height: 44,               // consistent badge height
    flexBasis: '48%',         // target two per row
    maxWidth: '48%',          // don't grow past the row width
  },
  algaeBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    marginRight: 8,            // consistent horizontal gap
    height: 44,
    flexBasis: '30.95%',          // make algae badges narrower
    maxWidth: '30.95%',
  },
  coralBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 6,
    marginRight: 8,            // consistent horizontal gap
    height: 44,
    flexBasis: '48%',          // match other badges for consistent layout
    maxWidth: '48%',
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
  coralLevelcontainer: {
    flexDirection: 'row',
    width: '47%',
    // backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginVertical: 6,
    marginRight: 6,
    height: 44,    
    marginTop: 10,               
  },
  climbContainer: {
    flexDirection: 'row',
    width: '100%',
    // backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginVertical: 6,
    marginRight: 6,
    height: 44,    
    marginTop: 10,            
  },
    coralLeveltext: {
      fontFamily: 'Inter',
      fontSize: 12,  // You can use dynamic scaling here based on width, if needed
      color: '#000',
      textAlign: 'center',
    },
  coralLevel: {
      flex: 1, // This makes the box take up equal space in its container
      height: 40,
      backgroundColor: '#00BCF0',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: 2,
      padding: 10,
      flexDirection: 'row',  // Keep text and other elements aligned properly
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
    // marginLeft: 6,
    textAlign: 'left',
    marginBottom: 10,
    marginTop: 3,
    borderRadius: 8,
  },
  textComment: {
    fontFamily: "Inter",
    fontSize: 20,
    textAlign: "center",
    color: "#000000",
  },
  Commenttext:{
    fontFamily: "InterBold",
    fontSize: 20,
    color: "#0071BC",
    marginTop: 15,
    textAlign: 'left',
    
    // marginLeft: 5,
  },
  picturebox: {
    width: '100%', 
    height: 100, 
    backgroundColor: '#949494', 
    justifyContent: 'center', 
    alignItems: 'center', 
    // margin: 10, 
  },
});

export default robotDisplay;