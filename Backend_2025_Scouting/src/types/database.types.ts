/**
 * Database Types
 * Auto-generated TypeScript types for Supabase database schema
 *
 * To regenerate:
 * npm run gen-types
 *
 * Note: You need to set PROJECT_REF environment variable to your Supabase project ID
 */

// Placeholder types until schema is generated
export interface Database {
  public: {
    Tables: {
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
      matches: {
        Row: {
          id: number
          team_id: number
          match_number: number
          regional: string
          scouter_name: string | null
          starting_position: string | null
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
          teleop_amp_attempts: number
          teleop_amp_scored: number
          teleop_speaker_attempts: number
          teleop_speaker_scored: number
          teleop_ground_intake: number
          teleop_source_intake: number
          endgame_climb: string | null
          endgame_trap_count: number
          driver_rating: number | null
          robot_disabled: boolean
          played_defense: boolean
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          team_id: number
          match_number: number
          regional: string
          scouter_name?: string | null
          starting_position?: string | null
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
          teleop_amp_attempts?: number
          teleop_amp_scored?: number
          teleop_speaker_attempts?: number
          teleop_speaker_scored?: number
          teleop_ground_intake?: number
          teleop_source_intake?: number
          endgame_climb?: string | null
          endgame_trap_count?: number
          driver_rating?: number | null
          robot_disabled?: boolean
          played_defense?: boolean
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          team_id?: number
          match_number?: number
          regional?: string
          scouter_name?: string | null
          starting_position?: string | null
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
          teleop_amp_attempts?: number
          teleop_amp_scored?: number
          teleop_speaker_attempts?: number
          teleop_speaker_scored?: number
          teleop_ground_intake?: number
          teleop_source_intake?: number
          endgame_climb?: string | null
          endgame_trap_count?: number
          driver_rating?: number | null
          robot_disabled?: boolean
          played_defense?: boolean
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      robot_info: {
        Row: {
          id: number
          team_id: number
          regional: string
          can_score_amp: boolean
          can_score_speaker: boolean
          can_ground_intake: boolean
          can_source_intake: boolean
          can_climb: boolean
          max_climb_level: string | null
          robot_weight: number | null
          robot_height: number | null
          drive_type: string | null
          notes: string | null
          scouter_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          team_id: number
          regional: string
          can_score_amp?: boolean
          can_score_speaker?: boolean
          can_ground_intake?: boolean
          can_source_intake?: boolean
          can_climb?: boolean
          max_climb_level?: string | null
          robot_weight?: number | null
          robot_height?: number | null
          drive_type?: string | null
          notes?: string | null
          scouter_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          team_id?: number
          regional?: string
          can_score_amp?: boolean
          can_score_speaker?: boolean
          can_ground_intake?: boolean
          can_source_intake?: boolean
          can_climb?: boolean
          max_climb_level?: string | null
          robot_weight?: number | null
          robot_height?: number | null
          drive_type?: string | null
          notes?: string | null
          scouter_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
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