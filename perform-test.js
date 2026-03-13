
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function performTest() {
  console.log("🔐 Logging in...");
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'daivid.evangelista@edu.mt.gov.br',
    password: 'Tudoposso7'
  });

  const unitId = '74e578a2-c433-4f2a-b033-c288965612e6';
  const month = 4;
  const year = 2026;

  console.log(`📝 Inserting test bill for unit ${unitId}...`);
  const { data: bill, error: billError } = await supabase.from('energy_bills').insert({
    consumer_unit_id: unitId,
    month: month,
    year: year,
    consumption_kwh: 100,
    injected_energy_kwh: 100,
    price_per_kwh: 1.00,
    solar_energy_value: 100,
    energisa_bill_value: 0,
    total_amount: 100.00,
    due_date: '2026-04-15',
    payment_status: 'pending'
  }).select().single();

  if (billError) {
    console.error("❌ Bill insertion failed:", billError.message);
    return;
  }

  console.log(`✅ Bill inserted: ${bill.id}`);

  // Wait for trigger to process
  console.log("⏳ Waiting for trigger to create notifications...");
  await new Promise(r => setTimeout(r, 2000));

  console.log("🔍 Checking notifications table...");
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('id, channel, status')
    .eq('bill_id', bill.id);

  if (notifError) {
    console.error("❌ Error fetching notifications:", notifError.message);
  } else {
    console.log("✅ Created Notifications:", JSON.stringify(notifications, null, 2));
  }
}

performTest();
