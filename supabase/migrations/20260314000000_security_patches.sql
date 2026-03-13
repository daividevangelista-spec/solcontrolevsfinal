-- Migration: Security Patches (Phase 12)
-- Prevents clients from modifying billing values and fixes broken proof uploads.

-- 1. Protective Trigger for Energy Bills
-- This prevents non-admins from changing financial and metadata columns.
CREATE OR REPLACE FUNCTION public.protect_bill_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is an admin, allow everything
    IF public.has_role(auth.uid(), 'admin') THEN
        RETURN NEW;
    END IF;

    -- If NOT an admin, check if sensitive columns are being modified
    IF (OLD.total_amount IS DISTINCT FROM NEW.total_amount) OR
       (OLD.solar_energy_value IS DISTINCT FROM NEW.solar_energy_value) OR
       (OLD.energisa_bill_value IS DISTINCT FROM NEW.energisa_bill_value) OR
       (OLD.consumption_kwh IS DISTINCT FROM NEW.consumption_kwh) OR
       (OLD.injected_energy_kwh IS DISTINCT FROM NEW.injected_energy_kwh) OR
       (OLD.month IS DISTINCT FROM NEW.month) OR
       (OLD.year IS DISTINCT FROM NEW.year) OR
       (OLD.due_date IS DISTINCT FROM NEW.due_date) OR
       (OLD.consumer_unit_id IS DISTINCT FROM NEW.consumer_unit_id) OR
       (OLD.price_per_kwh IS DISTINCT FROM NEW.price_per_kwh) OR
       (OLD.utility_tariff_used IS DISTINCT FROM NEW.utility_tariff_used) OR
       (OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'confirmed')
    THEN
        RAISE EXCEPTION 'Acesso negado: Você não tem permissão para alterar valores financeiros ou o status de confirmação desta fatura.';
    END IF;

    -- Allow everything else (specifically proof URL columns)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the protection trigger
DROP TRIGGER IF EXISTS tr_protect_bill_integrity ON public.energy_bills;
CREATE TRIGGER tr_protect_bill_integrity 
BEFORE UPDATE ON public.energy_bills 
FOR EACH ROW EXECUTE FUNCTION public.protect_bill_integrity();

-- 2. Fixed Update Policy for Clients
-- Allows clients to update THEIR OWN bills (protection is now handled by the trigger above).
-- This fixes the bug where clients couldn't attach receipts.
DROP POLICY IF EXISTS "Clients can attach proofs" ON public.energy_bills;
CREATE POLICY "Clients can attach proofs" 
ON public.energy_bills FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.consumer_units cu
        JOIN public.clients c ON c.id = cu.client_id
        WHERE cu.id = energy_bills.consumer_unit_id AND c.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.consumer_units cu
        JOIN public.clients c ON c.id = cu.client_id
        WHERE cu.id = energy_bills.consumer_unit_id AND c.user_id = auth.uid()
    )
);

-- Note: Technically the trigger protects the columns, but the policy allows the operation to start.
