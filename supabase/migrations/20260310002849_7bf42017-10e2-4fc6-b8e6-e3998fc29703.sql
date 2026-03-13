ALTER TABLE public.energy_bills 
  ADD COLUMN IF NOT EXISTS injected_energy_kwh numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS solar_energy_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS energisa_bill_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS energisa_bill_file_url text DEFAULT NULL;