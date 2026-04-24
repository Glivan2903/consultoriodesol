import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

const createSupabaseClient = () => createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'felipe-wimas-auth-v3' // Bump version to clear corrupted locks
  }
});

// Avoid multiple instances during Vite HMR
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient> | undefined;
};

export const supabase = globalForSupabase.supabase ?? createSupabaseClient();

if (import.meta.env.DEV) {
  globalForSupabase.supabase = supabase;
}
