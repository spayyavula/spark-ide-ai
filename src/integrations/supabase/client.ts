// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oxgjhfosaoffewkluzdg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2poZm9zYW9mZmV3a2x1emRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTM4NTksImV4cCI6MjA2NjM2OTg1OX0.b9CaUspT0TdK152HVdsN_lwrp97ea3rR59zqTFDU0qU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});