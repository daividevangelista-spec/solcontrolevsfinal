-- Migration: Add PIX receiver names to settings and clients
-- This allows for more professional payment instructions with the name of the recipient/titular.

-- 1. Add global receiver to energy_settings
ALTER TABLE public.energy_settings
  ADD COLUMN IF NOT EXISTS pix_receiver text DEFAULT 'SolControle';

-- 2. Add client-specific override to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS custom_pix_receiver text DEFAULT NULL;
