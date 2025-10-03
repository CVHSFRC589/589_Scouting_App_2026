import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
import BackButton from '../../../../backButton';
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, PanResponder, Pressable, TouchableOpacity, TextInput, FlatList, Dimensions, ScrollView } from "react-native";
import { useFonts } from 'expo-font';
import ProgressBar from '../../../../../components/ProgressBar'
import { robotApiService } from "@/data/processing";
import { error } from "console";


// var selectedTeamConst: number | null = null;
// var selectedMatchConst: number | null = null;
// var selectedRegionalConst: string | null = null;
// var auto_starting_positionConst: number | null = null;

const Pregame = () => {
    const router = useRouter();
    const regionalOptions = ['Hueneme', 'Ventura', 'East Bay', 'Orange County']
    const { returned } = useLocalSearchParams<{ returned: string }> ();
    // const options = ['1', '2', '3', '4', '5', 'Can add more in code']; // MUST ONLY BE NUMBERS, OR BAD STUFF HAPPENS
    // const secondOptions = ['1', '2', '3', 'Can add more in code']; // Still must only be numbers

    const pan = useRef(new Animated.Value(0)).current;

    //robot dropdown functions
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [robots, setRobots] = useState<Robot[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<RobotOption[] | null>(null);

    //match dropdown functions
    const [isSecondDropdownVisible, setSecondDropdownVisible] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
    const [searchSecondQuery, setSearchSecondQuery] = useState<string>('');
    const [matches, setMatches] = useState<TeamMatchBase[] | null>(null);
    const [displayedMatches, setFilteredMatches] = useState<Match[] | null>(null);

    const [isRegionalDropdownVisible, setRegionalDropdownVisible] = useState(false);
    const [selectedRegionalValue, setSelectedRegionalValue] = useState<string | null>(null);
    const [searchRegionalQuery, setSearchRegionalQuery] = useState<string>('');
    const [filteredRegionalOptions, setFilteredRegionalOptions] = useState(regionalOptions);
    
    const [auto_starting_position, setAutoStartingPosition] = useState<number>(0);

    const [secondTimeThru, setSecondTimeThru] = useState<boolean>(false);

    // const [matchNumber, setMatchNumber] = useState<number | null>(null);

    interface RobotOption {
        value: string;
        label: string;
    }

    interface Match {
        match_num: number;
    }
    
    // Team Number Dropdown functions
    const toggleTeamDropdown = async () => {
        let formatted_regional = ''
        if (selectedRegionalValue == null) {
            alert("Please select a regional first")
            return
        }
        else if (selectedRegionalValue == "Orange County") {
            formatted_regional = 'oc'
        }
        else if (selectedRegionalValue == "East Bay") {
            formatted_regional = 'be'
        }
        else if (selectedRegionalValue == "Ventura") {
            formatted_regional = 've'
        }
        else if (selectedRegionalValue == "Hueneme") {
            //check if hueneme regional key is "port hueneme -> ph" or "hueneme -> hu"
            formatted_regional = 'ph'
        }
        
        setDropdownVisible(!isDropdownVisible);
        setSearchQuery('');
        await fetchRobots(formatted_regional!);
    };

    const handleTeamSelect = (value: number) => {
        // selectedTeamConst = value;
        setSelectedTeam(value);
        setDropdownVisible(false);
    };

    const handleTeamSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredTeams(filteredRobots);
        } else {
            const filtered = filteredRobots.filter((option) =>
                option.label.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredTeams(filtered);
        }
    };

    // Dropdown 2 functions
    const toggleMatchDropdown = async () => {
        let formatted_regional = ''
        if (selectedRegionalValue == null) {
            alert("Please select a regional first")
            return
        }
        else if (selectedRegionalValue == "Orange County") {
            formatted_regional = 'oc'
        }
        else if (selectedRegionalValue == "East Bay") {
            formatted_regional = 'be'
        }
        else if (selectedRegionalValue == "Ventura") {
            formatted_regional = 've'
        }
        else if (selectedRegionalValue == "Hueneme") {
            //check if hueneme regional key is "port hueneme -> ph" or "hueneme -> hu"
            formatted_regional = 'ph'
        }

        setSecondDropdownVisible(!isSecondDropdownVisible);
        setSearchSecondQuery('');
        
        await fetchRemainingMatches(formatted_regional, selectedTeam!);
    };

    const handleMatchSelect = (value: number) => {
        // selectedMatchConst = value;
        setSelectedMatch(value);
        setSecondDropdownVisible(false);
    };

    useEffect(() => {
        if (returned == "true") {
            setSecondTimeThru(true);
        }
    }, []);

    // const handleMatchSearch = (query: string) => {
    //     setSearchSecondQuery(query);
    //     if (query.trim() === '') {
    //         setFilteredMatches(filteredMatches);
    //     } else {
    //         const filtered = filteredMatches.filter((option) =>
    //             option.match_num.toString().toLowerCase().includes(query.toLowerCase())
    //         );
    //         setFilteredMatches(filtered);
    //     }
    // };

    // Dropdown 3 functions (regional)
    const toggleRegionalDropdown = () => {
        setRegionalDropdownVisible(!isRegionalDropdownVisible);
        setSearchRegionalQuery('');
        setFilteredRegionalOptions(regionalOptions);
        // if(selectedRegionalValue != null)
            // setDropdownSelected(true);
    };

    const handleRegionalSelect = (value: string) => {
        // selectedRegionalConst = value;
        setSelectedRegionalValue(value);
        setRegionalDropdownVisible(false);
        // setDropdownSelected(true);
    };

    const handleRegionalSearch = (query: string) => {
        setSearchRegionalQuery(query);
        if (query.trim() === '') {
            setFilteredRegionalOptions(regionalOptions);
        } else {
            const filtered = regionalOptions.filter((option) =>
                option.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredRegionalOptions(filtered);
        }
    };

    const valueRef = useRef(50);
    const min = 0;
    const max = 100;
    const screenWidth = Dimensions.get('window').width;  // Defined here
    const trackPadding = 20; // Keep the padding as before
    const trackWidth = screenWidth * 0.8;
    const tickCount = 5;
    const tickSpacing = screenWidth / (tickCount); // Use full screen width for tick spacing
    
    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (e, gestureState) => {
            let newX = gestureState.dx + pan._value;
            if (newX < 0) newX = 0;
            if (newX > trackWidth - 20) newX = trackWidth - 20; // Clamp thumb to track width minus thumb width
        
            const nearestTick = Math.round(newX / tickSpacing) * tickSpacing;
            Animated.timing(pan, {
                toValue: nearestTick,
                duration: 45,
                useNativeDriver: false,
            }).start();
        
            valueRef.current = Math.round((nearestTick / trackWidth) * (max - min) + min);
            setAutoStartingPosition(Math.round(valueRef.current));
        },
        onPanResponderRelease: () => {
            const nearestTick = Math.round(pan._value / tickSpacing) * tickSpacing;
            Animated.spring(pan, {
                toValue: nearestTick,
                useNativeDriver: false,
            }).start();
            valueRef.current = Math.round((nearestTick / screenWidth) * (max - min) + min);
        
            setAutoStartingPosition(Math.round(valueRef.current));
            // auto_starting_positionConst = Math.round(valueRef.current);
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

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRobots = async (regional: string): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const robotData = await robotApiService.getAllRobots(regional);
            setRobots(robotData);
        } catch (err) {
            setError('Failed to fetch robot data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRemainingMatches = async (regional: string, team_num: number): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const matches = await robotApiService.fetchTeamRemainingMatches(regional, team_num);
            setMatches(matches);
        } catch (err) {
            setError('Failed to fetch robot data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRobots: RobotOption[] = robots
    .filter(robot => 
        robot.team_num.toString().includes(searchQuery.toLowerCase())
    )
    .map(robot => ({
        value: robot.team_num.toString(),
        label: `Team ${robot.team_num}`
    }));

    // const filteredMatches: Match[] = matches!
    // .filter(match => 
    //     match.match_num.toString().includes(searchQuery.toLowerCase())
    // )
    // .map(match => ({
    //     match_num: match.match_num
    // }));

    // // Fill out last filled values
    // React.useEffect(() => {
    //     if (selectedTeam != null) {
    //         setSelectedTeam(selectedTeam);
    //     }
    //     if (selectedMatch != null) {
    //         setSelectedMatch(selectedMatch);
    //     }
    //     if (selectedRegionalConst != null) {
    //         setSelectedRegionalValue(selectedRegionalConst);
    //     }
    // }, []);

    return (
        <ScrollView>
        <View style={styles.container}>
            <BackButton buttonName="Home Page" />
            <ProgressBar currentStep="Pre" />

            <Text style={styles.title}>Pregame</Text>

            <Text style={styles.Smallsubtitle}>Regional</Text>

            {/* Dropdown 2 */}
            <TouchableOpacity style={styles.dropdownButton} onPress={toggleRegionalDropdown}>
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownButtonText}>
                        {selectedRegionalValue || 'Select Regional'}
                    </Text>
                    <Text style={styles.dropdownArrow}>
                        {isRegionalDropdownVisible ? '∧' : '∨'}
                    </Text>
                </View>
            </TouchableOpacity>

            {isRegionalDropdownVisible && (
                <View style={styles.dropdownContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={searchRegionalQuery}
                        onChangeText={handleRegionalSearch}
                    />

                    <FlatList
                        data={filteredRegionalOptions}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => handleRegionalSelect(item)}
                            >
                                <Text style={styles.optionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={styles.noResultsText}>No results found</Text>
                        )}
                    />
                </View>
            )}

            <Text style={styles.Smallsubtitle}>Team</Text>

            { /* Team Number Dropdown */ }
            <TouchableOpacity style={styles.dropdownButton} onPress={toggleTeamDropdown}>
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownButtonText}>
                        {selectedTeam || 'Select Team Number'}
                    </Text>
                    <Text style={styles.dropdownArrow}>
                        {isDropdownVisible ? '∧' : '∨'}
                    </Text>
                </View>
            </TouchableOpacity>

            {isDropdownVisible &&(
                <View style={styles.dropdownContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={handleTeamSearch}
                    />

                    <FlatList
                        data={filteredRobots}
                        keyExtractor={(item: RobotOption) => item.value}
                        renderItem={({ item }: { item: RobotOption }) => (
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => {
                                    handleTeamSelect(Number(item.value))
                                }}
                            >
                                <Text style={styles.optionText}>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={styles.noResultsText}>No results found</Text>
                        )}
                    />
                </View>
            )}
            <Text style={styles.Smallsubtitle}>Match</Text>
            <TextInput
                        style={styles.dropdownButton}
                        placeholder="Match Number"
                        value={selectedMatch?.toString()}
                        onChangeText={(text: string) => handleMatchSelect(Number(text))}
            />

            
            {/* <TouchableOpacity style={styles.dropdownButton} onPress={toggleMatchDropdown}>
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownButtonText}>
                        {selectedMatch || 'Select Match'}
                    </Text>
                    <Text style={styles.dropdownArrow}>
                        {isSecondDropdownVisible ? '∧' : '∨'}
                    </Text>
                </View>
            </TouchableOpacity> */}

            {/* Does not work because no way to access unplayed matches */}
            {/*

            {isSecondDropdownVisible && (
                <View style={styles.dropdownContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={searchSecondQuery}
                        onChangeText={handleMatchSearch}
                    />

                    <FlatList
                        data={filteredMatches!}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => handleMatchSelect(Number(item))}
                            >
                                <Text style={styles.optionText}>{item.match_num}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={styles.noResultsText}>No results found</Text>
                        )}
                    />
                </View>
            )} */}

            <Text style={styles.Smallsubtitle}>Starting Position</Text>
            <View style={styles.sliderContainer}>
                <View style={[styles.track, { width: trackWidth }]}>
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
            </View>

            <View style={styles.row}>
                <Text style={[styles.text, { flex: 1, textAlign: 'left' }]}>Opposite</Text>
                <Text style={[styles.text, { flex: 1, textAlign: 'right' }]}>Processor</Text>
            </View>

            <Pressable style={styles.button} onPress={() => nextButton(selectedRegionalValue, selectedTeam, selectedMatch, auto_starting_position, secondTimeThru)}>)
                <Text style={styles.buttonText}>Next</Text>
            </Pressable>
        </View>
        </ScrollView>
    );
};

