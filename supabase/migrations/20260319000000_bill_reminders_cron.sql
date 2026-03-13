-- Migration: Automated Bill Reminders
-- Phase 21: Scheduled Reminders

-- 1. Create the function to process reminders
CREATE OR REPLACE FUNCTION public.process_bill_reminders()
RETURNS void AS $$
DECLARE
    bill RECORD;
    v_user_id UUID;
    v_phone TEXT;
    v_pix_key TEXT;
    v_month_name TEXT;
BEGIN
    -- Get global PIX key
    SELECT pix_key INTO v_pix_key FROM public.energy_settings LIMIT 1;

    -- Loop through bills due in precisely 3 days that are still pending
    FOR bill IN 
        SELECT eb.*, cu.client_id
        FROM public.energy_bills eb
        JOIN public.consumer_units cu ON cu.id = eb.consumer_unit_id
        WHERE eb.due_date = CURRENT_DATE + interval '3 days'
          AND eb.payment_status = 'pending'
    LOOP
        -- Get user info and phone
        SELECT 
            c.user_id, 
            COALESCE(p.phone, c.phone)
        INTO v_user_id, v_phone
        FROM public.clients c
        LEFT JOIN public.profiles p ON p.user_id = c.user_id
        WHERE c.id = bill.client_id;

        IF v_user_id IS NOT NULL THEN
            -- Check if we already sent a reminder for this bill (Avoid double cron run issues)
            IF NOT EXISTS (
                SELECT 1 FROM public.notifications 
                WHERE bill_id = bill.id 
                  AND type = 'bill_reminder_3d' 
                  AND channel = 'whatsapp'
            ) THEN
                
                -- Format month name
                v_month_name := CASE bill.month
                    WHEN 1 THEN 'Janeiro' WHEN 2 THEN 'Fevereiro' WHEN 3 THEN 'Março'
                    WHEN 4 THEN 'Abril' WHEN 5 THEN 'Maio' WHEN 6 THEN 'Junho'
                    WHEN 7 THEN 'Julho' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Setembro'
                    WHEN 10 THEN 'Outubro' WHEN 11 THEN 'Novembro' WHEN 12 THEN 'Dezembro'
                    ELSE 'Mês ' || bill.month
                END;

                -- Insert WhatsApp Notification
                IF v_phone IS NOT NULL AND v_phone != '' THEN
                    INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
                    VALUES (v_user_id, bill.id, 'bill_reminder_3d', 'whatsapp', 
                        jsonb_build_object(
                            'month', v_month_name, 
                            'year', bill.year, 
                            'amount', bill.total_amount, 
                            'due_date', bill.due_date, 
                            'pix_key', v_pix_key
                        ));
                END IF;

                -- Insert Email Notification (Optional, based on user preference if you want)
                INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
                VALUES (v_user_id, bill.id, 'bill_reminder_3d', 'email', 
                    jsonb_build_object(
                        'month', v_month_name, 
                        'year', bill.year, 
                        'amount', bill.total_amount, 
                        'due_date', bill.due_date
                    ));
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Schedule the job (Runs daily at 08:00 AM)
-- Note: Requires pg_cron extension enabled in Supabase Dashboard -> Extensions
SELECT cron.schedule(
    'process-bill-reminders-daily', -- name
    '0 8 * * *',                   -- cron schedule (8 AM daily)
    'SELECT public.process_bill_reminders()' -- command
);
