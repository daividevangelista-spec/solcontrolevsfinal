-- Add notification columns to energy_settings
ALTER TABLE public.energy_settings 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS auto_overdue_alerts BOOLEAN DEFAULT true;
