// ── Helpers ───────────────────────────────────────────────────────────────────

function parseTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function shiftMinutes(date, mins) {
  if (!date) return null;
  return new Date(date.getTime() + mins * 60000);
}

function withinWindow(date, windowMins) {
  if (!date) return false;
  const now = Date.now();
  const target = date.getTime();
  return now >= target && now < target + windowMins * 60000;
}

// ── State ─────────────────────────────────────────────────────────────────────

self.studySchedule = null;

// ── SW Lifecycle ──────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Message listener ──────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  if (type === 'SCHEDULE_NUDGES') {
    self.studySchedule = event.data.schedule;
  }

  if (type === 'SHOW_NOTIFICATION') {
    const { title, body, url = '/dashboard-v3' } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'lb-manual',
      data: { url },
    });
  }
});

// ── Notification click ────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard-v3';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// ── Nudge check ───────────────────────────────────────────────────────────────

async function runNudgeCheck() {
  const schedule = self.studySchedule;
  if (!schedule) return;

  const { reminderTime, checkinTime, studyDays, todayLogged, missedYesterday, missStreak = 0 } = schedule;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayName = dayNames[new Date().getDay()];
  if (!studyDays.includes(todayName)) return;

  const reminder = parseTime(reminderTime);
  const checkin = parseTime(checkinTime);

  if (todayLogged) return;

  if (withinWindow(shiftMinutes(reminder, -10), 4)) {
    const body = missStreak >= 5
      ? `Your plant is barely hanging on. Come back today — even 10 minutes.`
      : missStreak >= 2
      ? `You've missed ${missStreak} days. Today is the day to break that.`
      : `Get ready to start your session.`;
    await self.registration.showNotification('Study time in 10 minutes', {
      body, icon: '/favicon.ico', tag: 'lb-reminder', data: { url: '/dashboard-v3' },
    });
    return;
  }

  if (withinWindow(checkin, 4)) {
    const body = missStreak >= 2
      ? `${missStreak} days missed. Log even 10 minutes today to turn this around.`
      : `Tap to log your session — takes 5 seconds.`;
    await self.registration.showNotification('Did you study today?', {
      body, icon: '/favicon.ico', tag: 'lb-checkin', data: { url: '/dashboard-v3' },
    });
    return;
  }

  if (withinWindow(shiftMinutes(checkin, 30), 4)) {
    const body = missStreak >= 7
      ? `You've been away a week. Your course isn't gone — but it needs you today.`
      : missStreak >= 5
      ? `5 days without a session. Your plant is barely alive. 10 minutes right now.`
      : missStreak >= 2
      ? `${missStreak} days missed. Every extra day makes it harder to restart. Come back now.`
      : missedYesterday
      ? `You missed yesterday too. Your plant is wilting — even 10 minutes brings it back.`
      : `Your plant needs water. One topic, 10 minutes. You can do this.`;
    await self.registration.showNotification("Your course isn't abandoned", {
      body, icon: '/favicon.ico', tag: 'lb-recovery', data: { url: '/dashboard-v3' },
    });
  }
}

// ── Run every 5 minutes ───────────────────────────────────────────────────────

setInterval(runNudgeCheck, 5 * 60 * 1000);
