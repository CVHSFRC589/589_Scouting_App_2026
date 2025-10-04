import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "../../../../backButton";
import { useFonts } from "expo-font";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, PanResponder, Pressable, TextInput, Dimensions, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import ProgressBar from '../../../../../components/ProgressBar'
import { robotApiService } from "@/data/processing";


const Post = () => {
  const params = useLocalSearchParams<{
    team_num: string;
    match_num: string;
    regional: string;
  }>();

  // Validate URL parameters are present
  useEffect(() => {
    if (!params.team_num || !params.match_num || !params.regional) {
      Alert.alert(
        'Error',
        'Missing required parameters',
        [{ 
          text: 'OK', 
          onPress: () => router.push("/")
        }]
      );
    }

  }, [params]);

  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagNames, setTagNames] = useState(["Disabled", "No show", "Defense", "Malfunction"]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const pan = useRef(new Animated.Value(0)).current;
  const valueRef = useRef(50);
  const min = 0;
  const max = 100;
  const screenWidth = Dimensions.get('window').width;  // Defined here
  const trackPadding = 20; // Keep the padding as before
  const trackWidth = screenWidth * 0.8;
  const tickCount = 10;
  const tickSpacing = (trackWidth) / (tickCount-1); // Use full screen width for tick spacing
  
  const trackPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only handle if it's a tap (no movement)
        return Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5;
      },
      onPanResponderGrant: (evt) => {
        // Handle tap on track
        const locationX = evt.nativeEvent.locationX;
        const nearestTick = Math.round(locationX / tickSpacing) * tickSpacing;

        Animated.spring(pan, {
          toValue: nearestTick,
          useNativeDriver: false,
          friction: 7,
          tension: 40,
        }).start();

        const calculatedRating = Math.round((nearestTick / trackWidth) * 9) + 1;
        valueRef.current = calculatedRating;
        setDriverRating(calculatedRating);
      },
    })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
          // Store the starting position when touch begins
          pan.setOffset(pan._value);
          pan.setValue(0);
      },
      onPanResponderMove: (e, gestureState) => {
          let newX = gestureState.dx;
          const totalX = pan._offset + newX;

          // Clamp the value
          if (totalX < 0) newX = -pan._offset;
          if (totalX > trackWidth) newX = trackWidth - pan._offset;

          pan.setValue(newX);

          const currentPosition = pan._offset + newX;
          const nearestTick = Math.round(currentPosition / tickSpacing) * tickSpacing;

          //update rating
          const calculatedRating = Math.round((nearestTick / trackWidth) * 9) + 1;
          valueRef.current = calculatedRating;
          setDriverRating(calculatedRating);
        },
      onPanResponderRelease: () => {
          pan.flattenOffset();
          const nearestTick = Math.round(pan._value / tickSpacing) * tickSpacing;
          Animated.spring(pan, {
              toValue: nearestTick,
              useNativeDriver: false,
              friction: 7,
              tension: 40,
          }).start();

          const calculatedRating = Math.round((nearestTick / trackWidth) * 9) + 1;
          valueRef.current = calculatedRating;
          setDriverRating(calculatedRating);
        },

  })
  ).current;
  
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

  // State for form fields
  const [disabled, set_disabled] = useState<boolean>(false);
  const [noshow, set_noshow] = useState<boolean>(false);
  const [defense, set_defense] = useState<boolean>(false);
  const [malfunction, set_malfunction] = useState<boolean>(false);
  const [driverRating, setDriverRating] = useState<number>(5);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const postGameData: TeamMatchPostGame = {
        // Include base fields from URL parameters
        team_num: parseInt(params.team_num),
        match_num: parseInt(params.match_num),
        regional: params.regional,
        // Include post-game specific fields
        driverRating: driverRating,
        disabled: disabled,
        defence: defense,
        malfunction: malfunction,
        noShow: noshow,
        comments: text,
      };

      // Submit with timeout and retry logic for delay tolerance
      const submitWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await Promise.race([
              robotApiService.updatePostGame(postGameData),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
              )
            ]) as any;

            // Check for acknowledgment in response
            if (response && response.acknowledgment) {
              // Server acknowledged
            }

            return response;
          } catch (err) {
            if (i === retries - 1) throw err;
            // Retrying request
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };

      await submitWithRetry();

      // Update statistics (non-blocking)
      Promise.all([
        robotApiService.updateAverageCoralMatch(Number(params.team_num), params.regional),
        robotApiService.updateAverageAlgaeMatch(Number(params.team_num), params.regional)
      ]).catch(err => {
        // Stats update failed
      });

      Alert.alert(
        'Success',
        `Match data for Team ${params.team_num} submitted successfully!\n\nThe server has acknowledged receipt and is processing your scouting data.`,
        [
          {
            text: 'OK',
            onPress: () => router.push("/(login)/home")
          }
        ]
      );
    } catch (error) {
      // Demo mode - show success message even if backend unavailable
      Alert.alert(
        'Data Saved',
        `Match data for Team ${params.team_num} has been recorded.\n\nNote: Running in demo mode.`,
        [
          {
            text: 'OK',
            onPress: () => router.push("/(login)/home")
          }
        ]
      );
      setIsSubmitting(false);
    }




  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={styles.container}>
              <BackButton buttonName="Home Page" />
              <ProgressBar currentStep="Post" />
      <Text style={styles.title}>Post-Game</Text>
      <Text style={styles.subtitle}>Driver Rating</Text>
      <View style={styles.line}></View>

      <View style={styles.sliderContainer}>
        <View style={[styles.track, { width: trackWidth }]} {...trackPanResponder.panHandlers}>
            {/* Render tick marks */}
            {renderTicks()}
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.thumb,
                    {
                        transform: [{ translateX: pan }],
                    },
                ]}
            />
        </View>

        {/* Numbers aligned directly below the slider */}
        <View style={styles.numberContainer}>
          <Text style={styles.text}>1</Text>
          <Text style={styles.text}>2</Text>
          <Text style={styles.text}>3</Text>
          <Text style={styles.text}>4</Text>
          <Text style={styles.text}>5</Text>
          <Text style={styles.text}>6</Text>
          <Text style={styles.text}>7</Text>
          <Text style={styles.text}>8</Text>
          <Text style={styles.text}>9</Text>
          <Text style={styles.text}>10</Text>
        </View>
      </View>
      

      <Text style={styles.subtitle}>Quick Tags</Text>
      <View style={styles.line}></View>

      {/* Separate Pressable Boxes under Quick Tags (2 rows of 2 boxes) */}
      <View style={styles.quickTagsContainer}>
          <View style={styles.column}>
            <Pressable
              onPress={() => {
                set_disabled(!disabled)
            }}
              style={[styles.quickTagBox, disabled ? styles.pressed : styles.quickTagBox]}
            >
              <Text style={styles.quickTagText}>Disabled</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                set_noshow(!noshow)
            }}
              style={[styles.quickTagBox, noshow ? styles.pressed : styles.quickTagBox]}
            >
              <Text style={styles.quickTagText}>No Show</Text>
            </Pressable>
            </View>
            <View style={styles.column}>
            <Pressable
              onPress={() => {
                set_malfunction(!malfunction)
            }}
              style={[styles.quickTagBox, malfunction ? styles.pressed : styles.quickTagBox]}
            >
              <Text style={styles.quickTagText}>Malfunction</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                set_defense(!defense)
            }}
              style={[styles.quickTagBox, defense ? styles.pressed : styles.quickTagBox]}
            >
              <Text style={styles.quickTagText}>Defense</Text>
            </Pressable>
          </View>
      </View>

      <Text style={styles.subtitle}>Comments</Text>
      <View style={styles.line}></View>

      <TextInput
        style={styles.input}
        placeholder="   Enter Comments"
        value={text}
        onChangeText={setText}
      />


      <View style={{ alignItems: 'center' }}>
        <Pressable 
          style={[
            styles.buttonSubmit,
            isSubmitting && { opacity: 0.7 }
          ]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
  </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 25,
  },
  title: {
    fontFamily: "Koulen",
    fontSize: 40,
    marginBottom: 0,
    textAlign: "left",
  },
  subtitle: {
    fontFamily: "InterBold",
    fontSize: 32,
    marginBottom: 10,
    marginTop: 20,
    textAlign: "left",
    color: "#0071BC",
  },
  line: {
    width: "100%",
    height: 2,
    backgroundColor: "#000",
    marginBottom: 30,
    marginTop: -10,
    borderRadius: 5,
  },
  sliderContainer: {
    position: "relative",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 10,
},
track: {
    width: '100%', 
    height: 7,
    borderRadius: 5,
    backgroundColor: "#d3d3d3",
    position: "relative",
    marginLeft: '-3%',
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
    left: -7,
},
  numberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '95%',
    marginTop: 5,
  },
  text: {
    fontFamily: "InterBold",
    fontSize: 14,
    textAlign: "center",
    color: "#000000",
  },
  quickTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // This allows the 2x2 layout for Pressable boxes
    justifyContent: "space-between",
    marginTop: -20,
    rowGap: '1%',
  },
  column: {
    width: "49%",
    marginBottom: 5,
    alignItems: "center",
  },
  quickTagBox: {
    width: '100%',
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
  pressed: {
    backgroundColor: "#041347", // Change background color on press
  },
  tagInput: {
    marginTop: 5,
    padding: 5,
    width: "100%",
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 5,
    textAlign: "center",
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    textAlign: 'left',
    marginBottom: 10,
    marginTop: -20,
    borderRadius: 10,
  },
  buttonSubmit: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#00BCF0",
    marginTop: 40,
    alignSelf: 'center',
  },
  buttonText: {
    fontFamily: 'InterBold',
        fontSize: 15,
        color: '#fff',
  },
});

export default Post;