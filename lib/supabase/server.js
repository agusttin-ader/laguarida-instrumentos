import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

function ensureConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
  }
}

// Return a Supabase server client wired to Next's cookies API.
export function getSupabaseServerClient() {
  try {
    ensureConfig()

    const cookieStore = cookies()

    // Adapter to satisfy auth-helpers cookie API. The Next `cookies()` API
    // may expose either `get`/`set`/`delete` or `getAll`/`setAll` depending on
    // runtime/version. Support both shapes so we don't call a missing method.
    let cookieAdapter
    if (cookieStore && typeof cookieStore.get === 'function') {
      cookieAdapter = {
        get: (name) => {
          const c = cookieStore.get(name)
          if (!c) return undefined
          return c.value
        },
        set: (name, value, options) => {
          // next/headers cookies.set may accept an object
          cookieStore.set({ name, value, ...(options || {}) })
        },
        remove: (name, options) => {
          // some runtimes call this `delete` instead of `remove`
          if (typeof cookieStore.delete === 'function') {
            cookieStore.delete(name, options)
          } else if (typeof cookieStore.remove === 'function') {
            cookieStore.remove(name, options)
          }
        },
      }
    } else if (cookieStore && typeof cookieStore.getAll === 'function') {
      cookieAdapter = {
        get: async (name) => {
          const all = await cookieStore.getAll()
          const c = all.find((x) => x.name === name)
          return c ? c.value : undefined
        },
        set: async (name, value, options) => {
          await cookieStore.setAll([{ name, value, options: options || {} }])
        },
        remove: async (name, options) => {
          await cookieStore.setAll([{ name, value: '', options: { ...(options || {}), maxAge: 0 } }])
        },
      }
    } else {
      // Fallback: provide no-op implementations to avoid crashes; createServerClient
      // will warn if cookies aren't correct. This avoids throwing in environments
      // where cookies() is not available.
      cookieAdapter = {
        get: () => undefined,
        set: () => undefined,
        remove: () => undefined,
      }
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, { cookies: cookieAdapter })
  } catch (err) {
    throw new Error('Failed to create Supabase server client: ' + (err?.message || String(err)))
  }
}

// Get user info for the current session (reads cookies via next/headers).
export async function getUserFromRequest() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    throw error
  }
  return data?.user ?? null
}

export async function requireAuthFromRequest() {
  const user = await getUserFromRequest()
  if (!user) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }
  return user
}
