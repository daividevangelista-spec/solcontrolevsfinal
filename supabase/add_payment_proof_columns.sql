-- Add payment proof columns to energy_bills
ALTER TABLE public.energy_bills 
ADD COLUMN IF NOT EXISTS energisa_payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS solar_payment_proof_url TEXT;

-- We don't have a strict enum for payment_status in the DB (it's likely TEXT), 
-- but we should ensure the UI handles: 'pending', 'receipt_sent', 'confirmed', 'overdue'.
-- 'receipt_sent' corresponds to "Comprovante enviado"
-- 'confirmed' corresponds to "Confirmado pelo admin" (equivalent to 'paid')
