/**
 * Web Push: send to admin devices (iOS PWA / desktop).
 * Requires VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in env.
 */

let webpushPromise = null
async function getWebPush() {
  if (webpushPromise) return webpushPromise
  try {
    const wp = (await import('web-push')).default
    const publicKey = process.env.VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) return null
    wp.setVapidDetails(
      'mailto:admin@laguaridainstrumentos.com',
      publicKey,
      privateKey
    )
    webpushPromise = wp
    return wp
  } catch {
    return null
  }
}

function subscriptionFromRow(row) {
  if (!row?.endpoint || !row?.p256dh || !row?.auth) return null
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  }
}

/**
 * Send a push notification to all stored admin subscriptions.
 * @param {object} adminClient - Supabase admin client
 * @param {{ title: string, body?: string }} payload
 */
export async function sendAdminPushNotifications(adminClient, payload) {
  const wp = await getWebPush()
  if (!wp) return
  const { data: rows } = await adminClient
    .from('admin_push_subscriptions')
    .select('id, endpoint, p256dh, auth')
  if (!rows?.length) return
  const title = payload?.title || 'La Guarida'
  const body = payload?.body || ''
  const payloadStr = JSON.stringify({ title, body })
  for (const row of rows) {
    const sub = subscriptionFromRow(row)
    if (!sub) continue
    try {
      await wp.sendNotification(sub, payloadStr)
    } catch (err) {
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        try {
          await adminClient.from('admin_push_subscriptions').delete().eq('id', row.id)
        } catch {
          // ignore
        }
      }
    }
  }
}
