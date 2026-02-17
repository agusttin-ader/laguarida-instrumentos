import { createClient } from '@supabase/supabase-js'

// Client-side Supabase helper — only use this in client components
// Reads public env vars exposed to the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	// Fail fast during development; in production these should be set.
	// Do not throw here to avoid breaking SSR imports — this file must be
	// imported only from client components.
	console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default supabase