async function nextButton(regional: string | null, team_num: number | null, match_num: number | null, auto_starting_position: number | null, secondTimeThru: boolean) {
    let formatted_regional = ""
    if (regional == "Hueneme") {
        formatted_regional = "ph"
    }
    else if (regional == "Ventura") {
        formatted_regional = "ve"
    }
    else if (regional == "East Bay") {
        formatted_regional = "be"
    }
    console.log("Selected Team: " + team_num);
    console.log("Selected Match: " + match_num);
    console.log("Selected Regional: " + formatted_regional);
    
    if (team_num == null || match_num == null || regional == null) {
        alert("Please fill out all fields")
    }
    else {
        let teamMatch: TeamMatchPregame = {
            team_num: team_num!,
            match_num: match_num!,
            regional: formatted_regional!,
            auto_starting_position: auto_starting_position!
        }

        console.log("Sending data to server: ", teamMatch);

        // if (!secondTimeThru) {
        try {
            await robotApiService.sendPregameData(teamMatch)
        }
        catch (err) {
            if(err instanceof Error) {
                if(err.message.includes("JSON Parse error")) {
                    router.push(`./Auto?team=${team_num.toString()}&regional=${formatted_regional}&match=${match_num.toString()}`);
                }
            }
            else {
                console.error(err)
            }
        }
        // }
        router.push(`./Auto?team=${team_num.toString()}&regional=${formatted_regional}&match=${match_num.toString()}`); 
    }
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 25,
    },
    group: {
        flexDirection: 'row', // Arranges items horizontally (side by side)
    },
    row: {
        flexDirection: 'row', // Ensures items are placed in a row
        alignItems: 'center', // Aligns items vertically in the center of the row
    },
    title: {
        fontFamily: 'Koulen',
        fontSize: 40,
        marginBottom: 20,
        textAlign: 'left',
    },
    Smallsubtitle: {
        fontFamily: 'InterBold',
        fontSize: 16,
        textAlign: 'left',
        color: '#0071BC',
    },
    sliderContainer: {
        position: "relative",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
    },
    track: {
        width: '100%', 
        height: 7,
        borderRadius: 5,
        backgroundColor: "#d3d3d3",
        position: "relative",
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
    numberContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: 300,
        marginTop: 5,
    },
    text: {
        fontFamily: "InterBold",
        fontSize: 16,
        textAlign: "center",
        color: "#0071BC",
    },
    dropdownButton: {
        height: 45,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    unselectedDropdownButton:{
        height: 45,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#DCDCDC',
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
    button: {
        width: '48%',
        height: 40,
        backgroundColor: '#00BCF0',
        marginTop: 50,
        marginBottom: 20,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    buttonText: {
        fontFamily: 'InterBold',
        fontSize: 15,
        color: '#fff',
    },
});

export default Pregame;