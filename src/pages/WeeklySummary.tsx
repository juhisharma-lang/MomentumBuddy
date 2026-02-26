import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, TrendingDown, Clock, BookOpen } from 'lucide-react';
import { startOfWeek, addDays, format, parseISO, differenceInDays } from 'date-fns';

export default function WeeklySummary() {
  const navigate = useNavigate();
  const { goal, logs } = useApp();

  if (!goal) {
    navigate('/onboarding');
    return null;
  }

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const thisWeekLogs = logs.filter(l => {
    const d = parseISO(l.date);
    return d >= weekStart && d <= addDays(weekStart, 6);
  });

  const sessionsPlanned = Math.min(7, differenceInDays(today, weekStart) + 1);
  const sessionsCompleted = thisWeekLogs.filter(l => l.completed).length;
  const completionRate = sessionsPlanned > 0 ? Math.round((sessionsCompleted / sessionsPlanned) * 100) : 0;
  const minutesLogged = sessionsCompleted * goal.dailyMinutes;

  // Avg restart delay
  const missLogs = thisWeekLogs.filter(l => !l.completed);
  let totalDelay = 0;
  let delayCount = 0;
  for (const miss of missLogs) {
    const nextComplete = logs.find(l => l.completed && l.date > miss.date);
    if (nextComplete) {
      totalDelay += differenceInDays(parseISO(nextComplete.date), parseISO(miss.date));
      delayCount++;
    }
  }
  const avgDelay = delayCount > 0 ? (totalDelay / delayCount).toFixed(1) : '—';

  // Insight
  const getInsight = () => {
    if (sessionsCompleted === sessionsPlanned && sessionsPlanned > 0) {
      return "Perfect week! You showed up every single day. That's rare and powerful.";
    }
    if (completionRate >= 70) {
      return "Strong week. You bounced back well from any misses — that's the real skill.";
    }
    if (completionRate >= 40) {
      return "You stayed connected to your goal this week. Every session counts, even the short ones.";
    }
    if (sessionsCompleted > 0) {
      return "You showed up at least once this week. That thread of connection matters more than you think.";
    }
    return "This week was tough, and that's okay. The fact that you're here reviewing it shows you haven't let go.";
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
      </Button>

      <h1 className="text-2xl font-semibold mb-1">Weekly Summary</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Week of {format(weekStart, 'MMMM d')}
      </p>

      {/* Sessions Progress */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Sessions completed</span>
          <span className="text-sm text-muted-foreground">{sessionsCompleted}/{sessionsPlanned}</span>
        </div>
        <Progress value={completionRate} className="h-3 mb-2" />
        <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs">Avg restart delay</span>
          </div>
          <div className="text-2xl font-semibold font-serif">{avgDelay}<span className="text-sm font-normal text-muted-foreground ml-1">days</span></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Minutes logged</span>
          </div>
          <div className="text-2xl font-semibold font-serif">{minutesLogged}<span className="text-sm font-normal text-muted-foreground ml-1">min</span></div>
        </Card>
      </div>

      {/* Insight */}
      <Card className="p-5 mb-6 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">Weekly insight</p>
            <p className="text-sm text-muted-foreground font-serif italic">{getInsight()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
