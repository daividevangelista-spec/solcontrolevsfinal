-- SOLUÇÃO: Sincronizar total_amount desativando temporariamente a trava de segurança
-- Rode este script no SQL Editor do Supabase.

BEGIN;

-- 1. Desativar temporariamente a trigger de proteção
ALTER TABLE public.energy_bills DISABLE TRIGGER tr_protect_bill_integrity;

-- 2. Atualizar os valores (Soma Solar + Energisa)
UPDATE public.energy_bills 
SET total_amount = solar_energy_value + energisa_bill_value
WHERE ABS(total_amount - (solar_energy_value + energisa_bill_value)) > 0.01;

-- 3. Reativar a trigger de proteção
ALTER TABLE public.energy_bills ENABLE TRIGGER tr_protect_bill_integrity;

COMMIT;

-- Consulta de Verificação:
-- SELECT id, solar_energy_value, energisa_bill_value, total_amount FROM public.energy_bills LIMIT 10;
