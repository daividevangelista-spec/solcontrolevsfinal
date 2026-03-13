-- Migration: Add 'awaiting_confirmation' to payment_status enum
-- For PostgreSQL, we use ALTER TYPE. In some environments, this can't be run in a transaction.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payment_status' AND e.enumlabel = 'awaiting_confirmation') THEN
        ALTER TYPE public.payment_status ADD VALUE 'awaiting_confirmation';
    END IF;
END
$$;

-- Note: We already have 'pending', 'paid', 'overdue'. 
-- We might need 'receipt_sent' too if we want it to be a DB-level enum, but currently it's handled as string in TypeScript.
-- To keep it consistent, let's add 'receipt_sent' to the enum too.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payment_status' AND e.enumlabel = 'receipt_sent') THEN
        ALTER TYPE public.payment_status ADD VALUE 'receipt_sent';
    END IF;
END
$$;

-- And 'confirmed'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payment_status' AND e.enumlabel = 'confirmed') THEN
        ALTER TYPE public.payment_status ADD VALUE 'confirmed';
    END IF;
END
$$;
