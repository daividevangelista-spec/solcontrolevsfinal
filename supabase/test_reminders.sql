-- test_reminders.sql
-- Script para testar os lembretes automáticos de 3 dias

-- 1. Criar uma fatura de teste que vence em EXATAMENTE 3 dias
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
    EXTRACT(MONTH FROM now())::INTEGER, 
    EXTRACT(YEAR FROM now())::INTEGER, 
    100, 
    1.20, 
    120.00, 
    CURRENT_DATE + interval '3 days', 
    'pending'
);

-- 2. Executar manualmente a função de processamento de lembretes
-- (Isso simula o que o cron faz automaticamente todo dia)
SELECT public.process_bill_reminders();

-- 3. Verificar se as notificações foram criadas na fila
SELECT 
    n.id, 
    n.channel, 
    n.type, 
    n.status, 
    n.payload->>'due_date' as vencimento_no_payload,
    n.payload->>'month' as mes_no_payload
FROM public.notifications n
WHERE n.type = 'bill_reminder_3d'
ORDER BY n.created_at DESC
LIMIT 2;

-- 4. Opcional: Limpar se quiser rodar de novo
-- DELETE FROM public.notifications WHERE type = 'bill_reminder_3d';
-- DELETE FROM public.energy_bills WHERE due_date = CURRENT_DATE + interval '3 days';
