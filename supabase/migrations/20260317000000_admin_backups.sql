-- Migration: Admin Backups Table
CREATE TABLE IF NOT EXISTS public.backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('json', 'csv')),
    record_count INTEGER DEFAULT 0,
    file_size_kb INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Only Admins can see/manage backups
CREATE POLICY "Admins can manage backups"
    ON public.backups
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Audit log integration
CREATE TRIGGER tr_audit_backups
AFTER INSERT OR UPDATE OR DELETE ON public.backups
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
