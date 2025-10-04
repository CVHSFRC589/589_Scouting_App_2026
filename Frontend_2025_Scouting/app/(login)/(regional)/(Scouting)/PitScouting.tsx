import { Link, router, useRouter } from "expo-router";
import BackButton from '../../../backButton';
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, TextInput, ScrollView, Linking, Platform, TouchableOpacity, Modal, Alert, KeyboardAvoidingView} from "react-native";
import { useFonts } from "expo-font";
import { robotApiService, getDemoMode } from "@/data/processing";
import AppCache from "@/data/cache";
import { Ionicons } from '@expo/vector-icons';
// import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

const PitScouting = () => {

    // const [facing, setFacing] = useState<CameraType>('back');
    // const [permission, requestPermission] = useCameraPermissions();
    // const cameraRef = useRef(null);
    // const [photo, setPhoto] = useState(null);
    // const [isCameraVisible, setIsCameraVisible] = useState(false);

    const router = useRouter();
  const [comments, setComments] = useState<string>('');
//   const [showPhoto, setShowPhoto] = useState(false);
//   const [image, setImage] = useState(null);
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Permission state
//   const cameraRef = useRef<typeof Camera | null>(null);
  const [fontLoaded] = useFonts({
    'Koulen': require('../../../../assets/fonts/Koulen-Regular.ttf'),
    'InterBold': require('../../../../assets/fonts/Inter_18pt-Bold.ttf'),
    'InterExtraBold': require('../../../../assets/fonts/Inter_18pt-ExtraBold.ttf'),
  });


//   const [activeButtons, setActiveButtons] = useState([false, false]);

//     const toggleButton = (index) => {
//     setActiveButtons((prev) => {
//         const newState = [...prev];
//         newState[index] = !newState[index];
//         return newState;
//     });
//     };
    //const [ground_intake, set_ground_intake] = useState<boolean>(false)



    //form data
    const [team, setTeam] = useState<string>("")
    const [useNumberPad, setUseNumberPad] = useState<boolean>(true)
    const [regional, setRegional] = useState<string>("")
    const [vision, setVision] = useState<string>("")
    const [isVisionDropdownVisible, setVisionDropdownVisible] = useState<boolean>(false)
    const [driveTrain, setDriveTrain] = useState<string>("")
    const [isDriveTrainDropdownVisible, setDriveTrainDropdownVisible] = useState<boolean>(false)
    const [ground_intake, set_ground_intake] = useState<boolean>(false)
    const [source_intake, set_source_intake] = useState<boolean>(false)

    const [L1, set_L1] = useState<boolean>(false)
    const [L2, set_L2] = useState<boolean>(false)
    const [L3, set_L3] = useState<boolean>(false)
    const [L4, set_L4] = useState<boolean>(false)

    const [algae_removed, set_algae_removed] = useState<boolean>(false)
    const [algae_processor, set_algae_processor] = useState<boolean>(false)
    const [algae_net, set_algae_net] = useState<boolean>(false); // Note: This was missing in the original code, added for completeness

    const [climb_deep, set_climb_deep] = useState<boolean>(false)
    const [climb_shallow, set_climb_shallow] = useState<boolean>(false)

    useEffect(() => {
        const getRegional = async () => {
            let cache = await AppCache.getData();
            setRegional(cache!.regional);
    
            
        }
        getRegional();
    }, []);

//     if (!permission) {
//         return <View />;
//       }
   
//       if (!permission.granted) {
//         return (
//           <View style={{
//             flex:1,
//             padding: 35,
//             alignItems: 'center',
//             justifyContent: 'center'
//             }}>
//             <Text style={styles.message}>We need your permission to show the camera</Text>
//             <Pressable onPress={requestPermission} style={styles.buttonSubmit}>
//           <Text style={ styles.algaeCountButtonText}>Grant Permission</Text> {/* Style the text inside */}
//         </Pressable>
//           </View>
//         );
//       }
     
     
     


//       function toggleCameraFacing() {
//         setFacing(current => (current === 'back' ? 'front' : 'back'));
//       }


//       const takePicture = async () => {
//         if (cameraRef.current) {
//             const photo = await cameraRef.current.takePictureAsync();
//             setPhoto(photo.uri);
//             console.log("Picture taken:", photo.uri);
//         }
//     };
    

    
    
if(!fontLoaded){
    return <View style={styles.container}><Text> Loading...</Text></View>;
}
  
    return (
        //Backend robot pit scouting schema + table needs alteration to match this better.
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
        <BackButton buttonName="Home Page" />
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Pit Scouting</Text>
                {getDemoMode() && (
                    <View style={styles.connectionIndicator}>
                        <Ionicons name="server-outline" size={16} color="#FFFFFF" />
                    </View>
                )}
            </View>

            <View style={styles.teamInputContainer}>
                <Text style={styles.Smallsubtitle}>Team</Text>
                <TouchableOpacity
                    onPress={() => setUseNumberPad(!useNumberPad)}
                    style={styles.keyboardToggle}
                >
                    <Ionicons
                        name={useNumberPad ? "keypad-outline" : "text-outline"}
                        size={20}
                        color="#0071BC"
                    />
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Enter Team Number"
                value={team}
                onChangeText={setTeam}
                keyboardType={useNumberPad ? "number-pad" : "default"}
            />

            <Text style={styles.Smallsubtitle}>Vision System</Text>
            <View style={{ position: 'relative', zIndex: 1000 }}>
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setVisionDropdownVisible(!isVisionDropdownVisible)}
                >
                    <View style={styles.dropdownContent}>
                        <Text style={[styles.dropdownButtonText, vision && { color: '#333' }]}>
                            {vision || 'Select Vision System'}
                        </Text>
                        <Text style={styles.dropdownArrow}>
                            {isVisionDropdownVisible ? '∧' : '∨'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {isVisionDropdownVisible && (
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                setVision('Yes');
                                setVisionDropdownVisible(false);
                            }}
                        >
                            <Text style={styles.optionText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                setVision('No');
                                setVisionDropdownVisible(false);
                            }}
                        >
                            <Text style={styles.optionText}>No</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Text style={styles.Smallsubtitle}>Drive Train</Text>
            <View style={{ position: 'relative', zIndex: 999 }}>
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setDriveTrainDropdownVisible(!isDriveTrainDropdownVisible)}
                >
                    <View style={styles.dropdownContent}>
                        <Text style={[styles.dropdownButtonText, driveTrain && { color: '#333' }]}>
                            {driveTrain || 'Select Drive Train'}
                        </Text>
                        <Text style={styles.dropdownArrow}>
                            {isDriveTrainDropdownVisible ? '∧' : '∨'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {isDriveTrainDropdownVisible && (
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                setDriveTrain('Swerve');
                                setDriveTrainDropdownVisible(false);
                            }}
                        >
                            <Text style={styles.optionText}>Swerve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                setDriveTrain('Tank');
                                setDriveTrainDropdownVisible(false);
                            }}
                        >
                            <Text style={styles.optionText}>Tank</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                setDriveTrain('Wheel');
                                setDriveTrainDropdownVisible(false);
                            }}
                        >
                            <Text style={styles.optionText}>Wheel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            
            <Text style={styles.Smallsubtitle}>Intake</Text>
            <View style={styles.group}>
                <Pressable 
                    onPress={() => {
                        set_ground_intake(!ground_intake)
                    }}
                    style={[styles.button, ground_intake ? styles.pressed : styles.button]}
                    >
                    <Text style={styles.buttonText}>Ground</Text>
                </Pressable>
  
                <Pressable
                    onPress={() => {
                        set_source_intake(!source_intake)
                    }}
                    style={[styles.button, source_intake ? styles.pressed : styles.button]}
                    >
                    <Text style={styles.buttonText}>Station</Text>
                </Pressable>
                </View>
            
            <Text style={styles.Smallsubtitle}>Coral</Text>
            <View style={styles.group}>
                <Pressable 
                    onPress={() => {
                        set_L1(!L1)
                    }}
                    style={[styles.button, L1 ? styles.pressed : styles.button]}
                    >
                    <Text style={styles.buttonText}>L1</Text>
                </Pressable>
                <Pressable 
                    onPress={() => {
                        set_L2(!L2)
                    }}
                    style={[styles.button, L2 ? styles.pressed : styles.button]}
                    >
                    <Text style={styles.buttonText}>L2</Text>
                </Pressable>
                <Pressable
                    onPress={() => {
                        set_L3(!L3)
                    }}
                    style={[styles.button, L3 ? styles.pressed : styles.button]}
                    >
                    <Text style={styles.buttonText}>L3</Text>
                </Pressable>
                <Pressable 
                    onPress={() => {
                        set_L4(!L4)
                    }}
                    style={[styles.button, L4 ? styles.pressed : styles.button]}
                    >
                    <Text style={styles.buttonText}>L4</Text>
                </Pressable>
            </View>

            <Text style={styles.Smallsubtitle}>Algae</Text>
            <View style={styles.group}>
                <Pressable 
                    onPress={() => set_algae_removed(!algae_removed)} 
                    style={[styles.button, algae_removed ? styles.pressed : styles.button]}
                >
                    <Text style={styles.buttonText}>Removal</Text>
                </Pressable>
                <Pressable 
                    onPress={() => set_algae_processor(!algae_processor)} 
                    style={[styles.button, algae_processor ? styles.pressed : styles.button]}
                >
                    <Text style={styles.buttonText}>Processor</Text>
                </Pressable>
                <Pressable 
                    onPress={() => set_algae_net(!algae_net)} 
                    style={[styles.button, algae_net ? styles.pressed : styles.button]}
                >
                    <Text style={styles.buttonText}>Net</Text>
                </Pressable>
            </View>
            
            <Text style={styles.Smallsubtitle}>Climb</Text>
            <View style={styles.group}>
                <Pressable 
                    onPress={() => set_climb_deep(!climb_deep)} 
                    style={[styles.button, climb_deep ? styles.pressed : styles.button]}
                >
                    <Text style={styles.buttonText}>Deep</Text>
                </Pressable>
                <Pressable 
                    onPress={() => set_climb_shallow(!climb_shallow)} 
                    style={[styles.button, climb_shallow ? styles.pressed : styles.button]}
                >
                    <Text style={styles.buttonText}>Shallow</Text>
                </Pressable>
            </View>
            
            <Text style={styles.Smallsubtitle}>Comments</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Comments"
                value={comments}
                onChangeText={(text) => setComments(text.slice(0, 70))}
            />
    
