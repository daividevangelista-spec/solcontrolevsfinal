-- Script to add the specific admin account
DO $$
DECLARE
    new_admin_id UUID := gen_random_uuid();
BEGIN
    -- Only insert if the email doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'daivid.evangelista@edu.mt.gov.br') THEN
        
        -- Insert into Auth Users
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, confirmation_token, email_change, 
            email_change_token_new, recovery_token
        )
        VALUES (
            new_admin_id, 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            'daivid.evangelista@edu.mt.gov.br', 
            crypt('Tudoposso7', gen_salt('bf')), 
            now(), 
            '{"provider":"email","providers":["email"]}', 
            '{"name":"Daivid Evangelista"}', 
            now(), now(), '', '', '', ''
        );
        
        -- Override the default 'client' role assigned by the trigger to 'admin'
        UPDATE public.user_roles 
        SET role = 'admin' 
        WHERE user_id = new_admin_id;

        -- Associate the PIX Key settings with this new admin
        UPDATE public.energy_settings 
        SET pix_key = 'daivid.evangelista@edu.mt.gov.br'
        WHERE id IS NOT NULL;
        
    ELSE
        -- If the user already exists (e.g. they registered via the frontend), just make them an admin
        UPDATE public.user_roles 
        SET role = 'admin' 
        WHERE user_id = (SELECT id FROM auth.users WHERE email = 'daivid.evangelista@edu.mt.gov.br' LIMIT 1);
        
        -- Associate the PIX Key settings with this new admin
        UPDATE public.energy_settings 
        SET pix_key = 'daivid.evangelista@edu.mt.gov.br'
        WHERE id IS NOT NULL;
    END IF;
END $$;
