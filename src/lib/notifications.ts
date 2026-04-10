import { supabase } from './supabase'
import { getDeviceId } from './deviceId'

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

export async function syncScheduleToSW(schedule: {
  reminderTime: string;
  checkinTime: string;
  studyDays: string[];
  todayLogged: boolean;
  missedYesterday: boolean;
  missStreak?: number;
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

// ── Web Push subscription ─────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

export async function subscribeToWebPush(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    if (Notification.permission !== 'granted') return false;

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn('VITE_VAPID_PUBLIC_KEY not set');
      return false;
    }

    const reg = await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existing = await reg.pushManager.getSubscription();
    const subscription = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // Get user_id from Supabase
    const deviceId = getDeviceId();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (!user) {
      console.warn('subscribeToWebPush: user not found in Supabase yet');
      return false;
    }

    // Save subscription to Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          subscription: subscription.toJSON(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.warn('Failed to save push subscription:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('subscribeToWebPush failed:', err);
    return false;
  }
}