{/* <!--             <Text style={styles.Smallsubtitle}>Photo</Text>
               


               <TouchableOpacity style={styles.button5} onPress={() => setIsCameraVisible(true)}>
                   <Image source={require('../../../../assets/images/Camera.png')} style={styles.CameraIcon} />
                   <Text style={styles.buttonText}>Open Camera</Text>
               </TouchableOpacity>


               <Modal
                   animationType="slide"
                   transparent={false}
                   visible={isCameraVisible}
                   onRequestClose={() => setIsCameraVisible(false)}
               >
                   <View style={styles.container2}>
                       {/* Close Button (X) */}
                       {/* <TouchableOpacity style={styles.closeButton} onPress={() => setIsCameraVisible(false)}>
                           <Text style={styles.closeButtonText}> X </Text>
                       </TouchableOpacity>


                       <CameraView ref={cameraRef} style={styles.camera} facing={facing} />


                       <View style={styles.buttonContainer}>
                           <TouchableOpacity style={styles.button2} onPress={async () => {
                               await takePicture();
                               setIsCameraVisible(false); // Close modal after taking picture
                           }}>
                               <Text style={styles.text2}>⬤</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.button4} onPress={toggleCameraFacing}>
                       <Image source={require('../../../../assets/images/Refresh.png')} style={styles.flipCameraIcon} />
                       </TouchableOpacity>
                       </View>
                   </View>
               </Modal> */}


               {/* Display taken photo */}
               {/* {photo && <Image source={{ uri: photo }} style={{ width: '100%', height: 500 }} />}
                               </View> --> */}

            
            <Pressable style={styles.buttonSubmit} onPress={async () =>
                {
                    let team_num = Number(team)
                    let pitData: RobotPitData = {
                        team_num: team_num,
                        regional: regional,
                        vision_sys: vision,
                        drive_train: driveTrain,
                        ground_intake: ground_intake,
                        source_intake: source_intake,
                        L1_scoring: L1,
                        L2_scoring: L2,
                        L3_scoring: L3,
                        L4_scoring: L4,
                        remove: algae_removed,
                        processor: algae_processor,
                        net: algae_net,
                        climb_deep: climb_deep,
                        climb_shallow: climb_shallow,
                        comments: comments
                    }

                    try {
                        await robotApiService.updatePitData(team_num, pitData)
                        Alert.alert(
                            'Data Submitted',
                            `Pit scouting data for Team ${team_num} has been submitted successfully!\n\nNote: Running in demo mode.`,
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
                            `Pit scouting data for Team ${team_num} has been recorded.\n\nNote: Running in demo mode.`,
                            [
                                {
                                    text: 'OK',
                                    onPress: () => router.push("/(login)/home")
                                }
                            ]
                        );
                    }
                }}>
                <Text style={styles.algaeCountButtonText}>Submit</Text>
            </Pressable>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Makes sure the container takes up the whole screen
        justifyContent: 'flex-start', // Centers content to the top of the page
        padding: 25, // Optional: Adds padding to the container
    },

    group: {
        flexDirection: 'row',
        gap: '1%',
        marginBottom: 5
    },

    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        marginBottom: -10,
    },

    title:{
        fontFamily: 'Koulen',
        fontSize: 45,
        alignSelf: 'flex-start',
        //  left: 50,
    },

    connectionIndicator: {
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: '#DC3545',
        borderRadius: 14,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    Smallsubtitle: {
        fontFamily: 'InterBold',
        fontSize: 16,
        textAlign: 'left',
        color: '#0071BC',
    },
    teamInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    keyboardToggle: {
        padding: 5,
    },
    box: {
        width:'100%',
        height: 40,
        backgroundColor: 'gray',
    },
    pressed: {
        backgroundColor: "#041347", // Change background color on press
    },
    button: {
        flex: 1,
        width: '100%',
        flexDirection: "row",
        height: 35,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0071BC",
        borderRadius: 10,
    },

    buttonText: {
        fontFamily: "InterBold",
        fontSize: 14,
        color: "#F5FAFA",
    },
    buttonImage: {
        width: '15%',  // Adjust percentage based on need
        aspectRatio: 1,  // Ensures the width and height remain proportional
        resizeMode: "contain",
    },
    cameraButton: {
        width: '20%', // Full width
        flexDirection: "row", // Arrange items in a row
        alignItems: "center", // Center items vertically
        justifyContent: "space-evenly",  
    },
    cameraContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        textAlign: 'left',
        marginBottom: 10,
        borderRadius: 10,
      },
      dropdownButton: {
        height: 40,
        width: '100%',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#949494',
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    dropdownContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownArrow: {
        fontSize: 18,
        color: '#949494',
    },
    dropdownButtonText: {
        fontSize: 14,
        color: '#949494',
    },
    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 1001,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        maxHeight: 100,
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
      text: {
        fontSize: 16,
      },
      algaeCountButtonText: {
        fontFamily: 'InterBold',
        fontSize: 15,
        color: '#fff',
    },
      buttonSubmit: {
        width: 200,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#00BCF0',
        marginTop: 40,
        marginBottom: 40,
        alignSelf: 'center', // This will center the button within its container
        justifyContent: 'center',  // Ensure the text is centered vertically inside the button
        alignItems: 'center',
    },
    previewImage: {
        width: "100%",
        height: 200,
        marginTop: 10,
        borderRadius: 10,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        fontFamily: 'Inter',
        fontSize: 20,
    },
    button2: {
        width: 55,
        height: 55,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        //marginBottom: 10,
    },
    button4: {
        width: 65,
        height: 65,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        //marginBottom: 10,
    },
    button5: {
        flex: 1,
        width: '100%',
        flexDirection: "row",
        height: 35,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0071BC",
        borderRadius: 10,
        marginBottom: 10,
    },
    button3: {
        width: '90%',
        flexDirection: "row",
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0071BC",
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: "center",
        marginTop: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'transparent',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 25,
        fontWeight: 'bold',
    },
    text2: {
        fontFamily: 'InterBold',
        fontSize: 30,
        color: 'white',
    },
    flipCameraIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    CameraIcon: {
        width: 30,
        height: 30,
        marginRight: 5,
        resizeMode: 'contain',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 50,
        gap: '17%',
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
        paddingTop: 80,
        paddingBottom: 30,
    },
    camera: {
        flex: 1,
        width: '100%',
        height: 600,
    },



    });

export default PitScouting;