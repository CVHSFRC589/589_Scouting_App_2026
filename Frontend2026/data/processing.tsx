import { getCustomTabsSupportingBrowsersAsync } from "expo-web-browser";

const BASE_URL = 'https://589falkonroboticsscouting.com/tests'; // Replace with your actual API base URL

export const robotApiService = {
    // Get a specific robot by team number
    getRobot: async (teamNum: number, regional: string) => {
        const response = await fetch(`${BASE_URL}/get/${teamNum}/${regional}?team=${teamNum}&regional=${regional}`);
        if (!response.ok) throw new Error('Failed to fetch robot');
        return response.json();
    },

    // Add robot image
    addRobotImage: async (teamNum: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/add_picture/${teamNum}?team=${teamNum}`, {
            method: 'POST',
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
                'Content-Type': 'application/json' 
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
                'Content-Type': 'application/json' 
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
        const response = await fetch(`${BASE_URL}/climbing/${regional}/${teamNum}?team_num=${teamNum}&regional=${regional}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json', 
                'Content-Type': 'application/json' 
            },
        });

        if (!response.ok) throw new Error('Failed to update climb statistics');
        return response.json();
    },


    // Get all robots for a regional
    getAllRobots: async (regional: string) => {
        const response = await fetch(`${BASE_URL}/robots/${regional}`);
        
        console.log(response.json)
        
        if (!response.ok) throw new Error('Failed to fetch robots');
        return response.json();
    },

    getSortedRobots: async (sortBy: SortFieldParams, regional: string) => {        
        try {

            console.log(JSON.stringify(sortBy))
            const req = new Request(`${BASE_URL}/robots/ranking/sorted/${regional}`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json', 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(sortBy)
            });

            // console.log(req)
            const response = await fetch(req);
            
            // console.log("sorted robots");
            if (!response.ok) throw new Error('Failed to fetch sorted robots');
            return response.json(); 
        } catch (error) {
            console.error("API call error:", error);
            return null;
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
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
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
            const response = await fetch(url, {
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
            console.error("Failed to fetch team match data:", error);
            return null;
        }
    },

    fetchAllTeamMatchData: async (
        regional: string,
        team_num: number,
    ): Promise<TeamMatchResponse[] | null> => {
        const url = `${BASE_URL}/matches/all/${regional}/${team_num}?team_num=${team_num}`;
        
        try {
            const response = await fetch(url, {
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
            console.error("Failed to fetch team match data:", error);
            return null;
        }
    }, 

    fetchTeamRemainingMatches: async (
        regional: string,
        team_num: number
    ): Promise<TeamMatchBase[] | null> => {
        const url = `${BASE_URL}/matches/remaining/${regional}/${team_num}?team_num=${team_num}`;
        
        try {
            const response = await fetch(url, {
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
            console.error("Failed to fetch team match data:", error);
            return null;
        }
    }


};
