export type GoalType = 'job_switch' | 'certification' | 'skill_building' | 'other';
export type FallbackPath = 'quick_win' | 'back_on_track' | 'make_up';
export type FlowType = 'lockin' | 'reschedule' | 'pause';

export interface UserGoal {
  goalType: GoalType;
  goalTitle: string;
  deadlineType: 'fixed' | 'flexible';
  deadline?: string;
  dailyMinutes: number;
  startTime: string;
  checkinTime: string;
  email: string;
}

export interface DailyLog {
  date: string;
  completed: boolean;
  checkinResponseAt?: string;
  fallbackTriggered: boolean;
  pathSelected?: FallbackPath;
}

export interface Commitment {
  id: string;
  committedForDate: string;
  committedTime: string;
  minutes: number;
  flowType: FlowType;
  confirmed: boolean;
  fulfilled: boolean;
}

export interface CheckinPause {
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

export type DayStatus = 'done' | 'miss' | 'today' | 'future' | 'paused';
