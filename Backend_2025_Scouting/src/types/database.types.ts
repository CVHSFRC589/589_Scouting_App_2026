/**
 * Database Types
 * TypeScript types for Supabase database schema
 *
 * This file defines the structure of our database tables.
 * It is aligned with the backend schema created by supabase_migration scripts.
 *
 * Tables:
 * - teams: FRC team information
 * - matches: Match scouting data
 * - robot_info: Pit scouting data
 * - team_statistics: Calculated statistics
 */

export interface Database {
  public: {
    Tables: {
      // =====================================================================
      // TEAMS TABLE
      // =====================================================================
      teams: {
        Row: {
          id: number
          team_number: number
          team_name: string | null
          regional: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          team_number: number
          team_name?: string | null
          regional: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          team_number?: number
          team_name?: string | null
          regional?: string
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================================
      // MATCHES TABLE
      // =====================================================================
      matches: {
        Row: {
          id: number
          team_id: number
          match_number: number
          regional: string
          scouter_name: string | null

          // Pregame
          starting_position: string | null

          // Autonomous
          auto_taxi: boolean
          auto_m1: number
          auto_m2: number
          auto_m3: number
          auto_m4: number
          auto_m5: number
          auto_s1: number
          auto_s2: number
          auto_s3: number
          auto_r: number

          // Teleoperated
          teleop_amp_attempts: number
          teleop_amp_scored: number
          teleop_speaker_attempts: number
          teleop_speaker_scored: number
          teleop_ground_intake: number
          teleop_source_intake: number

          // Endgame
          endgame_climb: string | null
          endgame_trap_count: number

          // Postgame
          driver_rating: number | null
          robot_disabled: boolean
          played_defense: boolean
          comments: string | null

          // Timestamps
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          team_id: number
          match_number: number
          regional: string
          scouter_name?: string | null

          // Pregame
          starting_position?: string | null

          // Autonomous
          auto_taxi?: boolean
          auto_m1?: number
          auto_m2?: number
          auto_m3?: number
          auto_m4?: number
          auto_m5?: number
          auto_s1?: number
          auto_s2?: number
          auto_s3?: number
          auto_r?: number

          // Teleoperated
          teleop_amp_attempts?: number
          teleop_amp_scored?: number
          teleop_speaker_attempts?: number
          teleop_speaker_scored?: number
          teleop_ground_intake?: number
          teleop_source_intake?: number

          // Endgame
          endgame_climb?: string | null
          endgame_trap_count?: number

          // Postgame
          driver_rating?: number | null
          robot_disabled?: boolean
          played_defense?: boolean
          comments?: string | null

          // Timestamps
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          team_id?: number
          match_number?: number
          regional?: string
          scouter_name?: string | null

          // Pregame
          starting_position?: string | null

          // Autonomous
          auto_taxi?: boolean
          auto_m1?: number
          auto_m2?: number
          auto_m3?: number
          auto_m4?: number
          auto_m5?: number
          auto_s1?: number
          auto_s2?: number
          auto_s3?: number
          auto_r?: number

          // Teleoperated
          teleop_amp_attempts?: number
          teleop_amp_scored?: number
          teleop_speaker_attempts?: number
          teleop_speaker_scored?: number
          teleop_ground_intake?: number
          teleop_source_intake?: number

          // Endgame
          endgame_climb?: string | null
          endgame_trap_count?: number

          // Postgame
          driver_rating?: number | null
          robot_disabled?: boolean
          played_defense?: boolean
          comments?: string | null

          // Timestamps
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================================
      // ROBOT_INFO TABLE
      // =====================================================================
      robot_info: {
        Row: {
          id: number
          team_id: number
          regional: string

          // Capabilities
          can_score_amp: boolean
          can_score_speaker: boolean
          can_ground_intake: boolean
          can_source_intake: boolean
          can_climb: boolean
          max_climb_level: string | null

          // Physical specifications
          robot_weight: number | null
          robot_height: number | null
          drive_type: string | null

          // Additional info
          notes: string | null
          scouter_name: string | null

          // Timestamps
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          team_id: number
          regional: string

          // Capabilities
          can_score_amp?: boolean
          can_score_speaker?: boolean
          can_ground_intake?: boolean
          can_source_intake?: boolean
          can_climb?: boolean
          max_climb_level?: string | null

          // Physical specifications
          robot_weight?: number | null
          robot_height?: number | null
          drive_type?: string | null

          // Additional info
          notes?: string | null
          scouter_name?: string | null

          // Timestamps
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          team_id?: number
          regional?: string

          // Capabilities
          can_score_amp?: boolean
          can_score_speaker?: boolean
          can_ground_intake?: boolean
          can_source_intake?: boolean
          can_climb?: boolean
          max_climb_level?: string | null

          // Physical specifications
          robot_weight?: number | null
          robot_height?: number | null
          drive_type?: string | null

          // Additional info
          notes?: string | null
          scouter_name?: string | null

          // Timestamps
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================================
      // TEAM_STATISTICS TABLE
      // =====================================================================
      team_statistics: {
        Row: {
          id: number
          team_id: number
          regional: string
          stat_category: string
          stat_name: string
          stat_value: number | null
          stat_fraction: string | null
          total_matches: number | null
          last_calculated: string
        }
        Insert: {
          id?: number
          team_id: number
          regional: string
          stat_category: string
          stat_name: string
          stat_value?: number | null
          stat_fraction?: string | null
          total_matches?: number | null
          last_calculated?: string
        }
        Update: {
          id?: number
          team_id?: number
          regional?: string
          stat_category?: string
          stat_name?: string
          stat_value?: number | null
          stat_fraction?: string | null
          total_matches?: number | null
          last_calculated?: string
        }
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      [_ in never]: never
    }

    Enums: {
      [_ in never]: never
    }

    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

// Extract a table's row type
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

// Extract a table's insert type
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

// Extract a table's update type
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience type exports
export type Team = Tables<'teams'>
export type Match = Tables<'matches'>
export type RobotInfo = Tables<'robot_info'>
export type TeamStatistic = Tables<'team_statistics'>

export type TeamInsert = TablesInsert<'teams'>
export type MatchInsert = TablesInsert<'matches'>
export type RobotInfoInsert = TablesInsert<'robot_info'>
export type TeamStatisticInsert = TablesInsert<'team_statistics'>

export type TeamUpdate = TablesUpdate<'teams'>
export type MatchUpdate = TablesUpdate<'matches'>
export type RobotInfoUpdate = TablesUpdate<'robot_info'>
export type TeamStatisticUpdate = TablesUpdate<'team_statistics'>
