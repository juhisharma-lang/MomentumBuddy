import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DayStatus } from '@/types/app';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, differenceInDays, isToday, isBefore, parseISO } from 'date-fns';
import { Target, TrendingUp, Flame, Clock, ChevronRight, BarChart3 } from 'lucide-react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { goal, logs } = useApp();

  if (!goal) {
    navigate('/onboarding');
    return null;
  }

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const weekDays = DAY_LABELS.map((label, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    let status: DayStatus = 'future';
    if (isToday(date)) status = 'today';
    else if (isBefore(date, today)) {
      status = log?.completed ? 'done' : 'miss';
    }
    return { label, date, dateStr, status };
  });

  const thisWeekLogs = logs.filter(l => {
    const d = parseISO(l.date);
    return d >= weekStart && d <= addDays(weekStart, 6);
  });
  const sessionsCompleted = thisWeekLogs.filter(l => l.completed).length;
  const sessionsPlanned = Math.min(7, differenceInDays(today, weekStart) + 1);

  // Calculate streak
  let streak = 0;
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sortedLogs) {
    if (log.completed) streak++;
    else break;
  }

  // Calculate max gap
  let maxGap = 0;
  const completedDates = logs.filter(l => l.completed).map(l => l.date).sort();
  for (let i = 1; i < completedDates.length; i++) {
    const gap = differenceInDays(parseISO(completedDates[i]), parseISO(completedDates[i - 1]));
    if (gap > maxGap) maxGap = gap;
  }

  // Avg recovery speed
  const missLogs = logs.filter(l => !l.completed);
  let totalRecovery = 0;
  let recoveryCount = 0;
  for (const miss of missLogs) {
    const nextComplete = logs.find(l => l.completed && l.date > miss.date);
    if (nextComplete) {
      totalRecovery += differenceInDays(parseISO(nextComplete.date), parseISO(miss.date));
      recoveryCount++;
    }
  }
  const avgRecovery = recoveryCount > 0 ? (totalRecovery / recoveryCount).toFixed(1) : '—';

  const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), today) : null;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Your goal</p>
        <h1 className="text-2xl font-semibold mb-2">{goal.goalTitle}</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{goal.dailyMinutes} min/day</span>
          {daysLeft !== null && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              daysLeft <= 7 ? "bg-miss/10 text-miss" :
              daysLeft <= 30 ? "bg-primary/10 text-primary" :
              "bg-muted text-muted-foreground"
            )}>
              {daysLeft} days left
            </span>
          )}
        </div>
      </div>

      {/* Weekly Strip */}
      <Card className="p-5 mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">This week</h2>
        <div className="flex justify-between">
          {weekDays.map(day => (
            <div key={day.label} className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">{day.label}</span>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                day.status === 'done' && "bg-success text-success-foreground",
                day.status === 'miss' && "bg-miss/15 text-miss",
                day.status === 'today' && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                day.status === 'future' && "bg-muted text-muted-foreground",
              )}>
                {day.status === 'done' ? '✓' : day.status === 'miss' ? '·' : format(day.date, 'd')}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<Target className="w-4 h-4" />}
          label="Sessions this week"
          value={`${sessionsCompleted}/${sessionsPlanned}`}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg recovery"
          value={`${avgRecovery}d`}
        />
        <StatCard
          icon={<Flame className="w-4 h-4" />}
          label="Current streak"
          value={`${streak}`}
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Max gap"
          value={`${maxGap}d`}
        />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={() => navigate('/checkin')}>
          Evening Check-in <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="outline" className="w-full" size="lg" onClick={() => navigate('/weekly')}>
          <BarChart3 className="w-4 h-4 mr-2" /> Weekly Summary
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-semibold font-serif">{value}</div>
    </Card>
  );
}
