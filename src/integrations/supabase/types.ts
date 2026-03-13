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
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          performed_by: string | null
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: string
          performed_by?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: string
          performed_by?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          user_id?: string | null
          tier_enabled?: boolean | null
          tier_limit_kwh?: number | null
          tier_price_low?: number | null
          tier_price_high?: number | null
          override_pix?: boolean | null
          custom_pix_key?: string | null
          custom_pix_qr_code_url?: string | null
        }
        Relationships: []
      }
      consumer_units: {
        Row: {
          address: string | null
          client_id: string
          created_at: string
          id: string
          meter_number: string | null
          unit_name: string
        }
        Insert: {
          address?: string | null
          client_id: string
          created_at?: string
          id?: string
          meter_number?: string | null
          unit_name: string
        }
        Update: {
          address?: string | null
          client_id?: string
          created_at?: string
          id?: string
          meter_number?: string | null
          unit_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumer_units_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_bills: {
        Row: {
          consumer_unit_id: string
          consumption_kwh: number
          created_at: string
          due_date: string
          energisa_bill_file_url: string | null
          energisa_bill_value: number | null
          id: string
          injected_energy_kwh: number | null
          invoice_file_url: string | null
          month: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          price_per_kwh: number
          solar_energy_value: number | null
          total_amount: number
          year: number
        }
        Insert: {
          consumer_unit_id: string
          consumption_kwh: number
          created_at?: string
          due_date: string
          energisa_bill_file_url?: string | null
          energisa_bill_value?: number | null
          id?: string
          injected_energy_kwh?: number | null
          invoice_file_url?: string | null
          month: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price_per_kwh: number
          solar_energy_value?: number | null
          total_amount: number
          year: number
        }
        Update: {
          consumer_unit_id?: string
          consumption_kwh?: number
          created_at?: string
          due_date?: string
          energisa_bill_file_url?: string | null
          energisa_bill_value?: number | null
          id?: string
          injected_energy_kwh?: number | null
          invoice_file_url?: string | null
          month?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price_per_kwh?: number
          solar_energy_value?: number | null
          total_amount?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "energy_bills_consumer_unit_id_fkey"
            columns: ["consumer_unit_id"]
            isOneToOne: false
            referencedRelation: "consumer_units"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_settings: {
        Row: {
          id: string
          pix_key: string | null
          pix_qr_code_url: string | null
          price_per_kwh: number
          updated_at: string
        }
        Insert: {
          id?: string
          pix_key?: string | null
          pix_qr_code_url?: string | null
          price_per_kwh?: number
          updated_at?: string
        }
        Update: {
          id?: string
          pix_key?: string | null
          pix_qr_code_url?: string | null
          price_per_kwh?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          user_id: string
          email_enabled: boolean
          whatsapp_enabled: boolean
          push_enabled: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          push_enabled?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          push_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          bill_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
          channel: Database["public"]["Enums"]["notification_channel"]
          status: Database["public"]["Enums"]["notification_status"]
          payload: Json | null
          error_message: string | null
          created_at: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          bill_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          channel: Database["public"]["Enums"]["notification_channel"]
          status?: Database["public"]["Enums"]["notification_status"]
          payload?: Json | null
          error_message?: string | null
          created_at?: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          bill_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          channel?: Database["public"]["Enums"]["notification_channel"]
          status?: Database["public"]["Enums"]["notification_status"]
          payload?: Json | null
          error_message?: string | null
          created_at?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "energy_bills"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          bill_id: string
          created_at: string
          id: string
          payment_date: string
          payment_type: string
          receipt_file_url: string | null
        }
        Insert: {
          bill_id: string
          created_at?: string
          id?: string
          payment_date: string
          payment_type: string
          receipt_file_url?: string | null
        }
        Update: {
          bill_id?: string
          created_at?: string
          id?: string
          payment_date?: string
          payment_type?: string
          receipt_file_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "energy_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "client"
      payment_status: "pending" | "paid" | "overdue"
      notification_type: "bill_generated" | "bill_reminder_3d" | "bill_overdue" | "payment_proof_sent" | "payment_confirmed"
      notification_channel: "email" | "whatsapp" | "push"
      notification_status: "pending" | "sent" | "failed"
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
      app_role: ["admin", "client"],
      payment_status: ["pending", "paid", "overdue"],
      notification_type: ["bill_generated", "bill_reminder_3d", "bill_overdue", "payment_proof_sent", "payment_confirmed"],
      notification_channel: ["email", "whatsapp", "push"],
      notification_status: ["pending", "sent", "failed"],
    },
  },
} as const
