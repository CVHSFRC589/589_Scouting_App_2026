import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient';
import type { TeamMatchResponse } from '../data/schema';

/**
 * Real-time hook for team match data
 * Automatically updates when match data changes
 */
export const useRealtimeMatches = (regional: string, teamNum: number) => {
  const [matches, setMatches] = useState<TeamMatchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!regional || !teamNum) {
      setLoading(false);
      return;
    }

    fetchMatches();

    const channel = supabase
      .channel(`matches-${regional}-${teamNum}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_reports',
          filter: `regional=eq.${regional} AND team_number=eq.${teamNum}`
        },
        (payload) => {
          console.log('✨ Real-time: Match updated:', payload);
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [regional, teamNum]);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('match_reports')
        .select('*')
        .eq('regional', regional)
        .eq('team_number', teamNum)
        .order('match_number', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, refetch: fetchMatches };
};
