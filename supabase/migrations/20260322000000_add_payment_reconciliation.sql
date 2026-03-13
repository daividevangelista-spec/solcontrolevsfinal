-- Migration: PIX Payment Reconciliation
-- Phase 24: Payment Detection & Automatic Confirmation

-- 1. Add reconciliation columns to energy_bills
ALTER TABLE public.energy_bills 
ADD COLUMN IF NOT EXISTS pix_txid TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS pix_paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pix_status TEXT DEFAULT 'pending';

-- 2. Update PIX generation to include a TxID
-- We'll modify the existing handle_bill_pix_generation function
CREATE OR REPLACE FUNCTION public.handle_bill_pix_generation()
RETURNS TRIGGER AS $$
DECLARE
    v_pix_key TEXT;
    v_description TEXT;
    v_reference TEXT;
    v_txid TEXT;
BEGIN
    -- Get global pix key
    SELECT pix_key INTO v_pix_key FROM public.energy_settings LIMIT 1;
    
    IF v_pix_key IS NOT NULL AND v_pix_key != '' THEN
        -- Generate a unique TxID (Transaction ID)
        -- In a real scenario, this might follow bank requirements. 
        -- Here we use a unique string based on date and a random part.
        v_txid := 'SOL' || to_char(now(), 'YYYYMMDDHH24MISS') || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 10));
        NEW.pix_txid := v_txid;

        v_description := 'Fatura ' || NEW.month || '/' || NEW.year;
        v_reference := v_txid; -- Use TxID as internal reference
        
        -- Generate EMV String (Copy & Paste)
        NEW.pix_copy_paste := public.generate_pix_emv(v_pix_key, NEW.total_amount, v_description, v_reference);
        
        -- Generate QR Code URL
        NEW.pix_qrcode_url := 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&qzone=1&data=' || encode(NEW.pix_copy_paste::bytea, 'escape');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger to automatically queue "Payment Confirmed" notification
CREATE OR REPLACE FUNCTION public.handle_payment_confirmation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to 'paid'
    IF (OLD.payment_status = 'pending' AND NEW.payment_status = 'paid') THEN
        
        -- Get user_id associated with the bill
        DECLARE
            v_user_id UUID;
            v_month_name TEXT;
        BEGIN
            SELECT c.user_id INTO v_user_id 
            FROM public.consumer_units cu
            JOIN public.clients c ON c.id = cu.client_id
            WHERE cu.id = NEW.consumer_unit_id;

            IF v_user_id IS NOT NULL THEN
                -- Format month name
                v_month_name := CASE NEW.month
                    WHEN 1 THEN 'Janeiro' WHEN 2 THEN 'Fevereiro' WHEN 3 THEN 'Março'
                    WHEN 4 THEN 'Abril' WHEN 5 THEN 'Maio' WHEN 6 THEN 'Junho'
                    WHEN 7 THEN 'Julho' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Setembro'
                    WHEN 10 THEN 'Outubro' WHEN 11 THEN 'Novembro' WHEN 12 THEN 'Dezembro'
                    ELSE 'Mês ' || NEW.month
                END;

                -- Insert Notification specifically for WhatsApp
                INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
                VALUES (v_user_id, NEW.id, 'payment_confirmed', 'whatsapp', 
                    jsonb_build_object(
                        'month', v_month_name, 
                        'year', NEW.year, 
                        'amount', NEW.total_amount
                    ));
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger for Payment Confirmation
DROP TRIGGER IF EXISTS tr_notify_payment_confirmation ON public.energy_bills;
CREATE TRIGGER tr_notify_payment_confirmation
AFTER UPDATE ON public.energy_bills
FOR EACH ROW
EXECUTE FUNCTION public.handle_payment_confirmation_trigger();

-- 5. Schedule payment verification Edge Function
-- Note: This requires the 'check-payments' edge function to be deployed
SELECT cron.schedule(
    'check-pix-payments-5m',
    '*/5 * * * *', -- Every 5 minutes
    $$ SELECT net.http_post('https://<PROJECT_ID>.supabase.co/functions/v1/check-payments', 
       jsonb_build_object(), 
       jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || Deno.env.get('SERVICE_ROLE_KEY'))
    ) $$
);

-- Note: In Supabase, usually we use net.http_post with pg_net extension for cron to call edge functions.
-- Alternatively, if pg_net is not enabled, one can use a custom function that calls the edge function.
-- For this implementation, we'll provide a simplified version that can be triggered.
