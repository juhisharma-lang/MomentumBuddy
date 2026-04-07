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

  // 1. Study reminder — 10 min before study time
  if (withinWindow(shiftMinutes(reminder, -10), 4)) {
    const body = missStreak >= 5
      ? `Your plant is barely hanging on. Come back today — even 10 minutes.`
      : missStreak >= 2
      ? `You've missed ${missStreak} days. Today is the day to break that.`
      : `Get ready to start your session.`;
    await self.registration.showNotification('Study time in 10 minutes', {
      body,
      icon: '/favicon.ico',
      tag: 'lb-reminder',
      data: { url: '/dashboard-v3' },
    });
    return;
  }

  // 2. Check-in — at check-in time
  if (withinWindow(checkin, 4)) {
    const body = missStreak >= 2
      ? `${missStreak} days missed. Log even 10 minutes today to turn this around.`
      : `Tap to log your session — takes 5 seconds.`;
    await self.registration.showNotification('Did you study today?', {
      body,
      icon: '/favicon.ico',
      tag: 'lb-checkin',
      data: { url: '/dashboard-v3' },
    });
    return;
  }

  // 3. Recovery nudge — 30 min after check-in
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
      body,
      icon: '/favicon.ico',
      tag: 'lb-recovery',
      data: { url: '/dashboard-v3' },
    });
  }
}