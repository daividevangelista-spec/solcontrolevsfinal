-- Migration: Sync payments table when bill is paid
-- Phase 22: Automated Payment History

CREATE OR REPLACE FUNCTION public.sync_payment_on_bill_paid()
RETURNS TRIGGER AS $$
BEGIN
    -- Only insert if the status changed to 'paid' or 'confirmed'
    IF (NEW.payment_status IN ('paid', 'confirmed') AND (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('paid', 'confirmed'))) THEN
        INSERT INTO public.payments (
            energy_bill_id,
            payment_type,
            payment_date,
            receipt_file_url
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.payment_status = 'confirmed' THEN 'PIX'
                ELSE 'Boleto/Outro'
            END,
            CURRENT_DATE,
            NEW.solar_payment_proof_url
        )
        ON CONFLICT (energy_bill_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_payment_on_bill_paid ON public.energy_bills;
CREATE TRIGGER tr_sync_payment_on_bill_paid
AFTER UPDATE ON public.energy_bills
FOR EACH ROW
EXECUTE FUNCTION public.sync_payment_on_bill_paid();
