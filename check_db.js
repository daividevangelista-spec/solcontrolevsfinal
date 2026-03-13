import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: bills, error: err1 } = await supabase.from('energy_bills').select('id, consumer_unit_id, payment_status, total_amount');
  const { data: units, error: err2 } = await supabase.from('consumer_units').select('id, client_id');
  const { data: clients, error: err3 } = await supabase.from('clients').select('id, user_id');

  console.log(`Total bills: ${bills?.length}`);
  console.log(`Total units: ${units?.length}`);
  console.log(`Total clients: ${clients?.length}`);

  const unitIds = new Set(units?.map(u => u.id));
  const clientIds = new Set(clients?.map(c => c.id));

  let orphanedBills = bills?.filter(b => !unitIds.has(b.consumer_unit_id)) || [];
  let orphanedUnits = units?.filter(u => !clientIds.has(u.client_id)) || [];

  console.log(`Orphaned Bills (no valid unit_id): ${orphanedBills.length}`);
  console.log(`Orphaned Units (no valid client_id): ${orphanedUnits.length}`);

  // Fetch dashboard bills exactly like the query
  const { data: adminBills } = await supabase.from('energy_bills').select('id, consumer_units!inner(client_id)');
  console.log(`Bills returned by AdminDashboard query (!inner): ${adminBills?.length}`);
  
  // Try the fetch from ClientBills
  const { data: clientUserMatches } = await supabase.from('clients').select('id');
  console.log(`Total Clients (No user_id filter test): ${clientUserMatches?.length}`);
}

check().catch(console.error);
