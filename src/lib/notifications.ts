export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function sendLocalNotification(
  title: string,
  body: string,
  url = '/dashboard-v3'
): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  reg.active?.postMessage({ type: 'SHOW_NOTIFICATION', title, body, url });
}

export function saveStudyTime(reminderTime: string, checkinTime: string): void {
  localStorage.setItem('lb_reminder_time', reminderTime);
  localStorage.setItem('lb_checkin_time', checkinTime);
}

export function notificationsGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Call this from DashboardV3 on every load to keep the SW in sync
export async function syncScheduleToSW(schedule: {
  reminderTime: string;
  checkinTime: string;
  studyDays: string[];
  todayLogged: boolean;
  missedYesterday: boolean;
}): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: 'SCHEDULE_NUDGES', schedule });
  } catch {
    // SW not ready yet — silently skip
  }
}