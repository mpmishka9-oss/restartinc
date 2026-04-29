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
          didi_response: string | null
          dosha: string | null
          id: string
          level_description: string | null
          message: string | null
          practices_shown: Json | null
          severity_score: number | null
          user_id: string
        }
        Insert: {
          assigned_level?: number | null
          created_at?: string
          detected_state?: Database["public"]["Enums"]["detected_state"] | null
          didi_response?: string | null
          dosha?: string | null
          id?: string
          level_description?: string | null
          message?: string | null
          practices_shown?: Json | null
          severity_score?: number | null
          user_id: string
        }
        Update: {
          assigned_level?: number | null
          created_at?: string
          detected_state?: Database["public"]["Enums"]["detected_state"] | null
          didi_response?: string | null
          dosha?: string | null
          id?: string
          level_description?: string | null
          message?: string | null
          practices_shown?: Json | null
          severity_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          check_in_id: string | null
          created_at: string
          day_1: Json
          day_2: Json
          day_3: Json
          id: string
          user_id: string
        }
        Insert: {
          check_in_id?: string | null
          created_at?: string
          day_1?: Json
          day_2?: Json
          day_3?: Json
          id?: string
          user_id: string
        }
        Update: {
          check_in_id?: string | null
          created_at?: string
          day_1?: Json
          day_2?: Json
          day_3?: Json
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      practices: {
        Row: {
          created_at: string
          duration_mins: number
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
          duration_mins?: number
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
          duration_mins?: number
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
      profiles: {
        Row: {
          age: string | null
          chronotype: Database["public"]["Enums"]["chronotype"] | null
          chronotype_description: string | null
          chronotype_headline: string | null
          completed_practices: number
          created_at: string
          current_day: number
          email: string | null
          goal: string | null
          id: string
          journey_started_at: string | null
          name: string | null
          onboarding_answers: Json
          onboarding_completed: boolean
          path: Database["public"]["Enums"]["user_path"] | null
          streak_days: number
          updated_at: string
          whatsapp_phone: string | null
        }
        Insert: {
          age?: string | null
          chronotype?: Database["public"]["Enums"]["chronotype"] | null
          chronotype_description?: string | null
          chronotype_headline?: string | null
          completed_practices?: number
          created_at?: string
          current_day?: number
          email?: string | null
          goal?: string | null
          id: string
          journey_started_at?: string | null
          name?: string | null
          onboarding_answers?: Json
          onboarding_completed?: boolean
          path?: Database["public"]["Enums"]["user_path"] | null
          streak_days?: number
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Update: {
          age?: string | null
          chronotype?: Database["public"]["Enums"]["chronotype"] | null
          chronotype_description?: string | null
          chronotype_headline?: string | null
          completed_practices?: number
          created_at?: string
          current_day?: number
          email?: string | null
          goal?: string | null
          id?: string
          journey_started_at?: string | null
          name?: string | null
          onboarding_answers?: Json
          onboarding_completed?: boolean
          path?: Database["public"]["Enums"]["user_path"] | null
          streak_days?: number
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      chronotype: "lion" | "bear" | "wolf" | "dolphin"
      detected_state: "anxiety" | "stress" | "burnout" | "overwhelm" | "peak"
      practice_system: "neuro" | "ayurveda" | "peak"
      user_path: "ambitious" | "emotional"
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
      chronotype: ["lion", "bear", "wolf", "dolphin"],
      detected_state: ["anxiety", "stress", "burnout", "overwhelm", "peak"],
      practice_system: ["neuro", "ayurveda", "peak"],
      user_path: ["ambitious", "emotional"],
    },
  },
} as const
