import { useState, useMemo, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { getJourney } from '@/data/journeys';
import PlantVisual from '@/components/PlantVisual';
import { CheckCircle2, Circle, X, ArrowRight, Pencil, Settings } from 'lucide-react';
import { syncScheduleToSW } from '@/lib/notifications';

// ── Helpers ───────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekDays(): { label: string; date: string }[] {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return days.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, date: d.toISOString().split('T')[0] };
  });
}

function getDaysLeft(deadline?: string): number | null {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - new Date(today()).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function getCurrentWeekNumber(activatedAt?: string): number {
  if (!activatedAt) return 1;
  const ms = new Date(today()).getTime() - new Date(activatedAt).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24 * 7)));
}

function getPlantState(
  logs: { date: string; completed: boolean }[],
  todayStr: string
): 'growing' | 'wilting' | 'recovered' {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 3);
  const missCount = recent.filter(l => !l.completed).length;
  if (missCount >= 2) return 'wilting';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  const missedYesterday = logs.find(l => l.date === yStr && !l.completed);
  const doneToday = logs.find(l => l.date === todayStr && l.completed);
  if (missedYesterday && doneToday) return 'recovered';
  return 'growing';
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getAvgRecoveryDays(logs: { date: string; completed: boolean }[]): number | null {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const recoveryPoints: number[] = [];
  const missed = sorted.filter(l => !l.completed);
  const completed = sorted.filter(l => l.completed);
  for (const miss of missed) {
    const next = completed.find(l => l.date > miss.date);
    if (next) {
      const ms = new Date(next.date).getTime() - new Date(miss.date).getTime();
      recoveryPoints.push(Math.round(ms / (1000 * 60 * 60 * 24)));
    }
  }
  if (recoveryPoints.length === 0) return null;
  return Math.round(recoveryPoints.reduce((a, b) => a + b, 0) / recoveryPoints.length);
}

function getWeekSessionStats(
  logs: { date: string; completed: boolean }[],
  studyDays: string[],
  weekDates: { label: string; date: string }[],
  todayStr: string
): { done: number; planned: number } {
  const dayNameMap: Record<string, string> = {
    '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed',
    '4': 'Thu', '5': 'Fri', '6': 'Sat',
  };
  const done = weekDates.filter(({ date }) =>
    logs.find(l => l.date === date && l.completed)
  ).length;
  const planned = weekDates.filter(({ date }) => {
    if (date > todayStr) return false;
    const dayNum = String(new Date(date).getDay());
    return studyDays.includes(dayNameMap[dayNum]);
  }).length;
  return { done, planned: Math.max(planned, done) };
}

