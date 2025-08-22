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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      budget_data: {
        Row: {
          calculator_id: string
          created_at: string
          expenses: Json | null
          id: string
          income: number | null
          page_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calculator_id: string
          created_at?: string
          expenses?: Json | null
          id?: string
          income?: number | null
          page_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calculator_id?: string
          created_at?: string
          expenses?: Json | null
          id?: string
          income?: number | null
          page_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          current_progress: number | null
          description: string | null
          end_date: string | null
          id: string
          reward_badge: string | null
          start_date: string
          status: string
          target_amount: number | null
          target_days: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          current_progress?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          reward_badge?: string | null
          start_date?: string
          status?: string
          target_amount?: number | null
          target_days?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          current_progress?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          reward_badge?: string | null
          start_date?: string
          status?: string
          target_amount?: number | null
          target_days?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          mood_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          mood_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          mood_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_items: {
        Row: {
          created_at: string
          gift_idea: string | null
          id: string
          list_id: string
          price: number | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          gift_idea?: string | null
          id?: string
          list_id: string
          price?: number | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          gift_idea?: string | null
          id?: string
          list_id?: string
          price?: number | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      gift_lists: {
        Row: {
          budget_target: number | null
          created_at: string
          id: string
          list_title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_target?: number | null
          created_at?: string
          id?: string
          list_title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_target?: number | null
          created_at?: string
          id?: string
          list_title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pdf_processing_logs: {
        Row: {
          ai_categorization: Json | null
          created_at: string
          extracted_text: string | null
          file_name: string
          file_size: number | null
          id: string
          processed_at: string | null
          processing_error: string | null
          processing_status: string
          user_id: string | null
        }
        Insert: {
          ai_categorization?: Json | null
          created_at?: string
          extracted_text?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          user_id?: string | null
        }
        Update: {
          ai_categorization?: Json | null
          created_at?: string
          extracted_text?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      takeout_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          merchant: string
          pdf_source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          merchant: string
          pdf_source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          merchant?: string
          pdf_source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_type: string
          created_at: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_insights: {
        Row: {
          created_at: string
          data: Json | null
          description: string
          id: string
          insight_type: string
          is_read: boolean | null
          priority: number | null
          title: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          description: string
          id?: string
          insight_type: string
          is_read?: boolean | null
          priority?: number | null
          title: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          description?: string
          id?: string
          insight_type?: string
          is_read?: boolean | null
          priority?: number | null
          title?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: { _user_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_streak: {
        Args: {
          _activity_date?: string
          _streak_type: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
