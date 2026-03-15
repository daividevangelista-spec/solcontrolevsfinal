-- Migration: Roles & Moderation Hardening
-- Phase 15.3: Adding moderator role, ownership tracking, and fixing persistent schema errors

-- 1. Add 'moderator' to the enum (using transactional safety check)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'moderator') THEN
    ALTER TYPE public.app_role ADD VALUE 'moderator';
  END IF;
END $$;

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
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can view roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));
