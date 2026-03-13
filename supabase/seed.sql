-- Seed Data for SolControle
-- This script creates mock users, consumer units, and billing history to test the application.

-- 1. Create Mock Auth Users (Note: In a real Supabase environment, you would use the Auth API or the Dashboard to create users)
-- Since we can't directly insert into auth.users easily from standard SQL without hashing passwords perfectly, 
-- we will assume the users already exist in auth.users, or you can run this script AFTER creating two users in the Supabase Dashboard.

-- For the sake of local testing, Supabase Local allows inserting into auth.users.
-- We generate predictable UUIDs for our test users
DO $$
DECLARE
    admin_id UUID := '00000000-0000-0000-0000-000000000001';
    client_id UUID := '00000000-0000-0000-0000-000000000002';
    client_record_id UUID;
    unit_id_1 UUID;
    unit_id_2 UUID;
BEGIN
    -- Only run if the users don't exist to prevent errors on multiple runs
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
        -- Insert Mock Admin User into auth.users
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@solcontrole.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Super Admin"}', now(), now(), '', '', '', '');
        
        -- Insert Mock Client User into auth.users
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (client_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client@solcontrole.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"João da Silva"}', now(), now(), '', '', '', '');
        
        -- The trigger "on_auth_user_created" will automatically insert into public.profiles and public.user_roles (as 'client').
        -- We just need to update the admin's role
        
        -- Set up PIX Key on settings
        

        -- 2. Create the Client Record (managed by admin)
        INSERT INTO public.clients (user_id, name, phone, email, address, notes)
        VALUES (client_id, 'João da Silva', '(11) 98765-4321', 'client@solcontrole.com', 'Rua das Flores, 123, São Paulo - SP', 'Cliente Premium')
        RETURNING id INTO client_record_id;

        -- 3. Create Consumer Units for the Client
        INSERT INTO public.consumer_units (client_id, unit_name, meter_number, address)
        VALUES (client_record_id, 'Casa Principal (SP)', 'MED-10293847', 'Rua das Flores, 123, São Paulo - SP')
        RETURNING id INTO unit_id_1;

        INSERT INTO public.consumer_units (client_id, unit_name, meter_number, address)
        VALUES (client_record_id, 'Sítio Interior', 'MED-56473829', 'Rodovia do Sol, Km 15, São Roque - SP')
        RETURNING id INTO unit_id_2;

        -- 4. Create Billing History (Past 6 Months for Casa Principal)
        -- Month 1 (Current Month - Pending)
        INSERT INTO public.energy_bills (consumer_unit_id, month, year, consumption_kwh, injected_energy_kwh, price_per_kwh, solar_energy_value, energisa_bill_value, total_amount, due_date, payment_status)
        VALUES (unit_id_1, EXTRACT(MONTH FROM now())::INTEGER, EXTRACT(YEAR FROM now())::INTEGER, 450, 450, 0.75, 450 * 0.75, 85.50, (450 * 0.75) + 85.50, CURRENT_DATE + INTERVAL '5 days', 'pending');

        -- Month 2 (Past Month - Paid)
        INSERT INTO public.energy_bills (consumer_unit_id, month, year, consumption_kwh, injected_energy_kwh, price_per_kwh, solar_energy_value, energisa_bill_value, total_amount, due_date, payment_status)
        VALUES (unit_id_1, EXTRACT(MONTH FROM (now() - INTERVAL '1 month'))::INTEGER, EXTRACT(YEAR FROM (now() - INTERVAL '1 month'))::INTEGER, 420, 420, 0.75, 420 * 0.75, 92.00, (420 * 0.75) + 92.00, CURRENT_DATE - INTERVAL '25 days', 'paid');

        -- Month 3 (2 Months Ago - Paid)
        INSERT INTO public.energy_bills (consumer_unit_id, month, year, consumption_kwh, injected_energy_kwh, price_per_kwh, solar_energy_value, energisa_bill_value, total_amount, due_date, payment_status)
        VALUES (unit_id_1, EXTRACT(MONTH FROM (now() - INTERVAL '2 months'))::INTEGER, EXTRACT(YEAR FROM (now() - INTERVAL '2 months'))::INTEGER, 380, 380, 0.75, 380 * 0.75, 88.30, (380 * 0.75) + 88.30, CURRENT_DATE - INTERVAL '55 days', 'paid');

        -- Month 4 (3 Months Ago - Paid)
        INSERT INTO public.energy_bills (consumer_unit_id, month, year, consumption_kwh, injected_energy_kwh, price_per_kwh, solar_energy_value, energisa_bill_value, total_amount, due_date, payment_status)
        VALUES (unit_id_1, EXTRACT(MONTH FROM (now() - INTERVAL '3 months'))::INTEGER, EXTRACT(YEAR FROM (now() - INTERVAL '3 months'))::INTEGER, 510, 510, 0.75, 510 * 0.75, 95.10, (510 * 0.75) + 95.10, CURRENT_DATE - INTERVAL '85 days', 'paid');

        -- 5. Create Billing History for Sítio Interior
        -- Current Month (Overdue for testing)
        INSERT INTO public.energy_bills (consumer_unit_id, month, year, consumption_kwh, injected_energy_kwh, price_per_kwh, solar_energy_value, energisa_bill_value, total_amount, due_date, payment_status)
        VALUES (unit_id_2, EXTRACT(MONTH FROM now())::INTEGER, EXTRACT(YEAR FROM now())::INTEGER, 120, 120, 0.75, 120 * 0.75, 45.00, (120 * 0.75) + 45.00, CURRENT_DATE - INTERVAL '2 days', 'overdue');

    END IF;
END $$;
