
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function prepareTest() {
  console.log("🔐 Logging in...");
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'daivid.evangelista@edu.mt.gov.br',
    password: 'Tudoposso7'
  });

  const userId = '00000000-0000-0000-0000-000000000002';
  const testPhone = '5565981296917';

  console.log(`📱 Updating phone for user ${userId} to ${testPhone}...`);
  await supabase.from('profiles').update({ phone: testPhone }).eq('id', userId);

  console.log(`⚙️ Ensuring WhatsApp is enabled for user ${userId}...`);
  await supabase.from('notification_settings').upsert({ 
    user_id: userId, 
    whatsapp_enabled: true,
    email_enabled: true 
  });

  console.log("✅ Preparation complete.");
}

prepareTest();
