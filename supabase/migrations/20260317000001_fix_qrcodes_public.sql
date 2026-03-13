-- Migration: Fix QR Codes bucket visibility
-- Phase 21: Reverts the qrcodes bucket to public so images can be rendered in the application and PDFs.

UPDATE storage.buckets SET public = true WHERE id = 'qrcodes';

-- Garante que o objeto do qrcode pode ser lido por qualquer um
DROP POLICY IF EXISTS "QR Codes publicly accessible" ON storage.objects;
CREATE POLICY "QR Codes publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'qrcodes');
