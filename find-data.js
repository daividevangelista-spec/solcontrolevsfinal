
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function findData() {
  console.log("🔍 Querying profiles...");
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id, email, phone').limit(5);
  if (pError) console.error("❌ Profiles error:", pError.message);
  else console.log("✅ Profiles:", profiles);

  console.log("🔍 Querying consumer_units...");
  const { data: units, error: uError } = await supabase.from('consumer_units').select('id, client_id, unit_name').limit(5);
  if (uError) console.error("❌ Units error:", uError.message);
  else console.log("✅ Units:", units);
}

findData();
