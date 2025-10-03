import { Link, router, useGlobalSearchParams, useRouter } from "expo-router";
import BackButton from '../../../../backButton';
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, ScrollView, Modal } from "react-native";
import { robotApiService } from "@/data/processing";
import ProgressBar from '../../../../../components/ProgressBar'


const Tele = () => {
    const router = useRouter();
    const {team} = useGlobalSearchParams<{ team:string } > ();
    //regional string needs formatting to match backend naming scheme. 
    const {regional} = useGlobalSearchParams<{ regional:string } > ();
    const {match} = useGlobalSearchParams<{ match:string } > ();

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

    const popCoral = (timedelta: string, level: number) => {
        const new_coral = [...coral];

        new_coral.pop();

        setCoral(new_coral);
    } 


    const eventStartTime = new Date(Date.now());

    const createTeleTimeDelta = (t_initial: Date, t_final: Date): string => {
        const delta = t_final.valueOf() - eventStartTime.valueOf() + 15000;
        
        //should be in seconds. Formatting to a string
        // PT110S
        return `PT${delta/1000}S`
    }

    const decrementCount = (key: string) => {
      setCounts((prev) => {
          const newValue = prev[key] > 0 ? prev[key] - 1 : 0;
          return { ...prev, [key]: newValue };
      });
  };

  const decrementButtonStyle = (key: string) => {
    const isAlgaeKey = key === 'removed' || key === 'processed' || key === 'net'; // Check if it's 'removed' or 'processed'
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
  
    // Check if the key is 'removed' or 'processed' to use algaeCountButton style
    const buttonStyle = 
      key === 'removed' || key === 'processed' || key === 'net' ? styles.algaeCountButton : styles.countButton;
  
    return isMax ? { ...buttonStyle, backgroundColor: '#5792B9' } : buttonStyle;
  };
    

    const [isToggled, setIsToggled] = useState(false);
    
      // Function to toggle the boolean value
      // const toggle = () => {
      //   setIsToggled((prev) => !prev); // Toggle the current state
      // };
      const [selectedClimb, setSelectedClimb] = useState<string | null>(null);

      const toggleClimb = (value: string) => {
        setSelectedClimb((prev) => (prev === value ? null : value)); // Toggle the selected button
      };

  

    return (
        <ScrollView>
        <View style={styles.container}>
        <BackButton buttonName="Home Page" />
        <ProgressBar currentStep="Tele" />

            <Text style={styles.title}>Teleoperation</Text>

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
                              addCoral(createTeleTimeDelta(eventStartTime, now), 1)
  
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
                            />
                      </Pressable>
                        <Text style={styles.numberText}>{counts.coral2}</Text> {/* Display the current count */}
                        <Pressable 
                            style={incrementButtonStyle('coral2')} 
                            onPress={() => {
                              let now = new Date(Date.now())
                              addCoral(createTeleTimeDelta(eventStartTime, now), 2)
  
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
                              addCoral(createTeleTimeDelta(eventStartTime, now), 3)
  
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
                              addCoral(createTeleTimeDelta(eventStartTime, now), 4)
  
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
                      addAlgae(createTeleTimeDelta(eventStartTime, now), "removed");
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
                      addAlgae(createTeleTimeDelta(eventStartTime, now), "processor");
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
                      addAlgae(createTeleTimeDelta(eventStartTime, now), "net");
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

           
            <View style={{height: 30}}></View>
            <Text style={styles.subtitle}>Climb</Text>
            <View style={styles.line}></View>
              <View style= {styles.row}>
              <Pressable
                onPress={() => toggleClimb('deep')}
                style={[
                  styles.quickTagBox,
                  selectedClimb === 'deep' ? styles.pressed : styles.quickTagBox
                ]}
              >
                <Text style={styles.quickTagText}>Deep</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleClimb('shallow')}
                style={[
                  styles.quickTagBox,
                  selectedClimb === 'shallow' ? styles.pressed : styles.quickTagBox
                ]}
              >
                <Text style={styles.quickTagText}>Shallow</Text>
              </Pressable>
                  </View>
            
                  <View style= {styles.row}>
                  <Pressable
                    onPress={() => toggleClimb('park')}
                    style={[
                      styles.quickTagBox,
                      selectedClimb === 'park' ? styles.pressed : styles.quickTagBox
                    ]}
                  >
                    <Text style={styles.quickTagText}>Park</Text>
                  </Pressable>
                  <Pressable
                  onPress={() => toggleClimb('none')}
                  style={[
                    styles.quickTagBox,
                    selectedClimb === 'none' ? styles.pressed : styles.quickTagBox
                  ]}
                >
                  <Text style={styles.quickTagText}>None</Text>
                </Pressable>
                  </View>

            <Pressable style={styles.buttonSubmit} onPress={async () => {
                if (!selectedClimb) return;
                //add info to a teammatch object, then pass it forward onto the next view. Contexts?
                //see: passing using params: https://www.google.com/search?q=passing+state+object+onto+next+view+react+native+expo-router&sca_esv=edaa9008c38817d7&rlz=1C5CHFA_enUS1077US1082&sxsrf=AHTn8zrrP1ZSaAnIEMDJqqNpv2Tknb3E_g%3A1737951678525&ei=vgmXZ4DoH6fnkPIP34uaoAE&ved=0ahUKEwiAv73DhpWLAxWnM0QIHd-FBhQQ4dUDCBA&uact=5&oq=passing+state+object+onto+next+view+react+native+expo-router&gs_lp=Egxnd3Mtd2l6LXNlcnAiPHBhc3Npbmcgc3RhdGUgb2JqZWN0IG9udG8gbmV4dCB2aWV3IHJlYWN0IG5hdGl2ZSBleHBvLXJvdXRlcjIFECEYoAEyBRAhGKABSP0SUPMDWIsScAF4AZABAJgBhgGgAcsHqgEDOS4yuAEDyAEA-AEBmAIMoALrB8ICChAAGLADGNYEGEfCAgUQIRirApgDAIgGAZAGCJIHBDEwLjKgB6g6&sclient=gws-wiz-serp
                const team_match_tele: TeamMatchTele = {
                  team_num: Number(team),
                  match_num: Number(match),
                  regional: regional,
                  
                  algae: algae,
                  coral: coral,

                  climb_deep: selectedClimb === 'deep',
                  climb_shallow: selectedClimb === 'shallow',
                  park: selectedClimb === 'park'
                }

                await robotApiService.sendTeleData(team_match_tele)
                router.push({
                  pathname: "./Post",
                  params: {
                    team_num: team,
                    match_num: match,
                    regional: regional
                  }
              })
                //</View>`./Post?team=${team}&regional=${regional}&match=${match}`)
            }}>
              disabled={!selectedClimb}
                <Text style={styles.algaeCountButtonText}>Next</Text>
            </Pressable>
            {/* <Pressable style={styles.buttonSubmit} onPress={() => router.push("./Post")}> 
                            <Text style={styles.algaeCountButtonText}>Next</Text>
                    </Pressable> */
            }
            
        </View>
        {/* </View> */}
        </ScrollView>

        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 25,
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
        // backgroundColor: 'yellow',
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
    algaeButGroupNet: {
      flexDirection: 'row',  // Ensure buttons are aligned horizontally
      alignItems: 'center',  // Vertically align buttons and text
      justifyContent: 'space-between',  // Space between button and text
      // backgroundColor: 'purple',
      width: '50%',
      alignContent: 'center',
      alignSelf: 'center',
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
    countButton: {
        width: 45,
        height: 45,
        backgroundColor: '#4fb2f4',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusIcon: {
      width: "50%",
      height: "50%",
    },
    minusIcon: {
      width: "50%",
      height: "50%",
      //alignSelf: 'center',
    },
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
    algaeSubtitleNet: {
      fontFamily: 'InterBold',
      fontSize: 20,
      color: '#000',
      // backgroundColor: 'green',
      justifyContent: 'center',
      alignSelf: 'center'
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
    row: {
        flexDirection: 'row',
        gap: '1%',
        marginBottom: 5
      },
      quickTagContainer: {
        width: "50%",
        marginBottom: 5,
        alignItems: "center",
      },
      quickTagBox: {
        width: '50%',
        height: 35,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0071BC",
        borderRadius: 10,
      },
      quickTagText: {
        fontFamily: "InterBold",
        fontSize: 14,
        color: "#F5FAFA",
      },
      pressed: {
        backgroundColor: "#041347", // Change background color on press
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
      }
});

export default Tele;
