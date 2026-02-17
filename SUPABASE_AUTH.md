Supabase Auth — Notes for this project

Overview
- This project uses `@supabase/supabase-js` and the existing helpers in `lib/supabase`.
- We reuse the existing `client.js` (client) and `server.js` (server) helpers and add small wrappers for common auth flows.

Environment variables
- Client (exposed to browser): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server (only available on server): `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Do NOT add or expose the `service_role` key to the client or commit it to the repo.

Client-side helpers (lib/supabase/client.js)
- Default export: `supabase` (client instance for use in client components)
- `signInWithEmail(email, password)` — signs in using email+password
- `signUpWithEmail(email, password)` — creates an account
- `signOut()` — signs out
- `getSession()` — returns the current client session

Usage (client components)
- Import the client or helpers from `lib/supabase/client.js`.
- Example sign-in:

  const { data, error } = await signInWithEmail(email, password)
  // data.session contains access token; client SDK persists session in browser

Server-side auth helpers (lib/supabase/server.js)
- `getSupabaseServerClient()` — creates a server-side client using `SUPABASE_URL` and `SUPABASE_ANON_KEY`. This is the anon key on the server and is safe to use for normal operations.
- `getUserByAccessToken(accessToken)` — returns the user associated with a Supabase access token.
- `getUserFromRequest(req)` — tries to extract an access token from a Request-like object. It checks, in order:
  1. `Authorization: Bearer <token>` header
  2. `cookie` header for `supabaseAccessToken` or `sb-access-token` cookie names
- `requireAuthFromRequest(req)` — helper that throws a 401 error if no authenticated user is found.

Notes on server usage
- Supabase sessions are normally managed client-side (local storage). To access auth on the server you must provide the access token with the request.
- Two common approaches:
  1. Client attaches `Authorization: Bearer <access_token>` to fetch requests to your server routes. Server uses `getUserFromRequest(req)` to read and validate the token.
  2. After sign-in, set an HttpOnly cookie containing the access token from a trusted server endpoint. The server can then read the cookie automatically from requests. (This repo does not automatically set that cookie; you'll need to implement a route to set an HttpOnly cookie if you prefer that flow.)

Security
- Never expose the `service_role` key in client code or committed env files.
- The server helpers use the anon key and validate tokens by calling `auth.getUser(accessToken)`.

Examples
- Server route handler (App Router) example:

  import { NextResponse } from 'next/server'
  import { requireAuthFromRequest } from '../../lib/supabase/server'

  export async function GET(req) {
    try {
      const user = await requireAuthFromRequest(req)
      return NextResponse.json({ user })
    } catch (err) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

- Client example attaching token manually:

  // after sign in
  const { data } = await signInWithEmail(email, password)
  const token = data?.session?.access_token
  await fetch('/api/protected', {
    headers: { Authorization: `Bearer ${token}` }
  })

Further improvements
- To make auth automatic in server components, consider using `@supabase/auth-helpers-nextjs` (not added here per requirements) or implement an HttpOnly cookie-setting endpoint after sign-in.

If you want, I can:
- Add an example API route that sets an HttpOnly cookie on sign-in.
- Add middleware to attach user to requests automatically.
