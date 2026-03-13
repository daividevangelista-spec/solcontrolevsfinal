-- Migration: Fix Storage Buckets and Policies for QR Codes and Invoices
-- This ensures the buckets exist and have the correct RLS for both admins and clients.

-- 1. Ensure 'qrcodes' bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qrcodes', 'qrcodes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage policies for 'qrcodes' (Clear and robust)
-- Drop existing to avoid conflicts if needed, but we used CREATE POLICY which might fail if exists.
-- Better to use DO blocks or names that are likely unique.

DO $$ 
BEGIN
    -- Select: Public access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'QR Codes Select' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "QR Codes Select" ON storage.objects FOR SELECT USING (bucket_id = 'qrcodes');
    END IF;

    -- Insert/Update/Delete: Admin only
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'QR Codes Admin Insert' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "QR Codes Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qrcodes' AND public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'QR Codes Admin Update' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "QR Codes Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'qrcodes' AND public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'QR Codes Admin Delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "QR Codes Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'qrcodes' AND public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- 3. Ensure 'invoices' bucket is properly configured for proofs
-- Clients need to upload to specific folders (proofs_solar, proofs_energisa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Proofs' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Authenticated Upload Proofs" ON storage.objects FOR INSERT 
        WITH CHECK (bucket_id = 'invoices' AND auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 5. Relax RLS for 'clients' to allow auto-linking by email (Case Insensitive)
DO $$ 
BEGIN
    -- Select policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients see record by email' AND tablename = 'clients' AND schemaname = 'public') THEN
        CREATE POLICY "Clients see record by email" ON public.clients FOR SELECT USING (LOWER(email) = LOWER(auth.jwt()->>'email'));
    END IF;

    -- Update policy: Allow user to link themselves once if email matches and user_id is null
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients link own record' AND tablename = 'clients' AND schemaname = 'public') THEN
        CREATE POLICY "Clients link own record" ON public.clients FOR UPDATE 
        USING (LOWER(email) = LOWER(auth.jwt()->>'email') AND user_id IS NULL)
        WITH CHECK (LOWER(email) = LOWER(auth.jwt()->>'email') AND user_id = auth.uid());
    END IF;
END $$;
