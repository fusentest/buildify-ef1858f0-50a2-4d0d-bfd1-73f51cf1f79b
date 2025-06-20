
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://guvbtolnlnzotuldvvnt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmJ0b2xubG56b3R1bGR2dm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjU3NTMsImV4cCI6MjA2NjAwMTc1M30.l_op7dE3v2W1aTQCTTfUjPnzRsB9H0ofKRJobmwzCcs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);