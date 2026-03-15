-- Migration: Final Access & Visibility Restoration
-- Restores missing client policies drowned by previous hardening.

-- 1. Allow everyone to see their own role (CRITICAL for AuthContext to work)
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2. Restore Client view policies (dropped in previous moderator migration)
DROP POLICY IF EXISTS "Clients view own record" ON public.clients;
CREATE POLICY "Clients view own record" ON public.clients
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clients view own units" ON public.consumer_units;
CREATE POLICY "Clients view own units" ON public.consumer_units
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.clients WHERE clients.id = consumer_units.client_id AND clients.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Clients view own bills" ON public.energy_bills;
CREATE POLICY "Clients view own bills" ON public.energy_bills
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.consumer_units cu
    JOIN public.clients c ON c.id = cu.client_id
    WHERE cu.id = energy_bills.consumer_unit_id AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Clients view own payments" ON public.payments;
CREATE POLICY "Clients view own payments" ON public.payments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.energy_bills eb
    JOIN public.consumer_units cu ON cu.id = eb.consumer_unit_id
    JOIN public.clients c ON c.id = cu.client_id
    WHERE eb.id = payments.bill_id AND c.user_id = auth.uid()
  )
);

-- 3. Ensure profiles are always readable by the owner
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);
