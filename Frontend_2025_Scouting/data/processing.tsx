import { supabaseService } from './supabaseService';
import {
    mockRobots,
    mockTeamMatches,
    mockRemainingMatches,
    mockClimbData,
    getMockRobotByTeam,
    getMockRobotsByRegional
} from './mockData';
import { shouldUseDemoMode } from '@/components/ConnectionHeader';
import { uploadQueue } from './uploadQueue';

// Demo mode flag - automatically enabled when Supabase is unavailable OR manually enabled by user
let isDemoMode = false;

// Export demo mode status for UI components
export const getDemoMode = () => isDemoMode;

// Export queue access for UI components
export { uploadQueue };

// Helper to check if demo mode should be used (manual toggle or connection failure)
const checkDemoMode = async (): Promise<boolean> => {
    return await shouldUseDemoMode();
};
/**
 * Unified Robot API Service
 * Uses Supabase directly with fallback to mock data
 */
export const robotApiService = {

    // Get a specific robot by team number
    getRobot: async (teamNum: number, regional: string) => {
        // Check if demo mode is manually enabled first
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            return getMockRobotByTeam(teamNum, regional);
        }

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
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            return getMockRobotsByRegional(regional);
        }

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
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            return getMockRobotsByRegional(regional);
        }

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
    updatePitData: async (teamNum: number, pitData: RobotPitData, submittedBy?: string) => {
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            console.log('Demo mode: Pit data not saved to database');
            return { success: true, message: 'Demo mode - data not saved' };
        }

        try {
            // Add to upload queue - will retry until confirmed by database
            const queueId = await uploadQueue.enqueue('pit_scouting', {
                team_num: teamNum,
                regional: pitData.regional,
                ...pitData,
                submitted_by: submittedBy
            });

            console.log(`Pit data queued for upload (Queue ID: ${queueId})`);
            return { success: true, queued: true, queueId, acknowledgment: true };
        } catch (error) {
            console.error('Failed to queue pit data:', error);
            throw error;
        }
    },

    // Send pregame data
    sendPregameData: async (teamMatch: TeamMatchPregame) => {
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            console.log('Demo mode: Pregame data not saved to database');
            return { success: true, message: 'Demo mode - data not saved' };
        }

        try {
            const queueId = await uploadQueue.enqueue('match_pregame', teamMatch);
            console.log(`Pregame data queued for upload (Queue ID: ${queueId})`);
            return { success: true, queued: true, queueId, acknowledgment: true };
        } catch (error) {
            console.error('Failed to queue pregame data:', error);
            throw error;
        }
    },

    // Send auto phase data
    sendAutoData: async (autoData: TeamMatchAuto) => {
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            console.log('Demo mode: Auto data not saved to database');
            return { success: true, message: 'Demo mode - data not saved' };
        }

        try {
            const queueId = await uploadQueue.enqueue('match_auto', autoData);
            console.log(`Auto data queued for upload (Queue ID: ${queueId})`);
            return { success: true, queued: true, queueId, acknowledgment: true };
        } catch (error) {
            console.error('Failed to queue auto data:', error);
            throw error;
        }
    },

    // Send teleop phase data
    sendTeleData: async (teleData: TeamMatchTele) => {
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            console.log('Demo mode: Teleop data not saved to database');
            return { success: true, message: 'Demo mode - data not saved' };
        }

        try {
            const queueId = await uploadQueue.enqueue('match_tele', teleData);
            console.log(`Teleop data queued for upload (Queue ID: ${queueId})`);
            return { success: true, queued: true, queueId, acknowledgment: true };
        } catch (error) {
            console.error('Failed to queue tele data:', error);
            throw error;
        }
    },

    // Update postgame data
    updatePostGame: async (postGame: TeamMatchPostGame) => {
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            console.log('Demo mode: Postgame data not saved to database');
            return { success: true, message: 'Demo mode - data not saved' };
        }

        try {
            const queueId = await uploadQueue.enqueue('match_postgame', postGame);
            console.log(`Postgame data queued for upload (Queue ID: ${queueId})`);
            return { success: true, queued: true, queueId, acknowledgment: true };
        } catch (error) {
            console.error('Failed to queue postgame:', error);
            throw error;
        }
    },

    // Fetch single team match data
    fetchTeamMatchData: async (
        regional: string,
        team_num: number,
        match_num: number
    ) => {
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            const mockMatch = mockTeamMatches.find(m => m.match_num === match_num && m.team_num === team_num);
            return mockMatch || null;
        }

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
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            return mockTeamMatches.filter(m => m.team_num === team_num);
        }

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
        const shouldUseDemo = await checkDemoMode();
        if (shouldUseDemo) {
            isDemoMode = true;
            return mockClimbData;
        }

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
