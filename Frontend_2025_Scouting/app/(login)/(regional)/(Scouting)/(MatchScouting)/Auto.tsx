import { Link, router, useGlobalSearchParams, useRouter } from "expo-router";
import BackButton from '../../../../backButton';
import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Image, ScrollView, PanResponder, Dimensions } from "react-native";
// import { underDampedSpringCalculations } from "react-native-reanimated/lib/typescript/animation/springUtils";
import { time } from "console";
import { start } from "repl";
import { robotApiService, getDemoMode } from "@/data/processing";
import { matchDataCache } from "@/data/matchDataCache";
import ProgressBar from '../../../../../components/ProgressBar'
import { stringify } from "querystring";
import StateBackButton from "@/components/StateBackButton";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { DemoBorderWrapper } from "@/components/DemoBorderWrapper";


const Auto = () => {
    const router = useRouter();
    const {team} = useGlobalSearchParams<{ team:string } > ();
    //regional string needs formatting to match backend naming scheme.
    const {regional} = useGlobalSearchParams<{ regional:string } > ();
    const {match} = useGlobalSearchParams<{ match:string } > ();

    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isToggled, setIsToggled] = useState(false);
    const toggle = () => {
        setIsToggled((prev) => !prev); // Toggle the current state
      };

    // Initialize the state variable `count` with an initial value of 0
    const [counts, setCounts] = useState<{ [key: string]: number }>({
        coral1: 0,
        coral2: 0,
        coral3: 0,
        coral4: 0,
        removed: 0,
        processed: 0,
        net: 0
    });


    const incrementCount = (key: string) => {
        setCounts((prev) => {
            let newValue = prev[key] + 1;
            
            // Set limits for each count key
            if (key === 'coral1' || key === 'coral2' || key === 'coral3') {
            newValue = newValue <= 12 ? newValue : 12;
            } else if (key === 'coral4') {
            newValue = newValue <= 36 ? newValue : 36;
            } else if (key === 'removed') {
            newValue = newValue <= 12 ? newValue : 12;
            } else if (key === 'processed') {
            newValue = newValue <= 18 ? newValue : 18;
            }
        
            return { ...prev, [key]: newValue };
        });
    };
  
  
        
    const decrementCount = (key: string) => {
        setCounts((prev) => {
            const newValue = prev[key] > 0 ? prev[key] - 1 : 0;
            return { ...prev, [key]: newValue };
        });
    };


    // arrays of coral and algae used to format the api request
    const [coral, setCoral] = useState<Coral[]>([])
    const [algae, setAlgae] = useState<Algae[]>([])
    
    const addAlgae = (timedelta: string, where_scored: string) => {
        const algae_data: Algae = {
            team_num: Number(team),
            match_num: Number(match),
            regional: regional,
            where_scored: where_scored,
            made: true,
            timestamp: timedelta
        }

        const new_algae = [...algae, algae_data]
        setAlgae(new_algae)
    } 

    const addCoral = (timedelta: string, level: number) => {
        const coral_data: Coral = {
            team_num: Number(team),
            match_num: Number(match),
            regional: regional,
            level: level,
            made: true,
            timestamp: timedelta
        }

        const new_corals = [...coral, coral_data]
        setCoral(new_corals)
    } 


    //note: popping functions remove the last algae added to the array. So we are
    //counting on the scouter to not make long-lasting mistakes (basically just decrease
    //immediately in case of a misclick)
    const popAlgae = () => {
        const new_algae = [...algae];

        new_algae.pop();

        setAlgae(new_algae);
    } 

    const popCoral = () => {
        const new_coral = [...coral];

        new_coral.pop();

        setCoral(new_coral);
    } 


    const eventStartTime = new Date(Date.now());

    const createTimeDelta = (t_initial: Date, t_final: Date): string => {
        const delta = t_final.valueOf() - eventStartTime.valueOf();
        
        //should be in seconds. Formatting to a string
        // PT110S
        return `PT${delta/1000}S`
    }

    const decrementButtonStyle = (key: string) => {
      const isAlgaeKey = key === 'removed' || key === 'processed' || key === 'net'; // Check if it's 'removed' or 'processed' or 'net'
      return {
        ...styles.countButton,
        ...(isAlgaeKey ? styles.algaeCountButton : {}),
        backgroundColor: counts[key] === 0 ? '#5792B9' : '#4fb2f4', // Ensure color updates
      };
    };
    
    const incrementButtonStyle = (key: string) => {
      const isMax =
        (key === 'coral1' || key === 'coral2' || key === 'coral3') && counts[key] === 12 ||
        key === 'coral4' && counts[key] === 36 ||
        key === 'removed' && counts[key] === 6 ||
        key === 'processed' && counts[key] === 9;

      // Check if the key is 'removed' or 'processed' or 'net' to use algaeCountButton style
      const buttonStyle =
        key === 'removed' || key === 'processed' || key === 'net' ? styles.algaeCountButton : styles.countButton;

      return isMax ? { ...buttonStyle, backgroundColor: '#5792B9' } : buttonStyle;
    };``

    useEffect(() => {
        setIsDemoMode(getDemoMode());
    }, []);

    // Swipe gesture handler
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

                // Swipe right - go back to Pregame (use back to animate from left)
                if (shouldNavigateRight) {
                    setImmediate(() => router.back());
                }
                // Swipe left - go to Tele (push to animate from right)
                else if (shouldNavigateLeft) {
                    setImmediate(() => router.push(`./Tele?team=${team}&regional=${regional}&match=${match}`));
                }
            },
        })
    ).current;

    return (
        <DemoBorderWrapper>
        <AppHeader />
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.container} {...swipeGesture.panHandlers}>
            <View style={styles.navigationRow}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.push(`./Pregame?returned=true`)}
                >
                    <Image style={styles.backButtonIcon} source={require('./../../../../../assets/images/back_arrow.png')} />
                </Pressable>
                <Pressable
                    style={styles.forwardButton}
                    onPress={() => router.push(`./Tele?team=${team}&regional=${regional}&match=${match}`)}
                >
                    <Image style={styles.forwardButtonIcon} source={require('./../../../../../assets/images/back_arrow.png')} />
                </Pressable>
            </View>
            <ProgressBar currentStep="Auto" />

            <Text style={styles.title}>Autonomous</Text>

            <Text style={styles.subtitle}>Coral</Text>
            <View style={styles.line}></View>

            <View style={styles.horGroup}>
                {/* Adjust the image width and height to align with buttons */}
                <Image source={require('../../../../../assets/images/coral.png')} style={styles.image} resizeMode="contain" />

                <View style={styles.vertGroup}>
                    {/* Each button group */}
                    <View style={styles.butGroup}>
                      <Pressable 
                          style={() => decrementButtonStyle('coral1')} 
                          onPress={() => {
                            popCoral;
                            decrementCount('coral1')
                          }} 
                          disabled={counts.coral1 === 0}
                      >
                          <Image
                            source={require("../../../../../assets/images/Subtract.png")}
                            style={styles.minusIcon}
                              />
                      </Pressable>

                        <Text style={styles.numberText}>{counts.coral1}</Text> {/* Display the current count */}
                        <Pressable 
                            style={incrementButtonStyle('coral1')} 
                            onPress={() => {
                                let now = new Date(Date.now())
                                addCoral(createTimeDelta(eventStartTime, now), 1)
    
                                incrementCount('coral1')
                            }}
                        >
                            <Image
                            source={require("../../../../../assets/images/Plus Math.png")}
                            style={styles.plusIcon}
                              />
                        </Pressable>
                    </View>

                    <View style={styles.butGroup}>
                    <Pressable 
                          style={() => decrementButtonStyle('coral2')} 
                          onPress={() => {
                            popCoral;
                            decrementCount('coral2')
                          }} 
                          disabled={counts.coral2 === 0}
                      >
                    <Image
                            source={require("../../../../../assets/images/Subtract.png")}
                            style={styles.minusIcon}
                              />                      </Pressable>
                        <Text style={styles.numberText}>{counts.coral2}</Text> {/* Display the current count */}
                        <Pressable 
                            style={incrementButtonStyle('coral2')} 
                            onPress={() => {
                                let now = new Date(Date.now())
                                addCoral(createTimeDelta(eventStartTime, now), 2)
    
                                incrementCount('coral2')
                            }}
                        >
                            <Image
                            source={require("../../../../../assets/images/Plus Math.png")}
                            style={styles.plusIcon}
                              />
                        </Pressable>
                    </View>

                    <View style={styles.butGroup}>
                    <View style={styles.butGroup}>
                        <Pressable 
                            style={() => decrementButtonStyle('coral3')} 
                            onPress={() => {
                                popCoral;
                                decrementCount('coral3')
                            }}
                            disabled={counts.coral3 === 0}
                        >
                            <Image
                            source={require("../../../../../assets/images/Subtract.png")}
                            style={styles.minusIcon}
                              />
                        </Pressable>
                        <Text style={styles.numberText}>{counts.coral3}</Text> {/* Display the current count */}
                        <Pressable 
                            style={incrementButtonStyle('coral3')} 
                            onPress={() => {
                                let now = new Date(Date.now())
                                addCoral(createTimeDelta(eventStartTime, now), 3)
    
                                incrementCount('coral3')
                            }}
                        >
                            <Image
                            source={require("../../../../../assets/images/Plus Math.png")}
                            style={styles.plusIcon}
                              />
                        </Pressable>
                    </View>
                    </View>

                    <View style={styles.butGroup}>
                    <View style={styles.butGroup}>
                        <Pressable 
                              style={() => decrementButtonStyle('coral4')} 
                              onPress={() => {
                                popCoral;
                                decrementCount('coral4')
                              }}
                              disabled={counts.coral4 === 0}
                        >
                          <Image
                            source={require("../../../../../assets/images/Subtract.png")}
                            style={styles.minusIcon}
                              />
                        </Pressable>
                        <Text style={styles.numberText}>{counts.coral4}</Text> {/* Display the current count */}
                        <Pressable 
                            style={incrementButtonStyle('coral4')} 
                            onPress={() => {
                                let now = new Date(Date.now())
                                addCoral(createTimeDelta(eventStartTime, now), 4)
    
                                incrementCount('coral4')
                            }}
                        >
                            <Image
                            source={require("../../../../../assets/images/Plus Math.png")}
                            style={styles.plusIcon}
                              />
                        </Pressable>
                    </View>
                    </View>
                </View>
            </View>
            
            




            {/* ALGAEOIAJSKLHDFKLSJFHSKFH */}
            <Text style={styles.subtitle}>Algae</Text>
            <View style={styles.line}></View>


            <View style={styles.algaeVerticalContainer}>
              {/* Removed Counter */}
              <View style={styles.algaeSection}>
                <Text style={styles.algaeSubtitle}>Removed</Text>
                <View style={styles.algaeButGroup}>
                  <Pressable 
                    style={() => decrementButtonStyle('removed')} 
                    onPress={() => {
                      popAlgae;
                      decrementCount('removed');
                    }}
                    disabled={counts.removed === 0}
                  >
                    <Image
                      source={require("../../../../../assets/images/Subtract.png")}
                      style={styles.minusIcon}
                    />
                  </Pressable>
                  <Text style={styles.algaeNumberText}>{counts.removed}</Text>
                  <Pressable 
                    style={incrementButtonStyle('removed')} 
                    onPress={() => {
                      let now = new Date(Date.now());
                      addAlgae(createTimeDelta(eventStartTime, now), "removed");
                      incrementCount('removed');
                    }}
                  >
                    <Image
                      source={require("../../../../../assets/images/Plus Math.png")}
                      style={styles.plusIcon}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Processed Counter */}
              <View style={styles.algaeSection}>
                <Text style={styles.algaeSubtitle}>Processed</Text>
                <View style={styles.algaeButGroup}>
                  <Pressable 
                    style={() => decrementButtonStyle('processed')} 
                    onPress={() => {
                      popAlgae;
                      decrementCount('processed');
                    }}
                    disabled={counts.processed === 0}
                  >
                    <Image
                      source={require("../../../../../assets/images/Subtract.png")}
                      style={styles.minusIcon}
                    />
                  </Pressable>
                  <Text style={styles.algaeNumberText}>{counts.processed}</Text>
                  <Pressable
                    style={incrementButtonStyle('processed')}
                    onPress={() => {
                      let now = new Date(Date.now());
                      addAlgae(createTimeDelta(eventStartTime, now), "processed");
                      incrementCount('processed');
                    }}
                  >
                    <Image
                      source={require("../../../../../assets/images/Plus Math.png")}
                      style={styles.plusIcon}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Net Counter */}
              <View style={styles.algaeSection}>
                <Text style={styles.algaeSubtitle}>Net</Text>
                <View style={styles.algaeButGroup}>
                  <Pressable 
                    style={() => decrementButtonStyle('net')} 
                    onPress={() => {
                      popAlgae;
                      decrementCount('net');
                    }}
                    disabled={counts.net === 0}
                  >
                    <Image
                      source={require("../../../../../assets/images/Subtract.png")}
                      style={styles.minusIcon}
                    />
                  </Pressable>
                  <Text style={styles.algaeNumberText}>{counts.net}</Text>
                  <Pressable 
                    style={incrementButtonStyle('net')} 
                    onPress={() => {
                      let now = new Date(Date.now());
                      addAlgae(createTimeDelta(eventStartTime, now), "net");
                      incrementCount('net');
                    }}
                  >
                    <Image
                      source={require("../../../../../assets/images/Plus Math.png")}
                      style={styles.plusIcon}
                    />
                  </Pressable>
                </View>
              </View>
            </View>



      

            <Pressable style={styles.buttonSubmit} onPress={async () => {
                const team_match_auto: TeamMatchAuto = {
                    team_num: Number(team),
                    match_num: Number(match),
                    regional: regional,
                    algae: algae,
                    coral: coral,
                }

                // Save auto data to local cache (not submitting to server yet)
                try {
                    await matchDataCache.saveAutoData(team_match_auto);
                    console.log('📝 Auto data saved to cache');
                } catch (err) {
                    console.error('Error saving auto data to cache:', err);
                }

                // Navigate to Tele page
                router.push(`../(MatchScouting)/Tele?team=${team}&regional=${regional}&match=${match}`)
            }}>
                <Text style={styles.algaeCountButtonText}>Next</Text>
            </Pressable>

        {/* <Pressable style={styles.buttonSubmit} onPress={() => router.push("./Tele")}> 
                <Text style={styles.algaeCountButtonText}>Next</Text>
        </Pressable> */}

        </View>

        </ScrollView>
        <AppFooter />
        </DemoBorderWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 25,
        backgroundColor: '#E6F4FF',
    },
    navigationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    forwardButton: {
        borderRadius: 4,
        borderColor: 'white',
        width: 20,
        height: 20,
        marginBottom: 15,
        marginTop: 25,
        transform: [{ rotate: '180deg' }],
    },
    forwardButtonIcon: {
        width: 20,
        height: 20,
    },
    image: {
        width: '15%',  // Set the width of the image
        height: 260,   // Set a fixed height to align with buttons
        // backgroundColor: 'black',
    },
    horGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',  // Ensure space between image and buttons
        alignItems: 'flex-start',         // Align the items to the top
        width: '100%',
        // backgroundColor:'green',
    },

    algaeHorGroup: {
        flexDirection: 'row',
        alignItems: 'flex-start',         // Align the items to the top
        // marginHorizontal: 25,
        // backgroundColor:'green',
        justifyContent: 'space-between',
    },

    vertGroup: {
        width: '80%',  // Adjust width for the buttons to fit alongside the image
        gap: 8,
        // backgroundColor: 'red',
        justifyContent: 'space-evenly',  // Evenly space the button groups
        height: 260,
        margin: '5%',
    },

    algaeVertGroup: {
        width: '50%',  // Adjust width for the buttons to fit alongside the image
        // backgroundColor: 'red',
        // height: 260,
        // margin: '5%',
        justifyContent: 'center',
    },
    butGroup: {
        flexDirection: 'row',  // Ensure buttons are aligned horizontally
        alignItems: 'center',  // Vertically align buttons and text
        justifyContent: 'space-between',  // Space between button and text
        // backgroundColor: 'purple',
        width: '100%',
        
    },

    algaeButGroup: {
        flexDirection: 'row',  // Ensure buttons are aligned horizontally
        alignItems: 'center',  // Vertically align buttons and text
        justifyContent: 'space-between',  // Space between button and text
        // backgroundColor: 'purple',
        width: '90%',
        alignContent: 'center',
        
    },
    title: {
        fontFamily: 'Koulen',
        fontSize: 40,
        textAlign: 'left',
    },
    subtitle: {
        fontFamily: 'InterBold',
        fontSize: 32,
        textAlign: 'left',
        color: '#0071BC',
    },
    line: {
        width: '100%',
        height: 2,
        backgroundColor: '#000',
        marginBottom: 20,
        borderRadius: 5,
    },
    plusIcon: {
        width: "50%",
        height: "50%",
      },
    minusIcon: {
        width: "50%",
        height: "50%",
        alignSelf: 'center',

      },
    countButton: {
        width: 45,
        height: 45,
        backgroundColor: '#4fb2f4',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    /*
    countButtonText: {
        fontFamily: 'InterBold',
        fontSize: 30,
        color: '#fff',
    },
    */
    numberText: {
        fontFamily: 'InterBold',
        fontSize: 40,
        color: '#000',
    },

    algaeCountButton: {
        width: 40,
        height: 40,
        backgroundColor: '#4fb2f4',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    algaeCountButtonText: {
        fontFamily: 'InterBold',
        fontSize: 15,
        color: '#fff',
    },
    
    algaeNumberText: {
        fontFamily: 'InterBold',
        fontSize: 25,
        color: '#000',
    },

    algaeSubtitle: {
        fontFamily: 'InterBold',
        fontSize: 20,
        color: '#000',
        // backgroundColor: 'green',
        justifyContent: 'center',
    },

    buttonSubmit: {
        width: 200,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#00BCF0',
        marginTop: 40,
        alignSelf: 'center', // This will center the button within its container
        justifyContent: 'center',  // Ensure the text is centered vertically inside the button
        alignItems: 'center',
    },
    algaeVerticalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
      },
      algaeSection: {
        alignItems: 'center',
        marginVertical: 10,
        width: '100%',
      },
    quickTagBox: {
        width: '80%',
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0071BC",
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 20,
      },
      quickTagText: {
        fontFamily: "InterBold",
        fontSize: 14,
        color: "#F5FAFA",
      },
      pressed: {
        backgroundColor: "#041347", // Change background color on press
      },
});

export default Auto;
