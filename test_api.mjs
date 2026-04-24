import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAll() {
  const tables = [
    'inventory_categories',
    'inventory_products',
    'inventory_clients',
    'inventory_companies',
    'inventory_medical_records',
    'inventory_movements'
  ];

  console.log('--- TESTING ALL API ROUTES (TABLES) ---');
  let allWorking = true;

  for (const table of tables) {
    console.log(`\nTesting table: ${table}...`);
    try {
      const { data, error } = await supabase.from(table).select('*').limit(3);
      if (error) {
        console.error(`❌ ERROR fetching ${table}:`, error.message);
        allWorking = false;
      } else {
        console.log(`✅ SUCCESS: ${table} loaded successfully.`);
        console.log(`   Found ${data.length} records (showing up to 3).`);
        if (data.length > 0) {
          console.log(`   Sample:`, JSON.stringify(data[0]).substring(0, 100) + '...');
        } else {
          console.log(`   (Table is empty)`);
        }
      }
    } catch (err) {
      console.error(`❌ EXCEPTION fetching ${table}:`, err.message);
      allWorking = false;
    }
  }

  // Let's also check the join used in useProducts.ts
  console.log('\nTesting joined query for products (with categories)...');
  const { data: prodData, error: prodErr } = await supabase
    .from('inventory_products')
    .select('*, category:inventory_categories(name)')
    .limit(1);
    
  if (prodErr) {
    console.error('❌ ERROR in products join:', prodErr.message);
    allWorking = false;
  } else {
    console.log(`✅ SUCCESS: Products join query working.`);
  }

  // Testing join used in useMovements.ts
  console.log('\nTesting joined query for movements (with products)...');
  const { data: movData, error: movErr } = await supabase
    .from('inventory_movements')
    .select('*, product:inventory_products(name, unit)')
    .limit(1);

  if (movErr) {
    console.error('❌ ERROR in movements join:', movErr.message);
    allWorking = false;
  } else {
    console.log(`✅ SUCCESS: Movements join query working.`);
  }

  if (allWorking) {
    console.log('\n🎉 ALL ROUTES AND QUERIES ARE WORKING CORRECTLY!');
  } else {
    console.log('\n⚠️ SOME ERRORS WERE FOUND IN THE ROUTES.');
  }
}

testAll();
