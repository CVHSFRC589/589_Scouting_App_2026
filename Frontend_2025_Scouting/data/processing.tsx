import { getCustomTabsSupportingBrowsersAsync } from "expo-web-browser";
import {
    mockRobots,
    mockTeamMatches,
    mockRemainingMatches,
    mockClimbData,
    getMockRobotByTeam,
    getMockRobotsByRegional
} from './mockData';

const BASE_URL = 'http://192.168.5.17:3000/api'; // Local backend API - use computer's IP for phone access
const API_KEY = '589_e49493d424064e8cd5043d8b5073c63dcde70e87627a1b85c2cf81d62c6688cb';

// Demo mode flag - automatically enabled when backend is unavailable
let isDemoMode = false;

// Helper function to create headers with API key
const createHeaders = (additionalHeaders: Record<string, string> = {}) => ({
    'x-api-key': API_KEY,
    ...additionalHeaders
});

// Helper function to safely fetch with automatic fallback to demo mode
const safeFetch = async (url: string, options?: RequestInit) => {
    try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 5000);
        });

        // Race between fetch and timeout
        const response = await Promise.race([
            fetch(url, options),
            timeoutPromise
        ]) as Response;

        isDemoMode = false; // Backend is working
        return response;
    } catch (error) {
        if (!isDemoMode) {
            isDemoMode = true;
        }
        throw error;
    }
};

