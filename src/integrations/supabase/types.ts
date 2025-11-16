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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          achievement_type: string
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          requirement_count: number | null
          title: string
          xp_reward: number
        }
        Insert: {
          achievement_type: string
          color: string
          created_at?: string
          description: string
          icon: string
          id: string
          requirement_count?: number | null
          title: string
          xp_reward?: number
        }
        Update: {
          achievement_type?: string
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          requirement_count?: number | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      carbon_activities: {
        Row: {
          activity_type: string
          co2_emissions: number
          created_at: string
          id: string
          notes: string | null
          plant_id: string | null
          quantity: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          co2_emissions?: number
          created_at?: string
          id?: string
          notes?: string | null
          plant_id?: string | null
          quantity?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          co2_emissions?: number
          created_at?: string
          id?: string
          notes?: string | null
          plant_id?: string | null
          quantity?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_activities_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_footprint_summary: {
        Row: {
          created_at: string
          fertilizer_emissions: number | null
          id: string
          maintenance_emissions: number | null
          period_end: string
          period_start: string
          sensor_emissions: number | null
          total_emissions: number
          updated_at: string
          user_id: string
          watering_emissions: number | null
        }
        Insert: {
          created_at?: string
          fertilizer_emissions?: number | null
          id?: string
          maintenance_emissions?: number | null
          period_end: string
          period_start: string
          sensor_emissions?: number | null
          total_emissions?: number
          updated_at?: string
          user_id: string
          watering_emissions?: number | null
        }
        Update: {
          created_at?: string
          fertilizer_emissions?: number | null
          id?: string
          maintenance_emissions?: number | null
          period_end?: string
          period_start?: string
          sensor_emissions?: number | null
          total_emissions?: number
          updated_at?: string
          user_id?: string
          watering_emissions?: number | null
        }
        Relationships: []
      }
      care_schedules: {
        Row: {
          auto_adjust_weather: boolean | null
          created_at: string
          custom_instructions: string | null
          frequency_days: number
          id: string
          last_completed_at: string | null
          next_due_at: string
          plant_id: string
          priority: string | null
          task_type: string
          updated_at: string
        }
        Insert: {
          auto_adjust_weather?: boolean | null
          created_at?: string
          custom_instructions?: string | null
          frequency_days?: number
          id?: string
          last_completed_at?: string | null
          next_due_at: string
          plant_id: string
          priority?: string | null
          task_type: string
          updated_at?: string
        }
        Update: {
          auto_adjust_weather?: boolean | null
          created_at?: string
          custom_instructions?: string | null
          frequency_days?: number
          id?: string
          last_completed_at?: string | null
          next_due_at?: string
          plant_id?: string
          priority?: string | null
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_schedules_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      care_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          notes: string | null
          plant_id: string
          priority: string | null
          schedule_id: string | null
          status: string | null
          task_type: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          notes?: string | null
          plant_id: string
          priority?: string | null
          schedule_id?: string | null
          status?: string | null
          task_type: string
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          plant_id?: string
          priority?: string | null
          schedule_id?: string | null
          status?: string | null
          task_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_tasks_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "care_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_milestones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          measurement_unit: string | null
          measurement_value: number | null
          milestone_type: string
          photo_url: string | null
          plant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          measurement_unit?: string | null
          measurement_value?: number | null
          milestone_type: string
          photo_url?: string | null
          plant_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          measurement_unit?: string | null
          measurement_value?: number | null
          milestone_type?: string
          photo_url?: string | null
          plant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_milestones_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_achievements: {
        Row: {
          achievement_type: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          metadata: Json | null
          plant_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          plant_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          plant_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_achievements_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_diseases: {
        Row: {
          affected_plants: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          prevention: string[] | null
          scientific_name: string | null
          severity: string | null
          symptoms: string[] | null
          treatment: string[] | null
        }
        Insert: {
          affected_plants?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          prevention?: string[] | null
          scientific_name?: string | null
          severity?: string | null
          symptoms?: string[] | null
          treatment?: string[] | null
        }
        Update: {
          affected_plants?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          prevention?: string[] | null
          scientific_name?: string | null
          severity?: string | null
          symptoms?: string[] | null
          treatment?: string[] | null
        }
        Relationships: []
      }
      plant_health_logs: {
        Row: {
          ai_analysis: Json | null
          created_at: string
          detected_issues: string[] | null
          environmental_data: Json | null
          health_rating: number | null
          id: string
          mood: string | null
          notes: string | null
          photo_url: string | null
          plant_id: string
          user_id: string
          vitality_score: number | null
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string
          detected_issues?: string[] | null
          environmental_data?: Json | null
          health_rating?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          photo_url?: string | null
          plant_id: string
          user_id: string
          vitality_score?: number | null
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string
          detected_issues?: string[] | null
          environmental_data?: Json | null
          health_rating?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          photo_url?: string | null
          plant_id?: string
          user_id?: string
          vitality_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plant_health_logs_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_scans: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          custom_name: string | null
          diagnosis: string | null
          disease_detected: string | null
          health_status: string
          id: string
          image_url: string
          is_favorite: boolean | null
          location: string | null
          plant_type: string | null
          recommendations: string[] | null
          tags: string[] | null
          user_id: string | null
          weather_data: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          custom_name?: string | null
          diagnosis?: string | null
          disease_detected?: string | null
          health_status: string
          id?: string
          image_url: string
          is_favorite?: boolean | null
          location?: string | null
          plant_type?: string | null
          recommendations?: string[] | null
          tags?: string[] | null
          user_id?: string | null
          weather_data?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          custom_name?: string | null
          diagnosis?: string | null
          disease_detected?: string | null
          health_status?: string
          id?: string
          image_url?: string
          is_favorite?: boolean | null
          location?: string | null
          plant_type?: string | null
          recommendations?: string[] | null
          tags?: string[] | null
          user_id?: string | null
          weather_data?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_care_preferences: {
        Row: {
          auto_adjust_schedules: boolean | null
          carbon_tracking_enabled: boolean | null
          created_at: string
          email_reminders: boolean | null
          id: string
          notification_enabled: boolean | null
          notification_time: string | null
          preferred_units: string | null
          theme_preference: string | null
          updated_at: string
          user_id: string
          weather_sync_enabled: boolean | null
        }
        Insert: {
          auto_adjust_schedules?: boolean | null
          carbon_tracking_enabled?: boolean | null
          created_at?: string
          email_reminders?: boolean | null
          id?: string
          notification_enabled?: boolean | null
          notification_time?: string | null
          preferred_units?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
          weather_sync_enabled?: boolean | null
        }
        Update: {
          auto_adjust_schedules?: boolean | null
          carbon_tracking_enabled?: boolean | null
          created_at?: string
          email_reminders?: boolean | null
          id?: string
          notification_enabled?: boolean | null
          notification_time?: string | null
          preferred_units?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
          weather_sync_enabled?: boolean | null
        }
        Relationships: []
      }
      user_plants: {
        Row: {
          acquired_date: string | null
          climate_zone: string | null
          created_at: string
          custom_notes: string | null
          growth_stage: string | null
          health_status: string | null
          id: string
          image_url: string | null
          light_requirement: string | null
          location: string | null
          nickname: string
          plant_type: string | null
          soil_type: string | null
          species: string
          updated_at: string
          user_id: string
          water_frequency_days: number | null
        }
        Insert: {
          acquired_date?: string | null
          climate_zone?: string | null
          created_at?: string
          custom_notes?: string | null
          growth_stage?: string | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          light_requirement?: string | null
          location?: string | null
          nickname: string
          plant_type?: string | null
          soil_type?: string | null
          species: string
          updated_at?: string
          user_id: string
          water_frequency_days?: number | null
        }
        Update: {
          acquired_date?: string | null
          climate_zone?: string | null
          created_at?: string
          custom_notes?: string | null
          growth_stage?: string | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          light_requirement?: string | null
          location?: string | null
          nickname?: string
          plant_type?: string | null
          soil_type?: string | null
          species?: string
          updated_at?: string
          user_id?: string
          water_frequency_days?: number | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          achievements_earned: number
          created_at: string
          current_streak_days: number
          diseases_treated: number
          id: string
          last_activity_date: string | null
          level: number
          longest_streak_days: number
          perfect_weeks: number
          plants_added: number
          tasks_completed: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_earned?: number
          created_at?: string
          current_streak_days?: number
          diseases_treated?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak_days?: number
          perfect_weeks?: number
          plants_added?: number
          tasks_completed?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_earned?: number
          created_at?: string
          current_streak_days?: number
          diseases_treated?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak_days?: number
          perfect_weeks?: number
          plants_added?: number
          tasks_completed?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_cache: {
        Row: {
          cached_at: string | null
          id: string
          latitude: number
          longitude: number
          weather_data: Json
        }
        Insert: {
          cached_at?: string | null
          id?: string
          latitude: number
          longitude: number
          weather_data: Json
        }
        Update: {
          cached_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          weather_data?: Json
        }
        Relationships: []
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
