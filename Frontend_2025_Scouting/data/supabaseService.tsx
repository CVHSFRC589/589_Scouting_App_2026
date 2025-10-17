import { supabase } from './supabaseClient';
import {
  Robot,
  RobotStats,
  RobotPitData,
  TeamMatch,
  TeamMatchPregame,
  TeamMatchAuto,
  TeamMatchTele,
  TeamMatchPostGame,
  TeamMatchResponse,
  TeamMatchBase,
  SortFieldParams,
  ClimbData
} from './schema';

/**
 * Supabase Data Service
 * Direct database operations for FRC Scouting App
 */
export const supabaseService = {

  // ============================================================================
  // ROBOT OPERATIONS
  // ============================================================================

  /**
   * Get all robots for a regional with complete statistics
   */
  getAllRobots: async (regional: string): Promise<RobotStats[]> => {
    try {
      const { data, error } = await supabase
        .from('robots_complete')
        .select('*')
        .eq('regional', regional)
        .order('rank_value', { ascending: true });

      if (error) throw error;

      return data?.map(robot => ({
        team_num: robot.team_num,
        regional: robot.regional,
        rank_value: robot.rank_value || 0,
        avg_algae_scored: parseFloat(robot.avg_algae_scored) || 0,
        avg_algae_removed: parseFloat(robot.avg_algae_removed) || 0,
        avg_algae_processed: parseFloat(robot.avg_algae_processed) || 0,
        avg_algae: parseFloat(robot.avg_algae) || 0,
        avg_L1: parseFloat(robot.avg_l1) || 0,
        avg_L2: parseFloat(robot.avg_l2) || 0,
        avg_L3: parseFloat(robot.avg_l3) || 0,
        avg_L4: parseFloat(robot.avg_l4) || 0,
        avg_coral: parseFloat(robot.avg_coral) || 0,
      })) || [];
    } catch (error) {
      console.error('Error fetching robots:', error);
      throw error;
    }
  },

  /**
   * Get sorted robots by specific field
   */
  getSortedRobots: async (
    sortParams: SortFieldParams,
    regional: string
  ): Promise<RobotStats[]> => {
    try {
      // Determine sort field from params
      let orderByField = 'rank_value';
      let ascending = true;

      if (sortParams.RANK) {
        orderByField = 'rank_value';
        ascending = true;
      } else if (sortParams.ALGAE_SCORED) {
        orderByField = 'avg_algae_scored';
        ascending = false;
      } else if (sortParams.ALGAE_REMOVED) {
        orderByField = 'avg_algae_removed';
        ascending = false;
      } else if (sortParams.ALGAE_PROCESSED) {
        orderByField = 'avg_algae_processed';
        ascending = false;
      } else if (sortParams.ALGAE_AVG) {
        orderByField = 'avg_algae';
        ascending = false;
      } else if (sortParams.CORAL_L1) {
        orderByField = 'avg_l1';
        ascending = false;
      } else if (sortParams.CORAL_L2) {
        orderByField = 'avg_l2';
        ascending = false;
      } else if (sortParams.CORAL_L3) {
        orderByField = 'avg_l3';
        ascending = false;
      } else if (sortParams.CORAL_L4) {
        orderByField = 'avg_l4';
        ascending = false;
      } else if (sortParams.CORAL_AVG) {
        orderByField = 'avg_coral';
        ascending = false;
      }

      const { data, error } = await supabase
        .from('robots_complete')
        .select('*')
        .eq('regional', regional)
        .order(orderByField, { ascending });

      if (error) throw error;

      return data?.map(robot => ({
        team_num: robot.team_num,
        regional: robot.regional,
        rank_value: robot.rank_value || 0,
        avg_algae_scored: parseFloat(robot.avg_algae_scored) || 0,
        avg_algae_removed: parseFloat(robot.avg_algae_removed) || 0,
        avg_algae_processed: parseFloat(robot.avg_algae_processed) || 0,
        avg_algae: parseFloat(robot.avg_algae) || 0,
        avg_L1: parseFloat(robot.avg_l1) || 0,
        avg_L2: parseFloat(robot.avg_l2) || 0,
        avg_L3: parseFloat(robot.avg_l3) || 0,
        avg_L4: parseFloat(robot.avg_l4) || 0,
        avg_coral: parseFloat(robot.avg_coral) || 0,
      })) || [];
    } catch (error) {
      console.error('Error fetching sorted robots:', error);
      throw error;
    }
  },

  /**
   * Get specific robot by team number
   */
  getRobot: async (teamNum: number, regional: string): Promise<Robot | null> => {
    try {
      const { data, error } = await supabase
        .from('robots_complete')
        .select('*')
        .eq('team_num', teamNum)
        .eq('regional', regional)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching robot:', error);
      return null;
    }
  },

  /**
   * Update pit scouting data
   */
  updatePitData: async (teamNum: number, regional: string, pitData: RobotPitData) => {
    try {
      const { data, error } = await supabase
        .from('robot_info')
        .upsert({
          team_num: teamNum,
          regional: regional,
          vision_sys: pitData.vision_sys,
          drive_train: pitData.drive_train,
          ground_intake: pitData.ground_intake,
          source_intake: pitData.source_intake,
          l1_scoring: pitData.L1_scoring,
          l2_scoring: pitData.L2_scoring,
          l3_scoring: pitData.L3_scoring,
          l4_scoring: pitData.L4_scoring,
          remove: pitData.remove,
          processor: pitData.processor,
          net: pitData.net,
          climb_deep: pitData.climb_deep,
          climb_shallow: pitData.climb_shallow,
          comments: pitData.comments,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'team_num,regional'
        });

      if (error) throw error;
      console.log('✅ Pit data saved to Supabase');
      return data;
    } catch (error) {
      console.error('Error updating pit data:', error);
      throw error;
    }
  },

  // ============================================================================
  // MATCH SCOUTING OPERATIONS
  // ============================================================================

  /**
   * Create pregame match entry
   */
  sendPregameData: async (pregame: TeamMatchPregame) => {
    try {
      const { data, error } = await supabase
        .from('reefscape_matches')
        .insert({
          team_num: pregame.team_num,
          match_num: pregame.match_num,
          regional: pregame.regional,
          auto_starting_position: pregame.auto_starting_position,
          created_at: new Date().toISOString()
        });

      if (error) {
        // Handle duplicate match error
        if (error.code === '23505') {
          throw new Error('Match already exists');
        }
        throw error;
      }
      console.log('✅ Pregame data saved to Supabase');
      return data;
    } catch (error) {
      console.error('Error sending pregame data:', error);
      throw error;
    }
  },

  /**
   * Update auto phase data
   */
  sendAutoData: async (autoData: TeamMatchAuto) => {
    try {
      // Insert algae records
      if (autoData.algae && autoData.algae.length > 0) {
        const { error: algaeError } = await supabase
          .from('algae')
          .insert(autoData.algae.map(a => ({
            team_num: autoData.team_num,
            match_num: autoData.match_num,
            regional: autoData.regional,
            where_scored: a.where_scored,
            made: a.made,
            timestamp: a.timestamp
          })));

        if (algaeError) throw algaeError;
      }

      // Insert coral records
      if (autoData.coral && autoData.coral.length > 0) {
        const { error: coralError } = await supabase
          .from('coral')
          .insert(autoData.coral.map(c => ({
            team_num: autoData.team_num,
            match_num: autoData.match_num,
            regional: autoData.regional,
            level: c.level,
            made: c.made,
            timestamp: c.timestamp
          })));

        if (coralError) throw coralError;
      }

      console.log('✅ Auto data saved to Supabase');
      return { success: true };
    } catch (error) {
      console.error('Error sending auto data:', error);
      throw error;
    }
  },

  /**
   * Update teleop phase data
   */
  sendTeleData: async (teleData: TeamMatchTele) => {
    try {
      // Insert teleop algae
      if (teleData.algae && teleData.algae.length > 0) {
        const { error: algaeError } = await supabase
          .from('algae')
          .insert(teleData.algae.map(a => ({
            team_num: teleData.team_num,
            match_num: teleData.match_num,
            regional: teleData.regional,
            where_scored: a.where_scored,
            made: a.made,
            timestamp: a.timestamp
          })));

        if (algaeError) throw algaeError;
      }

      // Insert teleop coral
      if (teleData.coral && teleData.coral.length > 0) {
        const { error: coralError } = await supabase
          .from('coral')
          .insert(teleData.coral.map(c => ({
            team_num: teleData.team_num,
            match_num: teleData.match_num,
            regional: teleData.regional,
            level: c.level,
            made: c.made,
            timestamp: c.timestamp
          })));

        if (coralError) throw coralError;
      }

      // Update climb data
      const { error: matchError } = await supabase
        .from('reefscape_matches')
        .update({
          climb_deep: teleData.climb_deep,
          climb_shallow: teleData.climb_shallow,
          park: teleData.park
        })
        .eq('team_num', teleData.team_num)
        .eq('match_num', teleData.match_num)
        .eq('regional', teleData.regional);

      if (matchError) throw matchError;

      console.log('✅ Teleop data saved to Supabase');
      return { success: true };
    } catch (error) {
      console.error('Error sending tele data:', error);
      throw error;
    }
  },

  /**
   * Update postgame data
   */
  updatePostGame: async (postGame: TeamMatchPostGame) => {
    try {
      const { data, error } = await supabase
        .from('reefscape_matches')
        .update({
          driver_rating: postGame.driverRating,
          disabled: postGame.disabled,
          defence: postGame.defence,
          malfunction: postGame.malfunction,
          no_show: postGame.noShow,
          comments: postGame.comments
        })
        .eq('team_num', postGame.team_num)
        .eq('match_num', postGame.match_num)
        .eq('regional', postGame.regional);

      if (error) throw error;
      console.log('✅ Postgame data saved to Supabase');
      return data;
    } catch (error) {
      console.error('Error updating postgame:', error);
      throw error;
    }
  },

  /**
   * Fetch team match data
   */
  fetchTeamMatchData: async (
    regional: string,
    team_num: number,
    match_num: number
  ): Promise<TeamMatchResponse | null> => {
    try {
      const { data, error } = await supabase
        .from('reefscape_matches')
        .select(`
          *,
          match_algae:algae(*),
          match_coral:coral(*)
        `)
        .eq('regional', regional)
        .eq('team_num', team_num)
        .eq('match_num', match_num)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching match data:', error);
      return null;
    }
  },

  /**
   * Fetch all matches for a team
   */
  fetchAllTeamMatchData: async (
    regional: string,
    team_num: number
  ): Promise<TeamMatchResponse[]> => {
    try {
      const { data, error } = await supabase
        .from('reefscape_matches')
        .select(`
          *,
          match_algae:algae(*),
          match_coral:coral(*)
        `)
        .eq('regional', regional)
        .eq('team_num', team_num)
        .order('match_num', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all matches:', error);
      return [];
    }
  },

  /**
   * Get climb statistics
   */
  getClimbStats: async (teamNum: number, regional: string): Promise<ClimbData> => {
    try {
      const { data, error } = await supabase
        .from('reefscape_matches')
        .select('climb_deep, climb_shallow, park')
        .eq('team_num', teamNum)
        .eq('regional', regional);

      if (error) throw error;

      // Calculate climb statistics
      const stats = {
        deep: data?.filter(m => m.climb_deep).length || 0,
        shallow: data?.filter(m => m.climb_shallow).length || 0,
        park: data?.filter(m => m.park).length || 0,
        total: data?.length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching climb stats:', error);
      return { deep: 0, shallow: 0, park: 0, total: 0 };
    }
  }
};
