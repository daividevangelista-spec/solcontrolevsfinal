
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY // Ideally Service Role, but let's try to find a client first
);

async function findTestClient() {
  console.log("🔍 Searching for a test client...");
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, user_id, profiles(phone)')
    .limit(1);

  if (error) {
    console.error("❌ Error fetching clients:", error.message);
    return;
  }

  if (!clients || clients.length === 0) {
    console.log("⚠️ No clients found in the database.");
    return;
  }

  const client = clients[0];
  console.log(`✅ Found test client: ${client.name} (ID: ${client.id}, UserID: ${client.user_id})`);
  console.log(`📱 Phone: ${client.profiles?.phone || 'N/A'}`);

  // Check notification settings
  const { data: settings } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', client.user_id)
    .single();

  console.log("⚙️ Notification Settings:", JSON.stringify(settings, null, 2));
}

findTestClient();
