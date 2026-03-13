-- Migration: Automated Overdue Notifications
-- Phase 22: Overdue Scanner

-- 1. Create the function to process overdue bills
CREATE OR REPLACE FUNCTION public.process_bill_overdue()
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

    -- Loop through bills that are past due and still pending
    FOR bill IN 
        SELECT eb.*, cu.client_id
        FROM public.energy_bills eb
        JOIN public.consumer_units cu ON cu.id = eb.consumer_unit_id
        WHERE eb.due_date < CURRENT_DATE
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
            -- Check if we already sent an overdue notification for this bill
            IF NOT EXISTS (
                SELECT 1 FROM public.notifications 
                WHERE bill_id = bill.id 
                  AND type = 'bill_overdue' 
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
                    VALUES (v_user_id, bill.id, 'bill_overdue', 'whatsapp', 
                        jsonb_build_object(
                            'month', v_month_name, 
                            'year', bill.year, 
                            'amount', bill.total_amount, 
                            'due_date', bill.due_date, 
                            'pix_key', v_pix_key
                        ));
                END IF;

                -- Insert Email Notification
                INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
                VALUES (v_user_id, bill.id, 'bill_overdue', 'email', 
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

-- 2. Schedule the job (Runs daily at 09:00 AM)
SELECT cron.schedule(
    'process-bill-overdue-daily', 
    '0 9 * * *',                   
    'SELECT public.process_bill_overdue()' 
);
