-- Migration: Advanced Security Hardening & DB Calculations (Phase 13)
-- Moves business logic to the database and enforces production-grade security.

-- 1. Automate Billing Calculations
-- This function ensures solar_energy_value and total_amount are always calculated server-side.
CREATE OR REPLACE FUNCTION public.calculate_bill_totals()
RETURNS TRIGGER AS $$
DECLARE
    current_price NUMERIC;
BEGIN
    -- Get the price used for this bill. If not set, fallback to global settings.
    IF NEW.price_per_kwh IS NOT NULL AND NEW.price_per_kwh > 0 THEN
        current_price := NEW.price_per_kwh;
    ELSE
        SELECT price_per_kwh INTO current_price FROM public.energy_settings LIMIT 1;
        NEW.price_per_kwh := COALESCE(current_price, 0.75);
    END IF;

    -- Forced calculation of solar value
    NEW.solar_energy_value := ROUND((COALESCE(NEW.injected_energy_kwh, NEW.consumption_kwh, 0) * NEW.price_per_kwh)::numeric, 2);
    
    -- Forced calculation of total amount (per request: Total = Solar Value for now)
    -- In the future, if Energisa value should be added back, it would be done here.
    NEW.total_amount := NEW.solar_energy_value;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_calculate_bill_totals ON public.energy_bills;
CREATE TRIGGER tr_calculate_bill_totals
BEFORE INSERT OR UPDATE OF injected_energy_kwh, consumption_kwh, price_per_kwh ON public.energy_bills
FOR EACH ROW EXECUTE FUNCTION public.calculate_bill_totals();

-- 2. Strict Column Protection (Production Reinforcement)
-- This trigger blocks non-admins from touching ANY sensitive data.
CREATE OR REPLACE FUNCTION public.enforce_bill_column_protection()
RETURNS TRIGGER AS $$
BEGIN
    -- Admins have zero restrictions
    IF public.has_role(auth.uid(), 'admin') THEN
        RETURN NEW;
    END IF;

    -- Clients can ONLY update proof-related columns
    -- We allow changes to these columns:
    -- - invoice_file_url (solar bill upload)
    -- - energisa_bill_file_url (energisa bill upload)
    -- - energisa_payment_proof_url
    -- - solar_payment_proof_url
    
    IF (OLD.total_amount IS DISTINCT FROM NEW.total_amount) OR
       (OLD.solar_energy_value IS DISTINCT FROM NEW.solar_energy_value) OR
       (OLD.energisa_bill_value IS DISTINCT FROM NEW.energisa_bill_value) OR
       (OLD.consumption_kwh IS DISTINCT FROM NEW.consumption_kwh) OR
       (OLD.injected_energy_kwh IS DISTINCT FROM NEW.injected_energy_kwh) OR
       (OLD.month IS DISTINCT FROM NEW.month) OR
       (OLD.year IS DISTINCT FROM NEW.year) OR
       (OLD.due_date IS DISTINCT FROM NEW.due_date) OR
       (OLD.payment_status IS DISTINCT FROM NEW.payment_status) OR
       (OLD.consumer_unit_id IS DISTINCT FROM NEW.consumer_unit_id) OR
       (OLD.price_per_kwh IS DISTINCT FROM NEW.price_per_kwh) OR
       (OLD.utility_tariff_used IS DISTINCT FROM NEW.utility_tariff_used)
    THEN
        RAISE EXCEPTION 'Erro de Segurança: Clientes não podem alterar dados financeiros ou estruturais da fatura.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_enforce_bill_column_protection ON public.energy_bills;
CREATE TRIGGER tr_enforce_bill_column_protection
BEFORE UPDATE ON public.energy_bills
FOR EACH ROW EXECUTE FUNCTION public.enforce_bill_column_protection();

-- 3. Storage Hardening: Size and Type Limits
-- Update existing policies to be even stricter.
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Clients can upload their own proofs" ON storage.objects;
END $$;

CREATE POLICY "Clients can upload their own proofs" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'invoices' 
    AND (storage.foldername(name))[1] = 'proofs'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND (LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'pdf'))
    -- Limit to 5MB (5242880 bytes)
    AND (octet_length(content) <= 5242880)
);

-- 4. Standardize has_role check for users without specific roles
-- Ensure that everyone is at least a 'client' if they exist in auth.users
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_to_check public.app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE public.user_roles.user_id = has_role.user_id 
    AND public.user_roles.role = has_role.role_to_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
