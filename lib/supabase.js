import { createClient } from '@supabase/supabase-js';

// Build time-la variables illanaalum crash aagaama irukka dummy strings kudukkarom
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://temp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'temp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);