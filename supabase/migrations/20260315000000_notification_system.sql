-- Phase 19: Notification System Infrastructure

-- 1. Notification Settings (Preferences)
CREATE TABLE IF NOT EXISTS public.notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    whatsapp_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Notification Queue
CREATE TYPE public.notification_type AS ENUM (
    'bill_generated', 
    'bill_reminder_3d', 
    'bill_overdue', 
    'payment_proof_sent', 
    'payment_confirmed'
);

CREATE TYPE public.notification_channel AS ENUM ('email', 'whatsapp', 'push');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES public.energy_bills(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    channel public.notification_channel NOT NULL,
    status public.notification_status DEFAULT 'pending',
    payload JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ
);

-- RLS for Notification Settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification settings"
    ON public.notification_settings
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS for Notifications (Clients can only see their own, Admins can see all)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications"
    ON public.notifications
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- 3. Automatic Creation of Notification Settings on Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_settings (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_on_profile_created_notifications
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notification_settings();

-- Populate for existing users
INSERT INTO public.notification_settings (user_id)
SELECT user_id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- 4. Notification Triggers Logic

-- Trigger for New Bill / Payment Confirmation
CREATE OR REPLACE FUNCTION public.queue_notification()
RETURNS TRIGGER AS $$
DECLARE
    client_user_id UUID;
    settings RECORD;
BEGIN
    -- Get the user_id associated with the client
    SELECT user_id INTO client_user_id FROM public.clients WHERE id = NEW.client_id;
    
    IF client_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get user preferences
    SELECT * INTO settings FROM public.notification_settings WHERE user_id = client_user_id;

    -- Handle New Bill (INSERT)
    IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'energy_bills') THEN
        IF settings.email_enabled THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (client_user_id, NEW.id, 'bill_generated', 'email', jsonb_build_object('month', NEW.month, 'year', NEW.year, 'amount', NEW.total_amount));
        END IF;
        IF settings.push_enabled THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (client_user_id, NEW.id, 'bill_generated', 'push', jsonb_build_object('title', 'Nova Fatura', 'body', 'Sua fatura de ' || NEW.month || '/' || NEW.year || ' está disponível.'));
        END IF;
    END IF;

    -- Handle Payment Proof Sent (UPDATE payment_proof)
    IF (TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'energy_bills' AND NEW.payment_proof IS NOT NULL AND OLD.payment_proof IS NULL) THEN
        -- Notify Admin (Could be a different logic, but for now let's stick to client events)
    END IF;

    -- Handle Payment Confirmed (UPDATE payment_status)
    IF (TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'energy_bills' AND NEW.payment_status = 'paid' AND OLD.payment_status != 'paid') THEN
        IF settings.email_enabled THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (client_user_id, NEW.id, 'payment_confirmed', 'email', jsonb_build_object('month', NEW.month, 'year', NEW.year));
        END IF;
        IF settings.push_enabled THEN
            INSERT INTO public.notifications (user_id, bill_id, type, channel, payload)
            VALUES (client_user_id, NEW.id, 'payment_confirmed', 'push', jsonb_build_object('title', 'Pagamento Confirmado', 'body', 'Obrigado! Seu pagamento foi processado.'));
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers
CREATE TRIGGER tr_notify_bill_events
AFTER INSERT OR UPDATE ON public.energy_bills
FOR EACH ROW EXECUTE FUNCTION public.queue_notification();

-- 5. Audit Log Integration
CREATE TRIGGER tr_audit_notification_settings
AFTER INSERT OR UPDATE OR DELETE ON public.notification_settings
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER tr_audit_notifications
AFTER INSERT OR UPDATE OR DELETE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
