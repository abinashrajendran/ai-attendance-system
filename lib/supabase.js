import { createClient } from '@supabase/supabase-js';

// Build time-la error varaama irukka valid structure dummy URL kudukkarom
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cutglfwslyvnpwbjuqui.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);