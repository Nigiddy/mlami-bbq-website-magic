
-- Create tables schema
CREATE SCHEMA IF NOT EXISTS public;

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET app.settings.jwt_secret TO 'your-jwt-secret';

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Store in cents/smallest currency unit
  image_url TEXT,
  category_id INTEGER REFERENCES public.categories(id),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RESTAURANT TABLES TABLE
CREATE TABLE IF NOT EXISTS public.tables (
  id SERIAL PRIMARY KEY,
  table_number TEXT NOT NULL UNIQUE,
  is_occupied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id SERIAL PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES public.customers(id),
  table_number TEXT REFERENCES public.tables(table_number),
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal INTEGER NOT NULL, -- Store in cents/smallest currency unit
  total INTEGER NOT NULL, -- Store in cents/smallest currency unit
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES public.orders(id) NOT NULL,
  menu_item_id INTEGER REFERENCES public.menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL, -- Price at time of order (cents/smallest currency unit)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Sample Data Insertion

-- Categories
INSERT INTO public.categories (name, description)
VALUES
  ('BBQ Specialties', 'Our signature slow-cooked meats'),
  ('Starters', 'Begin your meal with these appetizers'),
  ('Sides', 'Perfect accompaniments to your main dish');

-- Menu Items (matching your current app data)
INSERT INTO public.menu_items (name, description, price, image_url, category_id, in_stock)
VALUES
  ('Smoked Brisket', 'Slow-smoked for 12 hours, our signature brisket melts in your mouth', 1899, '/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png', 1, true),
  ('Pulled Pork Sandwich', 'Hand-pulled pork shoulder with our signature BBQ sauce', 1499, '/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png', 1, true),
  ('BBQ Ribs', 'Fall-off-the-bone tender ribs with our signature dry rub', 2299, '/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png', 1, false),
  ('Grilled Chicken', 'Juicy grilled chicken with herbs and spices', 1699, '/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png', 1, true),
  ('BBQ Chicken Wings', 'Crispy wings tossed in our signature BBQ sauce', 1299, '/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png', 2, true),
  ('Loaded Fries', 'Crispy fries topped with cheese, bacon, and scallions', 899, '/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png', 3, true);

-- Sample Tables
INSERT INTO public.tables (table_number, is_occupied)
VALUES
  ('1', false),
  ('2', false),
  ('3', false),
  ('4', false),
  ('5', false);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create basic policies
-- Menu items can be viewed by anyone but modified only by authenticated users
CREATE POLICY "Anyone can view menu items" 
  ON public.menu_items FOR SELECT 
  USING (true);

CREATE POLICY "Only authenticated users can modify menu items" 
  ON public.menu_items FOR ALL 
  USING (auth.role() = 'authenticated');

-- Anyone can view categories
CREATE POLICY "Anyone can view categories" 
  ON public.categories FOR SELECT 
  USING (true);

-- Only authenticated users can modify categories
CREATE POLICY "Only authenticated users can modify categories" 
  ON public.categories FOR ALL 
  USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Users can view their own orders" 
  ON public.orders FOR SELECT 
  USING (true); -- In real app, would filter by customer ID

-- Tables can be viewed by anyone but modified only by authenticated users
CREATE POLICY "Anyone can view tables" 
  ON public.tables FOR SELECT 
  USING (true);

CREATE POLICY "Only authenticated users can modify tables" 
  ON public.tables FOR ALL 
  USING (auth.role() = 'authenticated');

-- Functions for common operations

-- Function to create a new order
CREATE OR REPLACE FUNCTION create_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_table_number TEXT,
  p_items JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_customer_id INTEGER;
  v_order_id INTEGER;
  v_item JSONB;
  v_subtotal INTEGER := 0;
BEGIN
  -- Create or get customer
  INSERT INTO customers (name, phone)
  VALUES (p_customer_name, p_customer_phone)
  ON CONFLICT (phone) DO UPDATE SET name = p_customer_name
  RETURNING id INTO v_customer_id;
  
  -- Calculate subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_subtotal := v_subtotal + (v_item->>'price')::INTEGER * (v_item->>'quantity')::INTEGER;
  END LOOP;
  
  -- Create order
  INSERT INTO orders (customer_id, table_number, subtotal, total)
  VALUES (v_customer_id, p_table_number, v_subtotal, v_subtotal)
  RETURNING id INTO v_order_id;
  
  -- Create order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, menu_item_id, quantity, price)
    VALUES (
      v_order_id,
      (v_item->>'id')::INTEGER,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::INTEGER
    );
  END LOOP;
  
  -- Return the order ID
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update order status
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id INTEGER,
  p_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE orders
  SET 
    status = p_status,
    updated_at = now()
  WHERE id = p_order_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update menu item availability
CREATE OR REPLACE FUNCTION update_menu_item_stock(
  p_item_id INTEGER,
  p_in_stock BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE menu_items
  SET 
    in_stock = p_in_stock,
    updated_at = now()
  WHERE id = p_item_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
