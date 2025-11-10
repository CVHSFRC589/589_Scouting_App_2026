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

// Connection check call counter for debugging
let connectionCheckCallCount = 0;
let lastConnectionCheckTime = 0;

// Singleton guard to prevent concurrent connection checks
let isCheckingConnection = false;
let lastCheckPromise: Promise<{ connected: boolean; errorType?: string }> | null = null;

// Enable detailed call stack logging (set to true to debug where checkConnection is called from)
const ENABLE_CALL_STACK_LOGGING = false;

export const supabaseService = {

  // ============================================================================
  // CONNECTION CHECK & SCHEMA VERSIONING
  // ============================================================================

  /**
   * Lightweight connection check using dedicated health check table
   * Also returns schema version for compatibility checking
   * Returns object with connection status and optional error type
   *
   * Uses singleton pattern to prevent multiple concurrent checks
   */
  checkConnection: async (): Promise<{ connected: boolean; errorType?: string }> => {
    // If a check is already in progress, return the existing promise
    if (isCheckingConnection && lastCheckPromise) {
      const timestamp = new Date().toISOString();
      console.log(`📊 [${timestamp}] [checkConnection] Reusing existing connection check (deduplicated)`);
      return lastCheckPromise;
    }

    connectionCheckCallCount++;
    const now = Date.now();
    const timeSinceLastCall = lastConnectionCheckTime ? now - lastConnectionCheckTime : 0;
    lastConnectionCheckTime = now;

    isCheckingConnection = true;

    // Create the check promise
    const checkPromise = (async () => {
      try {
      // Query app_metadata table (single row, always fast)
      const { data, error } = await supabase
        .from('app_metadata')
        .select('health_check_key, schema_version')
        .eq('id', 1)
        .single();

      if (error) {
        const errorMsg = error.message;

        // Check for Supabase paused project error
        if (errorMsg && errorMsg.includes('Project paused')) {
          console.warn('Health check failed: Database is paused');
          return { connected: false, errorType: 'database_paused' };
        }

        // Check for network request failures
        if (errorMsg && errorMsg.includes('Network request failed')) {
          console.warn('Health check failed: Network request failed');
          return { connected: false, errorType: 'network_error' };
        }

        // Filter out HTML error responses (Cloudflare errors when DB is paused)
        if (errorMsg && errorMsg.includes('<!DOCTYPE')) {
          // Check for Cloudflare Error 1016 (Origin DNS error - database paused)
          if (errorMsg.includes('Error 1016') || errorMsg.includes('Origin DNS error')) {
            console.warn('Health check failed: Database is paused (Cloudflare)');
            return { connected: false, errorType: 'database_paused' };
          } else {
            console.warn('Health check failed: Database is unreachable (HTML error response)');
            return { connected: false, errorType: 'database_unreachable' };
          }
        }

        // Generic error
        if (errorMsg) {
          console.warn('Health check failed:', errorMsg);
          return { connected: false, errorType: 'database_error' };
        }

        return { connected: false, errorType: 'unknown_error' };
      }

      // Verify the health check key is correct
      if (data?.health_check_key !== 'alive') {
        console.warn('Health check key mismatch');
        return { connected: false, errorType: 'health_check_mismatch' };
      }

      // Log schema version for debugging
      if (data?.schema_version) {
        const timestamp = new Date().toISOString();
        const callInfo = timeSinceLastCall
          ? `call #${connectionCheckCallCount}, ${timeSinceLastCall}ms since last`
          : `call #${connectionCheckCallCount}`;
        console.log(`📊 [${timestamp}] [checkConnection] (${callInfo}) Database schema version:`, data.schema_version);

        // Optional: Log call stack for debugging where checkConnection is being called from
        if (ENABLE_CALL_STACK_LOGGING) {
          const stack = new Error().stack;
          console.log(`   Call stack:\n${stack}`);
        }
      }

      return { connected: true };
      } catch (error) {
        console.error('Health check error:', error);
        return { connected: false, errorType: 'connection_failed' };
      } finally {
        isCheckingConnection = false;
        lastCheckPromise = null;
      }
    })();

    // Store the promise so concurrent calls can use it
    lastCheckPromise = checkPromise;

    return checkPromise;
  },

  /**
   * Get current database schema version
   */
  getSchemaVersion: async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('app_metadata')
        .select('schema_version')
        .eq('id', 1)
        .single();

      if (error) {
        // Filter out HTML error responses
        const errorMsg = error.message;
        if (errorMsg && !errorMsg.includes('<!DOCTYPE') && !errorMsg.includes('<html')) {
          console.error('Failed to get schema version:', errorMsg);
        }
        return null;
      }

      return data?.schema_version || null;
    } catch (error) {
      console.error('Schema version check error:', error);
      return null;
    }
  },

  /**
   * Get full app metadata including feature flags
   */
  getAppMetadata: async () => {
    try {
      const { data, error } = await supabase
        .from('app_metadata')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Failed to get app metadata:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('App metadata error:', error);
      return null;
    }
  },

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
        .order('rank_value', { ascending: false }); // Highest scores first

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
      let ascending = false; // Default to descending (highest scores first)

      if (sortParams.RANK) {
        orderByField = 'rank_value';
        ascending = false; // Highest rank_value (best score) first
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

      console.log('🔍 getSortedRobots - Querying regional:', regional, 'orderBy:', orderByField, 'ascending:', ascending);

      const { data, error } = await supabase
        .from('robots_complete')
        .select('*')
        .eq('regional', regional)
        .order(orderByField, { ascending });

      if (error) {
        console.error('❌ getSortedRobots - Query error:', error);
        throw error;
      }

      console.log('🔍 getSortedRobots - Raw data received:', data?.length, 'rows');
      if (data && data.length > 0) {
        console.log('🔍 getSortedRobots - First row:', data[0]);
      }

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

      if (!data) {
        console.log('⚠️ getRobot - No data returned for team:', teamNum, 'regional:', regional);
        return null;
      }

      // Debug: Log raw data from database
      console.log('🔍 getRobot - Raw data from robots_complete:', {
        team_num: data.team_num,
        regional: data.regional,
        can_remove: data.can_remove,
        can_process: data.can_process,
        can_net: data.can_net,
        l1_scoring: data.l1_scoring,
        l2_scoring: data.l2_scoring,
        l3_scoring: data.l3_scoring,
        l4_scoring: data.l4_scoring,
      });

      // Map database column names to Robot interface properties
      return {
        team_num: data.team_num,
        regional: data.regional,
        rank_value: data.rank_value || 0,
        picture_path: null, // Not stored in current schema

        // Pit report data (capabilities)
        vision_sys: data.vision_sys,
        drive_train: data.drive_train,
        ground_intake: data.ground_intake,
        source_intake: data.source_intake,

        // Coral scoring capabilities (from pit_reports)
        L1_scoring: data.l1_scoring,
        L2_scoring: data.l2_scoring,
        L3_scoring: data.l3_scoring,
        L4_scoring: data.l4_scoring,

        // Algae capabilities (from pit_reports)
        remove: data.can_remove,
        processor: data.can_process,
        net: data.can_net,

        // Climb capabilities (from pit_reports)
        climb_deep: data.can_climb_deep,
        climb_shallow: data.can_climb_shallow,

        // Match statistics (averages)
        avg_algae_scored: parseFloat(data.avg_algae_scored) || 0,
        avg_algae_removed: parseFloat(data.avg_algae_removed) || 0,
        avg_algae_processed: parseFloat(data.avg_algae_processed) || 0,
        avg_algae: parseFloat(data.avg_algae) || 0,
        avg_L1: parseFloat(data.avg_l1) || 0,
        avg_L2: parseFloat(data.avg_l2) || 0,
        avg_L3: parseFloat(data.avg_l3) || 0,
        avg_L4: parseFloat(data.avg_l4) || 0,
        avg_coral: parseFloat(data.avg_coral) || 0,

        comments: data.comments,
        matches: [], // Matches not included in robots_complete view
      };
    } catch (error) {
      console.error('Error fetching robot:', error);
      return null;
    }
  },

  /**
   * Update pit scouting data
   * @param submittedBy - User ID of the student submitting this data (optional for backward compatibility)
   */
  updatePitData: async (
    teamNum: number,
    regional: string,
    pitData: RobotPitData,
    submittedBy?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('pit_reports')
        .upsert({
          team_number: teamNum,
          regional: regional,
          vision_sys: pitData.vision_sys,
          drive_train: pitData.drive_train,
          ground_intake: pitData.ground_intake,
          source_intake: pitData.source_intake,
          l1_scoring: pitData.L1_scoring,
          l2_scoring: pitData.L2_scoring,
          l3_scoring: pitData.L3_scoring,
          l4_scoring: pitData.L4_scoring,
          can_remove: pitData.remove,
          can_process: pitData.processor,
          can_net: pitData.net,
          can_climb_deep: pitData.climb_deep,
          can_climb_shallow: pitData.climb_shallow,
          comments: pitData.comments,
          updated_at: new Date().toISOString(),
          submitted_by: submittedBy || null,
          submitted_at: submittedBy ? new Date().toISOString() : null
        }, {
          onConflict: 'team_number,regional'
        });

      if (error) throw error;
      console.log('✅ Pit data saved to Supabase', submittedBy ? `by user ${submittedBy}` : '');
      return { success: true, data, acknowledgment: true };
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
        .from('match_reports')
        .insert({
          team_number: pregame.team_num,
          match_number: pregame.match_num,
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
      return { success: true, data, acknowledgment: true };
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
      // Aggregate coral scores by level (count successful shots)
      const coralCounts = { l1: 0, l2: 0, l3: 0, l4: 0 };
      if (autoData.coral && autoData.coral.length > 0) {
        autoData.coral.forEach(c => {
          if (c.made) {
            if (c.level === 1) coralCounts.l1++;
            else if (c.level === 2) coralCounts.l2++;
            else if (c.level === 3) coralCounts.l3++;
            else if (c.level === 4) coralCounts.l4++;
          }
        });
      }

      // Count algae (count successful algae actions)
      const algaeCount = autoData.algae?.filter(a => a.made).length || 0;

      // Update match record with aggregated auto data (auto-specific columns)
      const { data, error } = await supabase
        .from('match_reports')
        .update({
          auto_l1_scored: coralCounts.l1,
          auto_l2_scored: coralCounts.l2,
          auto_l3_scored: coralCounts.l3,
          auto_l4_scored: coralCounts.l4,
          auto_algae_scored: algaeCount
        })
        .eq('team_number', autoData.team_num)
        .eq('match_number', autoData.match_num)
        .eq('regional', autoData.regional)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(`Match not found: Team ${autoData.team_num}, Match ${autoData.match_num}, Regional ${autoData.regional}`);
      }

      console.log(`✅ Auto data saved to Supabase: ${algaeCount} algae, ${coralCounts.l1 + coralCounts.l2 + coralCounts.l3 + coralCounts.l4} coral`);
      return { success: true, acknowledgment: true, algaeCount, coralCount: coralCounts.l1 + coralCounts.l2 + coralCounts.l3 + coralCounts.l4 };
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
      // Aggregate teleop coral scores by level
      const teleCoralCounts = { l1: 0, l2: 0, l3: 0, l4: 0 };
      if (teleData.coral && teleData.coral.length > 0) {
        teleData.coral.forEach(c => {
          if (c.made) {
            if (c.level === 1) teleCoralCounts.l1++;
            else if (c.level === 2) teleCoralCounts.l2++;
            else if (c.level === 3) teleCoralCounts.l3++;
            else if (c.level === 4) teleCoralCounts.l4++;
          }
        });
      }

      // Count teleop algae
      const teleAlgaeCount = teleData.algae?.filter(a => a.made).length || 0;

      // Update match record with teleop data (tele-specific columns) and climb data
      const { data: matchData, error: matchError } = await supabase
        .from('match_reports')
        .update({
          tele_l1_scored: teleCoralCounts.l1,
          tele_l2_scored: teleCoralCounts.l2,
          tele_l3_scored: teleCoralCounts.l3,
          tele_l4_scored: teleCoralCounts.l4,
          tele_algae_scored: teleAlgaeCount,
          climb_deep: teleData.climb_deep,
          climb_shallow: teleData.climb_shallow,
          park: teleData.park
        })
        .eq('team_number', teleData.team_num)
        .eq('match_number', teleData.match_num)
        .eq('regional', teleData.regional)
        .select();

      if (matchError) throw matchError;

      // Verify the match record was updated
      if (!matchData || matchData.length === 0) {
        throw new Error(`Match not found: Team ${teleData.team_num}, Match ${teleData.match_num}, Regional ${teleData.regional}`);
      }

      const totalCoralCount = teleCoralCounts.l1 + teleCoralCounts.l2 + teleCoralCounts.l3 + teleCoralCounts.l4;
      console.log(`✅ Teleop data saved to Supabase: ${teleAlgaeCount} algae, ${totalCoralCount} coral, climb updated`);
      return { success: true, acknowledgment: true, algaeCount: teleAlgaeCount, coralCount: totalCoralCount };
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
      // Fetch current auto and tele scores to calculate totals
      const { data: currentMatch, error: fetchError } = await supabase
        .from('match_reports')
        .select('auto_l1_scored, auto_l2_scored, auto_l3_scored, auto_l4_scored, auto_algae_scored, tele_l1_scored, tele_l2_scored, tele_l3_scored, tele_l4_scored, tele_algae_scored')
        .eq('team_number', postGame.team_num)
        .eq('match_number', postGame.match_num)
        .eq('regional', postGame.regional)
        .single();

      if (fetchError) throw fetchError;

      // Calculate totals (auto + tele)
      const totalL1 = (currentMatch?.auto_l1_scored || 0) + (currentMatch?.tele_l1_scored || 0);
      const totalL2 = (currentMatch?.auto_l2_scored || 0) + (currentMatch?.tele_l2_scored || 0);
      const totalL3 = (currentMatch?.auto_l3_scored || 0) + (currentMatch?.tele_l3_scored || 0);
      const totalL4 = (currentMatch?.auto_l4_scored || 0) + (currentMatch?.tele_l4_scored || 0);
      const totalAlgae = (currentMatch?.auto_algae_scored || 0) + (currentMatch?.tele_algae_scored || 0);

      // Use upsert to handle cases where match doesn't exist yet
      // This allows submitting postgame data even if user navigated directly to Post page
      const { data, error } = await supabase
        .from('match_reports')
        .upsert({
          team_number: postGame.team_num,
          match_number: postGame.match_num,
          regional: postGame.regional,
          driver_rating: postGame.driverRating,
          disabled: postGame.disabled,
          defence: postGame.defence,
          malfunction: postGame.malfunction,
          no_show: postGame.noShow,
          comments: postGame.comments,
          total_l1_scored: totalL1,
          total_l2_scored: totalL2,
          total_l3_scored: totalL3,
          total_l4_scored: totalL4,
          total_algae_scored: totalAlgae,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'team_number,match_number,regional',
          ignoreDuplicates: false
        })
        .select();

      if (error) throw error;

      console.log('✅ Postgame data saved to Supabase (totals calculated)');
      return { success: true, data, acknowledgment: true };
    } catch (error) {
      console.error('Error updating postgame:', error);
      throw error;
    }
  },

  /**
   * Submit complete match data in one transaction
   * This includes pregame, auto, tele, and postgame data
   * @param submittedBy - User ID of the student submitting this data (optional for backward compatibility)
   */
  submitCompleteMatch: async (matchData: {
    team_num: number;
    match_num: number;
    regional: string;
    auto_starting_position?: number;
    algae?: Array<{ where_scored: string; made: boolean; timestamp: number }>;
    coral?: Array<{ level: number; made: boolean; timestamp: number }>;
    tele_algae?: Array<{ where_scored: string; made: boolean; timestamp: number }>;
    tele_coral?: Array<{ level: number; made: boolean; timestamp: number }>;
    climb_level?: number;
    climb_deep?: boolean;
    climb_shallow?: boolean;
    park?: boolean;
    driverRating?: number;
    disabled?: boolean;
    defence?: boolean;
    malfunction?: boolean;
    noShow?: boolean;
    comments?: string;
    submitted_by?: string;
  }) => {
    try {
      // Aggregate coral scores from auto phase
      const autoCoralCounts = { l1: 0, l2: 0, l3: 0, l4: 0 };
      if (matchData.coral && matchData.coral.length > 0) {
        matchData.coral.forEach(c => {
          if (c.made) {
            if (c.level === 1) autoCoralCounts.l1++;
            else if (c.level === 2) autoCoralCounts.l2++;
            else if (c.level === 3) autoCoralCounts.l3++;
            else if (c.level === 4) autoCoralCounts.l4++;
          }
        });
      }

      // Aggregate coral scores from tele phase
      const teleCoralCounts = { l1: 0, l2: 0, l3: 0, l4: 0 };
      if (matchData.tele_coral && matchData.tele_coral.length > 0) {
        matchData.tele_coral.forEach(c => {
          if (c.made) {
            if (c.level === 1) teleCoralCounts.l1++;
            else if (c.level === 2) teleCoralCounts.l2++;
            else if (c.level === 3) teleCoralCounts.l3++;
            else if (c.level === 4) teleCoralCounts.l4++;
          }
        });
      }

      // Count algae from both phases
      const autoAlgaeCount = matchData.algae?.filter(a => a.made).length || 0;
      const teleAlgaeCount = matchData.tele_algae?.filter(a => a.made).length || 0;
      const totalAlgaeCount = autoAlgaeCount + teleAlgaeCount;

      // Count algae by type (removed, processed, net)
      const autoAlgaeRemoved = matchData.algae?.filter(a => a.made && a.where_scored === 'removed').length || 0;
      const autoAlgaeProcessed = matchData.algae?.filter(a => a.made && a.where_scored === 'processed').length || 0;
      const teleAlgaeRemoved = matchData.tele_algae?.filter(a => a.made && a.where_scored === 'removed').length || 0;
      const teleAlgaeProcessed = matchData.tele_algae?.filter(a => a.made && a.where_scored === 'processed').length || 0;

      const totalAlgaeRemoved = autoAlgaeRemoved + teleAlgaeRemoved;
      const totalAlgaeProcessed = autoAlgaeProcessed + teleAlgaeProcessed;

      // Combine auto + tele coral counts
      const totalCoralCounts = {
        l1: autoCoralCounts.l1 + teleCoralCounts.l1,
        l2: autoCoralCounts.l2 + teleCoralCounts.l2,
        l3: autoCoralCounts.l3 + teleCoralCounts.l3,
        l4: autoCoralCounts.l4 + teleCoralCounts.l4
      };

      // Upsert complete match record with separated auto/tele data and calculated totals
      const { data: matchRecord, error: matchError } = await supabase
        .from('match_reports')
        .upsert({
          team_number: matchData.team_num,
          match_number: matchData.match_num,
          regional: matchData.regional,
          auto_starting_position: matchData.auto_starting_position,
          // Auto phase scores
          auto_l1_scored: autoCoralCounts.l1,
          auto_l2_scored: autoCoralCounts.l2,
          auto_l3_scored: autoCoralCounts.l3,
          auto_l4_scored: autoCoralCounts.l4,
          auto_algae_scored: autoAlgaeCount,
          // Tele phase scores
          tele_l1_scored: teleCoralCounts.l1,
          tele_l2_scored: teleCoralCounts.l2,
          tele_l3_scored: teleCoralCounts.l3,
          tele_l4_scored: teleCoralCounts.l4,
          tele_algae_scored: teleAlgaeCount,
          // Total scores (auto + tele)
          total_l1_scored: totalCoralCounts.l1,
          total_l2_scored: totalCoralCounts.l2,
          total_l3_scored: totalCoralCounts.l3,
          total_l4_scored: totalCoralCounts.l4,
          total_algae_scored: totalAlgaeCount,
          // Algae breakdown by type
          algae_removed: totalAlgaeRemoved,
          algae_processed: totalAlgaeProcessed,
          // Endgame and other data
          climb_deep: matchData.climb_deep,
          climb_shallow: matchData.climb_shallow,
          park: matchData.park,
          driver_rating: matchData.driverRating,
          disabled: matchData.disabled,
          defence: matchData.defence,
          malfunction: matchData.malfunction,
          no_show: matchData.noShow,
          comments: matchData.comments,
          submitted_by: matchData.submitted_by || null,
          submitted_at: matchData.submitted_by ? new Date().toISOString() : null,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'team_number,match_number,regional',
          ignoreDuplicates: false
        })
        .select();

      if (matchError) throw matchError;

      const totalCoralCount = totalCoralCounts.l1 + totalCoralCounts.l2 + totalCoralCounts.l3 + totalCoralCounts.l4;
      const autoCoralCount = autoCoralCounts.l1 + autoCoralCounts.l2 + autoCoralCounts.l3 + autoCoralCounts.l4;
      const teleCoralCount = teleCoralCounts.l1 + teleCoralCounts.l2 + teleCoralCounts.l3 + teleCoralCounts.l4;

      console.log(`✅ Complete match data saved to Supabase: Team ${matchData.team_num}, Match ${matchData.match_num}${matchData.submitted_by ? ` by user ${matchData.submitted_by}` : ''}`);
      console.log(`   Auto: ${autoAlgaeCount} algae, ${autoCoralCount} coral | Tele: ${teleAlgaeCount} algae, ${teleCoralCount} coral`);
      console.log(`   Total: ${totalAlgaeCount} algae (${totalAlgaeRemoved} removed, ${totalAlgaeProcessed} processed), ${totalCoralCount} coral (L1:${totalCoralCounts.l1} L2:${totalCoralCounts.l2} L3:${totalCoralCounts.l3} L4:${totalCoralCounts.l4})`);

      return {
        success: true,
        acknowledgment: true,
        matchRecord,
        algaeCount: totalAlgaeCount,
        coralCount: totalCoralCount
      };
    } catch (error) {
      console.error('Error submitting complete match data:', error);
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
        .from('match_reports')
        .select('*')
        .eq('regional', regional)
        .eq('team_number', team_num)
        .eq('match_number', match_num)
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
        .from('match_reports')
        .select('*')
        .eq('regional', regional)
        .eq('team_number', team_num)
        .order('match_number', { ascending: true });

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
        .from('match_reports')
        .select('climb_deep, climb_shallow, park')
        .eq('team_number', teamNum)
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
