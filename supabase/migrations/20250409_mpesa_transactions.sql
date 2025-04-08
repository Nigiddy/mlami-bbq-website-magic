
-- Create the mpesa_transactions table
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Store in cents/smallest currency unit
  table_number TEXT REFERENCES public.tables(table_number),
  checkout_request_id TEXT NOT NULL UNIQUE,
  merchant_request_id TEXT NOT NULL,
  mpesa_receipt_number TEXT,
  transaction_date TEXT,
  result_description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies
CREATE POLICY "Anyone can view their own transactions by phone"
  ON public.mpesa_transactions FOR SELECT
  USING (true); -- In a real app, you would limit this by customer ID

CREATE POLICY "Only authenticated users can create transactions"
  ON public.mpesa_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);
