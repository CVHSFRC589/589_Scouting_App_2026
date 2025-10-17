import { supabaseService } from './supabaseService';
import {
    mockRobots,
    mockTeamMatches,
    mockRemainingMatches,
    mockClimbData,
    getMockRobotByTeam,
    getMockRobotsByRegional
} from './mockData';

// Demo mode flag - automatically enabled when Supabase is unavailable
let isDemoMode = false;

// Export demo mode status for UI components
export const getDemoMode = () => isDemoMode;
/**
 * Unified Robot API Service
 * Uses Supabase directly with fallback to mock data
 */
export const robotApiService = {

    // Get a specific robot by team number
    getRobot: async (teamNum: number, regional: string) => {
        try {
            const data = await supabaseService.getRobot(teamNum, regional);
            isDemoMode = false;
            return data;
        } catch (error) {
            console.log('Supabase unavailable, using demo mode');
            isDemoMode = true;
            return getMockRobotByTeam(teamNum, regional);
        }
    },

    // Get all robots for a regional
    getAllRobots: async (regional: string) => {
        try {
            const data = await supabaseService.getAllRobots(regional);
            isDemoMode = false;
            return data;
        } catch (error) {
            console.log('Supabase unavailable, using demo mode');
            isDemoMode = true;
            return getMockRobotsByRegional(regional);
        }
    },

    // Get sorted robots by specific criteria
    getSortedRobots: async (sortBy: SortFieldParams, regional: string) => {
        try {
            const data = await supabaseService.getSortedRobots(sortBy, regional);
            isDemoMode = false;
            return data;
        } catch (error) {
            console.log('Supabase unavailable, using demo mode');
            isDemoMode = true;
            return getMockRobotsByRegional(regional);
        }
    },

    // Update pit scouting data
    updatePitData: async (teamNum: number, pitData: RobotPitData) => {
        try {
            return await supabaseService.updatePitData(teamNum, pitData.regional, pitData);
        } catch (error) {
            console.error('Failed to update pit data:', error);
            throw error;
        }
    },

    // Send pregame data
    sendPregameData: async (teamMatch: TeamMatchPregame) => {
        try {
            return await supabaseService.sendPregameData(teamMatch);
        } catch (error) {
            console.error('Failed to send pregame data:', error);
            throw error;
        }
    },

    // Send auto phase data
    sendAutoData: async (autoData: TeamMatchAuto) => {
        try {
            return await supabaseService.sendAutoData(autoData);
        } catch (error) {
            console.error('Failed to send auto data:', error);
            throw error;
        }
    },

    // Send teleop phase data
    sendTeleData: async (teleData: TeamMatchTele) => {
        try {
            return await supabaseService.sendTeleData(teleData);
        } catch (error) {
            console.error('Failed to send tele data:', error);
            throw error;
        }
    },

    // Update postgame data
    updatePostGame: async (postGame: TeamMatchPostGame) => {
        try {
            return await supabaseService.updatePostGame(postGame);
        } catch (error) {
            console.error('Failed to update postgame:', error);
            throw error;
        }
    },

    // Fetch single team match data
    fetchTeamMatchData: async (
        regional: string,
        team_num: number,
        match_num: number
    ) => {
        try {
            const data = await supabaseService.fetchTeamMatchData(regional, team_num, match_num);
            isDemoMode = false;
            return data;
        } catch (error) {
            console.log('Supabase unavailable, using demo mode');
            isDemoMode = true;
            const mockMatch = mockTeamMatches.find(m => m.match_num === match_num && m.team_num === team_num);
            return mockMatch || null;
        }
    },

    // Fetch all team match data
    fetchAllTeamMatchData: async (
        regional: string,
        team_num: number
    ) => {
        try {
            const data = await supabaseService.fetchAllTeamMatchData(regional, team_num);
            isDemoMode = false;
            return data;
        } catch (error) {
            console.log('Supabase unavailable, using demo mode');
            isDemoMode = true;
            return mockTeamMatches.filter(m => m.team_num === team_num);
        }
    },

    // Get climb statistics
    getClimbStats: async (teamNum: number, regional: string) => {
        try {
            const data = await supabaseService.getClimbStats(teamNum, regional);
            isDemoMode = false;
            return data;
        } catch (error) {
            console.log('Supabase unavailable, using demo mode');
            isDemoMode = true;
            return mockClimbData;
        }
    },

    // Fetch remaining matches (not implemented in Supabase yet, use mock)
    fetchTeamRemainingMatches: async (
        regional: string,
        team_num: number
    ) => {
        // TODO: Implement in Supabase when match schedule is added
        console.log('Using mock data for remaining matches');
        return mockRemainingMatches.filter(m => m.team_num === team_num);
    }
};
