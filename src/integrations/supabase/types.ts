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
      boiler_config: {
        Row: {
          boiler_name: string
          boiler_number: number
          capacity: number | null
          created_at: string | null
          id: string
          location: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          boiler_name: string
          boiler_number: number
          capacity?: number | null
          created_at?: string | null
          id?: string
          location?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          boiler_name?: string
          boiler_number?: number
          capacity?: number | null
          created_at?: string | null
          id?: string
          location?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      characters: {
        Row: {
          alerted: boolean | null
          created_at: string | null
          dialog_background_url: string | null
          dialogue_background_url: string | null
          expression_state: string | null
          id: string
          image_url: string | null
          investigation_id: string | null
          is_culprit: boolean | null
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
          dialog_background_url?: string | null
          dialogue_background_url?: string | null
          expression_state?: string | null
          id?: string
          image_url?: string | null
          investigation_id?: string | null
          is_culprit?: boolean | null
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
          dialog_background_url?: string | null
          dialogue_background_url?: string | null
          expression_state?: string | null
          id?: string
          image_url?: string | null
          investigation_id?: string | null
          is_culprit?: boolean | null
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
      clues: {
        Row: {
          created_at: string | null
          description: string | null
          discovered_by: string | null
          id: string
          image_url: string | null
          investigation_id: string | null
          location: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discovered_by?: string | null
          id: string
          image_url?: string | null
          investigation_id?: string | null
          location?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discovered_by?: string | null
          id?: string
          image_url?: string | null
          investigation_id?: string | null
          location?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "clues_discovered_by_fkey"
            columns: ["discovered_by"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clues_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigations"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_standards: {
        Row: {
          created_at: string | null
          id: string
          max_value: number | null
          min_value: number | null
          parameter_name: string
          parameters: Json | null
          product_name: string
          unit: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter_name: string
          parameters?: Json | null
          product_name: string
          unit?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter_name?: string
          parameters?: Json | null
          product_name?: string
          unit?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
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
      equipment_availability_log: {
        Row: {
          availability_status: boolean
          changed_at: string | null
          changed_by: string | null
          equipment_tag: string
          id: string
          reason: string | null
        }
        Insert: {
          availability_status: boolean
          changed_at?: string | null
          changed_by?: string | null
          equipment_tag: string
          id?: string
          reason?: string | null
        }
        Update: {
          availability_status?: boolean
          changed_at?: string | null
          changed_by?: string | null
          equipment_tag?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      equipment_incidents: {
        Row: {
          cause_analysis: boolean | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          date_time: string
          deadline: string | null
          equipment_tag: string
          equipment_type: string
          id: string
          incident_type: string
          location: string
          planned_action: string
          responsible: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cause_analysis?: boolean | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date_time?: string
          deadline?: string | null
          equipment_tag: string
          equipment_type: string
          id?: string
          incident_type: string
          location: string
          planned_action: string
          responsible: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cause_analysis?: boolean | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date_time?: string
          deadline?: string | null
          equipment_tag?: string
          equipment_type?: string
          id?: string
          incident_type?: string
          location?: string
          planned_action?: string
          responsible?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_problems: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          date_time: string
          deadline: string | null
          equipment_tag: string
          equipment_type: string
          id: string
          location: string
          planned_action: string
          responsible: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date_time?: string
          deadline?: string | null
          equipment_tag: string
          equipment_type: string
          id?: string
          location: string
          planned_action: string
          responsible: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date_time?: string
          deadline?: string | null
          equipment_tag?: string
          equipment_type?: string
          id?: string
          location?: string
          planned_action?: string
          responsible?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_registry: {
        Row: {
          created_at: string | null
          created_by: string | null
          equipment_name: string
          equipment_tag: string
          equipment_type: string
          id: string
          is_available: boolean | null
          is_critical: boolean | null
          location: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          equipment_name: string
          equipment_tag: string
          equipment_type: string
          id?: string
          is_available?: boolean | null
          is_critical?: boolean | null
          location: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          equipment_name?: string
          equipment_tag?: string
          equipment_type?: string
          id?: string
          is_available?: boolean | null
          is_critical?: boolean | null
          location?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_works: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          date_planned: string
          deadline: string | null
          equipment_tag: string
          equipment_type: string
          id: string
          location: string
          planned_action: string
          responsible: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date_planned: string
          deadline?: string | null
          equipment_tag: string
          equipment_type: string
          id?: string
          location: string
          planned_action: string
          responsible: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date_planned?: string
          deadline?: string | null
          equipment_tag?: string
          equipment_type?: string
          id?: string
          location?: string
          planned_action?: string
          responsible?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      investigations: {
        Row: {
          accusation_made: boolean | null
          accusation_timestamp: string | null
          accused_character_id: string | null
          background_url: string | null
          created_at: string | null
          created_by: string | null
          culprit_character_id: string | null
          game_result: string | null
          id: string
          player_image_url: string | null
          player_role: string | null
          prompt: string
          status: string | null
          title: string
        }
        Insert: {
          accusation_made?: boolean | null
          accusation_timestamp?: string | null
          accused_character_id?: string | null
          background_url?: string | null
          created_at?: string | null
          created_by?: string | null
          culprit_character_id?: string | null
          game_result?: string | null
          id?: string
          player_image_url?: string | null
          player_role?: string | null
          prompt: string
          status?: string | null
          title: string
        }
        Update: {
          accusation_made?: boolean | null
          accusation_timestamp?: string | null
          accused_character_id?: string | null
          background_url?: string | null
          created_at?: string | null
          created_by?: string | null
          culprit_character_id?: string | null
          game_result?: string | null
          id?: string
          player_image_url?: string | null
          player_role?: string | null
          prompt?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "investigations_accused_character_id_fkey"
            columns: ["accused_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigations_culprit_character_id_fkey"
            columns: ["culprit_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          equipment_id: string | null
          id: string
          percentage_completed: number | null
          status: string | null
          task_title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          equipment_id?: string | null
          id?: string
          percentage_completed?: number | null
          status?: string | null
          task_title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          equipment_id?: string | null
          id?: string
          percentage_completed?: number | null
          status?: string | null
          task_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mixing_configurations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          mix_name: string
          primary_percentage: number
          primary_product: string
          secondary_percentage: number
          secondary_product: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          mix_name: string
          primary_percentage: number
          primary_product: string
          secondary_percentage: number
          secondary_product: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          mix_name?: string
          primary_percentage?: number
          primary_product?: string
          secondary_percentage?: number
          secondary_product?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      monthly_quality_targets: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_modifiable: boolean | null
          max_value: number | null
          min_value: number | null
          month_year: string
          parameter_name: string
          product_type: string
          target_value: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_modifiable?: boolean | null
          max_value?: number | null
          min_value?: number | null
          month_year: string
          parameter_name: string
          product_type: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_modifiable?: boolean | null
          max_value?: number | null
          min_value?: number | null
          month_year?: string
          parameter_name?: string
          product_type?: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_blends: {
        Row: {
          blend_name: string
          components: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          blend_name: string
          components: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          blend_name?: string
          components?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_quality_data: {
        Row: {
          batch_number: string
          cetane: number | null
          charge_nature: string | null
          charge_tonnage_per_hour: number | null
          color_code: string | null
          couleur: string | null
          created_at: string
          created_by: string | null
          cristallisation: number | null
          cristallisation_kero: number | null
          density: number | null
          ecoulement: number | null
          ecoulement_rsv: number | null
          evaporation_95: number | null
          flash_got: number | null
          flash_kero: number | null
          flash_kero_min: number | null
          gasoil_disposition: string | null
          id: string
          indice: number | null
          non_conformity_count: number | null
          octane_number_target: number | null
          octane_rating: number | null
          period_end: string | null
          period_start: string | null
          point_final: number | null
          point_initial: number | null
          product_name: string
          pt_90_got: number | null
          pt_trouble_got: number | null
          quality_status: string | null
          recommendations: string | null
          reformat_10: number | null
          residue_type: string | null
          sulfur_content: number | null
          test_date: string
          trouble: number | null
          tv_el: number | null
          tv_reformat: number | null
          unit_type: string | null
          updated_at: string
          viscosity: number | null
          viscosity_rsv: number | null
          yield_percentage: number | null
        }
        Insert: {
          batch_number: string
          cetane?: number | null
          charge_nature?: string | null
          charge_tonnage_per_hour?: number | null
          color_code?: string | null
          couleur?: string | null
          created_at?: string
          created_by?: string | null
          cristallisation?: number | null
          cristallisation_kero?: number | null
          density?: number | null
          ecoulement?: number | null
          ecoulement_rsv?: number | null
          evaporation_95?: number | null
          flash_got?: number | null
          flash_kero?: number | null
          flash_kero_min?: number | null
          gasoil_disposition?: string | null
          id?: string
          indice?: number | null
          non_conformity_count?: number | null
          octane_number_target?: number | null
          octane_rating?: number | null
          period_end?: string | null
          period_start?: string | null
          point_final?: number | null
          point_initial?: number | null
          product_name: string
          pt_90_got?: number | null
          pt_trouble_got?: number | null
          quality_status?: string | null
          recommendations?: string | null
          reformat_10?: number | null
          residue_type?: string | null
          sulfur_content?: number | null
          test_date: string
          trouble?: number | null
          tv_el?: number | null
          tv_reformat?: number | null
          unit_type?: string | null
          updated_at?: string
          viscosity?: number | null
          viscosity_rsv?: number | null
          yield_percentage?: number | null
        }
        Update: {
          batch_number?: string
          cetane?: number | null
          charge_nature?: string | null
          charge_tonnage_per_hour?: number | null
          color_code?: string | null
          couleur?: string | null
          created_at?: string
          created_by?: string | null
          cristallisation?: number | null
          cristallisation_kero?: number | null
          density?: number | null
          ecoulement?: number | null
          ecoulement_rsv?: number | null
          evaporation_95?: number | null
          flash_got?: number | null
          flash_kero?: number | null
          flash_kero_min?: number | null
          gasoil_disposition?: string | null
          id?: string
          indice?: number | null
          non_conformity_count?: number | null
          octane_number_target?: number | null
          octane_rating?: number | null
          period_end?: string | null
          period_start?: string | null
          point_final?: number | null
          point_initial?: number | null
          product_name?: string
          pt_90_got?: number | null
          pt_trouble_got?: number | null
          quality_status?: string | null
          recommendations?: string | null
          reformat_10?: number | null
          residue_type?: string | null
          sulfur_content?: number | null
          test_date?: string
          trouble?: number | null
          tv_el?: number | null
          tv_reformat?: number | null
          unit_type?: string | null
          updated_at?: string
          viscosity?: number | null
          viscosity_rsv?: number | null
          yield_percentage?: number | null
        }
        Relationships: []
      }
      product_specifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          max_value: number | null
          min_value: number | null
          product_name: string
          specification_name: string
          unit: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          product_name: string
          specification_name: string
          unit?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          product_name?: string
          specification_name?: string
          unit?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      production_tonnages: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          recorded_at: string | null
          tonnage_per_hour: number
          unit_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          recorded_at?: string | null
          tonnage_per_hour: number
          unit_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          recorded_at?: string | null
          tonnage_per_hour?: number
          unit_name?: string
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
      reactor_config: {
        Row: {
          catalyst_charge_kg: number
          created_at: string | null
          id: string
          is_active: boolean | null
          reactor_name: string
          updated_at: string | null
        }
        Insert: {
          catalyst_charge_kg: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reactor_name: string
          updated_at?: string | null
        }
        Update: {
          catalyst_charge_kg?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reactor_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reforming_daily_parameters: {
        Row: {
          charge_naphta_th: number | null
          chlore_ppm: number | null
          created_at: string | null
          created_by: string | null
          date_recorded: string
          debit_gr_th: number | null
          density_naphta: number | null
          h2_hc_ratio: number | null
          h2_percentage: number | null
          id: string
          injection_dcp_lh: number | null
          injection_eau_ppm: number | null
          octane_number: number | null
          updated_at: string | null
          wshv_calculated: number | null
        }
        Insert: {
          charge_naphta_th?: number | null
          chlore_ppm?: number | null
          created_at?: string | null
          created_by?: string | null
          date_recorded: string
          debit_gr_th?: number | null
          density_naphta?: number | null
          h2_hc_ratio?: number | null
          h2_percentage?: number | null
          id?: string
          injection_dcp_lh?: number | null
          injection_eau_ppm?: number | null
          octane_number?: number | null
          updated_at?: string | null
          wshv_calculated?: number | null
        }
        Update: {
          charge_naphta_th?: number | null
          chlore_ppm?: number | null
          created_at?: string | null
          created_by?: string | null
          date_recorded?: string
          debit_gr_th?: number | null
          density_naphta?: number | null
          h2_hc_ratio?: number | null
          h2_percentage?: number | null
          id?: string
          injection_dcp_lh?: number | null
          injection_eau_ppm?: number | null
          octane_number?: number | null
          updated_at?: string | null
          wshv_calculated?: number | null
        }
        Relationships: []
      }
      reforming_parameters: {
        Row: {
          charge_naphta: number | null
          chlore_ppm: number | null
          created_at: string | null
          created_by: string | null
          date_recorded: string
          debit_gr: number | null
          density_naphta: number | null
          h2_hc_ratio: number | null
          h2_percentage: number | null
          id: string
          injection_dcp: number | null
          injection_eau_ppm: number | null
          octane_number: number | null
          updated_at: string | null
          wshv: number | null
        }
        Insert: {
          charge_naphta?: number | null
          chlore_ppm?: number | null
          created_at?: string | null
          created_by?: string | null
          date_recorded: string
          debit_gr?: number | null
          density_naphta?: number | null
          h2_hc_ratio?: number | null
          h2_percentage?: number | null
          id?: string
          injection_dcp?: number | null
          injection_eau_ppm?: number | null
          octane_number?: number | null
          updated_at?: string | null
          wshv?: number | null
        }
        Update: {
          charge_naphta?: number | null
          chlore_ppm?: number | null
          created_at?: string | null
          created_by?: string | null
          date_recorded?: string
          debit_gr?: number | null
          density_naphta?: number | null
          h2_hc_ratio?: number | null
          h2_percentage?: number | null
          id?: string
          injection_dcp?: number | null
          injection_eau_ppm?: number | null
          octane_number?: number | null
          updated_at?: string | null
          wshv?: number | null
        }
        Relationships: []
      }
      regulation_loops: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          regulation: string
          status: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          regulation: string
          status?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          regulation?: string
          status?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_bypasses: {
        Row: {
          author: string
          created_at: string | null
          created_by: string | null
          date: string
          function_role: string
          id: string
          reason: string
          securities: string
          status: string | null
          time: string
          updated_at: string | null
        }
        Insert: {
          author: string
          created_at?: string | null
          created_by?: string | null
          date: string
          function_role: string
          id?: string
          reason: string
          securities: string
          status?: string | null
          time: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          function_role?: string
          id?: string
          reason?: string
          securities?: string
          status?: string | null
          time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shutdown_startup_events: {
        Row: {
          cause_category: string | null
          comments: string | null
          created_at: string
          created_by: string | null
          duration_hours: number | null
          end_time: string | null
          event_type: string
          id: string
          impact_level: string | null
          observations: string | null
          operator_name: string | null
          planned_works: boolean | null
          reason: string | null
          start_time: string
          status: string
          unit_name: string
          updated_at: string
        }
        Insert: {
          cause_category?: string | null
          comments?: string | null
          created_at?: string
          created_by?: string | null
          duration_hours?: number | null
          end_time?: string | null
          event_type: string
          id?: string
          impact_level?: string | null
          observations?: string | null
          operator_name?: string | null
          planned_works?: boolean | null
          reason?: string | null
          start_time: string
          status: string
          unit_name: string
          updated_at?: string
        }
        Update: {
          cause_category?: string | null
          comments?: string | null
          created_at?: string
          created_by?: string | null
          duration_hours?: number | null
          end_time?: string | null
          event_type?: string
          id?: string
          impact_level?: string | null
          observations?: string | null
          operator_name?: string | null
          planned_works?: boolean | null
          reason?: string | null
          start_time?: string
          status?: string
          unit_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      technical_direction_actions: {
        Row: {
          created_at: string | null
          created_by: string | null
          creation_date: string
          id: string
          reason: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          creation_date: string
          id?: string
          reason: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          creation_date?: string
          id?: string
          reason?: string
        }
        Relationships: []
      }
      technical_stop_works: {
        Row: {
          commentaire: string | null
          created_at: string | null
          date_debut: string | null
          delai: string | null
          demandeur: string
          duree_estimee: string | null
          id: string
          responsable: string
          service_realisation: string | null
          suivi_realisation: string | null
          technical_stop_id: string | null
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          date_debut?: string | null
          delai?: string | null
          demandeur: string
          duree_estimee?: string | null
          id?: string
          responsable: string
          service_realisation?: string | null
          suivi_realisation?: string | null
          technical_stop_id?: string | null
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          date_debut?: string | null
          delai?: string | null
          demandeur?: string
          duree_estimee?: string | null
          id?: string
          responsable?: string
          service_realisation?: string | null
          suivi_realisation?: string | null
          technical_stop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_stop_works_technical_stop_id_fkey"
            columns: ["technical_stop_id"]
            isOneToOne: false
            referencedRelation: "technical_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_stops: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          stop_date: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          stop_date: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          stop_date?: string
          unit?: string
          updated_at?: string | null
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
      water_parameter_limits: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: string
          max_value: number | null
          min_value: number | null
          parameter_name: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter_name: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter_name?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      water_parameters_config: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: string
          max_value: number | null
          min_value: number | null
          parameter_name: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter_name: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter_name?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      water_treatment_data: {
        Row: {
          chaudiere_number: number | null
          chlore_libre: number | null
          cond_level: number | null
          created_at: string
          created_by: string | null
          equipment_name: string
          equipment_tag: string | null
          equipment_type: string | null
          id: string
          ph_level: number | null
          phosphates: number | null
          sio2_level: number | null
          status: string | null
          ta_level: number | null
          tac_level: number | null
          th_level: number | null
          timestamp: string
          updated_at: string
        }
        Insert: {
          chaudiere_number?: number | null
          chlore_libre?: number | null
          cond_level?: number | null
          created_at?: string
          created_by?: string | null
          equipment_name: string
          equipment_tag?: string | null
          equipment_type?: string | null
          id?: string
          ph_level?: number | null
          phosphates?: number | null
          sio2_level?: number | null
          status?: string | null
          ta_level?: number | null
          tac_level?: number | null
          th_level?: number | null
          timestamp?: string
          updated_at?: string
        }
        Update: {
          chaudiere_number?: number | null
          chlore_libre?: number | null
          cond_level?: number | null
          created_at?: string
          created_by?: string | null
          equipment_name?: string
          equipment_tag?: string | null
          equipment_type?: string | null
          id?: string
          ph_level?: number | null
          phosphates?: number | null
          sio2_level?: number | null
          status?: string | null
          ta_level?: number | null
          tac_level?: number | null
          th_level?: number | null
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_management_entries: {
        Row: {
          comments: string | null
          created_at: string | null
          created_by: string | null
          date: string
          date_estimate: string | null
          delay_days: string | null
          equipment_list: string | null
          equipment_type: string
          id: string
          location: string | null
          planned_action: string
          realization_delay: string | null
          realization_percentage: number | null
          responsible: string
          status: string | null
          tag_equipment: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          date_estimate?: string | null
          delay_days?: string | null
          equipment_list?: string | null
          equipment_type: string
          id?: string
          location?: string | null
          planned_action: string
          realization_delay?: string | null
          realization_percentage?: number | null
          responsible: string
          status?: string | null
          tag_equipment?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          date_estimate?: string | null
          delay_days?: string | null
          equipment_list?: string | null
          equipment_type?: string
          id?: string
          location?: string | null
          planned_action?: string
          realization_delay?: string | null
          realization_percentage?: number | null
          responsible?: string
          status?: string | null
          tag_equipment?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      yield_tracking: {
        Row: {
          butane_yield: number | null
          color_code: string | null
          created_at: string | null
          created_by: string | null
          crude_processed_th: number | null
          crude_processed_tj: number | null
          date_recorded: string
          el_yield: number | null
          got_yield: number | null
          id: string
          kero_yield: number | null
          naphta_yield: number | null
          non_conformities: number | null
          rsv_yield: number | null
          total_yield: number | null
          unit_name: string
          updated_at: string | null
        }
        Insert: {
          butane_yield?: number | null
          color_code?: string | null
          created_at?: string | null
          created_by?: string | null
          crude_processed_th?: number | null
          crude_processed_tj?: number | null
          date_recorded: string
          el_yield?: number | null
          got_yield?: number | null
          id?: string
          kero_yield?: number | null
          naphta_yield?: number | null
          non_conformities?: number | null
          rsv_yield?: number | null
          total_yield?: number | null
          unit_name: string
          updated_at?: string | null
        }
        Update: {
          butane_yield?: number | null
          color_code?: string | null
          created_at?: string | null
          created_by?: string | null
          crude_processed_th?: number | null
          crude_processed_tj?: number | null
          date_recorded?: string
          el_yield?: number | null
          got_yield?: number | null
          id?: string
          kero_yield?: number | null
          naphta_yield?: number | null
          non_conformities?: number | null
          rsv_yield?: number | null
          total_yield?: number | null
          unit_name?: string
          updated_at?: string | null
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
