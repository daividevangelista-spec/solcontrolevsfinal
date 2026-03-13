import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking Buckets ---');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Error fetching buckets:', bucketError);
  } else {
    console.log('Available buckets:', buckets?.map(b => b.name));
  }

  console.log('\n--- Checking energy_bills dates ---');
  const { data: bills, error: billsError } = await supabase.from('energy_bills').select('id, year, month, payment_status, solar_energy_value');
  if (billsError) {
    console.error('Error fetching bills:', billsError);
  } else {
    console.log(`Total bills: ${bills?.length}`);
    if (bills && bills.length > 0) {
      const sorted = [...bills].sort((a,b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
      console.log('Most recent bill:', sorted[0]);
    }
  }
}

check().catch(console.error);
