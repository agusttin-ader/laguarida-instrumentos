/**
 * Cierra sesiones de chat sin mensajes en los últimos 30 min (sistema tipo tickets).
 * Invocar cada ~10 min: GET/POST con Authorization: Bearer CRON_SECRET o ?secret=CRON_SECRET.
 * Ej: cron-job.org → GET https://tudominio.com/api/chat/close-inactive?secret=TU_CRON_SECRET
 */
export const runtime = 'nodejs'
export const maxDuration = 30

const INACTIVITY_MINUTES = 30

function isCronAuthorized(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true
  const url = new URL(req.url || '', 'http://localhost')
  return url.searchParams.get('secret') === secret
}

async function closeInactiveSessions() {
  const { getSupabaseAdminClient } = await import('../../../../lib/supabase/server')
  const admin = getSupabaseAdminClient()
  const cutoff = new Date(Date.now() - INACTIVITY_MINUTES * 60 * 1000).toISOString()
  const idSet = new Set()
  const { data: inactiveWithMessages } = await admin
    .from('chat_sessions')
    .select('id')
    .in('status', ['open', 'pending'])
    .lt('last_message_at', cutoff)
  if (inactiveWithMessages) inactiveWithMessages.forEach((r) => idSet.add(r.id))
  const { data: inactiveNoMessages } = await admin
    .from('chat_sessions')
    .select('id')
    .in('status', ['open', 'pending'])
    .is('last_message_at', null)
    .lt('created_at', cutoff)
  if (inactiveNoMessages) inactiveNoMessages.forEach((r) => idSet.add(r.id))
  const ids = [...idSet]
  if (!ids.length) return { closed: 0 }
  const { error } = await admin
    .from('chat_sessions')
    .update({ status: 'closed' })
    .in('id', ids)
  if (error) throw error
  return { closed: ids.length }
}

export async function GET(req) {
  try {
    if (!isCronAuthorized(req)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const result = await closeInactiveSessions()
    return Response.json(result.closed ? result : { ...result, message: 'No inactive sessions' }, { status: 200 })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    if (!isCronAuthorized(req)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await closeInactiveSessions()
    return Response.json(result.closed ? result : { ...result, message: 'No inactive sessions' }, { status: 200 })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
