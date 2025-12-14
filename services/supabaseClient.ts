import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://nsxbnnqchhssgrypcaqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zeGJubnFjaGhzc2dyeXBjYXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTc1ODEsImV4cCI6MjA3NDQzMzU4MX0.0KAVczsTvt5aKaeXZyDXuF3qNSkMbZ23saoKvs7zLW0';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
