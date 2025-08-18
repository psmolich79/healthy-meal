import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CookieStorage } from "../lib/utils/cookie-storage";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Supabase configuration missing: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`);
}

// Create cookie storage instance
const cookieStorage = new CookieStorage();

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export the SupabaseClient type for use in services
export type { SupabaseClient };
