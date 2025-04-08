
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          image_url: string | null
          category_id: number | null
          in_stock: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category_id?: number | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category_id?: number | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tables: {
        Row: {
          id: number
          table_number: string
          is_occupied: boolean
          created_at: string
        }
        Insert: {
          id?: number
          table_number: string
          is_occupied?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          table_number?: string
          is_occupied?: boolean
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: number
          name: string | null
          phone: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          customer_id: number | null
          table_number: string | null
          status: string
          subtotal: number
          total: number
          payment_status: string | null
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          customer_id?: number | null
          table_number?: string | null
          status?: string
          subtotal: number
          total: number
          payment_status?: string | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          customer_id?: number | null
          table_number?: string | null
          status?: string
          subtotal?: number
          total?: number
          payment_status?: string | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          menu_item_id: number
          quantity: number
          price: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          menu_item_id: number
          quantity?: number
          price: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          menu_item_id?: number
          quantity?: number
          price?: number
          notes?: string | null
          created_at?: string
        }
      }
      mpesa_transactions: {
        Row: {
          id: number
          phone_number: string
          amount: number
          table_number: string | null
          checkout_request_id: string
          merchant_request_id: string
          mpesa_receipt_number: string | null
          transaction_date: string | null
          result_description: string | null
          status: string
          items: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          phone_number: string
          amount: number
          table_number?: string | null
          checkout_request_id: string
          merchant_request_id: string
          mpesa_receipt_number?: string | null
          transaction_date?: string | null
          result_description?: string | null
          status?: string
          items?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          phone_number?: string
          amount?: number
          table_number?: string | null
          checkout_request_id?: string
          merchant_request_id?: string
          mpesa_receipt_number?: string | null
          transaction_date?: string | null
          result_description?: string | null
          status?: string
          items?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order: {
        Args: {
          p_customer_name: string
          p_customer_phone: string
          p_table_number: string
          p_items: Json
        }
        Returns: number
      }
      update_order_status: {
        Args: {
          p_order_id: number
          p_status: string
        }
        Returns: boolean
      }
      update_menu_item_stock: {
        Args: {
          p_item_id: number
          p_in_stock: boolean
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
