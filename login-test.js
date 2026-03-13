
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function loginAndFetch() {
  console.log("🔐 Attempting login as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'daivid.evangelista@edu.mt.gov.br',
    password: 'Tudoposso7'
  });

  if (authError) {
    console.error("❌ Login failed:", authError.message);
    return;
  }

  console.log("✅ Login successful. Token obtained.");
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('id, name, user_id, phone')
    .limit(5);

  if (clientError) {
    console.error("❌ Client fetch failed:", clientError.message);
  } else {
    console.log("✅ Live Clients:", JSON.stringify(clients, null, 2));
    
    if (clients.length > 0) {
      const client = clients[0];
      // Get consumer units for this client
      const { data: units } = await supabase
        .from('consumer_units')
        .select('id, unit_name')
        .eq('client_id', client.id);
      console.log("✅ Consumer Units:", JSON.stringify(units, null, 2));
    }
  }
}

loginAndFetch();
