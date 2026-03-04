import { Milestone } from '@/types/app';

// ── Nudge types ──────────────────────────────────────────────────────────────

export type NudgeType =
  | 'session_reminder_30'      // 30 min before daily session
  | 'session_reminder_start'   // at daily session start time
  | 'commitment_reminder_30'   // 30 min before a locked-in restart commitment
  | 'pause_expired'            // pause ended but user hasn't returned
  | 'missed_no_plan'           // missed yesterday, no restart commitment exists
  | 'deadline_approaching';    // deadline is today or passed with sessions not logged

export interface Nudge {
  id: string;
  type: NudgeType;
  scheduledFor: string;        // ISO 8601 — backend fires at this time
  channel: 'telegram' | 'email';
  recipient: string;           // telegram handle or email address
  payload: {
    subject?: string;          // email only
    body: string;              // message copy
  };
  sent: boolean;               // backend sets this to true after sending
  createdAt: string;           // ISO 8601
}

// ── Storage key ──────────────────────────────────────────────────────────────

const NUDGE_KEY = 'momentum_buddy_nudges';

// ── Read / write helpers ─────────────────────────────────────────────────────

export function readNudgeQueue(): Nudge[] {
  try {
    const raw = localStorage.getItem(NUDGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeNudgeQueue(nudges: Nudge[]): void {
  localStorage.setItem(NUDGE_KEY, JSON.stringify(nudges));
}

// ── Queue a nudge (deduplicates by type + scheduledFor) ──────────────────────

export function queueNudge(nudge: Omit<Nudge, 'id' | 'sent' | 'createdAt'>): void {
  const queue = readNudgeQueue();
  const alreadyExists = queue.some(
    n => n.type === nudge.type && n.scheduledFor === nudge.scheduledFor && !n.sent
  );
  if (alreadyExists) return;
  queue.push({
    ...nudge,
    id: crypto.randomUUID(),
    sent: false,
    createdAt: new Date().toISOString(),
  });
  writeNudgeQueue(queue);
}

// ── Remove unsent nudges of a specific type (e.g. on pause cancel) ───────────

export function cancelNudgesByType(type: NudgeType): void {
  const queue = readNudgeQueue();
  writeNudgeQueue(queue.filter(n => n.type !== type || n.sent));
}

// ── Build scheduledFor timestamp from a date string + time string ────────────
// date: 'yyyy-MM-dd', time: 'HH:mm', offsetMinutes: negative = before

export function buildScheduledFor(date: string, time: string, offsetMinutes = 0): string {
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(hours, minutes + offsetMinutes, 0, 0);
  return d.toISOString();
}

// ── Resolve channel details from goal ────────────────────────────────────────

export function resolveRecipient(goal: Milestone): { channel: 'telegram' | 'email'; recipient: string } {
  return {
    channel: goal.channelType,
    recipient: goal.channelType === 'telegram'
      ? (goal.telegramHandle || '')
      : (goal.email || ''),
  };
}

// ── Nudge message copy ────────────────────────────────────────────────────────

export function buildNudgePayload(
  type: NudgeType,
  goal: Milestone,
  context: { date?: string; time?: string; minutes?: number } = {}
): Nudge['payload'] {
  const title = goal.goalTitle;
  const mins = context.minutes ?? goal.dailyMinutes;

  switch (type) {
    case 'session_reminder_30':
      return {
        subject: `Starting in 30 minutes — ${title}`,
        body: `Your ${mins}-minute session for "${title}" starts in 30 minutes at ${context.time}. Get ready.`,
      };
    case 'session_reminder_start':
      return {
        subject: `Time to start — ${title}`,
        body: `It's ${context.time}. Your ${mins}-minute session for "${title}" starts now.`,
      };
    case 'commitment_reminder_30':
      return {
        subject: `Restart in 30 minutes — ${title}`,
        body: `You committed to ${mins} minutes on "${title}" at ${context.time}. 30 minutes to go.`,
      };
    case 'pause_expired':
      return {
        subject: `Your pause has ended — ${title}`,
        body: `Your check-in pause has ended. Ready to get back to "${title}"? Open the app to log today's session.`,
      };
    case 'missed_no_plan':
      return {
        subject: `You missed yesterday — let's make a plan`,
        body: `You missed your "${title}" session yesterday and haven't scheduled a restart. Open the app to lock in a time for today.`,
      };
    case 'deadline_approaching':
      return {
        subject: `Deadline reached — ${title}`,
        body: `Your deadline for "${title}" is here. You still have time to log a session today and finish strong. Open the app.`,
      };
  }
}

// ── High-level queue helpers (called from pages) ──────────────────────────────

// Called from CheckIn when daily session is confirmed (yes flow)
export function queueDailySessionNudges(goal: Milestone, sessionDate: string): void {
  const { channel, recipient } = resolveRecipient(goal);
  if (!recipient) return;

  queueNudge({
    type: 'session_reminder_30',
    scheduledFor: buildScheduledFor(sessionDate, goal.startTime, -30),
    channel,
    recipient,
    payload: buildNudgePayload('session_reminder_30', goal, { time: goal.startTime }),
  });

  queueNudge({
    type: 'session_reminder_start',
    scheduledFor: buildScheduledFor(sessionDate, goal.startTime),
    channel,
    recipient,
    payload: buildNudgePayload('session_reminder_start', goal, { time: goal.startTime }),
  });
}

// Called from CheckIn when a restart commitment is locked in
export function queueCommitmentNudges(
  goal: Milestone,
  committedDate: string,
  committedTime: string,
  minutes: number
): void {
  const { channel, recipient } = resolveRecipient(goal);
  if (!recipient) return;

  queueNudge({
    type: 'commitment_reminder_30',
    scheduledFor: buildScheduledFor(committedDate, committedTime, -30),
    channel,
    recipient,
    payload: buildNudgePayload('commitment_reminder_30', goal, { time: committedTime, minutes }),
  });
}

// Called from Settings when a pause is saved
export function queuePauseExpiredNudge(goal: Milestone, pausedUntil: string): void {
  const { channel, recipient } = resolveRecipient(goal);
  if (!recipient) return;

  // Fire the day after the pause ends at the user's usual check-in time
  queueNudge({
    type: 'pause_expired',
    scheduledFor: buildScheduledFor(pausedUntil, goal.checkinTime),
    channel,
    recipient,
    payload: buildNudgePayload('pause_expired', goal),
  });
}

// Called from Dashboard on load when deadline is today or past with no log today
export function queueDeadlineNudge(goal: Milestone, todayStr: string): void {
  const { channel, recipient } = resolveRecipient(goal);
  if (!recipient) return;

  queueNudge({
    type: 'deadline_approaching',
    scheduledFor: buildScheduledFor(todayStr, goal.checkinTime ?? '09:00'),
    channel,
    recipient,
    payload: buildNudgePayload('deadline_approaching', goal),
  });
}

// Called from Dashboard on load when missed_no_plan condition is met
export function queueMissedNoPlanNudge(goal: Milestone, missedDate: string): void {
  const { channel, recipient } = resolveRecipient(goal);
  if (!recipient) return;

  // Fire at today's check-in time
  queueNudge({
    type: 'missed_no_plan',
    scheduledFor: buildScheduledFor(missedDate, goal.checkinTime),
    channel,
    recipient,
    payload: buildNudgePayload('missed_no_plan', goal),
  });
}