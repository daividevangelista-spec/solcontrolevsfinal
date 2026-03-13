-- Migration: Dynamic Primary Key support for Audit Log Trigger
-- Fixes error "record 'new' has no field 'id'" when auditing tables without an 'id' column

CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID := auth.uid();
    extracted_record_id UUID;
    pk_column_name TEXT;
BEGIN
    -- Determine the primary key column name dynamically
    -- Fallback to 'id' if not found, but check for 'user_id' as it's our other common PK
    IF TG_TABLE_NAME = 'notification_settings' THEN
        pk_column_name := 'user_id';
    ELSE
        pk_column_name := 'id';
    END IF;

    -- Extract the record ID dynamically based on the operation
    IF (TG_OP = 'DELETE') THEN
        EXECUTE format('SELECT ($1).%I', pk_column_name) USING OLD INTO extracted_record_id;
        INSERT INTO public.audit_logs (table_name, record_id, action, performed_by, old_data)
        VALUES (TG_TABLE_NAME, extracted_record_id, TG_OP, current_user_id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        EXECUTE format('SELECT ($1).%I', pk_column_name) USING NEW INTO extracted_record_id;
        INSERT INTO public.audit_logs (table_name, record_id, action, performed_by, old_data, new_data)
        VALUES (TG_TABLE_NAME, extracted_record_id, TG_OP, current_user_id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        EXECUTE format('SELECT ($1).%I', pk_column_name) USING NEW INTO extracted_record_id;
        INSERT INTO public.audit_logs (table_name, record_id, action, performed_by, new_data)
        VALUES (TG_TABLE_NAME, extracted_record_id, TG_OP, current_user_id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
