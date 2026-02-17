import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function ensureConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
  }
}

// Return a Supabase server client wired to Next's cookies API.
export async function getSupabaseServerClient() {
  try {
    ensureConfig()

    const cookieStore = await cookies()

    // Adapter to satisfy auth-helpers cookie API. The Next `cookies()` API
    // may expose either `get`/`set`/`delete` or `getAll`/`setAll` depending on
    // runtime/version. Support both shapes so we don't call a missing method.
    let cookieAdapter
    if (cookieStore && typeof cookieStore.get === 'function') {
      cookieAdapter = {
        // single-cookie helpers
        get: (name) => {
          const c = cookieStore.get(name)
          if (!c) return undefined
          return c.value
        },
        set: (name, value, options) => {
          cookieStore.set({ name, value, ...(options || {}) })
        },
        remove: (name, options) => {
          if (typeof cookieStore.delete === 'function') {
            cookieStore.delete(name, options)
          } else if (typeof cookieStore.remove === 'function') {
            cookieStore.remove(name, options)
          }
        },
        // bulk helpers
        getAll: async () => {
          if (typeof cookieStore.getAll === 'function') return await cookieStore.getAll()
          return []
        },
        setAll: async (cookiesArray) => {
          if (typeof cookieStore.setAll === 'function') return await cookieStore.setAll(cookiesArray)
          for (const c of cookiesArray || []) {
            try { cookieStore.set({ name: c.name, value: c.value, ...(c.options || {}) }) } catch (e) {}
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
          if (typeof cookieStore.setAll === 'function') {
            await cookieStore.setAll([{ name, value, options: options || {} }])
          } else if (typeof cookieStore.set === 'function') {
            cookieStore.set({ name, value, ...(options || {}) })
          }
        },
        remove: async (name, options) => {
          if (typeof cookieStore.setAll === 'function') {
            await cookieStore.setAll([{ name, value: '', options: { ...(options || {}), maxAge: 0 } }])
          } else if (typeof cookieStore.delete === 'function') {
            cookieStore.delete(name, options)
          }
        },
        getAll: async () => await cookieStore.getAll(),
        setAll: async (cookiesArray) => {
          if (typeof cookieStore.setAll === 'function') return await cookieStore.setAll(cookiesArray)
          for (const c of cookiesArray || []) {
            try { if (typeof cookieStore.set === 'function') cookieStore.set({ name: c.name, value: c.value, ...(c.options || {}) }) } catch (e) {}
          }
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
        getAll: async () => [],
        setAll: async () => undefined,
      }
    }

    const cookieOptions = {
      name: process.env.SUPABASE_COOKIE_NAME || 'sb',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' || false,
      path: '/',
    }

    if (process.env.SUPABASE_COOKIE_DOMAIN) cookieOptions.domain = process.env.SUPABASE_COOKIE_DOMAIN

    return createServerClient(supabaseUrl, supabaseAnonKey, { headers, cookies: cookieAdapter, cookieOptions })
  } catch (err) {
    throw new Error('Failed to create Supabase server client: ' + (err?.message || String(err)))
  }
}

// Get user info for the current session (reads cookies via next/headers).
export async function getUserFromRequest() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
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
import { createServerClient } from '@supabase/auth-helpers-nextjs'
<<<<<<< HEAD
import { cookies } from 'next/headers'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
=======
import { cookies, headers } from 'next/headers'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
>>>>>>> panel de admin mas policies de sql vercel fix 10 y loguin fixe 3

function ensureConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
  }
}

