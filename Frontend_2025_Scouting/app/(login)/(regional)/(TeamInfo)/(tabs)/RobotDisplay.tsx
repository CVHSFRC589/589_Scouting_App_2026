import React, { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { robotApiService } from "@/data/processing";
import BackButton from "@/app/backButton";
import AppCache from "@/data/cache";

const robotDisplay = () => {
  const router = useRouter();
  const {team} = useGlobalSearchParams<{ team:string } > ();
    //regional string needs formatting to match backend naming scheme. 
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

  const handleGetRobot = async (teamNum: number, regional: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let params = await AppCache.getData(); // Ensure this is awaited to get the regional value
      if (params) {
        setRegional(params?.regional || ''); // Fallback to empty string if regional is not found
      }
      // console.log(regional)
      
      const response = await robotApiService.getRobot(teamNum, regional);
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
    handleGetRobot(Number(team), regional);
    if (robot) {
      setError(null); // Clear error if robot data is successfully fetched
    }
  }, [regional]); // Empty array ensures it runs only once on mount
  

  return (
    <ScrollView style={styles.contentContainer}>
      <BackButton buttonName="Home Page"/>
      {/* {showButton && (
        <>
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            placeholder="Enter Team Number"
            value={teamNumber}
            onChangeText={setTeamNumber}
            keyboardType="numeric"
            maxLength={5}
          />
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: '#0071BC',
                padding: 10,
                borderRadius: 8,
                // margin: 10,
                opacity: pressed ? 0.7 : 1,
                width: '100%',
              }
            ]}
            onPress={() => handleGetRobot(Number(teamNumber))}
          >
            <Text style={[styles.text, { color: 'white', marginLeft: 0, textAlign: 'center' }]}>
              Load Robot Data
            </Text>
          </Pressable>
        </>
      )} */}

      {isLoading && <ActivityIndicator size="large" color="#0071BC" />}
      {/* {error && <Text style={[styles.text, { color: 'red' }]}>{error}</Text>} */}

      <View style={styles.titleContainer}>
        <Text style={styles.title}>ROBOT DISPLAY</Text>
      </View>
      {/* <Text style={styles.subtitle}>{robot?.team_num || '99999'}</Text> */}
      <Text style={styles.subtitle}>{team}</Text>

      {/* Algae and Removal row */}
      {/* <View style={styles.rowContainer}> */}
        <View style={styles.textWithBoxContainer}>
          <View style={styles.roundedBox}>
            <Image
              source={require("../../../../../assets/images/algae.png")}
              style={styles.AlgaeContainer}
            />
          </View>
          <Text style={styles.text}>Processed: </Text>
          {robot?.avg_algae_processed && (
            <View style={styles.smallBox}>
              <Text style={styles.textinABox}>{robot.avg_algae_processed.toFixed(1)}</Text>
            </View>
          )}
        
        {/* </View> */}
        </View>
      {/* </View> */}

      <View style={styles.textWithBoxContainer}>
          <View style={styles.roundedBox}>
            <Image
              source={require("../../../../../assets/images/algae.png")}
              style={styles.AlgaeContainer}
            />
          </View>
          <Text style={styles.text}>Can Remove?: </Text>
          <Text style={styles.textinABox}>
            {robot?.remove ? 'Yes' : 'No'}
          </Text>
        {/* </View> */}
        </View>
      {/* </View> */}

      {/* Climb Section */}
      <View style={styles.textWithBoxContainer}>
        <View style={styles.roundedBox}>
          <Image
            source={require("../../../../../assets/images/stairs.png")}
            style={styles.StairsContainer}
          />
        </View>
        <Text style={styles.text}>Climb: </Text>
        {/* <View style={styles.box2}> */}
          <Text style={styles.textinABox}>
            {robot?.climb_deep ? 'Deep' : robot?.climb_shallow ? 'Shallow' : 'None'}
          </Text>
        {/* </View> */}
      </View>

      {/* Coral Section */}
      <View style={styles.textWithBoxContainer}>
        <View style={styles.roundedBox}>
          <Image
            source={require("../../../../../assets/images/FigmaCoral.png")}
            style={styles.CoralContainer}
          />
        </View>
        
        <Text style={styles.text}>Coral: </Text>
      
        <View style={styles.coralLevelcontainer}>
          {[
            { key: 'L1', value: robot?.L1_scoring },
            { key: 'L2', value: robot?.L2_scoring },
            { key: 'L3', value: robot?.L3_scoring },
            { key: 'L4', value: robot?.L4_scoring }
          ].map((level) => (
            <View key={level.key} style={[styles.coralLevel, !level.value && { opacity: 0.3 }]}>
              <Text style={styles.coralLeveltext}>{level.key}</Text>
            </View>
          ))}
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
          <Text style={styles.Commenttext}>Comments</Text>
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
    </ScrollView>
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
    marginLeft: "-2%",
  },
  text: {
    fontFamily: 'InterBold',
    fontSize: 20,
    color: '#0071BC',
    marginLeft: 10,
  },
  textWithBoxContainer: {
    flexDirection: "row", 
    alignItems: "center",
    // backgroundColor :'pink',
    width: '100%',
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
    width: (Dimensions.get('window').width-138-53),
    // backgroundColor: 'green',
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