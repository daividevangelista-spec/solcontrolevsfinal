-- Migration: Audit Implementation & Hardening
-- Phase 11: Security, Performance, and Integrity

-- 1. Storage Hardening: Convert buckets to private
UPDATE storage.buckets SET public = false WHERE id IN ('invoices', 'receipts', 'qrcodes');

-- 2. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    performed_by UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 3. Audit Logging Trigger Function
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID := auth.uid();
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, performed_by, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, current_user_id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, performed_by, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, current_user_id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, performed_by, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, current_user_id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply Audit Triggers
CREATE TRIGGER audit_bills_trigger AFTER INSERT OR UPDATE OR DELETE ON public.energy_bills FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE TRIGGER audit_clients_trigger AFTER INSERT OR UPDATE OR DELETE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE TRIGGER audit_units_trigger AFTER INSERT OR UPDATE OR DELETE ON public.consumer_units FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE TRIGGER audit_payments_trigger AFTER INSERT OR UPDATE OR DELETE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- 5. Database Performance: Indices
CREATE INDEX IF NOT EXISTS idx_energy_bills_consumer_unit_id ON public.energy_bills(consumer_unit_id);
CREATE INDEX IF NOT EXISTS idx_consumer_units_client_id ON public.consumer_units(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON public.payments(bill_id);

-- 6. Historical Integrity: Add utility_tariff_used to energy_bills
ALTER TABLE public.energy_bills ADD COLUMN IF NOT EXISTS utility_tariff_used NUMERIC(10,4);

-- Set existing bills to the current default tariff (1.13)
UPDATE public.energy_bills SET utility_tariff_used = 1.13 WHERE utility_tariff_used IS NULL;

-- 7. Energy Settings Enhancement
ALTER TABLE public.energy_settings ADD COLUMN IF NOT EXISTS standard_utility_tariff NUMERIC(10,4) DEFAULT 1.13;

-- 8. Enhanced Storage Policies (Restrict Path)
-- Policy for clients: Can only upload to folders named after their own UID
-- Note: We first drop existing overly permissive policies if they exist.

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Authenticated Upload Proofs" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated can upload receipts" ON storage.objects;
END $$;

-- Robuster client upload policy for receipts/proofs
CREATE POLICY "Clients can upload their own proofs" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'invoices' 
    AND (storage.foldername(name))[1] = 'proofs'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Admin still has broad access
CREATE POLICY "Admins full storage access" 
ON storage.objects FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Storage Select Policy (Private Mode)
-- Instead of public, we allow select for owners or admins
DROP POLICY IF EXISTS "Invoices publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Receipts publicly accessible" ON storage.objects;

CREATE POLICY "Users can view own storage objects" 
ON storage.objects FOR SELECT 
USING (
    bucket_id IN ('invoices', 'receipts') 
    AND (
        (storage.foldername(name))[2] = auth.uid()::text 
        OR public.has_role(auth.uid(), 'admin')
    )
);
