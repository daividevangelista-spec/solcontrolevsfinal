-- Migration: Roles & Moderation Hardening
-- IMPORTANT: Run Part 1 first, then run Part 2.

-- ==========================================
-- PART 1: Run this block alone first
-- ==========================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
-- ==========================================

-- ==========================================
-- PART 2: Run the rest of the script after Part 1 completes
-- ==========================================

-- 2. Fix user_roles schema (Add missing columns that caused 400 errors)
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Add ownership tracking to sensitive tables
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.energy_bills ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.consumer_units ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 4. Set existing records created_by to a default admin (first admin found)
DO $$
DECLARE
  first_admin UUID;
BEGIN
  SELECT user_id INTO first_admin FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  IF first_admin IS NOT NULL THEN
    UPDATE public.clients SET created_by = first_admin WHERE created_by IS NULL;
    UPDATE public.energy_bills SET created_by = first_admin WHERE created_by IS NULL;
    UPDATE public.consumer_units SET created_by = first_admin WHERE created_by IS NULL;
  END IF;
END $$;

-- 5. Helper function to check if a record can be modified by the current user
CREATE OR REPLACE FUNCTION public.can_modify_record(_created_by UUID)
RETURNS BOOLEAN AS $$
DECLARE
  _current_role public.app_role;
  _creator_role public.app_role;
BEGIN
  -- Get current user role
  SELECT role INTO _current_role FROM public.user_roles WHERE user_id = auth.uid();
  
  -- If admin, can do everything
  IF _current_role = 'admin' THEN RETURN TRUE; END IF;
  
  -- If not admin or moderator, can do nothing (clients handled by their own policies)
  IF _current_role != 'moderator' THEN RETURN FALSE; END IF;
  
  -- If moderator, check creator's role
  SELECT role INTO _creator_role FROM public.user_roles WHERE user_id = _created_by;
  
  -- Moderator can ONLY modify if creator is NOT an admin
  RETURN (_creator_role IS NULL OR _creator_role != 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update Policies for Clients
DROP POLICY IF EXISTS "Admins manage clients" ON public.clients;
CREATE POLICY "Admins manage clients" ON public.clients
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  (public.has_role(auth.uid(), 'moderator') AND public.can_modify_record(created_by))
);

-- 7. Update Policies for Bills
DROP POLICY IF EXISTS "Admins manage bills" ON public.energy_bills;
CREATE POLICY "Admins manage bills" ON public.energy_bills
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  (public.has_role(auth.uid(), 'moderator') AND public.can_modify_record(created_by))
);

-- 8. Policies for user_roles (Moderators can view but not change)
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Moderators can view roles" ON public.user_roles;
CREATE POLICY "Moderators can view roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- 9. Add explicit relationship for join (PostgREST requirement)
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey_profiles,
ADD CONSTRAINT user_roles_user_id_fkey_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 10. Master Admin Protection (daivid.evangelista@edu.mt.gov.br)
-- This prevents the root admin from being demoted or removed, even via other admins.
CREATE OR REPLACE FUNCTION public.protect_master_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user being modified is the master admin by email
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = OLD.user_id AND email = 'daivid.evangelista@edu.mt.gov.br'
    ) THEN
        RAISE EXCEPTION 'A função de Administrador Master não pode ser removida ou alterada pelo sistema.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_master_admin ON public.user_roles;
CREATE TRIGGER tr_protect_master_admin
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_master_admin();
