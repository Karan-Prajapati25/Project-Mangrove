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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_type: string
          created_at: string | null
          description: string | null
          earned: boolean | null
          earned_at: string | null
          id: string
          progress: number | null
          target: number
          title: string
          user_id: string
        }
        Insert: {
          badge_type: string
          created_at?: string | null
          description?: string | null
          earned?: boolean | null
          earned_at?: string | null
          id?: string
          progress?: number | null
          target: number
          title: string
          user_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          description?: string | null
          earned?: boolean | null
          earned_at?: string | null
          id?: string
          progress?: number | null
          target?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          is_super_admin: boolean | null
          organization_name: string
          organization_type: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          is_super_admin?: boolean | null
          organization_name: string
          organization_type: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          is_super_admin?: boolean | null
          organization_name?: string
          organization_type?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      coins: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          duration: string | null
          id: string
          lessons: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration?: string | null
          id?: string
          lessons?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration?: string | null
          id?: string
          lessons?: number | null
          title?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          category: string
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          id: string
          points: number | null
          rank: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          points?: number | null
          rank?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          points?: number | null
          rank?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          id: string
          questions: number | null
          time_limit: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          id?: string
          questions?: number | null
          time_limit?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          questions?: number | null
          time_limit?: number | null
          title?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string
          incident_type: string
          latitude: number | null
          location: string | null
          longitude: number | null
          severity: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          incident_type: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          severity: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          incident_type?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          severity?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          category: string
          cost_in_coins: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          stock_quantity: number | null
        }
        Insert: {
          category: string
          cost_in_coins: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          stock_quantity?: number | null
        }
        Update: {
          category?: string
          cost_in_coins?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          stock_quantity?: number | null
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          created_at: string | null
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_scores: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_scores_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          coins_spent: number
          id: string
          purchase_date: string
          reward_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          coins_spent: number
          id?: string
          purchase_date?: string
          reward_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          coins_spent?: number
          id?: string
          purchase_date?: string
          reward_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_coin_amount_for_severity: {
        Args: { severity_level: string }
        Returns: number
      }
      is_super_admin: {
        Args: { user_email: string }
        Returns: boolean
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
