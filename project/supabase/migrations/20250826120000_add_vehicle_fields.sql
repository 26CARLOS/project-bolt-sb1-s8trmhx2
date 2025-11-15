-- Add vehicle-related fields to invoices table
ALTER TABLE invoices 
  ADD COLUMN IF NOT EXISTS vehicle text DEFAULT '',
  ADD COLUMN IF NOT EXISTS reg text DEFAULT '',
  ADD COLUMN IF NOT EXISTS mileage text DEFAULT '',
  ADD COLUMN IF NOT EXISTS job_card text DEFAULT '';
