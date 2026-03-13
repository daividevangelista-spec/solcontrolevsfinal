-- test_payment_confirmation.sql
-- Script para testar a confirmação automática de pagamento

-- 1. Limpar fatura de teste se já existir (evita erro de duplicidade)
DELETE FROM public.energy_bills 
WHERE consumer_unit_id = 'e74f757a-54e9-41d6-acb0-acd8f9bcd6db' 
  AND month = 1 
  AND year = 2026;

-- 2. Criar uma fatura de teste (o trigger gerará o TxID e PIX automaticamente)
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
    1, 
    2026, 
    100, 
    1.20, 
    120.00, 
    '2026-02-10', 
    'pending'
);

-- 2. Verificar se o TxID foi gerado
SELECT id, pix_txid FROM public.energy_bills WHERE month = 1 AND year = 2026;

-- 3. SIMULAR PAGAMENTO (Atualizar status para 'paid')
-- Isso deve disparar o trigger tr_notify_payment_confirmation
UPDATE public.energy_bills 
SET payment_status = 'paid', 
    pix_paid_at = now() 
WHERE month = 1 AND year = 2026;

-- 4. Verificar se a notificação de confirmação foi criada na fila
SELECT 
    n.id, 
    n.channel, 
    n.type, 
    n.status, 
    n.payload->>'amount' as valor_pago,
    n.payload->>'month' as referencia
FROM public.notifications n
WHERE n.type = 'payment_confirmed'
ORDER BY n.created_at DESC
LIMIT 1;

-- Opcional: Chamar a função de verificação manual (simulação de integração)
-- SELECT net.http_post('https://<PROJECT_ID>.supabase.co/functions/v1/check-payments', ...);
