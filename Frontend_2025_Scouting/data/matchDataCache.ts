import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TeamMatchPregame,
  TeamMatchAuto,
  TeamMatchTele,
  TeamMatchPostGame,
} from './schema';

/**
 * Match Data Cache
 *
 * Stores match data locally as user navigates through match pages.
 * Data is only submitted when user taps Submit on Post page.
 */

const MATCH_DATA_KEY = '@current_match_data';

export interface CompleteMatchData {
  // Required fields
  team_num: number;
  match_num: number;
  regional: string;

  // Pregame data
  auto_starting_position?: number;

  // Auto data
  algae?: Array<{
    where_scored: string;
    made: boolean;
    timestamp: number;
  }>;
  coral?: Array<{
    level: number;
    made: boolean;
    timestamp: number;
  }>;

  // Tele data
  tele_algae?: Array<{
    where_scored: string;
    made: boolean;
    timestamp: number;
  }>;
  tele_coral?: Array<{
    level: number;
    made: boolean;
    timestamp: number;
  }>;
  climb_level?: number;
  climb_deep?: boolean;
  climb_shallow?: boolean;
  park?: boolean;

  // Postgame data
  driverRating?: number;
  disabled?: boolean;
  defence?: boolean;
  malfunction?: boolean;
  noShow?: boolean;
  comments?: string;
}

export const matchDataCache = {
  /**
   * Get current match data from cache
   */
  getMatchData: async (): Promise<CompleteMatchData | null> => {
    try {
      const data = await AsyncStorage.getItem(MATCH_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading match data from cache:', error);
      return null;
    }
  },

  /**
   * Update match data in cache (merges with existing data)
   */
  updateMatchData: async (partialData: Partial<CompleteMatchData>): Promise<void> => {
    try {
      const existingData = await matchDataCache.getMatchData();
      const mergedData = { ...existingData, ...partialData };
      await AsyncStorage.setItem(MATCH_DATA_KEY, JSON.stringify(mergedData));
      console.log('📝 Match data updated in cache:', Object.keys(partialData));
    } catch (error) {
      console.error('Error updating match data cache:', error);
      throw error;
    }
  },

  /**
   * Save pregame data to cache
   */
  savePregameData: async (pregame: TeamMatchPregame): Promise<void> => {
    await matchDataCache.updateMatchData({
      team_num: pregame.team_num,
      match_num: pregame.match_num,
      regional: pregame.regional,
      auto_starting_position: pregame.auto_starting_position,
    });
  },

  /**
   * Save auto data to cache
   */
  saveAutoData: async (autoData: TeamMatchAuto): Promise<void> => {
    await matchDataCache.updateMatchData({
      team_num: autoData.team_num,
      match_num: autoData.match_num,
      regional: autoData.regional,
      algae: autoData.algae,
      coral: autoData.coral,
    });
  },

  /**
   * Save tele data to cache
   */
  saveTeleData: async (teleData: TeamMatchTele & { climb_level?: number }): Promise<void> => {
    await matchDataCache.updateMatchData({
      team_num: teleData.team_num,
      match_num: teleData.match_num,
      regional: teleData.regional,
      tele_algae: teleData.algae,
      tele_coral: teleData.coral,
      climb_level: teleData.climb_level,
      climb_deep: teleData.climb_deep,
      climb_shallow: teleData.climb_shallow,
      park: teleData.park,
    });
  },

  /**
   * Save postgame data to cache
   */
  savePostgameData: async (postGame: TeamMatchPostGame): Promise<void> => {
    await matchDataCache.updateMatchData({
      team_num: postGame.team_num,
      match_num: postGame.match_num,
      regional: postGame.regional,
      driverRating: postGame.driverRating,
      disabled: postGame.disabled,
      defence: postGame.defence,
      malfunction: postGame.malfunction,
      noShow: postGame.noShow,
      comments: postGame.comments,
    });
  },

  /**
   * Validate that match data has minimum required fields
   */
  validateMatchData: (data: CompleteMatchData | null): { valid: boolean; missing: string[] } => {
    if (!data) {
      return { valid: false, missing: ['All data'] };
    }

    const missing: string[] = [];

    if (!data.team_num) missing.push('Team Number');
    if (!data.match_num) missing.push('Match Number');
    if (!data.regional) missing.push('Regional');

    return {
      valid: missing.length === 0,
      missing,
    };
  },

  /**
   * Clear match data cache (after successful submit or when starting new match)
   */
  clearMatchData: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(MATCH_DATA_KEY);
      console.log('🗑️ Match data cache cleared');
    } catch (error) {
      console.error('Error clearing match data cache:', error);
      throw error;
    }
  },

  /**
   * Initialize match data with team, match, and regional
   * Called when starting a new match from Pregame
   */
  initializeMatch: async (team_num: number, match_num: number, regional: string): Promise<void> => {
    await matchDataCache.clearMatchData();
    await matchDataCache.updateMatchData({
      team_num,
      match_num,
      regional,
    });
  },
};
