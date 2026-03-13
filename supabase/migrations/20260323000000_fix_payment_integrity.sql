-- Migration: Fix Payment Status Enum & Integrity Function
-- Phase 25: Database Stabilization

-- 1. Ensure all values are in the enum (Safety check)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payment_status' AND e.enumlabel = 'awaiting_confirmation') THEN
        ALTER TYPE public.payment_status ADD VALUE 'awaiting_confirmation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payment_status' AND e.enumlabel = 'receipt_sent') THEN
        ALTER TYPE public.payment_status ADD VALUE 'receipt_sent';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payment_status' AND e.enumlabel = 'confirmed') THEN
        ALTER TYPE public.payment_status ADD VALUE 'confirmed';
    END IF;
EXCEPTION
    WHEN others THEN 
        RAISE NOTICE 'Enum extension skipped or failed: %', SQLERRM;
END $$;

-- 2. Update the integrity function to be safer
CREATE OR REPLACE FUNCTION public.protect_bill_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is an admin, allow everything
    -- NOTE: 'postgres' and service role are handled by bypass, 
    -- but we check our custom role logic too.
    IF public.has_role(auth.uid(), 'admin') THEN
        RETURN NEW;
    END IF;

    -- If NOT an admin, check if sensitive columns are being modified
    IF (OLD.total_amount IS DISTINCT FROM NEW.total_amount) OR
       (OLD.month IS DISTINCT FROM NEW.month) OR
       (OLD.year IS DISTINCT FROM NEW.year) OR
       (OLD.due_date IS DISTINCT FROM NEW.due_date) OR
       (OLD.consumer_unit_id IS DISTINCT FROM NEW.consumer_unit_id) OR
       (OLD.price_per_kwh IS DISTINCT FROM NEW.price_per_kwh) OR
       (OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status::text != 'awaiting_confirmation')
    THEN
        -- Allow changing status to 'awaiting_confirmation' (e.g. client sent a receipt)
        -- but block changing to 'paid' or anything else.
        RAISE EXCEPTION 'Acesso negado: Você não tem permissão para alterar valores financeiros ou marcar esta fatura como paga.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
