import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient';
import type { RobotStats } from '../data/schema';

/**
 * Real-time hook for robot leaderboard
 * Automatically updates when any scout submits data
 */
export const useRealtimeRobots = (regional: string) => {
  const [robots, setRobots] = useState<RobotStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!regional) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchRobots();

    // Set up real-time subscription
    const channel = supabase
      .channel(`robots-${regional}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'reefscape_matches',
          filter: `regional=eq.${regional}`
        },
        (payload) => {
          console.log('✨ Real-time: Match data changed:', payload);
          fetchRobots(); // Refresh when match data changes
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'robot_info',
          filter: `regional=eq.${regional}`
        },
        (payload) => {
          console.log('✨ Real-time: Robot info changed:', payload);
          fetchRobots(); // Refresh when pit scouting data changes
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'robot_stats',
          filter: `regional=eq.${regional}`
        },
        (payload) => {
          console.log('✨ Real-time: Robot stats changed:', payload);
          fetchRobots(); // Refresh when statistics are recalculated
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [regional]);

  const fetchRobots = async () => {
    try {
      const { data, error } = await supabase
        .from('robots_complete')
        .select('*')
        .eq('regional', regional)
        .order('rank_value', { ascending: true });

      if (error) throw error;

      setRobots(data?.map(robot => ({
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
      })) || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching robots:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { robots, loading, error, refetch: fetchRobots };
};
