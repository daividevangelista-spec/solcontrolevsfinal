-- Migration: Add dual billing mode support to energy_bills
-- Run this in Supabase SQL Editor

-- 1. Add billing_mode column
ALTER TABLE energy_bills 
ADD COLUMN IF NOT EXISTS billing_mode TEXT NOT NULL DEFAULT 'combined'
CHECK (billing_mode IN ('combined', 'separate'));

-- 2. Add concessionaria_value (separate from energisa_bill_value for clarity)
ALTER TABLE energy_bills 
ADD COLUMN IF NOT EXISTS concessionaria_value NUMERIC(10,2) DEFAULT 0;

-- 3. Add concessionaria_bill_url (URL to external boleto PDF)
ALTER TABLE energy_bills 
ADD COLUMN IF NOT EXISTS concessionaria_bill_url TEXT DEFAULT NULL;

-- 4. Add energisa_payment_proof_url if not exists (may already exist)
ALTER TABLE energy_bills 
ADD COLUMN IF NOT EXISTS energisa_payment_proof_url TEXT DEFAULT NULL;

-- 5. Add solar_payment_proof_url if not exists (may already exist)
ALTER TABLE energy_bills 
ADD COLUMN IF NOT EXISTS solar_payment_proof_url TEXT DEFAULT NULL;

-- 6. Add utility_tariff_used if not exists
ALTER TABLE energy_bills 
ADD COLUMN IF NOT EXISTS utility_tariff_used NUMERIC(10,4) DEFAULT 1.13;

-- Verify changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'energy_bills'
ORDER BY ordinal_position;
