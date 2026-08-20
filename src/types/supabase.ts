export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      athlete_achievements: {
        Row: {
          achievement_date: string | null
          achievement_type: string | null
          athlete_profile_id: string
          created_at: string
          description: string | null
          document_path: string | null
          id: string
          issuing_organization: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          achievement_date?: string | null
          achievement_type?: string | null
          athlete_profile_id: string
          created_at?: string
          description?: string | null
          document_path?: string | null
          id?: string
          issuing_organization?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          achievement_date?: string | null
          achievement_type?: string | null
          athlete_profile_id?: string
          created_at?: string
          description?: string | null
          document_path?: string | null
          id?: string
          issuing_organization?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_achievements_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_profiles: {
        Row: {
          awards_recognition: string | null
          city: string | null
          club_academy: string | null
          coach_mentor: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_public: boolean
          mobile_number: string | null
          nationality: string | null
          profile_status: string
          public_slug: string | null
          scholarship_recipient: boolean | null
          school_college: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          awards_recognition?: string | null
          city?: string | null
          club_academy?: string | null
          coach_mentor?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_public?: boolean
          mobile_number?: string | null
          nationality?: string | null
          profile_status?: string
          public_slug?: string | null
          scholarship_recipient?: boolean | null
          school_college?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          awards_recognition?: string | null
          city?: string | null
          club_academy?: string | null
          coach_mentor?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_public?: boolean
          mobile_number?: string | null
          nationality?: string | null
          profile_status?: string
          public_slug?: string | null
          scholarship_recipient?: boolean | null
          school_college?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_sports: {
        Row: {
          athlete_profile_id: string
          created_at: string
          id: string
          position_role: string | null
          primary_sport: string | null
          skill_level: string | null
          sport_discipline: string | null
          updated_at: string
        }
        Insert: {
          athlete_profile_id: string
          created_at?: string
          id?: string
          position_role?: string | null
          primary_sport?: string | null
          skill_level?: string | null
          sport_discipline?: string | null
          updated_at?: string
        }
        Update: {
          athlete_profile_id?: string
          created_at?: string
          id?: string
          position_role?: string | null
          primary_sport?: string | null
          skill_level?: string | null
          sport_discipline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_sports_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_athlete_public_slug: {
        Args: { p_full_name: string }
        Returns: string
      }
      get_public_athlete_achievements: {
        Args: { p_slug: string }
        Returns: {
          achievement_date: string
          achievement_type: string
          description: string
          has_document: boolean
          issuing_organization: string
          title: string
        }[]
      }
      get_public_athlete_profile: {
        Args: { p_slug: string }
        Returns: {
          city: string
          club_academy: string
          coach_mentor: string
          country: string
          full_name: string
          nationality: string
          position_role: string
          primary_sport: string
          school_college: string
          skill_level: string
          sport_discipline: string
        }[]
      }
      owns_athlete_profile: { Args: { profile_id: string }; Returns: boolean }
      save_athlete_registration: {
        Args: {
          p_achievements?: Json
          p_awards_recognition: string
          p_city: string
          p_club_academy: string
          p_coach_mentor: string
          p_country: string
          p_date_of_birth: string
          p_email: string
          p_full_name: string
          p_gender: string
          p_mobile_number: string
          p_nationality: string
          p_position_role: string
          p_primary_sport: string
          p_profile_status: string
          p_scholarship_recipient: boolean
          p_school_college: string
          p_skill_level: string
          p_sport_discipline: string
        }
        Returns: Json
      }
      set_athlete_profile_visibility: {
        Args: { p_is_public: boolean }
        Returns: {
          is_public: boolean
          public_slug: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
