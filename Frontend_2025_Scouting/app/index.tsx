import { Link, router } from "expo-router";
import { TextInput, Pressable, Button, Image, Text, View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React, { useState, useEffect } from 'react';
import { robotApiService } from "@/data/processing";
import AppCache from "@/data/cache";

// interface Robot {
//     team_num: number;
//     rank_value: number;
//     picture_path: string;
//     vision_sys: string;
//     drive_train: string;
//     ground_intake: boolean;
//     source_intake: boolean;
//     L1_scoring: boolean;
//     L2_scoring: boolean;
//     L3_scoring: boolean;
//     L4_scoring: boolean;
//     remove: boolean;
//     processor: boolean;
//     net: boolean;
//     climb_deep: boolean;
//     climb_shallow: boolean;
//     matches: any[];
//     avg_algae_scored: number;
//     avg_algae_removed: number;
//     avg_algae_processed: number;
//     avg_algae: number;
//     avg_L1: number;
//     avg_L2: number;
//     avg_L3: number;
//     avg_L4: number;
//     avg_coral: number;
// }

/*
TODO:
- fix login issues, search bar formatting
- bug fixes (see phone for bugs)
- fix back button on pregame
- more analytics
- fix robotdisplay. 
- see why graphs aren't displaying correctly
- see the data. 
*/

interface RobotOption {
    value: string;
    label: string;
}

const Login: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [robots, setRobots] = useState<Robot[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isSecondDropdownVisible, setSecondDropdownVisible] = useState<boolean>(false);
    const [selectedSecondValue, setSelectedSecondValue] = useState<string | null>(null);
    const [searchSecondQuery, setSearchSecondQuery] = useState<string>('');

    const secondOptions: string[] = ['Hueneme', 'Ventura', 'East Bay', "Orange County"];
    const [regional, setRegional] = useState<string>('')

    useEffect(() => {
        const checkCache = async () => {
            try {
                const cachedData = await AppCache.getData();
                if (cachedData?.teamNumber && cachedData?.regional) {
                    router.push("/(login)/home");
                }
            } finally {
                setLoading(false);
            }
        };
        
        checkCache();
    }, []);
    
    const fetchRobots = async (regional: string): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const robotData = await robotApiService.getAllRobots(regional);
            setRobots(robotData);
        } catch (err) {
            setError('Failed to fetch robot data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRobots(regional);
    }, [regional]);

    // useEffect(() => {
    //     if (regional) {
    //         fetchRobots(regional);
    //     }
    // }, [regional]);


    const toggleDropdown = (): void => {
        setDropdownVisible(!isDropdownVisible);
        setSearchQuery('');
    };

    const handleSelect = (value: string): void => {
        setSelectedValue(value);
        setDropdownVisible(false);
    };

    const handleSearch = (query: string): void => {
        setSearchQuery(query);
    };

    const toggleSecondDropdown = async (): Promise<void> => {
        setSecondDropdownVisible(!isSecondDropdownVisible);
        setSearchSecondQuery('');
        // await fetchRobots(regional);
    };

    const handleSecondSelect = async (value: string): Promise<void> => {
        setSelectedSecondValue(value);
        if (value == "Hueneme") {
            setRegional('ph')
        }
        else if (value == "Ventura") {
            setRegional('ve')
        }
        else if (value == "East Bay") {
            setRegional('be')
        }
        else if (value == "Orange County") {
            setRegional('oc')
        }
        
        setLoading(true);
        setSecondDropdownVisible(false);
        setSelectedValue(null);
    };

    const [fontLoaded] = useFonts({
        'Koulen': require('../assets/fonts/Koulen-Regular.ttf'),
        'InterBold': require('../assets/fonts/Inter_18pt-Bold.ttf'),
        'InterExtraBold': require('../assets/fonts/Inter_18pt-ExtraBold.ttf')
    });

    if (!fontLoaded) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    const filteredRobots: RobotOption[] = robots
        .filter(robot => 
            robot.team_num.toString().includes(searchQuery.toLowerCase())
        )
        .map(robot => ({
            value: robot.team_num.toString(),
            label: `Team ${robot.team_num}`
        }));

    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/589_logo.png')} style={styles.logo} />
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Welcome to the 589 Scouting App!</Text>

            {/* Competition Dropdown */}
            <View style={{ position: 'relative' }}>
                <TouchableOpacity style={styles.dropdownButton} onPress={toggleSecondDropdown}>
                    <View style={styles.dropdownContent}>
                        <Text style={styles.dropdownButtonText}>
                            {selectedSecondValue || 'Select Competition'}
                        </Text>
                        <Text style={styles.dropdownArrow}>
                            {isSecondDropdownVisible ? '∧' : '∨'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {isSecondDropdownVisible && (
                    <View style={styles.dropdownContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            value={searchSecondQuery}
                            onChangeText={(text: string) => setSearchSecondQuery(text)}
                        />
                        <FlatList
                            data={secondOptions.filter(option => 
                                option.toLowerCase().includes(searchSecondQuery.toLowerCase())
                            )}
                            keyExtractor={(item: string, index: number) => index.toString()}
                            renderItem={({ item }: { item: string }) => (
                                <TouchableOpacity style={styles.option} onPress={async () => {
                                    await handleSecondSelect(item)
                                }}>
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={styles.noResultsText}>No results found</Text>
                            )}
                        />
                    </View>
                )}
            </View>

            <View style={styles.container2}></View>

            {/* Team Number Dropdown */}
            <View style={{ position: 'relative' }}>
                <TouchableOpacity 
                    style={[
                        styles.dropdownButton,
                        !selectedSecondValue && styles.dropdownButtonDisabled
                    ]} 
                    onPress={toggleDropdown}
                    disabled={!selectedSecondValue}
                >
                    <View style={styles.dropdownContent}>
                        <Text style={styles.dropdownButtonText}>
                            {selectedValue ? `Team ${selectedValue}` : 'Select Team Number'}
                        </Text>
                        <Text style={styles.dropdownArrow}>
                            {isDropdownVisible ? '∧' : '∨'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {isDropdownVisible && (
                    <View style={styles.dropdownContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search team number..."
                            value={searchQuery}
                            onChangeText={handleSearch}
                            keyboardType="numeric"
                        />
                        {!(filteredRobots) ? (
                            <Text style={styles.loadingText}>Loading teams...</Text>
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : (
                            <FlatList
                                data={filteredRobots}
                                keyExtractor={(item: RobotOption) => item.value}
                                renderItem={({ item }: { item: RobotOption }) => (
                                    <TouchableOpacity 
                                        style={styles.option} 
                                        onPress={() => handleSelect(item.value)}
                                    >
                                        <Text style={styles.optionText}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <Text style={styles.noResultsText}>No teams found</Text>
                                )}
                            />
                        )}
                    </View>
                )}
            </View>

            <Pressable
                style={[
                    styles.buttonLogin,
                    (!selectedValue || !selectedSecondValue) && styles.buttonLoginDisabled
                ]}
                onPress={async () => {
                    await AppCache.saveData(Number(selectedValue), regional)
                    router.push("/(login)/home")
                }}
                disabled={!selectedValue || !selectedSecondValue}
            >
                <Text style={styles.buttonText}>Log in</Text>
            </Pressable>

            {/* Skip Arrow */}
            <TouchableOpacity
                style={styles.skipButton}
                onPress={async () => {
                    // Save default values if skipping login
                    await AppCache.saveData(589, 'be'); // Default to team 589 and East Bay
                    router.push("/(login)/home");
                }}
            >
                <Ionicons name="arrow-forward-circle-outline" size={40} color="rgba(0, 130, 190, 255)" />
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 25,
    },
    container2: {
        justifyContent: 'center',
        padding: 5,
    },
    title: {
        fontFamily: 'Koulen',
        fontSize: 45,
        alignSelf: 'flex-start',
        marginBottom: -10,
    },
    subtitle: {
        fontFamily: 'BPoppins',
        fontSize: 15,
        color: 'rgba(127, 127, 127, 255)',
        marginBottom: 10,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: -15,
    },
    buttonLogin: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '29%',
        borderRadius: 10,
        backgroundColor: 'rgba(0, 130, 190, 255)',
        borderWidth: 10,
        borderColor: 'rgba(0, 130, 190, 0)',
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        fontFamily: 'BPoppins',
        fontWeight: 'bold',
    },
    dropdownButton: {
        height: 45,
        width: '100%',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#949494',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
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
        zIndex: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        maxHeight: 200,
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
    dropdownButtonDisabled: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
    },
    buttonLoginDisabled: {
        backgroundColor: 'rgba(0, 130, 190, 0.5)',
    },
    loadingText: {
        textAlign: 'center',
        padding: 15,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        textAlign: 'center',
        padding: 15,
        fontSize: 16,
        color: '#ff0000',
    },
    skipButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    skipText: {
        fontSize: 14,
        color: 'rgba(0, 130, 190, 255)',
        fontFamily: 'BPoppins',
        marginTop: 5,
    },
});

export default Login;