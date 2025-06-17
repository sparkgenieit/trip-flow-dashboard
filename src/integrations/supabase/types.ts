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
      bookings: {
        Row: {
          booking_type: string | null
          created_at: string
          customer_id: string | null
          driver_id: string | null
          dropoff_location: string
          estimated_cost: number | null
          estimated_distance: number | null
          estimated_duration: number | null
          id: string
          notes: string | null
          pickup_location: string
          pickup_time: string
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          booking_type?: string | null
          created_at?: string
          customer_id?: string | null
          driver_id?: string | null
          dropoff_location: string
          estimated_cost?: number | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          pickup_location: string
          pickup_time: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          booking_type?: string | null
          created_at?: string
          customer_id?: string | null
          driver_id?: string | null
          dropoff_location?: string
          estimated_cost?: number | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          pickup_location?: string
          pickup_time?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          assigned_vehicle_id: string | null
          created_at: string
          id: string
          is_available: boolean | null
          is_part_time: boolean | null
          license_expiry: string | null
          license_number: string
          updated_at: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          assigned_vehicle_id?: string | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          is_part_time?: boolean | null
          license_expiry?: string | null
          license_number: string
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          assigned_vehicle_id?: string | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          is_part_time?: boolean | null
          license_expiry?: string | null
          license_number?: string
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string | null
          driver_rating: number | null
          feedback_time: string
          id: string
          service_rating: number | null
          trip_id: string | null
          vehicle_rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          driver_rating?: number | null
          feedback_time?: string
          id?: string
          service_rating?: number | null
          trip_id?: string | null
          vehicle_rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          driver_rating?: number | null
          feedback_time?: string
          id?: string
          service_rating?: number | null
          trip_id?: string | null
          vehicle_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          admin_commission: number | null
          created_at: string
          customer_id: string | null
          id: string
          invoice_number: string
          pdf_url: string | null
          subtotal: number
          total_amount: number
          trip_id: string | null
          vendor_commission: number | null
          vendor_id: string | null
        }
        Insert: {
          admin_commission?: number | null
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number: string
          pdf_url?: string | null
          subtotal: number
          total_amount: number
          trip_id?: string | null
          vendor_commission?: number | null
          vendor_id?: string | null
        }
        Update: {
          admin_commission?: number | null
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number?: string
          pdf_url?: string | null
          subtotal?: number
          total_amount?: number
          trip_id?: string | null
          vendor_commission?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      leaves: {
        Row: {
          approved_by: string | null
          created_at: string
          driver_id: string | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"] | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          driver_id?: string | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          driver_id?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          actual_distance: number | null
          booking_id: string | null
          breakdown_notes: string | null
          breakdown_reported: boolean | null
          created_at: string
          driver_id: string | null
          end_location: string | null
          end_time: string | null
          id: string
          start_location: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["trip_status"] | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          actual_distance?: number | null
          booking_id?: string | null
          breakdown_notes?: string | null
          breakdown_reported?: boolean | null
          created_at?: string
          driver_id?: string | null
          end_location?: string | null
          end_time?: string | null
          id?: string
          start_location?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_distance?: number | null
          booking_id?: string | null
          breakdown_notes?: string | null
          breakdown_reported?: boolean | null
          created_at?: string
          driver_id?: string | null
          end_location?: string | null
          end_time?: string | null
          id?: string
          start_location?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          comfort_level: number | null
          created_at: string
          id: string
          last_serviced_date: string | null
          rate_per_km: number
          status: Database["public"]["Enums"]["vehicle_status"] | null
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at: string
          vehicle_number: string
          vendor_id: string | null
        }
        Insert: {
          comfort_level?: number | null
          created_at?: string
          id?: string
          last_serviced_date?: string | null
          rate_per_km: number
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string
          vehicle_number: string
          vendor_id?: string | null
        }
        Update: {
          comfort_level?: number | null
          created_at?: string
          id?: string
          last_serviced_date?: string | null
          rate_per_km?: number
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string
          vehicle_number?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          commission_rate: number | null
          company_name: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          commission_rate?: number | null
          company_name: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          commission_rate?: number | null
          company_name?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
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
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      leave_status: "pending" | "approved" | "rejected"
      trip_status: "scheduled" | "started" | "completed" | "cancelled"
      user_role: "admin" | "vendor" | "driver" | "corporate_client" | "customer"
      vehicle_status: "available" | "maintenance" | "out_of_service"
      vehicle_type: "SUV" | "hatchback" | "sedan" | "XUV"
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
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      leave_status: ["pending", "approved", "rejected"],
      trip_status: ["scheduled", "started", "completed", "cancelled"],
      user_role: ["admin", "vendor", "driver", "corporate_client", "customer"],
      vehicle_status: ["available", "maintenance", "out_of_service"],
      vehicle_type: ["SUV", "hatchback", "sedan", "XUV"],
    },
  },
} as const
