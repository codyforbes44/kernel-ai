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
      conversations: {
        Row: {
          branch_point_message_id: string | null
          created_at: string
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          last_message_at: string | null
          lovable_project_name: string | null
          lovable_project_url: string | null
          message_count: number | null
          parent_conversation_id: string | null
          project_id: string
          summary: string | null
          tags: string[] | null
          title: string
          token_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_point_message_id?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          lovable_project_name?: string | null
          lovable_project_url?: string | null
          message_count?: number | null
          parent_conversation_id?: string | null
          project_id: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          token_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_point_message_id?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          lovable_project_name?: string | null
          lovable_project_url?: string | null
          message_count?: number | null
          parent_conversation_id?: string | null
          project_id?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          token_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_parent_conversation_id_fkey"
            columns: ["parent_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_helpful: boolean | null
          is_pinned: boolean | null
          is_starred: boolean | null
          metadata: Json | null
          model: string | null
          role: Database["public"]["Enums"]["message_role"]
          tokens_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_helpful?: boolean | null
          is_pinned?: boolean | null
          is_starred?: boolean | null
          metadata?: Json | null
          model?: string | null
          role: Database["public"]["Enums"]["message_role"]
          tokens_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_helpful?: boolean | null
          is_pinned?: boolean | null
          is_starred?: boolean | null
          metadata?: Json | null
          model?: string | null
          role?: Database["public"]["Enums"]["message_role"]
          tokens_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferences: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_archived: boolean | null
          name: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          category: Database["public"]["Enums"]["template_category"]
          content: string
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean | null
          name: string
          updated_at: string
          usage_count: number | null
          user_id: string
          variables: string[] | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["template_category"]
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
          variables?: string[] | null
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"]
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      usage_analytics: {
        Row: {
          conversations_created: number | null
          date: string
          id: string
          messages_sent: number | null
          templates_used: number | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          conversations_created?: number | null
          date?: string
          id?: string
          messages_sent?: number | null
          templates_used?: number | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          conversations_created?: number | null
          date?: string
          id?: string
          messages_sent?: number | null
          templates_used?: number | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      message_role: "user" | "assistant" | "system"
      template_category:
        | "debug"
        | "component"
        | "database"
        | "edge_function"
        | "rls"
        | "performance"
        | "ui_ux"
        | "refactor"
        | "docs"
        | "custom"
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
      app_role: ["admin", "user"],
      message_role: ["user", "assistant", "system"],
      template_category: [
        "debug",
        "component",
        "database",
        "edge_function",
        "rls",
        "performance",
        "ui_ux",
        "refactor",
        "docs",
        "custom",
      ],
    },
  },
} as const