function getCurrentStreak(
  logs: { date: string; completed: boolean }[],
  studyDays: string[]
): number {
  const dayNameMap: Record<number, string> = {
    0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
  };
  const completed = [...logs]
    .filter(l => l.completed)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (completed.length === 0) return 0;
  let streak = 0;
  let cursor = new Date(today());
  for (let i = 0; i < 60; i++) {
    const dateStr = cursor.toISOString().split('T')[0];
    const dayName = dayNameMap[cursor.getDay()];
    if (!studyDays.includes(dayName)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const log = completed.find(l => l.date === dateStr);
    if (log) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getMissStreak(
  logs: { date: string; completed: boolean }[],
  studyDays: string[],
  todayStr: string,
  activatedAt?: string
): number {
  const dayNameMap: Record<number, string> = {
    0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
  };
  let streak = 0;
  let cursor = new Date(todayStr);
  cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 30; i++) {
    const dateStr = cursor.toISOString().split('T')[0];
    if (activatedAt && dateStr < activatedAt) break;
    const dayName = dayNameMap[cursor.getDay()];
    if (!studyDays.includes(dayName)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const log = logs.find(l => l.date === dateStr);
    if (!log || !log.completed) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ── Day pill ──────────────────────────────────────────────────────────────────

function DayPill({ label, date, todayStr, logs }: {
  label: string;
  date: string;
  todayStr: string;
  logs: { date: string; completed: boolean }[];
}) {
  const log = logs.find(l => l.date === date);
  const isFuture = date > todayStr;
  const isToday = date === todayStr;

  let bg = 'bg-surface-container text-on-surface-variant';
  if (isToday && !log?.completed) bg = 'bg-[#a63c2a] text-white';
  else if (log?.completed) bg = 'bg-[#4ade80]/20 text-[#16a34a] ring-1 ring-[#16a34a]/30';
  else if (log && !log.completed) bg = 'bg-red-100 text-red-500';
  else if (isFuture) bg = 'bg-surface-container text-on-surface-variant opacity-40';

  return (
    <div className={`flex-1 h-9 rounded-bento flex items-center justify-center text-xs font-bold transition-all ${bg}`}>
      {label}
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({ value, label, sub, highlight }: {
  value: string;
  label: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex-1 rounded-bento p-3 text-center ${highlight ? 'bg-[#a63c2a]/8 border border-[#a63c2a]/20' : 'bg-surface-container'}`}>
      <p className={`text-xl font-black leading-none mb-0.5 ${highlight ? 'text-[#a63c2a]' : 'text-on-surface'}`}>
        {value}
      </p>
      <p className="text-[10px] font-bold text-on-surface-variant leading-tight">{label}</p>
      {sub && <p className="text-[9px] text-on-surface-variant mt-0.5 opacity-70">{sub}</p>}
    </div>
  );
}

// ── Goal item ─────────────────────────────────────────────────────────────────

function GoalItem({ title, done, onToggle, onEdit }: {
  title: string; done: boolean; onToggle: () => void; onEdit: () => void;
}) {
  return (
    <div className="flex items-start gap-3 w-full py-2.5 border-b border-outline-variant/20 last:border-0">
      <button onClick={onToggle} className="flex items-start gap-3 flex-1 text-left active:opacity-70 transition-opacity">
        {done
          ? <CheckCircle2 className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
          : <Circle className="w-5 h-5 text-outline-variant flex-shrink-0 mt-0.5" />
        }
        <span className={`text-sm leading-snug ${done ? 'text-on-surface-variant line-through' : 'text-on-surface font-medium'}`}>
          {title}
        </span>
      </button>
      <button onClick={onEdit} className="flex-shrink-0 mt-0.5 p-1 active:opacity-60">
        <Pencil className="w-3.5 h-3.5 text-outline-variant" />
      </button>
    </div>
  );
}

// ── Goal edit sheet ───────────────────────────────────────────────────────────

type GoalEdit = {
  milestoneId: string;
  weekNumber: number;
  index: number;
  replacedWith?: string;
  pushedToWeek?: number;
};

function loadGoalEdits(): GoalEdit[] {
  try { return JSON.parse(localStorage.getItem('lb_goal_edits') ?? '[]'); } catch { return []; }
}

function saveGoalEdits(edits: GoalEdit[]) {
  localStorage.setItem('lb_goal_edits', JSON.stringify(edits));
}

function GoalEditSheet({ goal, weekNumber, index, milestoneId, onDismiss }: {
  goal: string;
  weekNumber: number;
  index: number;
  milestoneId: string;
  onDismiss: () => void;
}) {
  const [mode, setMode] = useState<null | 'replace' | 'push'>(null);
  const [replaceText, setReplaceText] = useState('');

  function handlePush() {
    const edits = loadGoalEdits().filter(
      e => !(e.milestoneId === milestoneId && e.weekNumber === weekNumber && e.index === index)
    );
    edits.push({ milestoneId, weekNumber, index, pushedToWeek: weekNumber + 1 });
    saveGoalEdits(edits);
    onDismiss();
  }

  function handleReplace() {
    if (!replaceText.trim()) return;
    const edits = loadGoalEdits().filter(
      e => !(e.milestoneId === milestoneId && e.weekNumber === weekNumber && e.index === index)
    );
    edits.push({ milestoneId, weekNumber, index, replacedWith: replaceText.trim(), pushedToWeek: weekNumber + 1 });
    saveGoalEdits(edits);
    onDismiss();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onDismiss} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-m3-bg rounded-t-[2rem] px-5 pt-5 pb-8 font-jakarta shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />
        <button onClick={onDismiss} className="absolute top-5 right-5 w-8 h-8 bg-surface-container rounded-full flex items-center justify-center">
          <X className="w-4 h-4 text-on-surface-variant" />
        </button>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Editing goal</p>
        <p className="text-sm font-bold text-on-surface mb-5 pr-8">{goal}</p>

        {!mode && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode('replace')}
              className="w-full py-3.5 rounded-bento bg-surface-container text-on-surface font-bold text-sm text-left px-4"
            >
              I covered something else this week
              <p className="text-xs text-on-surface-variant font-normal mt-0.5">Type what you studied - original moves to next week</p>
            </button>
            <button
              onClick={handlePush}
              className="w-full py-3.5 rounded-bento bg-surface-container text-on-surface font-bold text-sm text-left px-4"
            >
              Push to next week
              <p className="text-xs text-on-surface-variant font-normal mt-0.5">Keep it for later - no changes this week</p>
            </button>
          </div>
        )}

        {mode === 'replace' && (
          <>
            <textarea
              autoFocus
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              placeholder="What did you actually study?"
              className="w-full border border-outline-variant rounded-bento p-3 text-sm font-jakarta resize-none h-20 mb-4 bg-surface-container text-on-surface"
            />
            <button
              onClick={handleReplace}
              disabled={!replaceText.trim()}
              className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-lg shadow-[#a63c2a]/20 active:scale-95 transition-transform disabled:opacity-50 mb-3"
            >
              Save and push original to next week
            </button>
            <button onClick={() => setMode(null)} className="w-full py-3 rounded-full border border-outline-variant text-on-surface-variant font-bold text-sm">
              Back
            </button>
          </>
        )}
      </div>
    </>
  );
}
// ── Recovery bottom sheet ─────────────────────────────────────────────────────

function RecoverySheet({ missedTopic, smallestStep, missStreak, plantState, onLogNow, onDismiss }: {
  missedTopic: string;
  smallestStep: string;
  missStreak: number;
  plantState: 'growing' | 'wilting' | 'recovered';
  onLogNow: () => void;
  onDismiss: () => void;
}) {
  const [feedbackText, setFeedbackText] = useState('');
  const isFeedbackMode = missStreak >= 7;

  const title = missStreak >= 7
    ? "You've been away a week."
    : missStreak >= 5
    ? "Your plant is barely hanging on."
    : missStreak >= 2
    ? `${missStreak} days missed. Still recoverable.`
    : "You missed yesterday.";

  const subtitle = missStreak >= 7
    ? "That's okay. We'd love to know what got in the way."
    : missStreak >= 5
    ? "Don't let this become two weeks. 10 minutes is all it takes."
    : missStreak >= 2
    ? "Every day you wait makes re-entry harder. Start tiny."
    : "No guilt. Your plant bounces back when you do.";

  function handleShareAndStart() {
    if (feedbackText.trim()) {
      const entry = {
        id: crypto.randomUUID(),
        recordedAt: new Date().toISOString().split('T')[0],
        missStreak,
        note: feedbackText.trim(),
      };
      try {
        const existing = JSON.parse(localStorage.getItem('lb_lapse_feedback') ?? '[]');
        localStorage.setItem('lb_lapse_feedback', JSON.stringify([...existing, entry]));
      } catch { /* silently skip */ }
    }
    onLogNow();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onDismiss} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-m3-bg rounded-t-[2rem] px-5 pt-5 pb-8 font-jakarta shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />
        <button
          onClick={onDismiss}
          className="absolute top-5 right-5 w-8 h-8 bg-surface-container rounded-full flex items-center justify-center"
        >
          <X className="w-4 h-4 text-on-surface-variant" />
        </button>

        <div className="flex justify-center mb-4">
<PlantVisual
  state={missStreak >= 2 ? 'wilting' : 'growing'}
  missStreak={missStreak}
  className="w-20 h-20"
/>        </div>

        <h2 className="text-xl font-black text-on-surface mb-1">{title}</h2>
        <p className="text-sm text-on-surface-variant mb-5">{subtitle}</p>

        {!isFeedbackMode && (
          <>
            <div className="bg-surface-container rounded-bento p-4 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                What you missed
              </p>
              <p className="text-sm font-bold text-on-surface">{missedTopic}</p>
            </div>
            <div className="bg-[#ffac9d]/20 border border-[#a63c2a]/20 rounded-bento p-4 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#a63c2a] mb-1">
                Smallest step right now
              </p>
              <p className="text-sm font-bold text-on-surface">{smallestStep}</p>
              <p className="text-xs text-on-surface-variant mt-1">~10 minutes</p>
            </div>
          </>
        )}

        {isFeedbackMode ? (
          <>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="What got in the way? (optional)"
              className="w-full border border-outline-variant rounded-bento p-3 text-sm font-jakarta resize-none h-20 mb-4 bg-surface-container text-on-surface"
            />
            <button
              onClick={handleShareAndStart}
              className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-lg shadow-[#a63c2a]/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mb-3"
            >
              {feedbackText.trim() ? 'Share & start again' : 'Start again'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-full border border-outline-variant text-on-surface-variant font-bold text-sm"
            >
              Not ready yet
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onLogNow}
              className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-lg shadow-[#a63c2a]/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mb-3"
            >
              I'm starting now
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-full border border-outline-variant text-on-surface-variant font-bold text-sm"
            >
              I'll do it later today
            </button>
          </>
        )}
      </div>
    </>
  );
}
// ── Main Dashboard ────────────────────────────────────────────────────────────

// ── Day 0 empty state ─────────────────────────────────────────────────────────

function Day0Screen({ milestone, onLog }: {
  milestone: { goalTitle: string; journeyId?: string };
  onLog: () => void;
}) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="h-screen bg-m3-bg font-jakarta flex flex-col overflow-hidden">
      <header className="flex-shrink-0 flex justify-between items-center px-5 pt-5 pb-2">
        <h1 className="text-base font-black text-on-surface">
          {milestone.goalTitle}
        </h1>
        <span className="text-[11px] text-on-surface-variant border border-outline-variant/40 rounded-full px-3 py-1.5 font-medium">
          Day 1
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">

        <div className="mb-3 pt-2">
          <h2 className="text-2xl font-black text-on-surface leading-tight">
            Day 1. <span className="text-[#a63c2a] italic">Let's begin.</span>
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Log your first session today to start your streak.
          </p>
        </div>

        <div className="bg-surface-container rounded-bento p-4 mb-3 flex items-center gap-4">
          <PlantVisual state="growing" className="w-16 h-16 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-on-surface">Your plant is ready to grow</p>
            <p className="text-xs text-on-surface-variant mt-1 leading-snug">
              Every session you log waters it. Come back after a miss and it recovers. Just like you.
            </p>
          </div>
        </div>

        <div className="bg-surface-container rounded-bento p-4 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            What a full week looks like
          </p>
          <div className="flex gap-1.5">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full aspect-square rounded-full"
                  style={{
                    background: '#a63c2a',
                    opacity: i === 0 ? 1 : 0.15,
                    animation: i > 0 ? `day0wave 1.8s ease-in-out ${i * 0.22}s infinite` : 'none',
                  }}
                />
                <span className="text-[9px] font-bold text-on-surface-variant">{d}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-3 text-center italic">
            Each dot is a study day - this is what you're building toward
          </p>
        </div>

        <div className="rounded-bento p-4 mb-3 border-2 border-dashed border-outline-variant/40">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Your patterns - unlocks after a few sessions
          </p>
          <div className="flex gap-2">
            {[
              { val: '--', label: 'Recovery speed', sub: 'avg days to restart' },
              { val: '--', label: 'Fragile day', sub: 'toughest weekday' },
              { val: '--', label: 'Fastest back', sub: 'personal best' },
            ].map(({ val, label, sub }) => (
              <div key={label} className="flex-1 bg-surface-container rounded-bento p-2.5 text-center border border-dashed border-outline-variant/30">
                <p className="text-lg font-black text-outline-variant">{val}</p>
                <p className="text-[9px] font-bold text-outline-variant uppercase tracking-wide leading-tight mt-0.5">{label}</p>
                <p className="text-[9px] text-outline-variant/70 mt-0.5 leading-tight">{sub}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <div className="flex-shrink-0 px-4 py-4 bg-m3-bg border-t border-outline-variant/20">
        <button
          onClick={onLog}
          className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-lg shadow-[#a63c2a]/20 active:scale-95 transition-transform"
        >
          Log today's session
        </button>
        <p className="text-center text-[11px] text-on-surface-variant mt-2">Takes 5 seconds</p>
      </div>

      <style>{`
        @keyframes day0wave {
          0%, 100% { opacity: 0.15; transform: scale(0.85); }
          50% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardV3() {  const navigate = useNavigate();
  const { activeMilestone, activeLogs, addLog } = useApp();
  const todayStr = today();
  const yesterdayStr = getYesterday();
  const weekDays = getWeekDays();

  const studyDays = activeMilestone?.studyDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const missStreak = getMissStreak(activeLogs, studyDays, todayStr, activeMilestone?.activatedAt);
  const todayLogged = activeLogs.find(l => l.date === todayStr);
  const missedYesterday = activeLogs.find(l => l.date === yesterdayStr && !l.completed);
  const showMissBanner = missStreak > 0 && !todayLogged?.completed;

const [completedGoals, setCompletedGoals] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('v3_completed_goals');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const [showRecovery, setShowRecovery] = useState(false);
  const [editingGoal, setEditingGoal] = useState<{ goal: string; index: number } | null>(null);
  const [goalEdits, setGoalEdits] = useState<GoalEdit[]>(() => loadGoalEdits());

  function refreshGoalEdits() {
    setGoalEdits(loadGoalEdits());
  }
  useEffect(() => {
    if (!activeMilestone) return;
    syncScheduleToSW({
      reminderTime: activeMilestone.notifReminderTime ?? '07:00 PM',
      checkinTime: activeMilestone.notifCheckinTime ?? '09:00 PM',
      studyDays: activeMilestone.studyDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      todayLogged: !!activeLogs.find(l => l.date === todayStr && l.completed),
      missedYesterday: !!activeLogs.find(l => l.date === yesterdayStr && !l.completed),
      missStreak,
    });
  }, [activeMilestone, activeLogs]);

  // Auto-open recovery sheet on day 3+
  useEffect(() => {
    if (missStreak >= 3 && !todayLogged?.completed) {
      setShowRecovery(true);
    }
  }, [missStreak]);

  function toggleGoal(goalKey: string) {
    setCompletedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalKey)) next.delete(goalKey);
      else next.add(goalKey);
      localStorage.setItem('v3_completed_goals', JSON.stringify([...next]));
      return next;
    });
  }

const journey = useMemo(() => {
    if (!activeMilestone?.journeyId) return null;
    if (activeMilestone.journeyId === 'custom') {
      try {
        const raw = localStorage.getItem('lb_custom_journey');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
    return getJourney(activeMilestone.journeyId);
  }, [activeMilestone?.journeyId]);
  
  const weekNumber = getCurrentWeekNumber(activeMilestone?.activatedAt);
  const daysLeft = getDaysLeft(activeMilestone?.deadline);
  const plantState = getPlantState(activeLogs, todayStr);

  const avgRecovery = getAvgRecoveryDays(activeLogs);
  const { done: weekDone, planned: weekPlanned } = getWeekSessionStats(activeLogs, studyDays, weekDays, todayStr);
  const streak = getCurrentStreak(activeLogs, studyDays);

  const currentWeek = useMemo(() => {
    if (!journey) return null;
    const idx = Math.min(weekNumber - 1, journey.weeks.length - 1);
    return journey.weeks[idx] ?? journey.weeks[0];
  }, [journey, weekNumber]);

  const doneCount = currentWeek?.goals.filter((_, i) =>
    completedGoals.has(`${weekNumber}-${i}`)
  ).length ?? 0;

  const missedTopicIndex = currentWeek?.goals.findIndex((_, i) =>
    !completedGoals.has(`${weekNumber}-${i}`)
  ) ?? 0;
  const missedTopic = currentWeek?.goals[missedTopicIndex >= 0 ? missedTopicIndex : 0] ?? 'Your next topic';
  const smallestStep = `Start with just the first part of: ${missedTopic}`;

  function handleLogSession() {
    addLog({ date: todayStr, completed: true, fallbackTriggered: false });
    setShowRecovery(false);
  }

const bannerTitle = missStreak >= 7
    ? "You've been away a week."
    : missStreak >= 5
    ? 'Your plant is barely hanging on.'
    : missStreak >= 2
    ? `You've missed ${missStreak} days in a row.`
    : 'You missed yesterday.';
    
if (!activeMilestone) {
    return (
      <div className="h-screen bg-m3-bg font-jakarta flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-xl font-black text-[#a63c2a] mb-2">No journey started yet</h2>
        <p className="text-on-surface-variant text-sm mb-6">Set up your learning plan to get started.</p>
        <button
          onClick={() => navigate('/welcome')}
          className="bg-[#a63c2a] text-white rounded-full px-8 py-3 font-bold text-sm"
        >
          Start a journey
        </button>
      </div>
    );
  }

const isDay0 = activeLogs.length === 0 && activeMilestone.activatedAt === todayStr;

  if (isDay0) {
    return <Day0Screen milestone={activeMilestone} onLog={handleLogSession} />;
  }
  return (
    <div className="h-screen bg-m3-bg font-jakarta flex flex-col overflow-hidden">

     <header className="flex-shrink-0 flex justify-between items-center px-5 pt-5 pb-2">
  <div>
    <h1 className="text-base font-black text-on-surface leading-tight">
      {journey?.name ?? activeMilestone.goalTitle}
    </h1>
    <p className="text-[11px] text-on-surface-variant mt-0.5">
      Week {weekNumber}
      {daysLeft !== null && ` · ${daysLeft} days left`}
    </p>
  </div>
<div className="flex items-center gap-2">
    <button
      onClick={() => navigate('/settings')}
      className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center active:scale-95 transition-transform"
    >
      <Settings className="w-4 h-4 text-on-surface-variant" />
    </button>
    <button
      onClick={() => navigate('/onboarding-v3')}
      className="text-[11px] text-on-surface-variant border border-outline-variant/40 rounded-full px-3 py-1.5 font-medium active:opacity-70"
    >
      Wrong journey? Switch
    </button>
  </div>
    </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">

        <div className="flex flex-col items-center py-4">
<PlantVisual
  state={plantState}
  missStreak={missStreak}
  sessionStreak={streak}
  className="w-28 h-28"
/>          <p className="text-xs font-bold text-on-surface-variant mt-2">
            {plantState === 'growing' && 'Growing steadily'}
            {plantState === 'wilting' && 'Needs attention - come back today'}
            {plantState === 'recovered' && 'Coming back - keep going'}
          </p>
        </div>

        <div className="flex gap-1.5 mb-4">
          {weekDays.map(({ label, date }) => (
            <DayPill
              key={date}
              label={label}
              date={date}
              todayStr={todayStr}
              logs={activeLogs}
            />
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <MetricCard
            highlight
            value={avgRecovery !== null ? `${avgRecovery}d` : '—'}
            label="Avg recovery"
            sub={avgRecovery !== null ? 'days to bounce back' : 'No misses yet 🌱'}
          />
          <MetricCard
            value={`${weekDone}/${weekPlanned}`}
            label="This week"
            sub="sessions done"
          />
          <MetricCard
            value={streak > 0 ? `${streak}` : '—'}
            label="Streak"
            sub={streak > 0 ? `scheduled sessions in a row` : 'Start today'}
          />
        </div>

        {showMissBanner && (
          <button
            onClick={() => setShowRecovery(true)}
            className="w-full bg-red-50 border border-red-100 rounded-bento p-4 mb-4 text-left active:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-700 mb-0.5">{bannerTitle}</p>
                <p className="text-xs text-red-500">Tap to see the smallest step back.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
            </div>
          </button>
        )}

        {currentWeek ? (
          <section className="bg-surface-container-lowest rounded-bento border border-outline-variant/15 mb-4">
            <div className="px-4 pt-4 pb-2 border-b border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Week {weekNumber}
                  </p>
                  <h3 className="text-sm font-black text-on-surface mt-0.5">
                    {currentWeek.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                  {doneCount}/{currentWeek.goals.length}
                </span>
              </div>
              <div className="mt-3 h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#a63c2a] rounded-full transition-all duration-500"
                  style={{ width: `${currentWeek.goals.length > 0 ? (doneCount / currentWeek.goals.length) * 100 : 0}%` }}
                />
              </div>
            </div>
<div className="px-4 py-1">
              {(() => {
                const pushedIn = goalEdits.filter(
                  e => e.milestoneId === activeMilestone.id && e.pushedToWeek === weekNumber
                );
const baseGoals = currentWeek.goals.map((goal, i) => {
                  const edit = goalEdits.find(
                    e => e.milestoneId === activeMilestone.id && e.weekNumber === weekNumber && e.index === i
                  );
// Hide only if pushed away AND no replacement text provided
                  if (edit?.pushedToWeek && edit.pushedToWeek !== weekNumber && !edit.replacedWith) return null;
                  return { title: edit?.replacedWith ?? goal, originalIndex: i };                }).filter(Boolean) as { title: string; originalIndex: number }[];
                const allGoals = [
...pushedIn.map(e => {
                  const sourceWeek = journey?.weeks[(e.weekNumber - 1)];
                  const sourceTitle = sourceWeek?.goals[e.index] ?? 'Pushed goal';
                  return { title: sourceTitle, originalIndex: -(e.index * 100 + e.weekNumber) };
                }),                  ...baseGoals,
                ];

                return allGoals.map(({ title, originalIndex }) => {
                  const key = `${weekNumber}-${originalIndex}`;
                  return (
                    <GoalItem
                      key={key}
                      title={title}
                      done={completedGoals.has(key)}
                      onToggle={() => toggleGoal(key)}
                      onEdit={() => setEditingGoal({ goal: title, index: originalIndex })}
                    />
                  );
                });
              })()}
            </div>          </section>
        ) : (
          <section className="bg-surface-container rounded-bento p-5 mb-4 text-center">
            <p className="text-sm text-on-surface-variant">
              Journey template not found.{' '}
              <button
                onClick={() => { localStorage.clear(); navigate('/onboarding-v3'); }}
                className="underline text-[#a63c2a]"
              >
                Reset and start fresh
              </button>
            </p>
          </section>
        )}

      </main>

      <div className="flex-shrink-0 px-4 py-4 bg-m3-bg border-t border-outline-variant/20">
        {todayLogged?.completed ? (
          <div className="w-full py-4 rounded-full bg-[#4ade80]/15 border border-[#16a34a]/30 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
            <span className="font-bold text-[#16a34a] text-sm">Session logged for today</span>
          </div>
        ) : (
          <button
            onClick={handleLogSession}
            className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-lg shadow-[#a63c2a]/20 active:scale-95 transition-transform"
          >
            Log today's session
          </button>
        )}
      </div>

      {showRecovery && (
  <RecoverySheet
    missedTopic={missedTopic}
    smallestStep={smallestStep}
    missStreak={missStreak}
    plantState={plantState}
    onLogNow={handleLogSession}
    onDismiss={() => setShowRecovery(false)}
  />
)}
{editingGoal && (
        <GoalEditSheet
          goal={editingGoal.goal}
          weekNumber={weekNumber}
          index={editingGoal.index}
          milestoneId={activeMilestone.id}
          onDismiss={() => { setEditingGoal(null); refreshGoalEdits(); }}
        />
      )}
    </div>
  );
}