// Return a Supabase server client wired to Next's cookies API.
<<<<<<< HEAD
export function getSupabaseServerClient() {
  try {
    ensureConfig()

    const cookieStore = cookies()
=======
export async function getSupabaseServerClient() {
  try {
    ensureConfig()

    const cookieStore = await cookies()
>>>>>>> panel de admin mas policies de sql vercel fix 10 y loguin fixe 3

    // Adapter to satisfy auth-helpers cookie API. The Next `cookies()` API
    // may expose either `get`/`set`/`delete` or `getAll`/`setAll` depending on
    // runtime/version. Support both shapes so we don't call a missing method.
    let cookieAdapter
    if (cookieStore && typeof cookieStore.get === 'function') {
      cookieAdapter = {
<<<<<<< HEAD
=======
        // single-cookie helpers
>>>>>>> panel de admin mas policies de sql vercel fix 10 y loguin fixe 3
        get: (name) => {
          const c = cookieStore.get(name)
          if (!c) return undefined
          return c.value
        },
        set: (name, value, options) => {
<<<<<<< HEAD
          // next/headers cookies.set may accept an object
          cookieStore.set({ name, value, ...(options || {}) })
        },
        remove: (name, options) => {
          // some runtimes call this `delete` instead of `remove`
=======
          cookieStore.set({ name, value, ...(options || {}) })
        },
        remove: (name, options) => {
>>>>>>> panel de admin mas policies de sql vercel fix 10 y loguin fixe 3
          if (typeof cookieStore.delete === 'function') {
            cookieStore.delete(name, options)
          } else if (typeof cookieStore.remove === 'function') {
            cookieStore.remove(name, options)
          }
        },
<<<<<<< HEAD
=======
        // bulk helpers
        getAll: async () => {
          if (typeof cookieStore.getAll === 'function') return await cookieStore.getAll()
          return []
        },
        setAll: async (cookiesArray) => {
          if (typeof cookieStore.setAll === 'function') return await cookieStore.setAll(cookiesArray)
          for (const c of cookiesArray || []) {
            try { cookieStore.set({ name: c.name, value: c.value, ...(c.options || {}) }) } catch (e) {}
          }
        },
>>>>>>> panel de admin mas policies de sql vercel fix 10 y loguin fixe 3
      }
    } else if (cookieStore && typeof cookieStore.getAll === 'function') {
      cookieAdapter = {
        get: async (name) => {
          const all = await cookieStore.getAll()
          const c = all.find((x) => x.name === name)
          return c ? c.value : undefined
        },
        set: async (name, value, options) => {
<<<<<<< HEAD
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
=======
          if (typeof cookieStore.setAll === 'function') {
            await cookieStore.setAll([{ name, value, options: options || {} }])
          } else if (typeof cookieStore.set === 'function') {
            cookieStore.set({ name, value, ...(options || {}) })
          }
        },
        remove: async (name, options) => {
          if (typeof cookieStore.setAll === 'function') {
            await cookieStore.setAll([{ name, value: '', options: { ...(options || {}), maxAge: 0 } }])
          } else if (typeof cookieStore.delete === 'function') {
            cookieStore.delete(name, options)
          }
        },
        getAll: async () => await cookieStore.getAll(),
        setAll: async (cookiesArray) => {
          if (typeof cookieStore.setAll === 'function') return await cookieStore.setAll(cookiesArray)
          for (const c of cookiesArray || []) {
            try { if (typeof cookieStore.set === 'function') cookieStore.set({ name: c.name, value: c.value, ...(c.options || {}) }) } catch (e) {}
          }
        },
      }
    } else {
>>>>>>> panel de admin mas policies de sql vercel fix 10 y loguin fixe 3
      cookieAdapter = {
        get: () => undefined,
        set: () => undefined,
        remove: () => undefined,
<<<<<<< HEAD
      }
    }

    // Configure cookie options for Supabase auth. These options are passed to
    // the auth-helpers so they set HttpOnly cookies with the desired attrs.
    const cookieOptions = {
      // name can be overridden by env if needed
=======
        getAll: async () => [],
        setAll: async () => undefined,
      }
    }

    const cookieOptions = {
>>>>>>> panel de admin mas policies de sql vercel fix 10 y loguin fixe 3
      name: process.env.SUPABASE_COOKIE_NAME || 'sb',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' || false,
      path: '/',
    }

<<<<<<< HEAD
    // Optionally allow configuring the cookie domain (useful for Vercel).
    // Example for sharing across previews/domains set SUPABASE_COOKIE_DOMAIN='.vercel.app'
    if (process.env.SUPABASE_COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.SUPABASE_COOKIE_DOMAIN
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, { cookies: cookieAdapter, cookieOptions })
=======
    if (process.env.SUPABASE_COOKIE_DOMAIN) cookieOptions.domain = process.env.SUPABASE_COOKIE_DOMAIN

    return createServerClient(supabaseUrl, supabaseAnonKey, { headers, cookies: cookieAdapter, cookieOptions })
>>>>>>> panel de admin mas policies de sql vercel fix 10 y loguin fixe 3
  } catch (err) {
    throw new Error('Failed to create Supabase server client: ' + (err?.message || String(err)))
  }
}

// Get user info for the current session (reads cookies via next/headers).
export async function getUserFromRequest() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
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
