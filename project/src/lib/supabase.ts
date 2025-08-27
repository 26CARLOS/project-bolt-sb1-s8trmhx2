import { createClient } from '@supabase/supabase-js'

// Vite injects variables prefixed with VITE_ from the project-root .env files.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl) {
	throw new Error('VITE_SUPABASE_URL is required. Add it to the project root .env file.')
}

if (!supabaseKey) {
	throw new Error('VITE_SUPABASE_ANON_KEY is required. Add it to the project root .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)