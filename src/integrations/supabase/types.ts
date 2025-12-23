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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_sessions: {
        Row: {
          applied_operations: Json
          completed_at: string | null
          created_at: string
          id: string
          iteration_count: number
          max_iterations: number
          original_request: string
          pending_operations: Json
          project_id: string
          started_at: string
          status: string
          steps: Json
          thinking: string | null
          user_id: string
        }
        Insert: {
          applied_operations?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          iteration_count?: number
          max_iterations?: number
          original_request: string
          pending_operations?: Json
          project_id: string
          started_at?: string
          status?: string
          steps?: Json
          thinking?: string | null
          user_id: string
        }
        Update: {
          applied_operations?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          iteration_count?: number
          max_iterations?: number
          original_request?: string
          pending_operations?: Json
          project_id?: string
          started_at?: string
          status?: string
          steps?: Json
          thinking?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          stripe_session_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          stripe_session_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          stripe_session_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_purchased: number
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          conversation_id: string | null
          created_at: string
          credits_used: number
          function_name: string
          id: string
          model: string
          tokens_input: number
          tokens_output: number
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          credits_used?: number
          function_name: string
          id?: string
          model: string
          tokens_input?: number
          tokens_output?: number
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          credits_used?: number
          function_name?: string
          id?: string
          model?: string
          tokens_input?: number
          tokens_output?: number
          user_id?: string
        }
        Relationships: []
      }
      builder_conversations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          project_id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          project_id: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          error_context: Json | null
          id: string
          is_applied: boolean | null
          operations: Json | null
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          error_context?: Json | null
          id?: string
          is_applied?: boolean | null
          operations?: Json | null
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          error_context?: Json | null
          id?: string
          is_applied?: boolean | null
          operations?: Json | null
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "builder_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_projects: {
        Row: {
          created_at: string
          description: string | null
          framework: string | null
          id: string
          is_public: boolean | null
          name: string
          settings: Json | null
          template: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          settings?: Json | null
          template?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          settings?: Json | null
          template?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      component_installations: {
        Row: {
          component_id: string
          id: string
          installed_at: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          component_id: string
          id?: string
          installed_at?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          component_id?: string
          id?: string
          installed_at?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_installations_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "marketplace_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "component_installations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      component_likes: {
        Row: {
          component_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          component_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          component_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_likes_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "marketplace_components"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          responded_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          responded_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          responded_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
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
      custom_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          project_id: string
          redirect_www: boolean | null
          ssl_issued_at: string | null
          ssl_status: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          verification_token: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          project_id: string
          redirect_www?: boolean | null
          ssl_issued_at?: string | null
          ssl_status?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_token?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          project_id?: string
          redirect_www?: boolean | null
          ssl_issued_at?: string | null
          ssl_status?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_token?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_env_vars: {
        Row: {
          created_at: string
          environment: string
          id: string
          is_secret: boolean
          key: string
          project_id: string
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          is_secret?: boolean
          key: string
          project_id: string
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          is_secret?: boolean
          key?: string
          project_id?: string
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_env_vars_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deployments: {
        Row: {
          build_duration_ms: number | null
          build_log: string | null
          bundle_size_bytes: number | null
          commit_message: string | null
          completed_at: string | null
          created_at: string | null
          deploy_url: string | null
          environment: string
          file_count: number | null
          id: string
          project_id: string
          started_at: string | null
          status: string
          subdomain: string | null
          user_id: string
          version: number
        }
        Insert: {
          build_duration_ms?: number | null
          build_log?: string | null
          bundle_size_bytes?: number | null
          commit_message?: string | null
          completed_at?: string | null
          created_at?: string | null
          deploy_url?: string | null
          environment?: string
          file_count?: number | null
          id?: string
          project_id: string
          started_at?: string | null
          status?: string
          subdomain?: string | null
          user_id: string
          version?: number
        }
        Update: {
          build_duration_ms?: number | null
          build_log?: string | null
          bundle_size_bytes?: number | null
          commit_message?: string | null
          completed_at?: string | null
          created_at?: string | null
          deploy_url?: string | null
          environment?: string
          file_count?: number | null
          id?: string
          project_id?: string
          started_at?: string | null
          status?: string
          subdomain?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "deployments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      design_systems: {
        Row: {
          border_radius: Json
          colors: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          project_id: string | null
          shadows: Json
          spacing: Json
          typography: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          border_radius?: Json
          colors?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          project_id?: string | null
          shadows?: Json
          spacing?: Json
          typography?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          border_radius?: Json
          colors?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          project_id?: string | null
          shadows?: Json
          spacing?: Json
          typography?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_systems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          column_number: number | null
          created_at: string | null
          error_type: string
          file_path: string | null
          id: string
          is_resolved: boolean | null
          line_number: number | null
          message: string
          project_id: string
          resolution_message_id: string | null
          stack_trace: string | null
        }
        Insert: {
          column_number?: number | null
          created_at?: string | null
          error_type: string
          file_path?: string | null
          id?: string
          is_resolved?: boolean | null
          line_number?: number | null
          message: string
          project_id: string
          resolution_message_id?: string | null
          stack_trace?: string | null
        }
        Update: {
          column_number?: number | null
          created_at?: string | null
          error_type?: string
          file_path?: string | null
          id?: string
          is_resolved?: boolean | null
          line_number?: number | null
          message?: string
          project_id?: string
          resolution_message_id?: string | null
          stack_trace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_resolution_message_id_fkey"
            columns: ["resolution_message_id"]
            isOneToOne: false
            referencedRelation: "builder_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      file_versions: {
        Row: {
          content: string
          created_at: string
          file_id: string
          id: string
          message: string | null
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string
          file_id: string
          id?: string
          message?: string | null
          version_number?: number
        }
        Update: {
          content?: string
          created_at?: string
          file_id?: string
          id?: string
          message?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "project_files"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_assets: {
        Row: {
          aspect_ratio: string | null
          asset_type: string
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          is_favorite: boolean | null
          metadata: Json | null
          mime_type: string | null
          project_id: string | null
          prompt: string
          storage_path: string
          storage_url: string
          style: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          aspect_ratio?: string | null
          asset_type?: string
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          project_id?: string | null
          prompt: string
          storage_path: string
          storage_url: string
          style?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          aspect_ratio?: string | null
          asset_type?: string
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          project_id?: string | null
          prompt?: string
          storage_path?: string
          storage_url?: string
          style?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      github_commits: {
        Row: {
          author_email: string | null
          author_name: string | null
          commit_message: string | null
          commit_sha: string
          committed_at: string | null
          direction: string
          files_changed: number | null
          id: string
          project_repo_id: string
          synced_at: string | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          commit_message?: string | null
          commit_sha: string
          committed_at?: string | null
          direction: string
          files_changed?: number | null
          id?: string
          project_repo_id: string
          synced_at?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          commit_message?: string | null
          commit_sha?: string
          committed_at?: string | null
          direction?: string
          files_changed?: number | null
          id?: string
          project_repo_id?: string
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "github_commits_project_repo_id_fkey"
            columns: ["project_repo_id"]
            isOneToOne: false
            referencedRelation: "project_repos"
            referencedColumns: ["id"]
          },
        ]
      }
      github_connections: {
        Row: {
          access_token: string
          avatar_url: string | null
          created_at: string | null
          github_user_id: string
          github_username: string
          id: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          avatar_url?: string | null
          created_at?: string | null
          github_user_id: string
          github_username: string
          id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          avatar_url?: string | null
          created_at?: string | null
          github_user_id?: string
          github_username?: string
          id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_alerts: {
        Row: {
          alert_type: string
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: string
          is_dismissed: boolean | null
          is_read: boolean | null
          location_id: string | null
          user_id: string
        }
        Insert: {
          alert_type?: string
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          location_id?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          location_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_alerts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "user_login_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      marketplace_components: {
        Row: {
          author_id: string
          category: string
          code: string
          created_at: string | null
          dependencies: Json | null
          description: string | null
          downloads: number | null
          id: string
          is_public: boolean | null
          likes: number | null
          name: string
          preview_image_url: string | null
          props_schema: Json | null
          tags: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          author_id: string
          category?: string
          code: string
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          downloads?: number | null
          id?: string
          is_public?: boolean | null
          likes?: number | null
          name: string
          preview_image_url?: string | null
          props_schema?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          author_id?: string
          category?: string
          code?: string
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          downloads?: number | null
          id?: string
          is_public?: boolean | null
          likes?: number | null
          name?: string
          preview_image_url?: string | null
          props_schema?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_helpful: boolean | null
          is_pinned: boolean | null
          is_read: boolean | null
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
          is_read?: boolean | null
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
          is_read?: boolean | null
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
          onboarding_completed: boolean | null
          preferences: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      project_analysis: {
        Row: {
          component_map: Json | null
          created_at: string | null
          dependency_graph: Json | null
          id: string
          import_map: Json | null
          last_analyzed_at: string | null
          project_id: string
          type_definitions: Json | null
          updated_at: string | null
        }
        Insert: {
          component_map?: Json | null
          created_at?: string | null
          dependency_graph?: Json | null
          id?: string
          import_map?: Json | null
          last_analyzed_at?: string | null
          project_id: string
          type_definitions?: Json | null
          updated_at?: string | null
        }
        Update: {
          component_map?: Json | null
          created_at?: string | null
          dependency_graph?: Json | null
          id?: string
          import_map?: Json | null
          last_analyzed_at?: string | null
          project_id?: string
          type_definitions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_entry_point: boolean | null
          language: string | null
          metadata: Json | null
          name: string
          path: string
          project_id: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_entry_point?: boolean | null
          language?: string | null
          metadata?: Json | null
          name: string
          path: string
          project_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_entry_point?: boolean | null
          language?: string | null
          metadata?: Json | null
          name?: string
          path?: string
          project_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_repos: {
        Row: {
          created_at: string | null
          default_branch: string | null
          github_connection_id: string
          id: string
          last_commit_sha: string | null
          last_synced_at: string | null
          project_id: string
          repo_full_name: string | null
          repo_name: string
          repo_owner: string
          sync_status: string | null
        }
        Insert: {
          created_at?: string | null
          default_branch?: string | null
          github_connection_id: string
          id?: string
          last_commit_sha?: string | null
          last_synced_at?: string | null
          project_id: string
          repo_full_name?: string | null
          repo_name: string
          repo_owner: string
          sync_status?: string | null
        }
        Update: {
          created_at?: string | null
          default_branch?: string | null
          github_connection_id?: string
          id?: string
          last_commit_sha?: string | null
          last_synced_at?: string | null
          project_id?: string
          repo_full_name?: string | null
          repo_name?: string
          repo_owner?: string
          sync_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_repos_github_connection_id_fkey"
            columns: ["github_connection_id"]
            isOneToOne: false
            referencedRelation: "github_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_repos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
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
      shared_templates: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          share_code: string
          shared_by_user_id: string
          template_category: string
          template_content: string
          template_description: string | null
          template_name: string
          template_variables: string[] | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          share_code: string
          shared_by_user_id: string
          template_category?: string
          template_content: string
          template_description?: string | null
          template_name: string
          template_variables?: string[] | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          share_code?: string
          shared_by_user_id?: string
          template_category?: string
          template_content?: string
          template_description?: string | null
          template_name?: string
          template_variables?: string[] | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          processed_at: string
          stripe_event_id: string
          subscription_id: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          processed_at?: string
          stripe_event_id: string
          subscription_id?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          processed_at?: string
          stripe_event_id?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
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
      user_login_locations: {
        Row: {
          city: string | null
          country: string | null
          country_code: string | null
          first_seen_at: string
          id: string
          ip_address: string
          is_trusted: boolean | null
          isp: string | null
          last_seen_at: string
          latitude: number | null
          login_count: number | null
          longitude: number | null
          region: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          first_seen_at?: string
          id?: string
          ip_address: string
          is_trusted?: boolean | null
          isp?: string | null
          last_seen_at?: string
          latitude?: number | null
          login_count?: number | null
          longitude?: number | null
          region?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          first_seen_at?: string
          id?: string
          ip_address?: string
          is_trusted?: boolean | null
          isp?: string | null
          last_seen_at?: string
          latitude?: number | null
          login_count?: number | null
          longitude?: number | null
          region?: string | null
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
      check_account_lockout: { Args: { p_email: string }; Returns: Json }
      generate_subdomain: {
        Args: { project_id: string; project_name: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_login_attempt: {
        Args: { p_email: string; p_ip_address?: string; p_success: boolean }
        Returns: undefined
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
