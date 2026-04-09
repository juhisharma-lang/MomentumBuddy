import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Trophy, Flame, Clock, Zap, CalendarCheck, CheckCircle2 } from 'lucide-react';

export default function MilestoneComplete() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const milestoneId = params.get('id');

  const { milestones, achievements, activeMilestone } = useApp();

  const milestone = milestones.find(m => m.id === (milestoneId ?? activeMilestone?.id));
  const achievement = achievements.find(a => a.milestoneId === milestone?.id);

  const hasNavigated = useRef(false);
  useEffect(() => {
    if (!milestone && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/dashboard-v3');
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
    { icon: <CalendarCheck className="w-4 h-4" />, label: 'Sessions', value: `${achievement.totalSessions}` },
    { icon: <Clock className="w-4 h-4" />, label: 'Minutes', value: `${achievement.totalMinutes}` },
    { icon: <Flame className="w-4 h-4" />, label: 'Longest streak', value: achievement.longestStreak > 0 ? `${achievement.longestStreak}d` : '--' },
    { icon: <Zap className="w-4 h-4" />, label: 'Fastest recovery', value: achievement.fastestRecovery !== null ? `${achievement.fastestRecovery}d` : '--' },
  ];

  return (
    <div className="h-screen bg-m3-bg font-jakarta flex flex-col overflow-hidden">

      <main className="flex-1 overflow-y-auto px-4 pb-4">

        <div className="flex justify-center pt-12 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#ffac9d]/40 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-[#a63c2a]" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-on-surface leading-tight mb-2">
            {headline}
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">{subline}</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#a63c2a]" />
            <span className="text-xs font-bold text-on-surface-variant">{milestone.goalTitle}</span>
          </div>
        </div>

        {achievement.totalSessions > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.map(s => (
              <div key={s.label} className="bg-surface-container rounded-bento p-4">
                <div className="flex items-center gap-1.5 text-on-surface-variant mb-2">
                  {s.icon}
                  <span className="text-[10px] uppercase tracking-widest font-bold">{s.label}</span>
                </div>
                <p className="text-2xl font-black text-on-surface">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {duration !== null && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-on-surface-variant">
              {duration} {duration === 1 ? 'day' : 'days'} from start
              {milestone.completedAt && ` · completed ${format(parseISO(milestone.completedAt), 'MMM d')}`}
            </span>
            {completedOnTime && (
              <span className="text-[11px] font-bold text-[#a63c2a] bg-[#ffac9d]/30 px-2.5 py-0.5 rounded-full">
                On time
              </span>
            )}
          </div>
        )}

      </main>

      <div className="flex-shrink-0 px-4 py-4 bg-m3-bg border-t border-outline-variant/20 flex flex-col gap-2">
        <button
          onClick={() => navigate('/onboarding-v3')}
          className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-lg shadow-[#a63c2a]/20 active:scale-95 transition-transform"
        >
          Start next milestone
        </button>
        <button
          onClick={() => navigate('/dashboard-v3')}
          className="w-full py-3 rounded-full border border-outline-variant text-on-surface-variant font-bold text-sm"
        >
          Done for now
        </button>
      </div>

    </div>
  );
}