// Export demo mode status for UI components
export const getDemoMode = () => isDemoMode;
export const robotApiService = {
    // Get a specific robot by team number
    getRobot: async (teamNum: number, regional: string) => {
        try {
            const response = await safeFetch(`${BASE_URL}/get/${teamNum}/${regional}?team=${teamNum}&regional=${regional}`);
            if (!response.ok) throw new Error('Failed to fetch robot');
            return response.json();
        } catch (error) {
            // Fallback to mock data
            return getMockRobotByTeam(teamNum, regional);
        }
    },

    // Add robot image
    addRobotImage: async (teamNum: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/add_picture/${teamNum}?team=${teamNum}`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload image');
        return response.json();
    },

    // Add team match data
    addTeamMatchData: async (teamMatch: TeamMatch) => {
        const response = await fetch(`${BASE_URL}/matches`, {
            method: 'PUT',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(teamMatch)
        });

        if (!response.ok) throw new Error('Failed to add team match data');
        return response.json();
    },

    // Update robot rank based on TBA data
    updateRobotRank: async (regional: string) => {
        const response = await fetch(`${BASE_URL}/robot/rank/${regional}?regional=${regional}`, {
            method: 'PUT',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
        });

        if (!response.ok) throw new Error('Failed to update robot rank');
        return response.json();
    },

    // Update average coral match stats
    updateAverageCoralMatch: async (teamNum: number, regional: string) => {
        const response = await fetch(`${BASE_URL}/stats/coral/${teamNum}/${regional}/avg?team_num=${teamNum}`, {
            method: 'PUT',
            headers: {
                'accept': 'application/json', 
                'Content-Type': 'application/json' 
            },
        });

        if (!response.ok) throw new Error('Failed to update coral match average');
        return response.json();
    },

    // Update average algae match stats
    updateAverageAlgaeMatch: async (teamNum: number, regional: string) => {
        const response = await fetch(`${BASE_URL}/stats/algae/${teamNum}/${regional}/avg?team_num=${teamNum}`, {
            method: 'PUT',
            headers: {
                'accept': 'application/json', 
                'Content-Type': 'application/json' 
            },
        });

        if (!response.ok) throw new Error('Failed to update algae match average');
        return response.json();
    },

    // Update climb statistics from /climbing/{regional}/{team_num}
    getClimbStats: async (teamNum: number, regional: string): Promise<ClimbData> => {
        try {
            const response = await safeFetch(`${BASE_URL}/climbing/${regional}/${teamNum}?team_num=${teamNum}&regional=${regional}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) throw new Error('Failed to update climb statistics');
            return response.json();
        } catch (error) {
            // Fallback to mock data
            return mockClimbData;
        }
    },


    // Get all robots for a regional
    getAllRobots: async (regional: string) => {
        try {
            const response = await safeFetch(`${BASE_URL}/robots/${regional}`);
            if (!response.ok) throw new Error('Failed to fetch robots');
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            // Fallback to mock data
            return getMockRobotsByRegional(regional);
        }
    },

    getSortedRobots: async (sortBy: SortFieldParams, regional: string) => {
        try {
            const req = new Request(`${BASE_URL}/robots/ranking/sorted/${regional}`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sortBy)
            });

            const response = await safeFetch(req.url, {
                method: req.method,
                headers: req.headers,
                body: JSON.stringify(sortBy)
            });

            if (!response.ok) throw new Error('Failed to fetch sorted robots');
            return response.json();
        } catch (error) {
            // Fallback to mock data (unsorted for now)
            return getMockRobotsByRegional(regional);
        }
    },

    // Update pit scouting data
    updatePitData: async (teamNum: number, pitData: RobotPitData) => {
        try {
            console.log(JSON.stringify(pitData))
            const req = new Request(`${BASE_URL}/scouting/pit/${teamNum}?team=${teamNum}`, {
                method: 'PUT',
                headers: {
                    'accept': 'application/json', 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(pitData)
            });

            console.log(req)
        
            const response = await fetch(req)
            
            
            if (!response.ok) throw new Error('Failed to update pit scouting data');
            return response.json(); 
        }
        catch (error) {
            console.error("API call error:", error);
            return null;
        }


    },

    sendAutoData: async (auto_data: TeamMatchAuto) => {
        try {
            console.log(JSON.stringify(auto_data))
            const req = new Request(`${BASE_URL}/scouting/match/auto`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(auto_data)
            });

            console.log(req)
        
            const response = await fetch(req)
            
            
            if (!response.ok) throw new Error('Failed to update pit scouting data');
            return response.json(); 
        }
        catch (error) {
            console.error("API call error:", error);
            return null;
        }
    },

    sendTeleData: async (tele_data: TeamMatchTele) => {
        try {
            console.log(JSON.stringify(tele_data))
            const req = new Request(`${BASE_URL}/scouting/match/tele`, {
                method: 'PUT',
                headers: {
                    'accept': 'application/json', 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(tele_data)
            });

            console.log(req)
        
            const response = await fetch(req)
            
            
            if (!response.ok) throw new Error('Failed to update pit scouting data');
            return response.json(); 
        }
        catch (error) {
            console.error("API call error:", error);
            return null;
        }
    },

    sendPregameData: async (teamMatch: TeamMatchPregame) => {
            // Validate data before sending
        const validationErrors = [];
        if (!teamMatch.team_num) validationErrors.push('team_num is missing');
        if (!teamMatch.match_num) validationErrors.push('match_num is missing');
        if (!teamMatch.regional) validationErrors.push('regional is missing');
        if (teamMatch.auto_starting_position === undefined) validationErrors.push('auto_starting_position is missing');

        if (validationErrors.length > 0) {
            throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
        }

        // Log the exact payload being sent
        console.log('Sending payload:', {
            rawData: teamMatch,
            stringified: JSON.stringify(teamMatch),
            types: {
                team_num: typeof teamMatch.team_num,
                match_num: typeof teamMatch.match_num,
                regional: typeof teamMatch.regional,
                auto_starting_position: typeof teamMatch.auto_starting_position
            }
        });

        try {
            const response = await fetch(`${BASE_URL}/scouting/send-data/match/pregame`,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(teamMatch)
            })

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server validation error:', errorData);
                throw new Error(`Server error: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log('Success:', data);
            return data;
        } catch (error) {
            // if (error === 'Match already exists') {
            console.error('Request error:', error);
            throw error;
        }
    },

    updatePostGame: async (teamMatch: TeamMatchPostGame): Promise<TeamMatchPostGame> => {
        try {
          const response = await fetch(`${BASE_URL}/scouting/match/postgame`, {
            method: 'PUT',
            headers: createHeaders({
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(teamMatch),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data as TeamMatchPostGame;
        } catch (error) {
          console.error('API call error:', error);
          throw error;
        }
    },

    fetchTeamMatchData: async (
        regional: string,
        team_num: number,
        match_num: number
    ): Promise<TeamMatchResponse | null> => {
        const url = `${BASE_URL}/match/${regional}/${team_num}/${match_num}?team_num=${team_num}&match_num=${match_num}`;

        try {
            const response = await safeFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to fetch team match data, using mock data:", error);
            // Fallback to mock match data
            const mockMatch = mockTeamMatches.find(m => m.match_num === match_num && m.team_num === team_num);
            return mockMatch || null;
        }
    },

    fetchAllTeamMatchData: async (
        regional: string,
        team_num: number,
    ): Promise<TeamMatchResponse[] | null> => {
        const url = `${BASE_URL}/matches/all/${regional}/${team_num}?team_num=${team_num}`;

        try {
            const response = await safeFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to fetch team match data, using mock data:", error);
            // Fallback to mock match data for this team
            return mockTeamMatches.filter(m => m.team_num === team_num);
        }
    }, 

    fetchTeamRemainingMatches: async (
        regional: string,
        team_num: number
    ): Promise<TeamMatchBase[] | null> => {
        const url = `${BASE_URL}/matches/remaining/${regional}/${team_num}?team_num=${team_num}`;

        try {
            const response = await safeFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to fetch remaining matches, using mock data:", error);
            // Fallback to mock remaining matches
            return mockRemainingMatches.filter(m => m.team_num === team_num);
        }
    }


};
