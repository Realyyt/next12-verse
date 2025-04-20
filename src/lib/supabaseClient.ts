
import { createClient } from "@supabase/supabase-js";

// Use the hardcoded values from the integrations/supabase/client.ts file
const supabaseUrl = "https://fxrvjmbbusgdeaxidekt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cnZqbWJidXNnZGVheGlkZWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODUyNjQsImV4cCI6MjA2MDc2MTI2NH0.4_9mytEqdmxRiGtg-sSXPbthMRag-jy4QajspLa73Kc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
