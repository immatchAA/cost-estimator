import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mlsfklcnggvwhynkhigx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sc2ZrbGNuZ2d2d2h5bmtoaWd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg4Njk0NiwiZXhwIjoyMDY2NDYyOTQ2fQ.W0pwxgmXhguSKS0PKKdv2-fQZhcG6NSSq7UAwTgrKVU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
