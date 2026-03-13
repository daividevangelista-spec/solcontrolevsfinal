-- test_pix_billing.sql
-- Script para testar a geração automática de PIX e QR Code

-- 1. Certificar que existe uma chave PIX configurada
UPDATE public.energy_settings SET pix_key = 'francis.pix@teste.com' WHERE id IS NOT NULL;

-- 2. Limpar fatura de teste se existir
DELETE FROM public.energy_bills 
WHERE consumer_unit_id = 'e74f757a-54e9-41d6-acb0-acd8f9bcd6db' 
  AND month = 12 AND year = 2025;

-- 3. Inserir nova fatura
INSERT INTO public.energy_bills (
    consumer_unit_id, 
    month, 
    year, 
    consumption_kwh, 
    price_per_kwh, 
    total_amount, 
    due_date, 
    payment_status
) VALUES (
    'e74f757a-54e9-41d6-acb0-acd8f9bcd6db', 
    12, 
    2025, 
    150, 
    1.00, 
    150.00, 
    '2025-12-30', 
    'pending'
);

-- 4. Verificar se os campos PIX foram gerados na tabela energy_bills
SELECT 
    id, 
    total_amount, 
    pix_copy_paste, 
    pix_qrcode_url 
FROM public.energy_bills 
WHERE month = 12 AND year = 2025;

-- 5. Verificar se a notificação foi criada com o payload correto
SELECT 
    n.channel, 
    n.type, 
    n.payload->>'amount' as valor,
    n.payload->>'pix_key' as copia_e_cola,
    n.payload->>'pix_qrcode' as link_qrcode
FROM public.notifications n
WHERE n.bill_id = (SELECT id FROM public.energy_bills WHERE month = 12 AND year = 2025)
  AND n.channel = 'whatsapp';
