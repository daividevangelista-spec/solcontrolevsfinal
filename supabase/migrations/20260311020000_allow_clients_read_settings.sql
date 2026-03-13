-- Migration: Allow Authenticated users to read energy_settings
-- This is necessary for clients to see the global PIX key and QR Code.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read settings' AND tablename = 'energy_settings' AND schemaname = 'public') THEN
        CREATE POLICY "Authenticated users can read settings" ON public.energy_settings FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;
