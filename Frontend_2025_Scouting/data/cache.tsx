import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheData {
  teamNumber: number;
  competition: string;
}

class AppCache {
  private static readonly CACHE_KEY = 'app_cache_data';

  static async saveData(teamNumber: number, competition: string): Promise<void> {
    try {
      const data: CacheData = {
        teamNumber,
        competition,
      };
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to cache:', error);
      throw error;
    }
  }

  static async getData(): Promise<CacheData | null> {
    try {
      const data = await AsyncStorage.getItem(this.CACHE_KEY);
      if (data) {
        return JSON.parse(data) as CacheData;
      }
      return null;
    } catch (error) {
      console.error('Error reading data from cache:', error);
      throw error;
    }
  }

  static async clearData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  static async updateTeamNumber(teamNumber: number): Promise<void> {
    try {
      const currentData = await this.getData();
      await this.saveData(teamNumber, currentData?.competition || '');
    } catch (error) {
      console.error('Error updating team number:', error);
      throw error;
    }
  }

  static async updateCompetition(competition: string): Promise<void> {
    try {
      const currentData = await this.getData();
      await this.saveData(currentData?.teamNumber || 0, competition);
    } catch (error) {
      console.error('Error updating competition:', error);
      throw error;
    }
  }

}

export default AppCache;