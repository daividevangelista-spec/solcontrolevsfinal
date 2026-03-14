-- Migration: Client PIX Refinement
-- Description: Unifies PIX fields, stops automatic generation, and implements client-to-bill copying.

-- 1. Refurbish 'clients' table fields
DO $$ 
BEGIN
    -- Rename custom_pix_key if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'custom_pix_key') THEN
        ALTER TABLE public.clients RENAME COLUMN custom_pix_key TO pix_key;
    END IF;

    -- Rename custom_pix_qr_code_url if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'custom_pix_qr_code_url') THEN
        ALTER TABLE public.clients RENAME COLUMN custom_pix_qr_code_url TO pix_qrcode_url;
    END IF;

    -- Rename custom_pix_receiver if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'custom_pix_receiver') THEN
        ALTER TABLE public.clients RENAME COLUMN custom_pix_receiver TO pix_holder_name;
    END IF;

    -- Add pix_holder_name to energy_bills if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'energy_bills' AND column_name = 'pix_holder_name') THEN
        ALTER TABLE public.energy_bills ADD COLUMN pix_holder_name TEXT;
    END IF;
END $$;

-- 2. Deactivate old automatic generation trigger
DROP TRIGGER IF EXISTS tr_generate_bill_pix ON public.energy_bills;

-- 3. Update generation function to be a NO-OP (as requested: RETURN NEW)
CREATE OR REPLACE FUNCTION public.handle_bill_pix_generation()
RETURNS TRIGGER AS $$
BEGIN
    -- This function is now a no-op to satisfy existing references 
    -- and ensure the system doesn't generate automatic PIX EMV strings.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create NEW trigger function to copy PIX data from Client to Bill
CREATE OR REPLACE FUNCTION public.handle_bill_pix_copy_from_client()
RETURNS TRIGGER AS $$
DECLARE
    v_client_id UUID;
    v_pix_key TEXT;
    v_pix_qrcode_url TEXT;
    v_pix_holder_name TEXT;
BEGIN
    -- Get the client_id from the consumer unit
    SELECT client_id INTO v_client_id 
    FROM public.consumer_units 
    WHERE id = NEW.consumer_unit_id;

    -- Fetch PIX data from the client
    SELECT pix_key, pix_qrcode_url, pix_holder_name 
    INTO v_pix_key, v_pix_qrcode_url, v_pix_holder_name
    FROM public.clients
    WHERE id = v_client_id;

    -- Copy to the bill record
    NEW.pix_copy_paste := v_pix_key;
    NEW.pix_qrcode_url := v_pix_qrcode_url;
    NEW.pix_holder_name := v_pix_holder_name;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create the copy trigger
DROP TRIGGER IF EXISTS tr_copy_client_pix_to_bill ON public.energy_bills;
CREATE TRIGGER tr_copy_client_pix_to_bill
BEFORE INSERT ON public.energy_bills
FOR EACH ROW
EXECUTE FUNCTION public.handle_bill_pix_copy_from_client();
