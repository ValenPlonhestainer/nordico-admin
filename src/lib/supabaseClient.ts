import { createClient } from '@supabase/supabase-js'

// Usa service_role key para poder escribir (bypasea RLS)
// NUNCA usar esta key en el sitio público
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY as string
)
