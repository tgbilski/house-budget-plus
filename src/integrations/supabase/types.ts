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
      blog_posts: {
        Row: {
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published: boolean
          published_at: string | null
          read_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_data: {
        Row: {
          calculator_id: string
          created_at: string
          expenses: Json | null
          household_id: string | null
          id: string
          income: number | null
          page_type: string
          project_id: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          calculator_id: string
          created_at?: string
          expenses?: Json | null
          household_id?: string | null
          id?: string
          income?: number | null
          page_type: string
          project_id?: string | null
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          calculator_id?: string
          created_at?: string
          expenses?: Json | null
          household_id?: string | null
          id?: string
          income?: number | null
          page_type?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_data_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          current_progress: number | null
          description: string | null
          end_date: string | null
          household_id: string | null
          id: string
          reward_badge: string | null
          start_date: string
          status: string
          target_amount: number | null
          target_days: number | null
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          challenge_type: string
          created_at?: string
          current_progress?: number | null
          description?: string | null
          end_date?: string | null
          household_id?: string | null
          id?: string
          reward_badge?: string | null
          start_date?: string
          status?: string
          target_amount?: number | null
          target_days?: number | null
          title: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          challenge_type?: string
          created_at?: string
          current_progress?: number | null
          description?: string | null
          end_date?: string | null
          household_id?: string | null
          id?: string
          reward_badge?: string | null
          start_date?: string
          status?: string
          target_amount?: number | null
          target_days?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string
          date: string
          description: string | null
          household_id: string | null
          id: string
          mood_score: number | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          household_id?: string | null
          id?: string
          mood_score?: number | null
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          household_id?: string | null
          id?: string
          mood_score?: number | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          household_id: string
          id: string
          merchant: string | null
          notes: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          household_id: string
          id?: string
          merchant?: string | null
          notes?: string | null
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          household_id?: string
          id?: string
          merchant?: string | null
          notes?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      gift_items: {
        Row: {
          category: string | null
          created_at: string
          gift_idea: string | null
          id: string
          list_id: string
          notes: string | null
          price: number | null
          priority: string | null
          purchased_at: string | null
          quantity: number | null
          quantity_purchased: number | null
          status: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          gift_idea?: string | null
          id?: string
          list_id: string
          notes?: string | null
          price?: number | null
          priority?: string | null
          purchased_at?: string | null
          quantity?: number | null
          quantity_purchased?: number | null
          status?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          gift_idea?: string | null
          id?: string
          list_id?: string
          notes?: string | null
          price?: number | null
          priority?: string | null
          purchased_at?: string | null
          quantity?: number | null
          quantity_purchased?: number | null
          status?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      gift_lists: {
        Row: {
          budget_target: number | null
          created_at: string
          event_date: string | null
          household_id: string | null
          id: string
          list_title: string
          one_week_alert_dismissed: boolean | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          budget_target?: number | null
          created_at?: string
          event_date?: string | null
          household_id?: string | null
          id?: string
          list_title?: string
          one_week_alert_dismissed?: boolean | null
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          budget_target?: number | null
          created_at?: string
          event_date?: string | null
          household_id?: string | null
          id?: string
          list_title?: string
          one_week_alert_dismissed?: boolean | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "gift_lists_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          created_at: string
          gift_idea: string | null
          household_id: string | null
          id: string
          link: string | null
          notes: string | null
          occasion: string
          price: number | null
          purchased: boolean | null
          recipient: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          gift_idea?: string | null
          household_id?: string | null
          id?: string
          link?: string | null
          notes?: string | null
          occasion: string
          price?: number | null
          purchased?: boolean | null
          recipient: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          gift_idea?: string | null
          household_id?: string | null
          id?: string
          link?: string | null
          notes?: string | null
          occasion?: string
          price?: number | null
          purchased?: boolean | null
          recipient?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "gifts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_invites: {
        Row: {
          created_at: string
          expires_at: string
          household_id: string
          id: string
          invited_by: string
          invited_email: string
          invited_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          household_id: string
          id?: string
          invited_by: string
          invited_email: string
          invited_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          household_id?: string
          id?: string
          invited_by?: string
          invited_email?: string
          invited_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          can_edit: boolean
          can_view: boolean
          created_at: string
          household_id: string
          id: string
          joined_at: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          household_id: string
          id?: string
          joined_at?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          household_id?: string
          id?: string
          joined_at?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
          originator_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          originator_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          originator_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          category: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          image_urls: string[] | null
          location_address: string | null
          location_city: string | null
          location_country: string | null
          location_latitude: number | null
          location_longitude: number | null
          location_state: string | null
          moderation_result: Json | null
          price: number | null
          rejection_reason: string | null
          report_count: number
          status: string
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          category: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          image_urls?: string[] | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_state?: string | null
          moderation_result?: Json | null
          price?: number | null
          rejection_reason?: string | null
          report_count?: number
          status?: string
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          image_urls?: string[] | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_state?: string | null
          moderation_result?: Json | null
          price?: number | null
          rejection_reason?: string | null
          report_count?: number
          status?: string
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
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
          household_id: string | null
          id: string
          processed_at: string | null
          processing_error: string | null
          processing_status: string
          user_id: string | null
          year: number
        }
        Insert: {
          ai_categorization?: Json | null
          created_at?: string
          extracted_text?: string | null
          file_name: string
          file_size?: number | null
          household_id?: string | null
          id?: string
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          user_id?: string | null
          year?: number
        }
        Update: {
          ai_categorization?: Json | null
          created_at?: string
          extracted_text?: string | null
          file_name?: string
          file_size?: number | null
          household_id?: string | null
          id?: string
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "pdf_processing_logs_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_household_id: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_household_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_household_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_household_id_fkey"
            columns: ["current_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_entries: {
        Row: {
          amount: number
          created_at: string
          entry_month: string
          goal_id: string
          id: string
          notes: string | null
          updated_at: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          entry_month: string
          goal_id: string
          id?: string
          notes?: string | null
          updated_at?: string
          year?: number
        }
        Update: {
          amount?: number
          created_at?: string
          entry_month?: string
          goal_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "savings_entries_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          current_amount: number
          description: string | null
          goal_number: number
          household_id: string | null
          id: string
          image_url: string | null
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_amount?: number
          description?: string | null
          goal_number: number
          household_id?: string | null
          id?: string
          image_url?: string | null
          target_amount?: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          current_amount?: number
          description?: string | null
          goal_number?: number
          household_id?: string | null
          id?: string
          image_url?: string | null
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          ai_queries_count: number | null
          ai_queries_reset_date: string | null
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
          ai_queries_count?: number | null
          ai_queries_reset_date?: string | null
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
          ai_queries_count?: number | null
          ai_queries_reset_date?: string | null
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
      user_badges: {
        Row: {
          badge_type: string
          created_at: string
          earned_at: string
          household_id: string | null
          id: string
          user_id: string
          year: number
        }
        Insert: {
          badge_type: string
          created_at?: string
          earned_at?: string
          household_id?: string | null
          id?: string
          user_id: string
          year?: number
        }
        Update: {
          badge_type?: string
          created_at?: string
          earned_at?: string
          household_id?: string | null
          id?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      user_insights: {
        Row: {
          created_at: string
          data: Json | null
          description: string
          household_id: string | null
          id: string
          insight_type: string
          is_read: boolean | null
          priority: number | null
          title: string
          user_id: string
          valid_until: string | null
          year: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          description: string
          household_id?: string | null
          id?: string
          insight_type: string
          is_read?: boolean | null
          priority?: number | null
          title: string
          user_id: string
          valid_until?: string | null
          year?: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          description?: string
          household_id?: string | null
          id?: string
          insight_type?: string
          is_read?: boolean | null
          priority?: number | null
          title?: string
          user_id?: string
          valid_until?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_insights_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          reason: string
          reporter_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          reason: string
          reporter_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          reason?: string
          reporter_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
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
          household_id: string | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_type: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          household_id?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          household_id?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_options: {
        Row: {
          car_rental_cost: number | null
          contact: string | null
          created_at: string
          destination: string | null
          destination_safe: boolean | null
          everyone_enjoy: boolean | null
          exciting_option: boolean | null
          favorable_travel: boolean | null
          id: string
          lodging_cost: number | null
          memorable: boolean | null
          notes: string | null
          project_id: string
          travel_mode: string | null
          travel_mode_cost: number | null
          updated_at: string
          user_id: string
          vacation_number: number
          year: number
        }
        Insert: {
          car_rental_cost?: number | null
          contact?: string | null
          created_at?: string
          destination?: string | null
          destination_safe?: boolean | null
          everyone_enjoy?: boolean | null
          exciting_option?: boolean | null
          favorable_travel?: boolean | null
          id?: string
          lodging_cost?: number | null
          memorable?: boolean | null
          notes?: string | null
          project_id: string
          travel_mode?: string | null
          travel_mode_cost?: number | null
          updated_at?: string
          user_id: string
          vacation_number: number
          year?: number
        }
        Update: {
          car_rental_cost?: number | null
          contact?: string | null
          created_at?: string
          destination?: string | null
          destination_safe?: boolean | null
          everyone_enjoy?: boolean | null
          exciting_option?: boolean | null
          favorable_travel?: boolean | null
          id?: string
          lodging_cost?: number | null
          memorable?: boolean | null
          notes?: string | null
          project_id?: string
          travel_mode?: string | null
          travel_mode_cost?: number | null
          updated_at?: string
          user_id?: string
          vacation_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vacation_options_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vacation_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_projects: {
        Row: {
          created_at: string
          household_id: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
          vacation_number: number | null
          year: number
        }
        Insert: {
          created_at?: string
          household_id?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
          vacation_number?: number | null
          year?: number
        }
        Update: {
          created_at?: string
          household_id?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          vacation_number?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vacation_projects_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_projects: {
        Row: {
          created_at: string
          household_id: string | null
          id: string
          project_number: number | null
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          household_id?: string | null
          id?: string
          project_number?: number | null
          title: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          household_id?: string | null
          id?: string
          project_number?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_projects_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_quotes: {
        Row: {
          contact_info: string | null
          created_at: string
          date_received: string | null
          estimate_amount: number | null
          good_timing: boolean | null
          id: string
          liked_sales_rep: boolean | null
          notes: string | null
          offers_financing: boolean | null
          project_id: string
          responsive: boolean | null
          trustworthy: boolean | null
          updated_at: string
          vendor_name: string | null
          year: number
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          date_received?: string | null
          estimate_amount?: number | null
          good_timing?: boolean | null
          id?: string
          liked_sales_rep?: boolean | null
          notes?: string | null
          offers_financing?: boolean | null
          project_id: string
          responsive?: boolean | null
          trustworthy?: boolean | null
          updated_at?: string
          vendor_name?: string | null
          year?: number
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          date_received?: string | null
          estimate_amount?: number | null
          good_timing?: boolean | null
          id?: string
          liked_sales_rep?: boolean | null
          notes?: string | null
          offers_financing?: boolean | null
          project_id?: string
          responsive?: boolean | null
          trustworthy?: boolean | null
          updated_at?: string
          vendor_name?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vendor_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_household_invite: {
        Args: { _invite_id: string }
        Returns: boolean
      }
      check_and_increment_ai_usage: {
        Args: { _user_id: string }
        Returns: Json
      }
      delete_user_account: { Args: { _user_id: string }; Returns: boolean }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_household_originator: {
        Args: { _household_id: string; _user_id: string }
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
      user_household_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      user_role_type: "general" | "admin"
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
      user_role_type: ["general", "admin"],
    },
  },
} as const
