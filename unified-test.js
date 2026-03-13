
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function unifiedTest() {
  console.log("🔐 Logging in as admin...");
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'daivid.evangelista@edu.mt.gov.br',
    password: 'Tudoposso7'
  });

  if (!auth.session) {
    console.error("❌ Login failed.");
    return;
  }

  console.log("🔍 Finding a valid consumer unit...");
  const { data: units, error: uError } = await supabase.from('consumer_units').select('id, unit_name').limit(1);
  if (uError || !units.length) {
    console.error("❌ Could not find a consumer unit:", uError?.message);
    return;
  }

  const unit = units[0];
  console.log(`✅ Using Unit: ${unit.unit_name} (ID: ${unit.id})`);

  // Generate unique month/year combo to avoid collision with existing bills
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const randomYear = 2030; // Future year to avoid overlap

  console.log(`📝 Inserting test bill for ${randomMonth}/${randomYear}...`);
  const { data: bill, error: billError } = await supabase.from('energy_bills').insert({
    consumer_unit_id: unit.id,
    month: randomMonth,
    year: randomYear,
    consumption_kwh: 100,
    price_per_kwh: 1,
    total_amount: 100,
    due_date: '2030-01-01',
    payment_status: 'pending'
  }).select().single();

  if (billError) {
    console.error("❌ Bill insertion failed:", billError.message);
    return;
  }

  console.log(`✅ Bill created: ${bill.id}`);

  console.log("⏳ Waiting for trigger...");
  await new Promise(r => setTimeout(r, 2000));

  console.log("🔍 Checking for notifications...");
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, channel, status')
    .eq('bill_id', bill.id);

  console.log("✅ Notifications in DB:", JSON.stringify(notifications, null, 2));

  if (notifications && notifications.length > 0) {
    console.log("🚀 Manually triggering Edge Function processing simulation...");
    // Since we don't have the Service Role Key to call the real Edge Function safely via CLI/API,
    // we already verified the logic via simulate-automation.js.
    // However, I can try to trigger the real function if it's open.
    const edgeFuncUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/send-notifications`;
    
    // Most Edge Functions require the Authorization header.
    const edgeRes = await fetch(edgeFuncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.session.access_token}`
      },
      body: JSON.stringify({})
    });

    if (edgeRes.ok) {
      console.log("✅ Edge Function invoked successfully.");
      const edgeData = await edgeRes.json();
      console.log("Edge Output:", JSON.stringify(edgeData, null, 2));

      // Check final status
      console.log("🔍 Verifying notification status update...");
      await new Promise(r => setTimeout(r, 2000));
      const { data: finalNotifs } = await supabase
        .from('notifications')
        .select('id, channel, status, error_message')
        .eq('bill_id', bill.id);
      console.log("🏁 Final Notifications Status:", JSON.stringify(finalNotifs, null, 2));
    } else {
      console.error("⚠️ Edge Function invocation failed status:", edgeRes.status);
      const errText = await edgeRes.text();
      console.error("Error details:", errText);
    }
  }
}

unifiedTest();
