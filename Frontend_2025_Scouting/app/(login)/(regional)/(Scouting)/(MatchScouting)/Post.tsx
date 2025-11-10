import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "../../../../backButton";
import { useFonts } from "expo-font";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, PanResponder, Pressable, TextInput, Dimensions, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, DeviceEventEmitter } from "react-native";
import ProgressBar from '../../../../../components/ProgressBar'
import { robotApiService, getDemoMode } from "@/data/processing";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { DemoBorderWrapper } from "@/components/DemoBorderWrapper";
import { getDemoModeFromStorage, DEMO_MODE_CHANGED_EVENT } from "@/components/ConnectionHeader";
import { matchDataCache } from "@/data/matchDataCache";
import { uploadQueue } from "@/data/uploadQueue";
import { useAuth } from "@/contexts/AuthContext";


const Post = () => {
  const params = useLocalSearchParams<{
    team_num: string;
    match_num: string;
    regional: string;
  }>();

  const { userProfile } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Validate URL parameters are present and check demo mode
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

    // Check demo mode on mount
    const checkDemoMode = async () => {
      const demoEnabled = await getDemoModeFromStorage();
      setIsDemoMode(demoEnabled);
    };
    checkDemoMode();

    // Listen for demo mode changes
    const subscription = DeviceEventEmitter.addListener(
      DEMO_MODE_CHANGED_EVENT,
      (event: { isDemoMode: boolean }) => {
        setIsDemoMode(event.isDemoMode);
      }
    );

    return () => {
      subscription.remove();
    };
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
  const tickCount = 5;
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

        const calculatedRating = Math.round((nearestTick / trackWidth) * 4) + 1;
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
          const calculatedRating = Math.round((nearestTick / trackWidth) * 4) + 1;
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

          const calculatedRating = Math.round((nearestTick / trackWidth) * 4) + 1;
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
  const [driverRating, setDriverRating] = useState<number>(3);

  // Swipe gesture handler
  const swipeGesture = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only allow right swipes (going back)
        // More lenient: allow swipe if horizontal movement is at least 2x vertical movement
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
        const isRightSwipe = gestureState.dx > 20;
        return isHorizontal && isRightSwipe;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const screenWidth = Dimensions.get('window').width;
        const swipeThreshold = screenWidth * 0.125; // 1/8 of screen width

        // Swipe right - go back to Tele (use back to animate from left)
        if (gestureState.dx > swipeThreshold) {
          // Immediate navigation for better responsiveness
          setImmediate(() => router.back());
        }
        // No left swipe - Post is the final page
      },
    })
  ).current;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Save current postgame data to cache
      const postGameData: TeamMatchPostGame = {
        team_num: parseInt(params.team_num),
        match_num: parseInt(params.match_num),
        regional: params.regional,
        driverRating: driverRating,
        disabled: disabled,
        defence: defense,
        malfunction: malfunction,
        noShow: noshow,
        comments: text,
      };

      await matchDataCache.savePostgameData(postGameData);
      console.log('📝 Postgame data saved to cache');

      // 2. Get complete match data from cache
      const completeMatchData = await matchDataCache.getMatchData();

      // 3. Validate complete match data
      const validation = matchDataCache.validateMatchData(completeMatchData);
      if (!validation.valid) {
        Alert.alert(
          'Missing Information',
          `Please ensure the following fields are filled in before submitting:\n\n${validation.missing.join('\n')}\n\nGo back to the Pregame page to enter this information.`,
          [
            {
              text: 'Go to Pregame',
              onPress: () => {
                setIsSubmitting(false);
                router.push(`./Pregame?returned=true`);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsSubmitting(false)
            }
          ]
        );
        return;
      }

      // 4. Check if in demo mode
      if (isDemoMode) {
        Alert.alert(
          'Demo Mode',
          `This would have submitted match data for Team ${completeMatchData!.team_num}, but you are in demo mode.\n\nNo data was sent to the server.`,
          [
            {
              text: 'OK',
              onPress: async () => {
                await matchDataCache.clearMatchData();
                router.push("/(login)/home");
              }
            }
          ]
        );
        setIsSubmitting(false);
        return;
      }

      // 5. Add user tracking and queue complete match data for upload
      const matchDataWithUser = {
        ...completeMatchData!,
        submitted_by: userProfile?.id
      };
      console.log('📤 Queuing complete match data:', matchDataWithUser);
      await uploadQueue.enqueue('match_complete', matchDataWithUser);
      console.log('✅ Complete match data queued for upload');

      // 6. Clear cache after successful queue
      await matchDataCache.clearMatchData();

      // 7. Show success message
      Alert.alert(
        'Match Submitted',
        `Match data for Team ${completeMatchData!.team_num} has been queued for upload.\n\nThe data will be sent to the server automatically.`,
        [
          {
            text: 'OK',
            onPress: () => router.push("/(login)/home")
          }
        ]
      );
    } catch (error) {
      console.error('Match submission error:', error);

      Alert.alert(
        'Submission Error',
        `Could not queue match data.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [
          {
            text: 'OK',
            onPress: () => setIsSubmitting(false)
          }
        ]
      );
    }




  };

  return (
    <DemoBorderWrapper>
      <AppHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
    <View style={styles.container} {...swipeGesture.panHandlers}>
              <View style={styles.navigationRow}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.push({
                        pathname: "./Tele",
                        params: {
                            team: params.team_num,
                            match: params.match_num,
                            regional: params.regional
                        }
                    })}
                >
                    <Image style={styles.backButtonIcon} source={require('./../../../../../assets/images/back_arrow.png')} />
                </Pressable>
              </View>
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
    <AppFooter />
    </DemoBorderWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 25,
    backgroundColor: '#E6F4FF',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    borderRadius: 4,
    borderColor: 'white',
    width: 20,
    height: 20,
    marginBottom: 15,
    marginTop: 25,
  },
  backButtonIcon: {
    width: 20,
    height: 20,
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