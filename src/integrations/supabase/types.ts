export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      characters: {
        Row: {
          alerted: boolean | null
          created_at: string | null
          dialogue_background_url: string | null
          expression_state: string | null
          id: string
          investigation_id: string | null
          knowledge: string
          location_description: string | null
          name: string
          personality: Json
          position: Json
          reputation_score: number | null
          role: string
          sprite: string | null
        }
        Insert: {
          alerted?: boolean | null
          created_at?: string | null
          dialogue_background_url?: string | null
          expression_state?: string | null
          id?: string
          investigation_id?: string | null
          knowledge?: string
          location_description?: string | null
          name: string
          personality?: Json
          position?: Json
          reputation_score?: number | null
          role: string
          sprite?: string | null
        }
        Update: {
          alerted?: boolean | null
          created_at?: string | null
          dialogue_background_url?: string | null
          expression_state?: string | null
          id?: string
          investigation_id?: string | null
          knowledge?: string
          location_description?: string | null
          name?: string
          personality?: Json
          position?: Json
          reputation_score?: number | null
          role?: string
          sprite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
        ]
      }
      cloudinary_assets: {
        Row: {
          asset_name: string
          asset_type: string
          character_id: string | null
          cloudinary_public_id: string
          cloudinary_url: string
          created_at: string | null
          id: string
          investigation_id: string | null
          location_context: string | null
        }
        Insert: {
          asset_name: string
          asset_type: string
          character_id?: string | null
          cloudinary_public_id: string
          cloudinary_url: string
          created_at?: string | null
          id?: string
          investigation_id?: string | null
          location_context?: string | null
        }
        Update: {
          asset_name?: string
          asset_type?: string
          character_id?: string | null
          cloudinary_public_id?: string
          cloudinary_url?: string
          created_at?: string | null
          id?: string
          investigation_id?: string | null
          location_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cloudinary_assets_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloudinary_assets_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
        ]
      }
      dialog_history: {
        Row: {
          character_id: string | null
          character_reply: string
          clickable_keywords: string[] | null
          created_at: string | null
          id: string
          investigation_id: string | null
          reputation_impact: number | null
          timestamp: string | null
          truth_likelihood: number | null
          user_input: string
        }
        Insert: {
          character_id?: string | null
          character_reply: string
          clickable_keywords?: string[] | null
          created_at?: string | null
          id?: string
          investigation_id?: string | null
          reputation_impact?: number | null
          timestamp?: string | null
          truth_likelihood?: number | null
          user_input: string
        }
        Update: {
          character_id?: string | null
          character_reply?: string
          clickable_keywords?: string[] | null
          created_at?: string | null
          id?: string
          investigation_id?: string | null
          reputation_impact?: number | null
          timestamp?: string | null
          truth_likelihood?: number | null
          user_input?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialog_history_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialog_history_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
        ]
      }
      dialogs: {
        Row: {
          character_id: string | null
          character_reply: string
          clickable_keywords: Json | null
          id: string
          investigation_id: string | null
          reputation_impact: number | null
          timestamp: string | null
          truth_likelihood: number | null
          user_input: string
        }
        Insert: {
          character_id?: string | null
          character_reply: string
          clickable_keywords?: Json | null
          id?: string
          investigation_id?: string | null
          reputation_impact?: number | null
          timestamp?: string | null
          truth_likelihood?: number | null
          user_input: string
        }
        Update: {
          character_id?: string | null
          character_reply?: string
          clickable_keywords?: Json | null
          id?: string
          investigation_id?: string | null
          reputation_impact?: number | null
          timestamp?: string | null
          truth_likelihood?: number | null
          user_input?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialogs_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialogs_investigation_ud_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_data: {
        Row: {
          created_at: string
          created_by: string | null
          efficiency_percentage: number | null
          equipment_id: string
          equipment_name: string
          equipment_type: string
          id: string
          last_maintenance: string | null
          location: string | null
          next_maintenance: string | null
          operating_hours: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          efficiency_percentage?: number | null
          equipment_id: string
          equipment_name: string
          equipment_type: string
          id?: string
          last_maintenance?: string | null
          location?: string | null
          next_maintenance?: string | null
          operating_hours?: number | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          efficiency_percentage?: number | null
          equipment_id?: string
          equipment_name?: string
          equipment_type?: string
          id?: string
          last_maintenance?: string | null
          location?: string | null
          next_maintenance?: string | null
          operating_hours?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_saves: {
        Row: {
          created_at: string | null
          game_state: Json
          id: string
          investigation_id: string | null
          last_played_at: string | null
          player_name: string | null
          player_position: Json
          player_role: string | null
        }
        Insert: {
          created_at?: string | null
          game_state?: Json
          id?: string
          investigation_id?: string | null
          last_played_at?: string | null
          player_name?: string | null
          player_position?: Json
          player_role?: string | null
        }
        Update: {
          created_at?: string | null
          game_state?: Json
          id?: string
          investigation_id?: string | null
          last_played_at?: string | null
          player_name?: string | null
          player_position?: Json
          player_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_saves_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_assets: {
        Row: {
          asset_name: string
          asset_type: string
          created_at: string | null
          id: string
          image_url: string
          investigation_id: string | null
          prompt: string
        }
        Insert: {
          asset_name: string
          asset_type: string
          created_at?: string | null
          id?: string
          image_url: string
          investigation_id?: string | null
          prompt: string
        }
        Update: {
          asset_name?: string
          asset_type?: string
          created_at?: string | null
          id?: string
          image_url?: string
          investigation_id?: string | null
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_assets_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
        ]
      }
      investigation_assets: {
        Row: {
          asset_name: string
          asset_type: string
          asset_url: string
          created_at: string | null
          id: string
          investigation_id: string | null
        }
        Insert: {
          asset_name: string
          asset_type: string
          asset_url: string
          created_at?: string | null
          id?: string
          investigation_id?: string | null
        }
        Update: {
          asset_name?: string
          asset_type?: string
          asset_url?: string
          created_at?: string | null
          id?: string
          investigation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investigation_assets_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
        ]
      }
      investigations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          player_image_url: string | null
          player_role: string | null
          prompt: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          player_image_url?: string | null
          player_role?: string | null
          prompt: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          player_image_url?: string | null
          player_role?: string | null
          prompt?: string
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          confidence_level: number | null
          description: string
          discovered_at: string | null
          id: string
          investigation_id: string | null
          resolved: boolean | null
          source_pnj: string | null
        }
        Insert: {
          confidence_level?: number | null
          description: string
          discovered_at?: string | null
          id?: string
          investigation_id?: string | null
          resolved?: boolean | null
          source_pnj?: string | null
        }
        Update: {
          confidence_level?: number | null
          description?: string
          discovered_at?: string | null
          id?: string
          investigation_id?: string | null
          resolved?: boolean | null
          source_pnj?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_pnj_fkey"
            columns: ["source_pnj"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      product_quality_data: {
        Row: {
          batch_number: string
          created_at: string
          created_by: string | null
          density: number | null
          id: string
          octane_rating: number | null
          product_name: string
          quality_status: string | null
          sulfur_content: number | null
          test_date: string
          updated_at: string
          viscosity: number | null
        }
        Insert: {
          batch_number: string
          created_at?: string
          created_by?: string | null
          density?: number | null
          id?: string
          octane_rating?: number | null
          product_name: string
          quality_status?: string | null
          sulfur_content?: number | null
          test_date: string
          updated_at?: string
          viscosity?: number | null
        }
        Update: {
          batch_number?: string
          created_at?: string
          created_by?: string | null
          density?: number | null
          id?: string
          octane_rating?: number | null
          product_name?: string
          quality_status?: string | null
          sulfur_content?: number | null
          test_date?: string
          updated_at?: string
          viscosity?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shutdown_startup_events: {
        Row: {
          created_at: string
          created_by: string | null
          duration_hours: number | null
          end_time: string | null
          event_type: string
          id: string
          impact_level: string | null
          reason: string | null
          start_time: string
          status: string
          unit_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration_hours?: number | null
          end_time?: string | null
          event_type: string
          id?: string
          impact_level?: string | null
          reason?: string | null
          start_time: string
          status: string
          unit_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration_hours?: number | null
          end_time?: string | null
          event_type?: string
          id?: string
          impact_level?: string | null
          reason?: string | null
          start_time?: string
          status?: string
          unit_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          module: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_treatment_data: {
        Row: {
          created_at: string
          created_by: string | null
          equipment_name: string
          flow_rate: number | null
          id: string
          ph_level: number | null
          pressure: number | null
          status: string | null
          temperature: number | null
          timestamp: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          equipment_name: string
          flow_rate?: number | null
          id?: string
          ph_level?: number | null
          pressure?: number | null
          status?: string | null
          temperature?: number | null
          timestamp?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          equipment_name?: string
          flow_rate?: number | null
          id?: string
          ph_level?: number | null
          pressure?: number | null
          status?: string | null
          temperature?: number | null
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _module?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "supervisor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operator", "supervisor", "viewer"],
    },
  },
} as const
