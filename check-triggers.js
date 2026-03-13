
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkTriggers() {
  console.log("🔐 Logging in...");
  await supabase.auth.signInWithPassword({
    email: 'daivid.evangelista@edu.mt.gov.br',
    password: 'Tudoposso7'
  });

  console.log("🔍 Checking for triggers on energy_bills...");
  // We can query information_schema or pg_trigger if we have permissions, 
  // but usually users have restricted access to pg_catalog.
  // However, we can try to find if the function exists.
  const { data, error } = await supabase.rpc('get_trigger_def', { trigger_name: 'tr_notify_bill_events' });
  
  if (error) {
    console.error("⚠️ RPC get_trigger_def not found or permission denied. Trying raw query via SQL execute (if possible).");
    // Some Supabase setups have a 'exec_sql' RPC for admins.
  } else {
    console.log("✅ Trigger Info:", data);
  }
}

checkTriggers();
