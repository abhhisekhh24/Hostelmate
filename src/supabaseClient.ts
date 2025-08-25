import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://https://emznmqeenclngbntgauy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtem5tcWVlbmNsbmdibnRnYXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNDUxMzIsImV4cCI6MjA1OTgyMTEzMn0.JslC26InwVlm-GcbgQtEaaKP6EkWMizh1U4ISDgo0wg'
)

const { data, error } = await supabase.from('pg_meta').select('*')
console.log(data, error)