export type GoalType = 'job_switch' | 'certification' | 'skill_building' | 'other';
export type FlowType = 'lockin' | 'reschedule' | 'pause';
export type ChannelType = 'telegram' | 'email';
export type DashboardState = 'A' | 'B' | 'C' | 'D';
export type MilestoneStatus = 'active' | 'placeholder' | 'completed' | 'abandoned';

// ── Milestone ─────────────────────────────────────────────────────────────────
// Replaces UserGoal. A placeholder has only id, title, deadline, status, createdAt.
// All schedule/channel fields are filled in when the milestone is activated.

export interface Milestone {
  id: string;
  status: MilestoneStatus;
  createdAt: string;                  // ISO date string

  // Required even for placeholder
  goalTitle: string;

  // Optional on placeholder, required on active
  goalType?: GoalType;
  deadlineType?: 'fixed' | 'flexible';
  deadline?: string;                  // 'yyyy-MM-dd'
  dailyMinutes?: number;
  startTime?: string;
  checkinTime?: string;
  channelType?: ChannelType;
  telegramHandle?: string;
  email?: string;

  // Lifecycle timestamps
  activatedAt?: string;
  completedAt?: string;
  abandonedAt?: string;
}

// ── Sub-types — all scoped by milestoneId ─────────────────────────────────────

export interface DailyLog {
  milestoneId: string;
  date: string;                       // 'yyyy-MM-dd'
  completed: boolean;
  checkinResponseAt?: string;
  fallbackTriggered: boolean;
}

export interface Commitment {
  id: string;
  milestoneId: string;
  committedForDate: string;
  committedTime: string;
  minutes: number;
  flowType: FlowType;
  confirmed: boolean;
  fulfilled: boolean;
}

export interface CheckinPause {
  milestoneId: string;
  pausedFrom: string;
  pausedUntil: string;
}

export interface WeeklySummaryData {
  weekStart: string;
  sessionsPlanned: number;
  sessionsCompleted: number;
  avgRestartDelay: number;
  minutesLogged: number;
}

// ── Achievements — computed when a milestone completes ────────────────────────

export interface MilestoneAchievements {
  milestoneId: string;
  totalSessions: number;
  totalMinutes: number;
  longestStreak: number;
  fastestRecovery: number | null;
  avgRecovery: number | null;
  completedOnTime: boolean;
}

export type DayStatus = 'done' | 'miss' | 'restart_planned' | 'today' | 'future' | 'paused';

// ── Dashboard state derivation ────────────────────────────────────────────────

export function getDashboardState(
  logs: DailyLog[],
  commitments: Commitment[],
  pauses: CheckinPause[],
  milestoneId: string,
  today: string
): DashboardState {
  const mLogs = logs.filter(l => l.milestoneId === milestoneId);
  const mCommitments = commitments.filter(c => c.milestoneId === milestoneId);
  const mPauses = pauses.filter(p => p.milestoneId === milestoneId);

  const activePause = mPauses.find(p => p.pausedFrom <= today && p.pausedUntil >= today);
  if (activePause) return 'D';

  const pendingCommitment = mCommitments.find(
    c => c.confirmed && !c.fulfilled && c.committedForDate >= today
  );
  if (pendingCommitment) return 'C';

  const yesterday = getPrevDay(today);
  const yesterdayLog = mLogs.find(l => l.date === yesterday);
  if (yesterdayLog && !yesterdayLog.completed) return 'B';

  return 'A';
}

function getPrevDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ── Achievement computation ───────────────────────────────────────────────────

export function computeAchievements(
  milestone: Milestone,
  logs: DailyLog[]
): MilestoneAchievements {
  const mLogs = logs
    .filter(l => l.milestoneId === milestone.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const completed = mLogs.filter(l => l.completed);
  const missed = mLogs.filter(l => !l.completed);

  let longestStreak = 0;
  let currentStreak = 0;
  for (const log of mLogs) {
    if (log.completed) { currentStreak++; longestStreak = Math.max(longestStreak, currentStreak); }
    else { currentStreak = 0; }
  }

  const recoveryPoints: number[] = [];
  for (const miss of missed) {
    const next = completed.find(l => l.date > miss.date);
    if (next) {
      const msPerDay = 1000 * 60 * 60 * 24;
      recoveryPoints.push(Math.round(
        (new Date(next.date).getTime() - new Date(miss.date).getTime()) / msPerDay
      ));
    }
  }

  return {
    milestoneId: milestone.id,
    totalSessions: completed.length,
    totalMinutes: completed.length * (milestone.dailyMinutes ?? 0),
    longestStreak,
    fastestRecovery: recoveryPoints.length > 0 ? Math.min(...recoveryPoints) : null,
    avgRecovery: recoveryPoints.length > 0
      ? parseFloat((recoveryPoints.reduce((a, b) => a + b, 0) / recoveryPoints.length).toFixed(1))
      : null,
    completedOnTime:
      milestone.deadlineType === 'fixed' && !!milestone.deadline && !!milestone.completedAt
        ? milestone.completedAt <= milestone.deadline
        : false,
  };
}

// ── Pulse Feedback ────────────────────────────────────────────────────────────

export interface PulseFeedback {
  id: string;
  milestoneId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  dayNumber: number;                  // which 7-day mark (7, 14, 21, ...)
  recordedAt: string;                 // ISO date string
}
