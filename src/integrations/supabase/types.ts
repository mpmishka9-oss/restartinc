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
      check_ins: {
        Row: {
          assigned_level: number | null
          created_at: string
          detected_state: Database["public"]["Enums"]["detected_state"] | null
          dosha: string | null
          id: string
          message: string | null
          severity_score: number | null
          suggested_practice_types: Json | null
          user_id: string
          warm_response: string | null
        }
        Insert: {
          assigned_level?: number | null
          created_at?: string
          detected_state?: Database["public"]["Enums"]["detected_state"] | null
          dosha?: string | null
          id?: string
          message?: string | null
          severity_score?: number | null
          suggested_practice_types?: Json | null
          user_id: string
          warm_response?: string | null
        }
        Update: {
          assigned_level?: number | null
          created_at?: string
          detected_state?: Database["public"]["Enums"]["detected_state"] | null
          dosha?: string | null
          id?: string
          message?: string | null
          severity_score?: number | null
          suggested_practice_types?: Json | null
          user_id?: string
          warm_response?: string | null
        }
        Relationships: []
      }
      practices: {
        Row: {
          created_at: string
          estimated_minutes: number
          id: string
          level_1: string
          level_2: string
          level_3: string
          state: Database["public"]["Enums"]["detected_state"]
          system: Database["public"]["Enums"]["practice_system"]
          title: string
          why_it_works: string
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number
          id?: string
          level_1: string
          level_2: string
          level_3: string
          state: Database["public"]["Enums"]["detected_state"]
          system: Database["public"]["Enums"]["practice_system"]
          title: string
          why_it_works: string
        }
        Update: {
          created_at?: string
          estimated_minutes?: number
          id?: string
          level_1?: string
          level_2?: string
          level_3?: string
          state?: Database["public"]["Enums"]["detected_state"]
          system?: Database["public"]["Enums"]["practice_system"]
          title?: string
          why_it_works?: string
        }
        Relationships: []
      }
      user_responses: {
        Row: {
          age: string | null
          chronotype: Database["public"]["Enums"]["chronotype"] | null
          chronotype_description: string | null
          chronotype_headline: string | null
          chronotype_scores: Json | null
          created_at: string
          email: string
          gender: string | null
          id: string
          name: string | null
          path: string | null
          person_type: string | null
          reflective_answers: Json
          regular_practice: string | null
          role: string | null
          sleep_general: string | null
          streak_days: number
          updated_at: string
          wellness_attitude: string | null
        }
        Insert: {
          age?: string | null
          chronotype?: Database["public"]["Enums"]["chronotype"] | null
          chronotype_description?: string | null
          chronotype_headline?: string | null
          chronotype_scores?: Json | null
          created_at?: string
          email: string
          gender?: string | null
          id?: string
          name?: string | null
          path?: string | null
          person_type?: string | null
          reflective_answers?: Json
          regular_practice?: string | null
          role?: string | null
          sleep_general?: string | null
          streak_days?: number
          updated_at?: string
          wellness_attitude?: string | null
        }
        Update: {
          age?: string | null
          chronotype?: Database["public"]["Enums"]["chronotype"] | null
          chronotype_description?: string | null
          chronotype_headline?: string | null
          chronotype_scores?: Json | null
          created_at?: string
          email?: string
          gender?: string | null
          id?: string
          name?: string | null
          path?: string | null
          person_type?: string | null
          reflective_answers?: Json
          regular_practice?: string | null
          role?: string | null
          sleep_general?: string | null
          streak_days?: number
          updated_at?: string
          wellness_attitude?: string | null
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
      chronotype: "Lion" | "Bear" | "Owl" | "Dolphin"
      detected_state: "anxiety" | "stress" | "burnout" | "overwhelm"
      practice_system: "neuro" | "ayurveda"
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
    Enums: {
      chronotype: ["Lion", "Bear", "Owl", "Dolphin"],
      detected_state: ["anxiety", "stress", "burnout", "overwhelm"],
      practice_system: ["neuro", "ayurveda"],
    },
  },
} as const
