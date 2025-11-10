import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
import BackButton from '../../../../backButton';
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, PanResponder, Pressable, TouchableOpacity, TextInput, FlatList, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from "react-native";
import { useFonts } from 'expo-font';
import ProgressBar from '../../../../../components/ProgressBar'
import { robotApiService, getDemoMode } from "@/data/processing";
import { matchDataCache } from "@/data/matchDataCache";
import { error } from "console";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { DemoBorderWrapper } from "@/components/DemoBorderWrapper";
import { useCompetition } from "@/contexts/CompetitionContext";


// var selectedTeamConst: number | null = null;
// var selectedMatchConst: number | null = null;
// var selectedRegionalConst: string | null = null;
// var auto_starting_positionConst: number | null = null;

const Pregame = () => {
    const router = useRouter();
    const { activeCompetition, availableCompetitions } = useCompetition();
    const { returned } = useLocalSearchParams<{ returned: string }> ();
    // const options = ['1', '2', '3', '4', '5', 'Can add more in code']; // MUST ONLY BE NUMBERS, OR BAD STUFF HAPPENS
    // const secondOptions = ['1', '2', '3', 'Can add more in code']; // Still must only be numbers

    const [isDemoMode, setIsDemoMode] = useState(false);

    const pan = useRef(new Animated.Value(0)).current;

    // Team number - direct input, no dropdown needed
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

    //match dropdown functions
    const [isSecondDropdownVisible, setSecondDropdownVisible] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
    const [searchSecondQuery, setSearchSecondQuery] = useState<string>('');
    const [matches, setMatches] = useState<TeamMatchBase[] | null>(null);
    const [displayedMatches, setFilteredMatches] = useState<Match[] | null>(null);

    // Competition is now static and set by admin - no dropdown needed
    const selectedRegionalValue = activeCompetition;
    
    const [auto_starting_position, setAutoStartingPosition] = useState<number>(0);

    const [secondTimeThru, setSecondTimeThru] = useState<boolean>(false);

    // const [matchNumber, setMatchNumber] = useState<number | null>(null);

    interface Match {
        match_num: number;
    }

    // Team number is now direct input - no dropdown or interfaces needed

    // Dropdown 2 functions
    const toggleMatchDropdown = async () => {
        if (selectedRegionalValue == null) {
            alert("Please select a competition first")
            return
        }

        // Use active competition from database
        const formatted_regional = activeCompetition || 'Test Competition';

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
        // Check demo mode on mount
        setIsDemoMode(getDemoMode());
    }, []);

    // Competition is set by admin - no need for sync or dropdown functions
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

    const valueRef = useRef(50);
    const min = 0;
    const max = 100;
    const screenWidth = Dimensions.get('window').width;  // Defined here
    const trackPadding = 20; // Keep the padding as before
    const trackWidth = screenWidth * 0.8;
    const tickCount = 5;
    const tickSpacing = screenWidth / (tickCount); // Use full screen width for tick spacing

    const trackPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                // Handle tap on track
                const locationX = evt.nativeEvent.locationX;
                const nearestTick = Math.round(locationX / tickSpacing) * tickSpacing;

                Animated.spring(pan, {
                    toValue: nearestTick,
                    useNativeDriver: false,
                    friction: 5,
                    tension: 60,
                }).start();

                valueRef.current = Math.round((nearestTick / trackWidth) * (max - min) + min);
                setAutoStartingPosition(Math.round(valueRef.current));
            },
        })
    ).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Allow movement with less resistance
                return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
            },
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
                if (totalX > trackWidth - 20) newX = trackWidth - 20 - pan._offset;

                pan.setValue(newX);

                const currentPosition = pan._offset + newX;
                const nearestTick = Math.round(currentPosition / tickSpacing) * tickSpacing;
                valueRef.current = Math.round((nearestTick / trackWidth) * (max - min) + min);
                setAutoStartingPosition(Math.round(valueRef.current));
            },
            onPanResponderRelease: () => {
                pan.flattenOffset();
                const nearestTick = Math.round(pan._value / tickSpacing) * tickSpacing;
                Animated.spring(pan, {
                    toValue: nearestTick,
                    useNativeDriver: false,
                    friction: 5,
                    tension: 60,
                }).start();

                valueRef.current = Math.round((nearestTick / trackWidth) * (max - min) + min);
                setAutoStartingPosition(Math.round(valueRef.current));
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

    // Team input is now direct entry - no need to fetch robots from database

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

                // Swipe right - go to home (use back to animate from left)
                if (shouldNavigateRight) {
                    setImmediate(() => router.back());
                }
                // Swipe left - go to next screen (Auto, push to animate from right)
                else if (shouldNavigateLeft) {
                    const team = selectedTeam || 589;
                    const match = selectedMatch || 1;
                    const regional = activeCompetition || 'Test Competition';
                    setImmediate(() => router.push(`./Auto?team=${team}&regional=${regional}&match=${match}`));
                }
            },
        })
    ).current;

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
                    onPress={() => router.push("/(login)/home")}
                >
                    <Image style={styles.backButtonIcon} source={require('./../../../../../assets/images/back_arrow.png')} />
                </Pressable>
                <Pressable
                    style={styles.forwardButton}
                    onPress={() => {
                        // Navigate to Auto with current data
                        const team = selectedTeam || 589;
                        const match = selectedMatch || 1;
                        const regional = activeCompetition || 'Test Competition';

                        router.push(`./Auto?team=${team}&regional=${regional}&match=${match}`);
                    }}
                >
                    <Image style={styles.forwardButtonIcon} source={require('./../../../../../assets/images/back_arrow.png')} />
                </Pressable>
            </View>
            <ProgressBar currentStep="Pre" />

            <Text style={styles.title}>Pregame</Text>

            <Text style={styles.Smallsubtitle}>Competition</Text>

            {/* Static Competition Label with Tooltip */}
            <TouchableOpacity
                style={styles.staticCompetitionContainer}
                onPress={() => {
                    Alert.alert(
                        'Competition Locked',
                        'The competition can only be set by an administrator. Contact team lead if this needs to be changed.',
                        [{ text: 'OK', style: 'default' }]
                    );
                }}
            >
                <Text style={styles.staticCompetitionText}>
                    {activeCompetition || 'No competition set'}
                </Text>
            </TouchableOpacity>

            <Text style={styles.Smallsubtitle}>Team</Text>

            { /* Team Number Input */ }
            <TextInput
                style={styles.dropdownButton}
                placeholder="Team Number"
                value={selectedTeam?.toString() || ''}
                onChangeText={(text: string) => {
                    const teamNum = text ? Number(text) : null;
                    setSelectedTeam(teamNum);
                }}
                keyboardType="number-pad"
            />
            <Text style={styles.Smallsubtitle}>Match</Text>
            <TextInput
                        style={styles.dropdownButton}
                        placeholder="Match Number"
                        value={selectedMatch?.toString()}
                        onChangeText={(text: string) => handleMatchSelect(Number(text))}
                        keyboardType="number-pad"
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
            </View>

            <View style={styles.row}>
                <Text style={[styles.text, { flex: 1, textAlign: 'left' }]}>Opposite</Text>
                <Text style={[styles.text, { flex: 1, textAlign: 'right' }]}>Processor</Text>
            </View>

            <Pressable style={styles.button} onPress={() => nextButton(selectedRegionalValue, selectedTeam, selectedMatch, auto_starting_position, secondTimeThru)}>
                <Text style={styles.buttonText}>Next</Text>
            </Pressable>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
        <AppFooter />
        </DemoBorderWrapper>
    );
};

async function nextButton(regional: string | null, team_num: number | null, match_num: number | null, auto_starting_position: number | null, secondTimeThru: boolean) {
    // Regional is passed in as parameter from component
    const formatted_regional = regional || 'Test Competition';

    if (team_num == null || match_num == null || regional == null) {
        alert("Please fill out all fields")
    }
    else {
        let teamMatch: TeamMatchPregame = {
            team_num: team_num!,
            match_num: match_num!,
            regional: formatted_regional,
            auto_starting_position: auto_starting_position!
        }

        // Save pregame data to local cache (not submitting to server yet)
        try {
            await matchDataCache.savePregameData(teamMatch);
            console.log('📝 Pregame data saved to cache');
        } catch (err) {
            console.error('Error saving pregame data to cache:', err);
        }

        // Navigate to Auto page
        router.push(`./Auto?team=${team_num.toString()}&regional=${formatted_regional}&match=${match_num.toString()}`);
    }

}

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
    staticCompetitionContainer: {
        height: 45,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#0071BC',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#E6F4FF',
    },
    staticCompetitionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A4A4A',
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