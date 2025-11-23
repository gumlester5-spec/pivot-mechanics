import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://erxrkhgvvhnnhbivashx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeHJraGd2dmhubmhiaXZhc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDQzNTMsImV4cCI6MjA3OTQ4MDM1M30.5A9AWzxe5pTQgcYqzG2M0EWHSmHgvWCTePzhr55IACI'

export const supabase = createClient(supabaseUrl, supabaseKey)
