export interface BusinessDetails {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  labour_rate_per_hour?: number
  bank_account_holder?: string
  bank_account_type?: string
  bank_account_number?: string
  bank_name?: string
  bank_branch_code?: string
  currency?: string
  default_vat_rate?: number
  invoice_terms?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  client?: Client
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  issue_date: string
  due_date?: string
  tax_rate: number
  notes?: string
  terms?: string
  vehicle?: string
  reg?: string
  mileage?: string
  job_card?: string
  subtotal: number
  tax_amount: number
  total_amount: number
  created_at: string
  updated_at: string
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  vat_rate: number
  created_at: string
}

export interface InvoiceFormData {
  client_id: string
  status: string
  issue_date: string
  due_date?: string
  tax_rate: number
  notes?: string
  terms?: string
  vehicle?: string
  reg?: string
  mileage?: string
  job_card?: string
  items: {
    description: string
    quantity: number
    unit_price: number
    vat_rate: number
  }[]
}