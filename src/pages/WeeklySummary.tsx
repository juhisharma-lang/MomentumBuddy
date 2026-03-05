import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { startOfWeek, addDays, format, parseISO, differenceInDays, startOfMonth, subMonths } from 'date-fns';
import PoweredByFooter from '@/components/PoweredByFooter';
import { DailyLog, Milestone } from '@/types/app';

type Duration = 'week' | 'month' | '3months' | '6months';

const DURATIONS: { key: Duration; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'Month' },
  { key: '3months', label: '3 Months' },
  { key: '6months', label: '6 Months' },
];

function getDateRange(duration: Duration): { from: Date; to: Date } {
  const today = new Date();
  switch (duration) {
    case 'week': return { from: startOfWeek(today, { weekStartsOn: 1 }), to: today };
    case 'month': return { from: startOfMonth(today), to: today };
    case '3months': return { from: subMonths(today, 3), to: today };
    case '6months': return { from: subMonths(today, 6), to: today };
  }
}

function computeRecoveryPoints(logs: DailyLog[]): { date: string; days: number }[] {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const points: { date: string; days: number }[] = [];
  for (const miss of sorted.filter(l => !l.completed)) {
    const next = sorted.find(l => l.completed && l.date > miss.date);
    if (next) {
      points.push({
        date: next.date,
        days: differenceInDays(parseISO(next.date), parseISO(miss.date)),
      });
    }
  }
  return points;
}

