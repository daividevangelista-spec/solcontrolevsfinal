-- Migration: Automated Notification Cron Jobs
-- Phase 19: Automation using pg_net and pg_cron

-- 1. Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Cron Job for Sending Pending Notifications (Every 5 minutes)
SELECT cron.schedule(
  'send-notifications-every-5-min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xvobfydrxaenmocwveqj.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT value FROM secrets WHERE name = 'SERVICE_ROLE_KEY') -- Requer acesso a segredos ou passar a key fixa
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 3. Cron Job for Processing Reminders (Daily at 08:00 AM)
SELECT cron.schedule(
  'process-reminders-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xvobfydrxaenmocwveqj.supabase.co/functions/v1/process-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT value FROM secrets WHERE name = 'SERVICE_ROLE_KEY')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Alternativa se não houver acesso dinâmico à service_role_key via SQL:
-- O usuário pode substituir a URL e a KEY fixas se preferir no painel SQL do Supabase.
