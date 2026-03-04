import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock } from 'lucide-react';
import { startOfWeek, addDays, format, parseISO, differenceInDays } from 'date-fns';
import PoweredByFooter from '@/components/PoweredByFooter';

export default function WeeklySummary() {
  const navigate = useNavigate();
  const { activeMilestone: goal, activeLogs: logs } = useApp();

  if (!goal) { navigate('/onboarding'); return null; }

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const thisWeekLogs = logs.filter(l => {
    const d = parseISO(l.date);
    return d >= weekStart && d <= addDays(weekStart, 6);
  });

  const sessionsPlanned = Math.min(7, differenceInDays(today, weekStart) + 1);
  const sessionsCompleted = thisWeekLogs.filter(l => l.completed).length;
  const completionRate = sessionsPlanned > 0 ? Math.round((sessionsCompleted / sessionsPlanned) * 100) : 0;
  const minutesLogged = sessionsCompleted * (goal.dailyMinutes ?? 0);

  const missLogs = logs.filter(l => !l.completed);
  let totalDelay = 0;
  let delayCount = 0;
  for (const miss of missLogs) {
    const nextComplete = logs.find(l => l.completed && l.date > miss.date);
    if (nextComplete) {
      totalDelay += differenceInDays(parseISO(nextComplete.date), parseISO(miss.date));
      delayCount++;
    }
  }
  const avgDelay = delayCount > 0 ? (totalDelay / delayCount).toFixed(1) : null;

  const getInsight = (): string => {
    if (sessionsCompleted === sessionsPlanned && sessionsPlanned > 0)
      return `${sessionsCompleted}/${sessionsPlanned} sessions. Clean week.`;
    if (completionRate >= 70)
      return `${sessionsCompleted}/${sessionsPlanned} sessions. You recovered from any misses quickly — that is the pattern that compounds.`;
    if (completionRate >= 40)
      return `${sessionsCompleted}/${sessionsPlanned} sessions. Inconsistent week. Focus on reducing the gap between a miss and your next session.`;
    if (sessionsCompleted > 0)
      return `${sessionsCompleted}/${sessionsPlanned} sessions. Difficult week. How fast did you come back after each miss?`;
    return `0/${sessionsPlanned} sessions this week. Reset starts now.`;
  };

  return (
    <div className="relative bg-background flex flex-col min-h-[100dvh]">
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 py-8">

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <h1 className="text-2xl font-semibold mb-1">Weekly Summary</h1>
        <p className="text-[14px] text-foreground/70 mb-8">Week of {format(weekStart, 'MMMM d')}</p>

        {/* Avg restart delay */}
        <Card className="p-5 mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-2">Avg restart delay</p>
          {avgDelay ? (
            <>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-semibold">{avgDelay}</span>
                <span className="text-foreground/50 text-sm">days</span>
              </div>
              <p className="text-xs text-foreground/60">Average days between a miss and your next completed session.</p>
            </>
          ) : (
            <>
              <span className="text-3xl font-semibold text-muted-foreground">—</span>
              <p className="text-xs text-foreground/60 mt-1">No recoveries recorded yet — check back after your first miss and restart.</p>
            </>
          )}
        </Card>

        {/* Sessions */}
        <Card className="p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Sessions completed</span>
            <span className="text-sm text-foreground/60">{sessionsCompleted}/{sessionsPlanned}</span>
          </div>
          <Progress value={completionRate} className="h-2 mb-2" />
          <p className="text-xs text-foreground/60">{completionRate}% this week</p>
        </Card>

        {/* Minutes */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Minutes logged</span>
          </div>
          <div className="text-2xl font-semibold">
            {minutesLogged}<span className="text-sm font-normal text-foreground/50 ml-1">min</span>
          </div>
        </Card>

        {/* Insight */}
        <Card className="p-5 border-border bg-muted/40">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-2">This week</p>
          <p className="text-sm text-foreground leading-relaxed">{getInsight()}</p>
        </Card>

        <PoweredByFooter />
      </div>
      </div>
    </div>
  );
}
