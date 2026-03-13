ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS tier_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tier_limit_kwh numeric DEFAULT 800,
  ADD COLUMN IF NOT EXISTS tier_price_low numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS tier_price_high numeric DEFAULT 0.0;
