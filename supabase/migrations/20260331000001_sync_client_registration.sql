-- Migration: Sync Client Registration and RLS Policies
-- Task: Automate client creation on signup and allow self-editing with restricted access.

-- 1. Update handle_new_user to also insert into public.clients
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into Profiles
  INSERT INTO public.profiles (user_id, name, email, phone, address)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'full_address'
  );
  
  -- Insert into Clients (Billing entity)
  INSERT INTO public.clients (user_id, name, email, phone, address)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'full_address'
  );

  -- Default role is client
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create Synchronization Function (Profile -> Client)
-- This ensures that if the client updates their phone/address in Settings, it reflects in the Clients list for the Admin.
CREATE OR REPLACE FUNCTION public.sync_profile_to_client()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clients
  SET 
    name = NEW.name,
    phone = NEW.phone,
    address = NEW.address,
    email = NEW.email
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger for Profile Synchronization
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_client();

-- 4. Update RLS Policies for public.clients
-- Allow clients to update their own record in the clients table
DROP POLICY IF EXISTS "Clients update own record" ON public.clients;
CREATE POLICY "Clients update own record" 
ON public.clients FOR UPDATE 
USING (auth.uid() = user_id);

-- Ensure clients can only see their own record (pre-existing, but just in case)
DROP POLICY IF EXISTS "Clients view own record" ON public.clients;
CREATE POLICY "Clients view own record" 
ON public.clients FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Update RLS Policies for public.profiles (already common, but reinforcing)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);
