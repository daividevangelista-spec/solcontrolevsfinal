-- Migration: Force Admin Permissions & Master User Protection
-- Ensures the master admin user always has access regardless of local state.

-- 1. Ensure 'moderator' role exists (if not already added)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND 'moderator' = ANY(enum_range(NULL::public.app_role)::text[])) THEN
        ALTER TYPE public.app_role ADD VALUE 'moderator';
    END IF;
END $$;

-- 2. Force 'admin' role for the Master User
DO $$
DECLARE
  master_user_id UUID;
BEGIN
  -- Find the master user ID
  SELECT id INTO master_user_id FROM auth.users WHERE email = 'daivid.evangelista@edu.mt.gov.br';
  
  IF master_user_id IS NOT NULL THEN
    -- Delete any existing role to avoid unique constraint issues
    DELETE FROM public.user_roles WHERE user_id = master_user_id;
    -- Insert the correct admin role
    INSERT INTO public.user_roles (user_id, role) VALUES (master_user_id, 'admin');
    
    -- Ensure a profile exists
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (master_user_id, 'Admin Master', 'daivid.evangelista@edu.mt.gov.br')
    ON CONFLICT (user_id) DO UPDATE SET name = 'Admin Master';
  END IF;
END $$;

-- 3. Reinforce RLS Policies for user_roles (Admins MUST be able to read all roles)
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ) OR auth.uid() = user_id
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- 4. Critical: Ensure energy_bills are always readable by Admins
DROP POLICY IF EXISTS "Admins manage bills" ON public.energy_bills;
CREATE POLICY "Admins manage bills" ON public.energy_bills
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Restore Client Read Access (Secondary backup)
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
