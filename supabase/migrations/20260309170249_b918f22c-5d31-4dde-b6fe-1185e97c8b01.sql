
-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'overdue');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clients table (managed by admin)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Consumer units
CREATE TABLE public.consumer_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    unit_name TEXT NOT NULL,
    meter_number TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consumer_units ENABLE ROW LEVEL SECURITY;

-- Energy settings
CREATE TABLE public.energy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_per_kwh NUMERIC(10,4) NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.energy_settings ENABLE ROW LEVEL SECURITY;

-- Energy bills
CREATE TABLE public.energy_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_unit_id UUID REFERENCES public.consumer_units(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    consumption_kwh NUMERIC(10,2) NOT NULL,
    price_per_kwh NUMERIC(10,4) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    due_date DATE NOT NULL,
    invoice_file_url TEXT,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(consumer_unit_id, month, year)
);
ALTER TABLE public.energy_bills ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES public.energy_bills(id) ON DELETE CASCADE NOT NULL,
    payment_type TEXT NOT NULL,
    payment_date DATE NOT NULL,
    receipt_file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Storage policies
CREATE POLICY "Invoices publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');
CREATE POLICY "Admins can upload invoices" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete invoices" ON storage.objects FOR DELETE USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Receipts publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
CREATE POLICY "Authenticated can upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

-- RLS Policies

-- User roles: admins can see all, users can see own
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Clients: admin full access, clients see own
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own record" ON public.clients FOR SELECT USING (auth.uid() = user_id);

-- Consumer units: admin full, clients see own
CREATE POLICY "Admins manage consumer units" ON public.consumer_units FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own units" ON public.consumer_units FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.clients WHERE clients.id = consumer_units.client_id AND clients.user_id = auth.uid())
);

-- Energy settings: admin only
CREATE POLICY "Admins manage settings" ON public.energy_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Energy bills: admin full, clients see own
CREATE POLICY "Admins manage bills" ON public.energy_bills FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own bills" ON public.energy_bills FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.consumer_units cu
    JOIN public.clients c ON c.id = cu.client_id
    WHERE cu.id = energy_bills.consumer_unit_id AND c.user_id = auth.uid()
  )
);

-- Payments: admin full, clients see own
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own payments" ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.energy_bills eb
    JOIN public.consumer_units cu ON cu.id = eb.consumer_unit_id
    JOIN public.clients c ON c.id = cu.client_id
    WHERE eb.id = payments.bill_id AND c.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_energy_settings_updated_at BEFORE UPDATE ON public.energy_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  
  -- Default role is client
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default energy settings
INSERT INTO public.energy_settings (price_per_kwh) VALUES (0.75);
