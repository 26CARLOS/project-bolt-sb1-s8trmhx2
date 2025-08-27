/*
  # Invoice Management System Schema

  1. New Tables
    - `business_details`
      - Stores single business configuration
      - Logo, contact info, banking details
    - `clients`
      - Client information for invoicing
      - Name, address, phone, email
    - `invoices` 
      - Main invoice records
      - Links to client, contains totals and metadata
    - `invoice_items`
      - Individual line items for each invoice
      - Description, quantity, pricing, VAT

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Business details table (single record)
CREATE TABLE IF NOT EXISTS business_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Your Business',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  website text DEFAULT '',
  logo_url text DEFAULT '',
  labour_rate_per_hour decimal(10,2) DEFAULT 0,
  bank_account_holder text DEFAULT '',
  bank_account_type text DEFAULT 'BUSINESS ACCOUNT',
  bank_account_number text DEFAULT '',
  bank_name text DEFAULT '',
  bank_branch_code text DEFAULT '',
  currency text DEFAULT 'R',
  default_vat_rate decimal(5,2) DEFAULT 15.00,
  invoice_terms text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  issue_date date DEFAULT CURRENT_DATE,
  due_date date,
  tax_rate decimal(5,2) DEFAULT 15.00,
  notes text DEFAULT '',
  terms text DEFAULT '',
  subtotal decimal(12,2) DEFAULT 0,
  tax_amount decimal(12,2) DEFAULT 0,
  total_amount decimal(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity decimal(10,2) DEFAULT 1,
  unit_price decimal(10,2) DEFAULT 0,
  vat_rate decimal(5,2) DEFAULT 15.00,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE business_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_details
CREATE POLICY "Users can read business details"
  ON business_details
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update business details"
  ON business_details
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for clients
CREATE POLICY "Users can manage clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for invoices
CREATE POLICY "Users can manage invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for invoice_items
CREATE POLICY "Users can manage invoice items"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default business details
INSERT INTO business_details (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Your Autocare Business')
ON CONFLICT DO NOTHING;

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  -- Get the next invoice number
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_number FROM '^([0-9]+)') AS INTEGER)) + 1,
    1001
  ) INTO next_num
  FROM invoices
  WHERE invoice_number ~ '^[0-9]+$';
  
  invoice_num := next_num::TEXT;
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Function to recalculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_id_param UUID)
RETURNS VOID AS $$
DECLARE
  subtotal_calc DECIMAL(12,2);
  tax_amount_calc DECIMAL(12,2);
  total_amount_calc DECIMAL(12,2);
  invoice_tax_rate DECIMAL(5,2);
BEGIN
  -- Get the invoice tax rate
  SELECT tax_rate INTO invoice_tax_rate
  FROM invoices 
  WHERE id = invoice_id_param;
  
  -- Calculate subtotal from items
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  INTO subtotal_calc
  FROM invoice_items 
  WHERE invoice_id = invoice_id_param;
  
  -- Calculate tax amount
  tax_amount_calc := subtotal_calc * (invoice_tax_rate / 100);
  
  -- Calculate total
  total_amount_calc := subtotal_calc + tax_amount_calc;
  
  -- Update invoice totals
  UPDATE invoices 
  SET 
    subtotal = subtotal_calc,
    tax_amount = tax_amount_calc,
    total_amount = total_amount_calc,
    updated_at = now()
  WHERE id = invoice_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate totals when items change
CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_invoice_totals(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_invoice_items_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_invoice_totals();