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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_coach_profiles: {
        Row: {
          academy_coach_name: string | null
          academy_info_path: string | null
          age_groups_trained: string | null
          coach_certification: string | null
          created_at: string
          experience_level: string | null
          id: string
          id_proof_path: string | null
          location: string | null
          registration_id: string | null
          sports_offered: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academy_coach_name?: string | null
          academy_info_path?: string | null
          age_groups_trained?: string | null
          coach_certification?: string | null
          created_at?: string
          experience_level?: string | null
          id?: string
          id_proof_path?: string | null
          location?: string | null
          registration_id?: string | null
          sports_offered?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academy_coach_name?: string | null
          academy_info_path?: string | null
          age_groups_trained?: string | null
          coach_certification?: string | null
          created_at?: string
          experience_level?: string | null
          id?: string
          id_proof_path?: string | null
          location?: string | null
          registration_id?: string | null
          sports_offered?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_coach_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
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
          aadhaar_or_govt_id: string | null
          awards_recognition: string | null
          city: string | null
          club_academy: string | null
          coach_mentor: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_public: boolean
          mobile_number: string | null
          nationality: string | null
          preferred_language: string | null
          profile_status: string
          public_slug: string | null
          scholarship_recipient: boolean | null
          school_college: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aadhaar_or_govt_id?: string | null
          awards_recognition?: string | null
          city?: string | null
          club_academy?: string | null
          coach_mentor?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_public?: boolean
          mobile_number?: string | null
          nationality?: string | null
          preferred_language?: string | null
          profile_status?: string
          public_slug?: string | null
          scholarship_recipient?: boolean | null
          school_college?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aadhaar_or_govt_id?: string | null
          awards_recognition?: string | null
          city?: string | null
          club_academy?: string | null
          coach_mentor?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_public?: boolean
          mobile_number?: string | null
          nationality?: string | null
          preferred_language?: string | null
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
          sport_category: string | null
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
          sport_category?: string | null
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
          sport_category?: string | null
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
      creator_profiles: {
        Row: {
          content_type: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          portfolio_link: string | null
          portfolio_path: string | null
          registration_id: string | null
          social_media_handles: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          portfolio_link?: string | null
          portfolio_path?: string | null
          registration_id?: string | null
          social_media_handles?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          portfolio_link?: string | null
          portfolio_path?: string | null
          registration_id?: string | null
          social_media_handles?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_staff_profiles: {
        Row: {
          availability: string | null
          certification: string | null
          created_at: string
          experience_years: number | null
          full_name: string | null
          id: string
          id_proof_path: string | null
          location: string | null
          registration_id: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          certification?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          id_proof_path?: string | null
          location?: string | null
          registration_id?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          certification?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          id_proof_path?: string | null
          location?: string | null
          registration_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_staff_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      management_legal_profiles: {
        Row: {
          created_at: string
          experience_level: string | null
          full_name: string | null
          id: string
          id_proof_path: string | null
          license_number: string | null
          license_path: string | null
          location: string | null
          organization: string | null
          registration_id: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          id_proof_path?: string | null
          license_number?: string | null
          license_path?: string | null
          location?: string | null
          organization?: string | null
          registration_id?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          id_proof_path?: string | null
          license_number?: string | null
          license_path?: string | null
          location?: string | null
          organization?: string | null
          registration_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "management_legal_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_expert_profiles: {
        Row: {
          certificate_path: string | null
          certifications: string | null
          created_at: string
          experience_level: string | null
          expertise: string | null
          full_name: string | null
          id: string
          id_proof_path: string | null
          location: string | null
          registration_id: string | null
          services_offered: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_path?: string | null
          certifications?: string | null
          created_at?: string
          experience_level?: string | null
          expertise?: string | null
          full_name?: string | null
          id?: string
          id_proof_path?: string | null
          location?: string | null
          registration_id?: string | null
          services_offered?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_path?: string | null
          certifications?: string | null
          created_at?: string
          experience_level?: string | null
          expertise?: string | null
          full_name?: string | null
          id?: string
          id_proof_path?: string | null
          location?: string | null
          registration_id?: string | null
          services_offered?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_expert_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          profile_id: string
          registered_at: string | null
          registration_type: string
          sportfo_user_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          profile_id: string
          registered_at?: string | null
          registration_type: string
          sportfo_user_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          profile_id?: string
          registered_at?: string | null
          registration_type?: string
          sportfo_user_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_sportfo_user_id_fkey"
            columns: ["sportfo_user_id"]
            isOneToOne: false
            referencedRelation: "sportfo_users"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_profiles: {
        Row: {
          budget_range: string | null
          contact_person: string | null
          created_at: string
          id: string
          id_proof_path: string | null
          location: string | null
          organization_name: string | null
          proposal_path: string | null
          registration_id: string | null
          sponsorship_interest: string[] | null
          sports_focus: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          id_proof_path?: string | null
          location?: string | null
          organization_name?: string | null
          proposal_path?: string | null
          registration_id?: string | null
          sponsorship_interest?: string[] | null
          sports_focus?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_range?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          id_proof_path?: string | null
          location?: string | null
          organization_name?: string | null
          proposal_path?: string | null
          registration_id?: string | null
          sponsorship_interest?: string[] | null
          sports_focus?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      sportfo_users: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          sportfo_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          sportfo_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          sportfo_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_analytics_profiles: {
        Row: {
          created_at: string
          experience_years: number | null
          full_name: string | null
          id: string
          location: string | null
          portfolio_report_path: string | null
          registration_id: string | null
          role: string | null
          sports_specialization: string | null
          tools_used: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          portfolio_report_path?: string | null
          registration_id?: string | null
          role?: string | null
          sports_specialization?: string | null
          tools_used?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          portfolio_report_path?: string | null
          registration_id?: string | null
          role?: string | null
          sports_specialization?: string | null
          tools_used?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_analytics_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_category_breakdown: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          registration_type: string
          registrations: number
        }[]
      }
      admin_list_registrations: {
        Args: {
          p_category?: string
          p_from?: string
          p_page?: number
          p_page_size?: number
          p_status?: string
          p_to?: string
        }
        Returns: Json
      }
      admin_registration_kpis: { Args: never; Returns: Json }
      admin_registration_trend: {
        Args: { p_from: string; p_to: string }
        Returns: {
          day: string
          registrations: number
        }[]
      }
      ensure_sportfo_id: { Args: never; Returns: string }
      generate_athlete_public_slug: {
        Args: { p_full_name: string }
        Returns: string
      }
      get_own_role_registration: {
        Args: { p_registration_type: string }
        Returns: Json
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
      get_public_athlete_countries: {
        Args: never
        Returns: {
          country: string
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
          sport_category: string
          sport_discipline: string
          sportfo_id: string
        }[]
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      owns_athlete_profile: { Args: { profile_id: string }; Returns: boolean }
      save_athlete_registration: {
        Args: {
          p_aadhaar_or_govt_id?: string
          p_achievements?: Json
          p_awards_recognition: string
          p_city: string
          p_club_academy: string
          p_coach_mentor: string
          p_country: string
          p_date_of_birth: string
          p_email: string
          p_emergency_contact?: string
          p_full_name: string
          p_gender: string
          p_mobile_number: string
          p_nationality: string
          p_position_role: string
          p_preferred_language?: string
          p_primary_sport: string
          p_profile_status: string
          p_scholarship_recipient: boolean
          p_school_college: string
          p_skill_level: string
          p_sport_category: string
          p_sport_discipline: string
        }
        Returns: Json
      }
      save_role_registration: {
        Args: { p_fields: Json; p_registration_type: string; p_status: string }
        Returns: Json
      }
      search_public_athletes: {
        Args: {
          p_city?: string
          p_country?: string
          p_page?: number
          p_page_size?: number
          p_query?: string
          p_skill_level?: string
          p_sport?: string
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
      sportfo_id_exists: { Args: { p_sportfo_id: string }; Returns: boolean }
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
