-- Migration: Add PIX QR Code to settings and PIX overrides to clients

-- Add global QR code to energy_settings
ALTER TABLE public.energy_settings
  ADD COLUMN IF NOT EXISTS pix_qr_code_url text DEFAULT NULL;

-- Add client-specific PIX overrides to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS override_pix boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_pix_key text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_pix_qr_code_url text DEFAULT NULL;

-- We should also ensure a storage bucket exists for QR codes (reusing 'receipts' or creating a new one 'qrcodes')
-- For simplicity, let's create a public bucket specifically for QR Codes if it doesn't exist.
-- Assuming we can insert into storage.buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qrcodes', 'qrcodes', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for QR Codes bucket
CREATE POLICY "QR Codes publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'qrcodes');
CREATE POLICY "Admins can upload QR codes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qrcodes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update QR codes" ON storage.objects FOR UPDATE USING (bucket_id = 'qrcodes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete QR codes" ON storage.objects FOR DELETE USING (bucket_id = 'qrcodes' AND public.has_role(auth.uid(), 'admin'));
