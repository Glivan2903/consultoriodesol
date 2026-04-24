import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Fetching inventory_clients...");
  const { data, error } = await supabase.from('inventory_clients').select('*');
  if (error) {
    console.error("Error fetching clients:", error);
  } else {
    console.log(`Success! Found ${data.length} clients.`);
    if (data.length > 0) {
      console.log("First client:", data[0].name);
    }
  }

  console.log("Fetching inventory_categories...");
  const { data: catData, error: catErr } = await supabase.from('inventory_categories').select('*');
  if (catErr) {
    console.error("Error fetching categories:", catErr);
  } else {
    console.log(`Success! Found ${catData.length} categories.`);
  }
}

check();
