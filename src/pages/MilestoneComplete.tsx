import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Trophy, Flame, Clock, Zap, CalendarCheck, CheckCircle2 } from 'lucide-react';
import PoweredByFooter from '@/components/PoweredByFooter';

export default function MilestoneComplete() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const milestoneId = params.get('id');

  const { milestones, achievements, activeMilestone } = useApp();

  // Find the milestone and its achievement — prefer id param, else activeMilestone
  const milestone = milestones.find(m => m.id === (milestoneId ?? activeMilestone?.id));
  const achievement = achievements.find(a => a.milestoneId === milestone?.id);

  const hasNavigated = useRef(false);
  useEffect(() => {
    if (!milestone && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/dashboard');
    }
  }, [milestone, navigate]);

  if (!milestone || !achievement) return null;

  const duration = milestone.activatedAt && milestone.completedAt
    ? differenceInDays(parseISO(milestone.completedAt), parseISO(milestone.activatedAt))
    : null;

  const completedOnTime = achievement.completedOnTime;

  const headline = (() => {
    if (achievement.totalSessions === 0) return 'You made a start.';
    if (completedOnTime) return 'Finished on time.';
    if (achievement.longestStreak >= 7) return 'That took real consistency.';
    return 'You saw it through.';
  })();

  const subline = (() => {
    if (achievement.totalSessions === 0)
      return `"${milestone.goalTitle}" is marked complete.`;
    if (achievement.avgRecovery !== null && achievement.avgRecovery <= 1.5)
      return `You bounced back fast - ${achievement.avgRecovery} days average recovery.`;
    if (achievement.longestStreak > 0)
      return `Your longest streak was ${achievement.longestStreak} ${achievement.longestStreak === 1 ? 'day' : 'days'} in a row.`;
    return `"${milestone.goalTitle}" is complete.`;
  })();

  const stats: { icon: React.ReactNode; label: string; value: string }[] = [
    {
      icon: <CalendarCheck className="w-4 h-4" />,
      label: 'Sessions',
      value: `${achievement.totalSessions}`,
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Minutes',
      value: `${achievement.totalMinutes}`,
    },
    {
      icon: <Flame className="w-4 h-4" />,
      label: 'Longest streak',
      value: achievement.longestStreak > 0 ? `${achievement.longestStreak}d` : '—',
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: 'Fastest recovery',
      value: achievement.fastestRecovery !== null ? `${achievement.fastestRecovery}d` : '—',
    },
  ];

  return (
    <div className="relative bg-background min-h-[100dvh] flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-16 pb-36">

        {/* ── Icon ── */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* ── Headline ── */}
        <div className="text-center mb-10">
          <h1
            className="text-[28px] font-semibold text-foreground mb-2 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {headline}
          </h1>
          <p className="text-[14px] text-foreground/60 leading-relaxed">{subline}</p>
        </div>

        {/* ── Goal name pill ── */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-muted border border-border">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-medium text-foreground/70">{milestone.goalTitle}</span>
          </div>
        </div>

        {/* ── Stats grid ── */}
        {achievement.totalSessions > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map(s => (
              <div key={s.label} className="bg-muted/50 border border-border rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                  {s.icon}
                  <span className="text-[11px] uppercase tracking-[0.08em] font-light">{s.label}</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Duration + on-time badge ── */}
        {duration !== null && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-[13px] text-foreground/50">
              {duration} {duration === 1 ? 'day' : 'days'} from start
              {milestone.completedAt && ` · completed ${format(parseISO(milestone.completedAt), 'MMM d')}`}
            </span>
            {completedOnTime && (
              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                On time
              </span>
            )}
          </div>
        )}

      </div>

      {/* ── Fixed bottom CTA ── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-8 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-md mx-auto space-y-2">
          <Button
            className="w-full h-14 rounded-2xl text-[15px] font-semibold"
            onClick={() => navigate('/onboarding?new=1')}
          >
            Start next milestone
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-2xl text-muted-foreground"
            onClick={() => navigate('/dashboard')}
          >
            Done for now
          </Button>
        </div>
        <PoweredByFooter />
      </div>
    </div>
  );
}
