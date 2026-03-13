
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function auditDatabase() {
  console.log("🔐 Logging in as admin...");
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'daivid.evangelista@edu.mt.gov.br',
    password: 'Tudoposso7'
  });
  
  if (authErr) {
    console.error("❌ Auth Error:", authErr.message);
    return;
  }

  const userId = auth.user.id;
  console.log("✅ Logged in. User ID:", userId);

  // 1. Check if 'whatsapp' exists in enum
  console.log("🔍 Checking notification_channel enum...");
  // We can't query pg_type easily with publishable key usually, 
  // but we can try to insert a dummy and see if it fails.
  // Actually, we can check if we can fetch one notification if any exists.
  const { data: notifs } = await supabase.from('notifications').select('channel').limit(1);
  console.log("Sample notifications:", notifs);

  // 2. Check the test client
  const testEmail = 'francislaine.conrado@edu.mt.gov.br';
  console.log(`🔍 Checking test client: ${testEmail}...`);
  
  const { data: client, error: cErr } = await supabase
    .from('clients')
    .select('id, user_id, phone')
    .eq('email', testEmail)
    .single();

  if (cErr) {
    console.error("❌ Client not found:", cErr.message);
    return;
  }

  console.log("✅ Client found:", client);

  if (client.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('user_id', client.user_id)
      .single();
    console.log("✅ Profile Phone:", profile?.phone);

    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', client.user_id)
      .single();
    console.log("✅ Settings:", settings);
  } else {
    console.warn("⚠️ Client has no user_id linked!");
  }
}

auditDatabase();
