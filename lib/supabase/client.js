import { createClient } from '@supabase/supabase-js'

// Client-side Supabase helper — only use this in client components
// Reads public env vars exposed to the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// In production ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
// We do not throw here to avoid breaking SSR imports — this file is used from client components.

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default supabase

// Client-side auth helpers (wraps @supabase/supabase-js auth methods)
export async function signInWithEmail(email, password) {
	return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email, password) {
	return supabase.auth.signUp({ email, password })
}

export async function signOut() {
	return supabase.auth.signOut()
}

export async function getSession() {
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession()
	if (error) throw error
	return session
}
