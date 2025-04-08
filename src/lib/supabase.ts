
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// These environment variables are automatically injected by Lovable when you connect to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Category = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: number | null;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
};

export type Table = {
  id: number;
  table_number: string;
  is_occupied: boolean;
  created_at: string;
};

export type Customer = {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export type Order = {
  id: number;
  customer_id: number | null;
  table_number: string | null;
  status: string;
  subtotal: number;
  total: number;
  payment_status: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  price: number;
  notes: string | null;
  created_at: string;
};

// Create a database.types.ts placeholder file
// This would typically be generated from Supabase CLI, but for now we'll create a simple placeholder
