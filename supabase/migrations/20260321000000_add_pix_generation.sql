-- Migration: Automatic PIX Generation
-- Phase 23: PIX EMV & QR Code Integration

-- 1. Add columns to energy_bills
ALTER TABLE public.energy_bills 
ADD COLUMN IF NOT EXISTS pix_copy_paste TEXT,
ADD COLUMN IF NOT EXISTS pix_qrcode_url TEXT;

-- 2. CRC16 function for PIX (CCITT-FALSE)
CREATE OR REPLACE FUNCTION public.crc16_pix(str text) 
RETURNS text AS $$
DECLARE
    crc integer := 65535; -- 0xFFFF
    i integer;
    j integer;
    byte integer;
    polynomial integer := 4129; -- 0x1021
BEGIN
    FOR i IN 1..length(str) LOOP
        byte := ascii(substring(str from i for 1));
        crc := crc # (byte << 8);
        FOR j IN 1..8 LOOP
            IF (crc & 32768) != 0 THEN
                crc := (crc << 1) # polynomial;
            ELSE
                crc := (crc << 1);
            END IF;
            crc := crc & 65535;
        END LOOP;
    END LOOP;
    RETURN upper(lpad(to_hex(crc), 4, '0'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Function to generate PIX Copy & Paste (EMV Standard)
CREATE OR REPLACE FUNCTION public.generate_pix_emv(
    v_pix_key text, 
    v_amount numeric, 
    v_description text, 
    v_reference text
) RETURNS text AS $$
DECLARE
    payload text;
    gui text := '0014BR.GOV.BCB.PIX';
    merchant_name text := 'SOLCONTROLE';
    merchant_city text := 'CUIABA'; -- Default or city from settings
    amount_str text;
    merchant_account_info text;
    additional_data text;
    emv text;
BEGIN
    -- Format amount (2 decimal places)
    amount_str := to_char(v_amount, 'FM999990.00');
    
    -- MERCHANT ACCOUNT INFORMATION (ID 26)
    merchant_account_info := '00' || lpad(length(gui)::text, 2, '0') || gui ||
                             '01' || lpad(length(v_pix_key)::text, 2, '0') || v_pix_key;
                             
    IF v_description IS NOT NULL AND v_description != '' THEN
        merchant_account_info := merchant_account_info || '02' || lpad(length(v_description)::text, 2, '0') || v_description;
    END IF;

    -- ADDITIONAL DATA FIELD (ID 62)
    additional_data := '05' || lpad(length(v_reference)::text, 2, '0') || v_reference;

    -- ASSEMBLING PAYLOAD (without CRC)
    payload := '000201' || -- Payload Format Indicator
              '26' || lpad(length(merchant_account_info)::text, 2, '0') || merchant_account_info ||
              '52040000' || -- Merchant Category Code
              '5303986' || -- Transaction Currency (Real)
              '54' || lpad(length(amount_str)::text, 2, '0') || amount_str ||
              '5802BR' || -- Country Code
              '59' || lpad(length(merchant_name)::text, 2, '0') || merchant_name ||
              '60' || lpad(length(merchant_city)::text, 2, '0') || merchant_city ||
              '62' || lpad(length(additional_data)::text, 2, '0') || additional_data ||
              '6304'; -- CRC tag

    -- Append CRC16
    payload := payload || public.crc16_pix(payload);
    
    RETURN payload;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Trigger Function to auto-generate PIX on Bill Insert
CREATE OR REPLACE FUNCTION public.handle_bill_pix_generation()
RETURNS TRIGGER AS $$
DECLARE
    v_pix_key TEXT;
    v_description TEXT;
    v_reference TEXT;
BEGIN
    -- Get global pix key
    SELECT pix_key INTO v_pix_key FROM public.energy_settings LIMIT 1;
    
    IF v_pix_key IS NOT NULL AND v_pix_key != '' THEN
        v_description := 'Fatura ' || NEW.month || '/' || NEW.year;
        v_reference := 'B' || lpad(NEW.id::text, 10, '0'); -- Shortened reference for EMV
        
        -- Generate EMV String
        NEW.pix_copy_paste := public.generate_pix_emv(v_pix_key, NEW.total_amount, v_description, 'INV' || NEW.month || NEW.year);
        
        -- Generate QR Code URL (API)
        NEW.pix_qrcode_url := 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&qzone=1&data=' || encode(NEW.pix_copy_paste::bytea, 'escape');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create Trigger
DROP TRIGGER IF EXISTS tr_generate_bill_pix ON public.energy_bills;
CREATE TRIGGER tr_generate_bill_pix
BEFORE INSERT ON public.energy_bills
FOR EACH ROW
EXECUTE FUNCTION public.handle_bill_pix_generation();
