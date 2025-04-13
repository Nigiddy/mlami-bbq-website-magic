
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Supabase connection details
const supabaseUrl = "https://pzlfeqyzuftvrujcjetq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bGZlcXl6dWZ0dnJ1amNqZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNjk3MTMsImV4cCI6MjA1OTg0NTcxM30.z3DZRtqqWIhkZfKsaXAwLHJinGtdO4Lbe8Zx90YYcxo";

// Create client with basic error handling
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Function to safely use Supabase client
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check your environment variables.');
  }
  return supabase;
};

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

export type MpesaTransaction = {
  id: number;
  phone_number: string;
  amount: number;
  table_number: string | null;
  checkout_request_id: string;
  merchant_request_id: string;
  mpesa_receipt_number: string | null;
  transaction_date: string | null;
  result_description: string | null;
  status: string;
  items: any | null;
  created_at: string;
  updated_at: string;
};
