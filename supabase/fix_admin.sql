-- Script to manually fix the new user's profile and assign them the admin role
DO $$
DECLARE
    target_user_id UUID := 'e0c9e9b0-1ab8-437b-87b4-d51ceab1bd28';
BEGIN
    -- 1. Ensure the user exists in public.profiles (to prevent infinite loading)
    -- user_id is unique, so we can use ON CONFLICT (user_id)
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (target_user_id, 'Daivid Evangelista', 'daivid.evangelista@edu.mt.gov.br')
    ON CONFLICT (user_id) DO NOTHING;

    -- 2. Ensure they have a row in user_roles and set it to 'admin'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

    -- 3. Update global PIX key to ensure it matches his email if desired
    UPDATE public.energy_settings 
    SET pix_key = 'daivid.evangelista@edu.mt.gov.br'
    WHERE id IS NOT NULL;
    
END $$;
