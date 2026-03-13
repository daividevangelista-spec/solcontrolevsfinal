-- test_overdue.sql
-- Script para testar os avisos automáticos de fatura vencida

-- 1. Limpar faturas duplicadas para o mês de teste (mês passado)
DELETE FROM public.energy_bills 
WHERE consumer_unit_id = 'e74f757a-54e9-41d6-acb0-acd8f9bcd6db' 
  AND month = EXTRACT(MONTH FROM now() - interval '1 month')::INTEGER 
  AND year = EXTRACT(YEAR FROM now())::INTEGER;

-- 2. Criar uma fatura de teste que já VENCEU (ontem)
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
    EXTRACT(MONTH FROM now() - interval '1 month')::INTEGER, 
    EXTRACT(YEAR FROM now())::INTEGER, 
    100, 
    1.20, 
    120.00, 
    CURRENT_DATE - interval '1 day', 
    'pending'
);

-- 2. Executar manualmente a função de processamento de atrasados
SELECT public.process_bill_overdue();

-- 3. Verificar se as notificações foram criadas na fila
SELECT 
    n.id, 
    n.channel, 
    n.type, 
    n.status, 
    n.payload->>'due_date' as vencimento_no_payload,
    n.payload->>'month' as mes_no_payload
FROM public.notifications n
WHERE n.type = 'bill_overdue'
ORDER BY n.created_at DESC
LIMIT 2;

-- 4. Opcional: Limpar se quiser rodar de novo
-- DELETE FROM public.notifications WHERE type = 'bill_overdue';
-- DELETE FROM public.energy_bills WHERE due_date < CURRENT_DATE;
