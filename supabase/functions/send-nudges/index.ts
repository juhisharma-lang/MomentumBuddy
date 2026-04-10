// supabase/functions/send-nudges/index.ts
// Runs on a cron schedule, checks who needs a nudge, sends web push

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Web Push implementation (no npm in Deno, use web crypto) ─────────────────

async function uint8ArrayToBase64Url(arr: Uint8Array): Promise<string> {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function base64UrlToUint8Array(base64url: string): Promise<Uint8Array> {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)))
}

async function signJWT(payload: object, privateKeyBytes: Uint8Array): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' }
  const enc = new TextEncoder()
  const headerB64 = await uint8ArrayToBase64Url(enc.encode(JSON.stringify(header)))
  const payloadB64 = await uint8ArrayToBase64Url(enc.encode(JSON.stringify(payload)))
  const signingInput = `${headerB64}.${payloadB64}`

  const key = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    enc.encode(signingInput)
  )

  const sigB64 = await uint8ArrayToBase64Url(new Uint8Array(signature))
  return `${signingInput}.${sigB64}`
}

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublic: string,
  vapidPrivate: string,
  vapidMailto: string
): Promise<Response> {
  const url = new URL(subscription.endpoint)
  const audience = `${url.protocol}//${url.host}`
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60

  const privateKeyBytes = await base64UrlToUint8Array(vapidPrivate)
  const jwt = await signJWT({ aud: audience, exp, sub: vapidMailto }, privateKeyBytes)

  return fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${vapidPublic}`,
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
    },
    body: payload,
  })
}

// ── Nudge copy ────────────────────────────────────────────────────────────────

function getNudgeCopy(missStreak: number, type: 'reminder' | 'checkin'): { title: string; body: string } {
  if (type === 'reminder') {
    if (missStreak >= 7) return { title: 'Still here for you', body: 'No pressure - even 10 mins counts today.' }
    if (missStreak >= 5) return { title: 'Ready when you are', body: 'Your streak is waiting. Pick it back up today.' }
    if (missStreak >= 2) return { title: 'Time to restart', body: 'Yesterday was a miss. Today is your comeback.' }
    return { title: 'Study time', body: "Your session starts soon. You've got this." }
  } else {
    if (missStreak >= 7) return { title: 'Log in when ready', body: 'No judgment. Just mark what happened today.' }
    if (missStreak >= 5) return { title: 'How did it go?', body: "Log today's session - even partial progress counts." }
    if (missStreak >= 2) return { title: 'Did you study today?', body: 'Log your session to keep your recovery going.' }
    return { title: 'Check in time', body: 'How did your session go today?' }
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const vapidPublic  = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidMailto  = Deno.env.get('VAPID_MAILTO')!
    const serviceKey   = Deno.env.get('SERVICE_ROLE_KEY')!
    const supabaseUrl  = Deno.env.get('SUPABASE_URL')!

    const supabase = createClient(supabaseUrl, serviceKey)

    // Get all push subscriptions with their user state
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select(`
        id,
        subscription,
        user_id,
        users (
          full_state,
          active_milestone_id
        )
      `)

    if (error) throw error
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no subscriptions' }), { status: 200 })
    }

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentHour = now.getUTCHours()
    const currentMinute = now.getUTCMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    let sent = 0
    let skipped = 0

    for (const row of subscriptions) {
      try {
        const fullState = row.users?.full_state
        if (!fullState) { skipped++; continue }

        const state = typeof fullState === 'string' ? JSON.parse(fullState) : fullState
        const activeMilestone = state.milestones?.find(
          (m: any) => m.id === state.activeMilestoneId && m.status === 'active'
        )
        if (!activeMilestone) { skipped++; continue }

        // Check if today is a study day
        const studyDays: string[] = activeMilestone.studyDays ?? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        const todayName = dayNames[now.getUTCDay()]
        if (!studyDays.includes(todayName)) { skipped++; continue }

        // Check if already logged today
        const todayLogged = state.logs?.some(
          (l: any) => l.date === todayStr && l.milestoneId === activeMilestone.id && l.completed
        )
        if (todayLogged) { skipped++; continue }

        // Check if paused
        const activePause = state.pauses?.find(
          (p: any) => p.milestoneId === activeMilestone.id &&
            p.pausedFrom <= todayStr && p.pausedUntil >= todayStr
        )
        if (activePause) { skipped++; continue }

        // Calculate miss streak
        const missStreak = (() => {
          let streak = 0
          const cursor = new Date(now)
          cursor.setUTCDate(cursor.getUTCDate() - 1)
          while (streak < 30) {
            const d = cursor.toISOString().split('T')[0]
            const log = state.logs?.find((l: any) => l.date === d && l.milestoneId === activeMilestone.id)
            if (!log || log.completed) break
            streak++
            cursor.setUTCDate(cursor.getUTCDate() - 1)
          }
          return streak
        })()

        // Parse reminder and checkin times
        const parseTime = (timeStr: string): number => {
          if (!timeStr) return -1
          const clean = timeStr.replace(/\s?(AM|PM)/i, '')
          const [h, m] = clean.split(':').map(Number)
          const isPM = /PM/i.test(timeStr)
          const hour = isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h)
          return hour * 60 + (m || 0)
        }

        const reminderMinutes = parseTime(activeMilestone.notifReminderTime ?? activeMilestone.startTime ?? '09:00')
        const checkinMinutes  = parseTime(activeMilestone.notifCheckinTime ?? activeMilestone.checkinTime ?? '21:00')

        // Fire within a 35-minute window of scheduled time
        const WINDOW = 35
        const shouldSendReminder = Math.abs(currentTimeMinutes - reminderMinutes) <= WINDOW
        const shouldSendCheckin  = Math.abs(currentTimeMinutes - checkinMinutes) <= WINDOW

        if (!shouldSendReminder && !shouldSendCheckin) { skipped++; continue }

        const nudgeType = shouldSendReminder ? 'reminder' : 'checkin'
        const { title, body } = getNudgeCopy(missStreak, nudgeType)

        const payload = JSON.stringify({ title, body, url: '/dashboard-v3' })

        const result = await sendWebPush(
          row.subscription,
          payload,
          vapidPublic,
          vapidPrivate,
          vapidMailto
        )

        if (result.ok || result.status === 201) {
          sent++
        } else {
          // 410 = subscription expired, remove it
          if (result.status === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', row.id)
          }
          skipped++
        }
      } catch (innerErr) {
        console.warn('Failed to process subscription:', innerErr)
        skipped++
      }
    }

    return new Response(JSON.stringify({ sent, skipped }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('send-nudges error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})