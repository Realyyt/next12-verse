// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fxrvjmbbusgdeaxidekt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cnZqbWJidXNnZGVheGlkZWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODUyNjQsImV4cCI6MjA2MDc2MTI2NH0.4_9mytEqdmxRiGtg-sSXPbthMRag-jy4QajspLa73Kc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);