function getMonthlyBuckets(logs: DailyLog[], milestone: Milestone, fromDate: Date) {
  const buckets: { label: string; completed: number; total: number }[] = [];
  const today = new Date();
  let cursor = startOfMonth(fromDate);
  while (cursor <= today) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const end = monthEnd < today ? monthEnd : today;
    const daysInRange = differenceInDays(end, cursor) + 1;
    const monthLogs = logs.filter(l => {
      const d = parseISO(l.date);
      return d >= cursor && d <= end;
    });
    buckets.push({
      label: format(cursor, 'MMM'),
      completed: monthLogs.filter(l => l.completed).length,
      total: daysInRange,
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return buckets;
}

// ── Mini sparkline component ──────────────────────────────
function RecoverySparkline({ points }: { points: { date: string; days: number }[] }) {
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-16 text-[12px] text-muted-foreground">
        {points.length === 0 ? 'No recovery data yet' : 'Need 2+ recoveries to show trend'}
      </div>
    );
  }
  const max = Math.max(...points.map(p => p.days), 1);
  const w = 100 / (points.length - 1);
  const pts = points.map((p, i) => `${i * w},${100 - (p.days / max) * 90}`).join(' ');
  const improving = points[points.length - 1].days <= points[0].days;

  return (
    <div>
      <svg viewBox={`0 0 100 100`} className="w-full h-14" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={improving ? '#5E8C70' : '#C47A5A'} stopOpacity="0.15" />
            <stop offset="100%" stopColor={improving ? '#5E8C70' : '#C47A5A'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`${pts} ${(points.length - 1) * w},100 0,100`}
          fill="url(#sparkFill)"
          stroke="none"
        />
        <polyline
          points={pts}
          fill="none"
          stroke={improving ? '#5E8C70' : '#C47A5A'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={i * w}
            cy={100 - (p.days / max) * 90}
            r="3"
            fill={improving ? '#5E8C70' : '#C47A5A'}
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>First</span>
        <span className={improving ? 'text-success font-medium' : 'text-terra font-medium'}>
          {improving ? '↓ Improving' : '↑ Getting slower'}
        </span>
        <span>Latest</span>
      </div>
    </div>
  );
}

// ── Monthly bar chart ─────────────────────────────────────
function MonthlyBars({ buckets }: { buckets: { label: string; completed: number; total: number }[] }) {
  if (buckets.length === 0) return null;
  const maxTotal = Math.max(...buckets.map(b => b.total), 1);

  return (
    <div className="flex items-end gap-2 h-16">
      {buckets.map((b, i) => {
        const rate = b.total > 0 ? b.completed / b.total : 0;
        const heightPct = Math.max((b.total / maxTotal) * 100, 8);
        const fillPct = rate * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-sm overflow-hidden relative"
              style={{ height: `${heightPct * 0.48}px`, background: '#1A3328', minHeight: '8px' }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-sm transition-all"
                style={{
                  height: `${fillPct}%`,
                  background: rate >= 0.7 ? '#5EC47A' : rate >= 0.4 ? '#E8705A' : '#8FA898',
                }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function WeeklySummary() {
  const navigate = useNavigate();
  const { activeMilestone, activeLogs, milestones, logs } = useApp();
  const [duration, setDuration] = useState<Duration>('week');

  if (!activeMilestone) { navigate('/onboarding'); return null; }

  const { from, to } = getDateRange(duration);

  // ── Active milestone stats ────────────────────────────────
  const filteredLogs = activeLogs.filter(l => {
    const d = parseISO(l.date);
    return d >= from && d <= to;
  });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const thisWeekLogs = activeLogs.filter(l => {
    const d = parseISO(l.date);
    return d >= weekStart && d <= addDays(weekStart, 6);
  });

  const sessionsPlanned = duration === 'week'
    ? Math.min(7, differenceInDays(today, weekStart) + 1)
    : filteredLogs.length + filteredLogs.filter(l => !l.completed).length;

  const sessionsCompleted = filteredLogs.filter(l => l.completed).length;
  const minutesLogged = sessionsCompleted * (activeMilestone.dailyMinutes ?? 0);
  const completionRate = filteredLogs.length > 0
    ? Math.round((sessionsCompleted / filteredLogs.length) * 100)
    : 0;

  const recoveryPoints = computeRecoveryPoints(filteredLogs);
  const avgRecovery = recoveryPoints.length > 0
    ? (recoveryPoints.reduce((s, p) => s + p.days, 0) / recoveryPoints.length).toFixed(1)
    : null;

  const monthlyBuckets = getMonthlyBuckets(
    activeLogs,
    activeMilestone,
    duration === 'week' ? from : subMonths(today, duration === 'month' ? 1 : duration === '3months' ? 3 : 6)
  );

  // ── Combined milestone stats ──────────────────────────────
  const allActiveMilestones = milestones.filter(m => m.status === 'active' || m.status === 'completed');
  const allLogs = logs;
  const hasMultiple = allActiveMilestones.length > 1;

  const combinedCompleted = allLogs.filter(l => l.completed).length;
  const combinedMinutes = allActiveMilestones.reduce((sum, m) => {
    const mCompleted = allLogs.filter(l => l.milestoneId === m.id && l.completed).length;
    return sum + mCompleted * (m.dailyMinutes ?? 0);
  }, 0);

  const allRecoveryPoints = computeRecoveryPoints(allLogs);
  const combinedAvgRecovery = allRecoveryPoints.length > 0
    ? (allRecoveryPoints.reduce((s, p) => s + p.days, 0) / allRecoveryPoints.length).toFixed(1)
    : null;

  // Consistency per milestone (completion rate)
  const milestoneConsistency = allActiveMilestones.map(m => {
    const mLogs = allLogs.filter(l => l.milestoneId === m.id);
    const rate = mLogs.length > 0
      ? Math.round((mLogs.filter(l => l.completed).length / mLogs.length) * 100)
      : 0;
    return { title: m.goalTitle, rate, id: m.id };
  }).sort((a, b) => b.rate - a.rate);

  // Overall streak across all milestones
  const allDates = [...new Set(allLogs.filter(l => l.completed).map(l => l.date))].sort();
  let streak = 0;
  let tempStreak = 0;
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) { tempStreak = 1; continue; }
    const diff = differenceInDays(parseISO(allDates[i]), parseISO(allDates[i - 1]));
    if (diff === 1) { tempStreak++; streak = Math.max(streak, tempStreak); }
    else tempStreak = 1;
  }

  const getInsight = (): string => {
    if (sessionsCompleted === 0) return `No sessions logged in this period yet.`;
    if (completionRate >= 80) return `${sessionsCompleted} sessions. Strong consistency — keep the pattern going.`;
    if (completionRate >= 50) return `${sessionsCompleted} sessions. You recovered from misses — that's the habit that compounds.`;
    return `${sessionsCompleted} sessions. Focus on shortening the gap after each miss.`;
  };

  return (
    <div className="relative bg-background flex flex-col min-h-[100dvh]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-5 py-8">

          {/* Back */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>

          <h1 className="text-2xl font-semibold mb-1">Summary</h1>
          <p className="text-[13px] text-foreground/60 mb-5">{activeMilestone.goalTitle}</p>

          {/* Duration selector */}
          <div className="flex gap-2 mb-6 bg-muted/40 rounded-xl p-1">
            {DURATIONS.map(d => (
              <button
                key={d.key}
                onClick={() => setDuration(d.key)}
                className={`flex-1 text-[12px] font-medium py-1.5 rounded-lg transition-all ${
                  duration === d.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Insight */}
            <Card className="p-4 mb-4" style={{ background: '#1A3328', border: '1px solid #1F3D2F' }}>
            <p className="text-[13px] text-foreground/80 leading-relaxed">{getInsight()}</p>
          </Card>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-1">Sessions</p>
              <p className="text-2xl font-semibold">{sessionsCompleted}</p>
              <p className="text-[11px] text-muted-foreground">{completionRate}% rate</p>
            </Card>
            <Card className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-1">Minutes</p>
              <p className="text-2xl font-semibold">{minutesLogged}</p>
              <p className="text-[11px] text-muted-foreground">logged</p>
            </Card>
            <Card className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-1">Avg Recovery</p>
              {avgRecovery ? (
                <>
                  <p className="text-2xl font-semibold">{avgRecovery}</p>
                  <p className="text-[11px] text-muted-foreground">days</p>
                </>
              ) : (
                <p className="text-[12px] text-muted-foreground mt-2">No misses yet</p>
              )}
            </Card>
          </div>

          {/* Recovery trend + Monthly bars side by side */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-3">Recovery Trend</p>
              <RecoverySparkline points={recoveryPoints} />
            </Card>
            <Card className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-3">Monthly Consistency</p>
              {monthlyBuckets.length > 0
                ? <MonthlyBars buckets={monthlyBuckets} />
                : <p className="text-[11px] text-muted-foreground mt-2">Not enough data yet</p>
              }
            </Card>
          </div>

          {/* Day by day this week */}
          {duration === 'week' && (
            <Card className="p-4 mb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-3">This Week</p>
              <div className="flex gap-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const date = format(addDays(weekStart, i), 'yyyy-MM-dd');
                  const log = activeLogs.find(l => l.date === date);
                  const isToday = date === format(today, 'yyyy-MM-dd');
                  const isFuture = parseISO(date) > today;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${
                        isToday ? 'bg-terra text-white' :
                        log?.completed ? 'bg-success/20 text-success' :
                        log && !log.completed ? 'bg-muted text-muted-foreground' :
                        isFuture ? 'text-muted-foreground/30' :
                        'text-muted-foreground/50'
                      }`}>
                        {isToday ? format(addDays(weekStart, i), 'd') :
                         log?.completed ? '✓' :
                         log ? '–' : format(addDays(weekStart, i), 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── Combined milestone section ── */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold">Across All Milestones</h2>
              {!hasMultiple && (
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">1 milestone</span>
              )}
            </div>

            {!hasMultiple && (
              <Card className="p-3 mb-3 border-dashed bg-muted/20">
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  These patterns get richer as you add more milestones — you'll start to see how your consistency habit carries across different goals.
                </p>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Card className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-1">Total Sessions</p>
                <p className="text-2xl font-semibold">{combinedCompleted}</p>
                <p className="text-[11px] text-muted-foreground">all goals</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-1">Total Minutes</p>
                <p className="text-2xl font-semibold">{combinedMinutes}</p>
                <p className="text-[11px] text-muted-foreground">all goals</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-1">Best Streak</p>
                <p className="text-2xl font-semibold">{streak || '—'}</p>
                <p className="text-[11px] text-muted-foreground">days combined</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-1">Avg Recovery</p>
                {combinedAvgRecovery ? (
                  <>
                    <p className="text-2xl font-semibold">{combinedAvgRecovery}</p>
                    <p className="text-[11px] text-muted-foreground">days overall</p>
                  </>
                ) : (
                  <p className="text-[12px] text-muted-foreground mt-2">No misses yet</p>
                )}
              </Card>
            </div>

            {/* Milestone consistency comparison */}
            {milestoneConsistency.length > 0 && (
              <Card className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-3">Consistency by Goal</p>
                <div className="flex flex-col gap-3">
                  {milestoneConsistency.map((m, i) => (
                    <div key={m.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[12px] text-foreground/80 truncate max-w-[70%]">{m.title}</span>
                        <span className="text-[12px] font-medium text-foreground">{m.rate}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${m.rate}%`,
                            background: i === 0 && hasMultiple ? '#5E8C70' : '#C47A5A',
                          }}
                        />
                      </div>
                      {i === 0 && hasMultiple && (
                        <p className="text-[10px] text-success mt-0.5">Most consistent</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

        </div>
        <PoweredByFooter />
      </div>
    </div>
  );
}
