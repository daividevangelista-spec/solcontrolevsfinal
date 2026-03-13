-- Migration: Fix Energy Settings Schema
-- Phase 23: Schema Synchronization & Reliability
-- Ensures all columns required by the Admin panel exist in the energy_settings table.

ALTER TABLE public.energy_settings 
    ADD COLUMN IF NOT EXISTS pix_receiver TEXT DEFAULT 'SolControle',
    ADD COLUMN IF NOT EXISTS standard_utility_tariff NUMERIC(10,4) DEFAULT 1.13,
    ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS auto_overdue_alerts BOOLEAN DEFAULT true;

-- Ensure we have at least one settings row to prevent 404s
INSERT INTO public.energy_settings (id, price_per_kwh)
VALUES ('cb3c3d0e-92f6-4548-a4f3-80046fe524ba', 0.95)
ON CONFLICT (id) DO NOTHING;

-- Log the repair
INSERT INTO public.audit_logs (table_name, record_id, action, new_data)
VALUES ('energy_settings', 'cb3c3d0e-92f6-4548-a4f3-80046fe524ba', 'SCHEMA_REPAIR', '{"status": "columns_added"}'::jsonb);
