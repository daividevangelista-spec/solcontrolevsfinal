-- script_teste_notificacoes.sql
-- 1. Primeiro, certifique-se de que o PIX key existe para evitar erros na trigger
UPDATE public.energy_settings SET pix_key = 'francis.pix@teste.com' WHERE id IS NOT NULL;

-- 2. Limpar qualquer fatura existente para este mês/ano para evitar erro de duplicidade
DELETE FROM public.energy_bills 
WHERE consumer_unit_id = 'e74f757a-54e9-41d6-acb0-acd8f9bcd6db' 
  AND month = EXTRACT(MONTH FROM now())::INTEGER 
  AND year = EXTRACT(YEAR FROM now())::INTEGER;

-- 3. Inserir uma fatura de teste para a unidade consumidora informada
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
    CURRENT_DATE + interval '10 days', 
    'pending'
);

-- 3. Verificar se as notificações foram criadas (EMAIL e WHATSAPP)
SELECT 
    n.id, 
    n.channel, 
    n.status, 
    n.type,
    p.email as email_alvo,
    p.phone as telefone_alvo,
    n.payload
FROM public.notifications n
JOIN public.profiles p ON p.user_id = n.user_id
WHERE n.bill_id = (SELECT id FROM public.energy_bills ORDER BY created_at DESC LIMIT 1)
ORDER BY n.channel;

-- 4. (Opcional) Limpar o teste se desejar:
-- DELETE FROM public.energy_bills WHERE consumer_unit_id = 'e74f757a-54e9-41d6-acb0-acd8f9bcd6db' AND year = 2026;
