-- Migration: Add WhatsApp to queue_notification trigger
-- Phase 20: WhatsApp Integration (Production Corrected)

CREATE OR REPLACE FUNCTION public.queue_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_phone TEXT;
    v_email_enabled BOOLEAN := true;
    v_whatsapp_enabled BOOLEAN := true;
    v_push_enabled BOOLEAN := true;
    v_pix_key TEXT;
    v_month_name TEXT;
BEGIN
    -- 1. Identify User and Phone number via the correct path:
    -- energy_bills -> consumer_units -> clients -> profiles
    SELECT 
        c.user_id, 
        COALESCE(p.phone, c.phone)
    INTO v_user_id, v_phone
    FROM public.consumer_units cu
    JOIN public.clients c ON c.id = cu.client_id
    LEFT JOIN public.profiles p ON p.user_id = c.user_id
    WHERE cu.id = NEW.consumer_unit_id;

    -- If no user is linked, we can't notify
    IF v_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 2. Fetch User Notification Preferences (Default to true if row is missing)
    SELECT 
        COALESCE(email_enabled, true),
        COALESCE(whatsapp_enabled, true),
        COALESCE(push_enabled, true)
    INTO v_email_enabled, v_whatsapp_enabled, v_push_enabled
    FROM public.notification_settings 
    WHERE user_id = v_user_id;

    -- 3. Fetch Global PIX Key
    SELECT pix_key INTO v_pix_key FROM public.energy_settings LIMIT 1;
    
    -- Format month name for display (optional, but better for the template)
    v_month_name := CASE NEW.month
        WHEN 1 THEN 'Janeiro' WHEN 2 THEN 'Fevereiro' WHEN 3 THEN 'Março'
        WHEN 4 THEN 'Abril' WHEN 5 THEN 'Maio' WHEN 6 THEN 'Junho'
        WHEN 7 THEN 'Julho' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Setembro'
        WHEN 10 THEN 'Outubro' WHEN 11 THEN 'Novembro' WHEN 12 THEN 'Dezembro'
        ELSE 'Mês ' || NEW.month
    END;

    -- 4. Handle New Bill (INSERT)
    IF (TG_OP = 'INSERT') THEN
        -- Email
        IF v_email_enabled THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (v_user_id, NEW.id, 'bill_generated', 'email', 
                jsonb_build_object('month', v_month_name, 'year', NEW.year, 'amount', NEW.total_amount, 'due_date', NEW.due_date));
        END IF;
        
        -- WhatsApp (Only if phone is available)
        IF v_whatsapp_enabled AND v_phone IS NOT NULL AND v_phone != '' THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (v_user_id, NEW.id, 'bill_generated', 'whatsapp', 
                jsonb_build_object(
                    'month', v_month_name, 
                    'year', NEW.year, 
                    'amount', NEW.total_amount, 
                    'due_date', NEW.due_date, 
                    'pix_key', COALESCE(NEW.pix_copy_paste, v_pix_key),
                    'pix_qrcode', NEW.pix_qrcode_url
                ));
        END IF;

        -- Push
        IF v_push_enabled THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (v_user_id, NEW.id, 'bill_generated', 'push', 
                jsonb_build_object('title', 'Nova Fatura', 'body', 'Sua fatura de ' || v_month_name || '/' || NEW.year || ' está disponível.'));
        END IF;
    END IF;

    -- 5. Handle Payment Confirmed (UPDATE payment_status)
    IF (TG_OP = 'UPDATE' AND NEW.payment_status = 'paid' AND OLD.payment_status != 'paid') THEN
        -- Email
        IF v_email_enabled THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (v_user_id, NEW.id, 'payment_confirmed', 'email', 
                jsonb_build_object('month', v_month_name, 'year', NEW.year, 'amount', NEW.total_amount));
        END IF;
        
        -- WhatsApp
        IF v_whatsapp_enabled AND v_phone IS NOT NULL AND v_phone != '' THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (v_user_id, NEW.id, 'payment_confirmed', 'whatsapp', 
                jsonb_build_object('month', v_month_name, 'year', NEW.year, 'amount', NEW.total_amount));
        END IF;

        -- Push
        IF v_push_enabled THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (v_user_id, NEW.id, 'payment_confirmed', 'push', 
                jsonb_build_object('title', 'Pagamento Confirmado', 'body', 'Obrigado! Seu pagamento foi processado.'));
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
