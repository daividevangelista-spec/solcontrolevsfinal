-- Migration: Secure Cron Auth
-- Phase 27: Fixing Service Role Auth for Edge Functions

-- 1. Create a secure internal table for secrets if it doesn't exist
-- This table is useful to store sensitive keys that need to be accessed via SQL/Cron
CREATE TABLE IF NOT EXISTS public.secrets (
    name TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Safety)
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

-- Only service_role can access this
CREATE POLICY "Service Role Only" ON public.secrets
FOR ALL TO service_role USING (true);

-- 2. Update the Cron Job for Notifications
-- IMPORTANT: The user must insert the SERVICE_ROLE_KEY into the secrets table:
-- INSERT INTO public.secrets (name, value) VALUES ('SERVICE_ROLE_KEY', 'your-actual-key-here') 
-- ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;

-- Remove previously existing job safely
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-notifications-every-5-min') THEN
        PERFORM cron.unschedule('send-notifications-every-5-min');
    END IF;
END $$;
SELECT cron.schedule(
  'send-notifications-every-5-min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xvobfydrxaenmocwveqj.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE((SELECT value FROM public.secrets WHERE name = 'SERVICE_ROLE_KEY'), '')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 3. Update the Cron Job for Reminders
-- Remove previously existing job safely
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-reminders-daily') THEN
        PERFORM cron.unschedule('process-reminders-daily');
    END IF;
END $$;
SELECT cron.schedule(
  'process-reminders-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xvobfydrxaenmocwveqj.supabase.co/functions/v1/process-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE((SELECT value FROM public.secrets WHERE name = 'SERVICE_ROLE_KEY'), '')
    ),
    body := '{}'::jsonb
  );
  $$
);
