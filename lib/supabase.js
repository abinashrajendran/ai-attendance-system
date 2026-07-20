import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// URL illana client-ah create pannama null-ah anupum. Build crash aagathu.
export const supabase = (supabaseUrl.startsWith('https')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;