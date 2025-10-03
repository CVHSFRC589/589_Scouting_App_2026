import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import BackButton from "@/app/backButton";


const Projection = () => {
  const router = useRouter();

  const [fontLoaded] = useFonts({
    Koulen: require("../../assets/fonts/Koulen-Regular.ttf"),
    InterBold: require("../../assets/fonts/Inter_18pt-Bold.ttf"),
    InterExtraBold: require("../../assets/fonts/Inter_18pt-ExtraBold.ttf"),
  });

  /*
  1. Get next match (search for team's unplayed, return first)
    * it seems like the init team match function won't work for initializing matches (maybe it works before a regional?)
    This needs more research. I have no idea if they'll initialize nearer to the regional.
  2. fetch team data from API for each team (but only for their top scorings?)
    * make this simpler. Only for avg total coral, avg total algae, and climb?
  4. Display
  */

 //we could try making a projection model for this page instead. I.e. build your own alliance and the model predicts who will win the game
 //could be a great resume project + intersting to do. 
 //See here: https://neo4j.com/blog/graph-data-science/build-predictive-model-python/

 //Need to parse data.  


  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
      <BackButton buttonName="Home Page" />
        <Text style={styles.title}>Projections</Text>
      </View>

      {/* Row Container for Two Sets */}
      <View style={styles.rowContainer}>
        
        <View style={styles.column}>

          <Text style={styles.subtitle2}>99%</Text>

          <Text style={styles.subtitleBlue}>00000</Text>
            <Text style={styles.textBlue}>L1: </Text>
            <Text style={styles.textBlue}>L2: </Text>
            <Text style={styles.textBlue}>L3: </Text>

          <Text style={styles.subtitleBlue}>00000</Text>
            <Text style={styles.textBlue}>L1: </Text>
            <Text style={styles.textBlue}>L2: </Text>
            <Text style={styles.textBlue}>L3: </Text>

          <Text style={styles.subtitleBlue}>00000</Text>
            <Text style={styles.textBlue}>L1: </Text>
            <Text style={styles.textBlue}>L2: </Text>
            <Text style={styles.textBlue}>L3: </Text>
        </View>

        <View style={styles.column}>

          <Text style={styles.subtitle2}>99%</Text>

          <Text style={styles.subtitleRed}>00000</Text>
            <Text style={styles.textBlue}>L1: </Text>
            <Text style={styles.textBlue}>L2: </Text>
            <Text style={styles.textBlue}>L3: </Text>

          <Text style={styles.subtitleRed}>00000</Text>
            <Text style={styles.textBlue}>L1: </Text>
            <Text style={styles.textBlue}>L2: </Text>
            <Text style={styles.textBlue}>L3: </Text>

          <Text style={styles.subtitleRed}>00000</Text>
            <Text style={styles.textBlue}>L1: </Text>
            <Text style={styles.textBlue}>L2: </Text>
            <Text style={styles.textBlue}>L3: </Text>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontFamily: "Koulen",
    fontSize: 40,
    textAlign: "left",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    // alignItems: "left",
  },
  subtitleBlue: {
    fontFamily: "InterBold",
    fontSize: 30,
    textAlign: "left",
    //marginTop: 20,
    marginBottom: 5,
    color: "#0071BC",
  },
  subtitleRed: {
    fontFamily: "InterBold",
    fontSize: 30,
    textAlign: "left",
    //marginTop: 20,
    marginBottom: 5,
    color: "#BF1414",
  },
  subtitle2: {
    fontFamily: "InterBold",
    fontSize: 40,
    textAlign: "left",
    marginBottom: 5,
    color: "#949494",
  },
  text: {
    fontFamily: "InterBold",
    fontSize: 18,
    textAlign: "left",
    color: "#fff",
  },
  textBlue: {
    fontFamily: "InterBold",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "left",
    color: "#0071BC",
  },
});

export default Projection;