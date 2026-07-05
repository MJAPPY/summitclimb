import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xdcrqjjjunqmjhskfmaz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkY3JxampqdW5xbWpoc2tmbWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTkwNDYsImV4cCI6MjA5ODc3NTA0Nn0.e4OHOSPfwkAHuskqfgdtrTPlt2DILkJQ-20fTT1rdmg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);