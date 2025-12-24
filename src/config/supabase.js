import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  process.env.VUE_APP_SUPABASE_URL || 'https://qkduucehkgwbdawkbkvl.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.VUE_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZHV1Y2Voa2d3YmRhd2tia3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjY0MjEsImV4cCI6MjA4MTQ0MjQyMX0.aaI_0RJ1ERZbJMhSo01GvQtmSXS-dx-an60y_jrfaJs';

export const isConfigured = () => {
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('YOUR_SUPABASE_URL') &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY') &&
    SUPABASE_URL.includes('supabase.co')
  );
};

let supabaseClient = null;

export const getSupabaseClient = () => {
  if (!isConfigured()) {
    throw new Error('Supabase configuration incomplete. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
};
