-- Run this in the Supabase SQL Editor to add PIX override columns to the clients table
-- These columns were defined in the migration files but need to be applied to the live database

-- Add tier pricing columns (if not already added)
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS tier_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tier_limit_kwh NUMERIC,
  ADD COLUMN IF NOT EXISTS tier_price_low NUMERIC,
  ADD COLUMN IF NOT EXISTS tier_price_high NUMERIC;

-- Add PIX override columns (if not already added)
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS override_pix BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS custom_pix_key TEXT,
  ADD COLUMN IF NOT EXISTS custom_pix_qr_code_url TEXT;

-- Add PIX QR code URL to energy_settings (if not already added)
ALTER TABLE public.energy_settings
  ADD COLUMN IF NOT EXISTS pix_qr_code_url TEXT;
  
SELECT 'Columns added successfully!' AS result;
