import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://joqherfotksjlpyztcdc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvcWhlcmZvdGtzamxweXp0Y2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzMzMDgsImV4cCI6MjEwNDQwOTMwOH0.6CNA9387QAW47khchSbyOGocMUHu4_YMIhwigv432mA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
