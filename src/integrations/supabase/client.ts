// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fmgqafaanjqkczzbwgyc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZ3FhZmFhbmpxa2N6emJ3Z3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMzA1OTMsImV4cCI6MjA2NTcwNjU5M30.OCe_Qz2A0MIQvWwnzns3_xtCkwsmDsODeeG2enO8EC4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);