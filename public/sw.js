const CACHE_NAME = 'learners-buddy-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

// ── Push (Phase 2 — server-side) ──────────────────────────────────────────────

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data?.json() ?? {}; } catch { data = { body: e.data?.text() ?? '' }; }
  const title = data.title ?? 'Learners Buddy';
  const options = {
    body: data.body ?? 'Time to study.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag ?? 'learners-buddy',
    data: { url: data.url ?? '/dashboard-v3' },
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification tap — open the app ──────────────────────────────────────────

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url ?? '/dashboard-v3';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// ── Messages from the app ─────────────────────────────────────────────────────

self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, url } = e.data;
    self.registration.showNotification(title ?? 'Learners Buddy', {
      body: body ?? 'Time to study.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'learners-buddy-local',
      data: { url: url ?? '/dashboard-v3' },
    });
  }

  // App sends schedule + state every time dashboard loads
  if (e.data?.type === 'SCHEDULE_NUDGES') {
    self.studySchedule = e.data.schedule;
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseTime(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(' ');
  const ampm = parts[1];
  const [hStr, mStr] = parts[0].split(':');
  let hour = parseInt(hStr);
  const minute = parseInt(mStr ?? '0');
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return { hour24: hour, minute };
}

function withinWindow(target, windowMins) {
  if (!target) return false;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const targetMins = target.hour24 * 60 + target.minute;
  return Math.abs(nowMins - targetMins) <= windowMins;
}

function shiftMinutes(target, delta) {
  if (!target) return null;
  const total = (target.hour24 * 60 + target.minute + delta + 1440) % 1440;
  return { hour24: Math.floor(total / 60), minute: total % 60 };
}

// ── Nudge check — runs every 5 minutes ───────────────────────────────────────

async function runNudgeCheck() {
  const schedule = self.studySchedule;
  if (!schedule) return;

  const { reminderTime, checkinTime, studyDays, todayLogged, missedYesterday } = schedule;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayName = dayNames[new Date().getDay()];
  if (!studyDays.includes(todayName)) return;

  const reminder = parseTime(reminderTime);
  const checkin = parseTime(checkinTime);

  // Already logged — no nudges needed
  if (todayLogged) return;

  // 1. Study reminder — 10 min before study time
  if (withinWindow(shiftMinutes(reminder, -10), 4)) {
    await self.registration.showNotification('Study time in 10 minutes 📖', {
      body: 'Get ready to start your session.',
      icon: '/favicon.ico',
      tag: 'lb-reminder',
      data: { url: '/dashboard-v3' },
    });
    return;
  }

  // 2. Check-in — at check-in time
  if (withinWindow(checkin, 4)) {
    await self.registration.showNotification('Did you study today? 🌱', {
      body: 'Tap to log your session — takes 5 seconds.',
      icon: '/favicon.ico',
      tag: 'lb-checkin',
      data: { url: '/dashboard-v3' },
    });
    return;
  }

  // 3. Recovery nudge — 30 min after check-in
  if (withinWindow(shiftMinutes(checkin, 30), 4)) {
    const body = missedYesterday
      ? 'You missed yesterday too. Your plant is wilting 🥀 — even 10 minutes brings it back.'
      : 'Your plant needs water. One topic, 10 minutes. You can do this.';
    await self.registration.showNotification("Your course isn't abandoned 🌱", {
      body,
      icon: '/favicon.ico',
      tag: 'lb-recovery',
      data: { url: '/dashboard-v3' },
    });
  }
}

// ── Activate + start interval ─────────────────────────────────────────────────

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
  // Check every 5 minutes
  setInterval(() => {
    runNudgeCheck().catch(() => {});
  }, 5 * 60 * 1000);
});