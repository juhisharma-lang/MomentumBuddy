import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DayStatus, getDashboardState } from '@/types/app';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, differenceInDays, isToday, isBefore, parseISO } from 'date-fns';
import { ChevronRight, BarChart3, AlertCircle, CalendarCheck, PauseCircle, ChevronDown } from 'lucide-react';
import PoweredByFooter from '@/components/PoweredByFooter';
import { queueMissedNoPlanNudge, queueDeadlineNudge } from '@/lib/nudgeQueue';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeMilestone: goal, milestones, setActiveMilestoneId, activeLogs: logs, activeCommitments: commitments, activePauses: pauses, feedback, addFeedback } = useApp();
  const [showMilestoneMenu, setShowMilestoneMenu] = useState(false);

  if (!goal) { navigate('/onboarding'); return null; }

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const dashState = getDashboardState(logs, commitments, pauses, goal.id, todayStr);
  const activePause = pauses.find(p => p.pausedFrom <= todayStr && p.pausedUntil >= todayStr);
  const pendingCommitment = commitments.find(c => c.confirmed && !c.fulfilled && c.committedForDate >= todayStr);

  if (dashState === 'B') queueMissedNoPlanNudge(goal, todayStr);

  const anchorDate = goal.activatedAt ?? goal.createdAt;
  const daysSinceStart = differenceInDays(today, parseISO(anchorDate));
  const currentDayMark = daysSinceStart > 0 ? Math.floor(daysSinceStart / 7) * 7 : 0;
  const alreadyRatedThisMark = feedback.some(f => f.milestoneId === goal.id && f.dayNumber === currentDayMark);
  const showPulse = currentDayMark > 0 && !alreadyRatedThisMark;

  const [pulseRating, setPulseRating] = useState<number | null>(null);
  const [pulseDismissed, setPulseDismissed] = useState(false);

  const handlePulseRate = (rating: number) => {
    setPulseRating(rating);
    addFeedback({ milestoneId: goal.id, rating: rating as 1|2|3|4|5, dayNumber: currentDayMark });
    setTimeout(() => setPulseDismissed(true), 1200);
  };

  const weekDays = DAY_LABELS.map((label, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    const hasRestartPlanned = commitments.some(c => c.confirmed && !c.fulfilled && c.committedForDate === dateStr);
    let status: DayStatus = 'future';
    if (isToday(date)) {
      if (log?.completed) status = 'done';
      else if (log && !log.completed) status = 'miss';
      else status = 'today';
    } else if (isBefore(date, today)) {
      if (log?.completed) status = 'done';
      else if (hasRestartPlanned) status = 'restart_planned';
      else status = 'miss';
    } else {
      status = hasRestartPlanned ? 'restart_planned' : 'future';
    }
    return { label, date, dateStr, status };
  });

  const thisWeekLogs = logs.filter(l => {
    const d = parseISO(l.date);
    return d >= weekStart && d <= addDays(weekStart, 6);
  });
  const sessionsCompleted = thisWeekLogs.filter(l => l.completed).length;

  // Recovery speed
  const missLogs = logs.filter(l => !l.completed).sort((a, b) => a.date.localeCompare(b.date));
  const recoveryPoints: number[] = [];
  for (const miss of missLogs) {
    const nextComplete = logs.find(l => l.completed && l.date > miss.date);
    if (nextComplete) recoveryPoints.push(differenceInDays(parseISO(nextComplete.date), parseISO(miss.date)));
  }
  const recoveryCount = recoveryPoints.length;
  const avgRecovery = recoveryCount > 0 ? (recoveryPoints.reduce((a,b) => a+b, 0) / recoveryCount).toFixed(1) : null;

  let trend: 'improving'|'slower'|'neutral'|'first' = 'neutral';
  if (recoveryCount === 1) { trend = 'first'; }
  else if (recoveryCount >= 2) {
    const half = Math.floor(recoveryCount / 2);
    const olderAvg = recoveryPoints.slice(0, half).reduce((a,b) => a+b, 0) / half;
    const recentAvg = recoveryPoints.slice(-half).reduce((a,b) => a+b, 0) / half;
    if (recentAvg < olderAvg - 0.3) trend = 'improving';
    else if (recentAvg > olderAvg + 0.3) trend = 'slower';
  }

  const personalBest = recoveryCount > 0 ? Math.min(...recoveryPoints) : null;
  const latestRecovery = recoveryCount > 0 ? recoveryPoints[recoveryPoints.length - 1] : null;
  const isPersonalBest = recoveryCount >= 2 && latestRecovery !== null && latestRecovery === personalBest;

  // Pattern insights
  const allLogs = [...logs].sort((a,b) => a.date.localeCompare(b.date));
  let longestGap: number | null = null;
  if (allLogs.length >= 2) {
    let cur = 0, max = 0;
    const logDates = new Set(allLogs.filter(l => l.completed).map(l => l.date));
    const first = parseISO(allLogs[0].date);
    const last = parseISO(allLogs[allLogs.length-1].date);
    for (let i = 0; i < differenceInDays(last, first)+1; i++) {
      const d = format(addDays(first, i), 'yyyy-MM-dd');
      if (!logDates.has(d)) { cur++; max = Math.max(max, cur); } else { cur = 0; }
    }
    if (max > 0) longestGap = max;
  }
  const missByDay: Record<string,number> = {};
  for (const log of allLogs.filter(l => !l.completed)) {
    const day = format(parseISO(log.date), 'EEEE');
    missByDay[day] = (missByDay[day] || 0) + 1;
  }
  const mostFragileDay = Object.keys(missByDay).length > 0
    ? Object.entries(missByDay).sort((a,b) => b[1]-a[1])[0][0] : null;

  const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), today) : null;
  const todayLogged = logs.some(l => l.date === todayStr);

  // Fire deadline nudge if deadline is today or passed and user hasn't logged today
  if (daysLeft !== null && daysLeft <= 0 && !todayLogged) {
    queueDeadlineNudge(goal, todayStr);
  }

  // Pre-compute strings with apostrophes
  const recoveryMsg = (() => {
    if (isPersonalBest) return `You bounced back in ${latestRecovery} ${latestRecovery === 1 ? 'day' : 'days'} last time — your best yet.`;
    if (trend === 'improving') return 'Your recent recoveries are getting faster. Keep that momentum.';
    if (trend === 'slower') return 'Recent recoveries are taking a bit longer. That is okay.';
    if (trend === 'first') return 'First recovery recorded. Keep going to see your trend build.';
    return 'Average days between a miss and your next session.';
  })();
  const todayDoneLog = logs.find(l => l.date === todayStr);
  const todayLoggedMsg = todayDoneLog?.completed ? 'Session logged. See you tomorrow.' : 'Miss logged. Check in again tomorrow.';

  // Multiple milestones — always show switcher so user can add more
  const otherMilestones = milestones.filter(m => m.id !== goal.id && m.status === 'active');

  // Are all pattern cards unlocked?
  const patternsUnlocked = longestGap !== null && mostFragileDay !== null && personalBest !== null;

  return (
    <div className="relative bg-background flex flex-col min-h-[100dvh] overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-5 pt-10 pb-40 min-h-[100dvh]">

          {/* ── Header ── */}
          <div className="mb-6">
            <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.1em] font-light">Milestone</p>

            {/* Milestone name — always tappable to switch or add */}
            <div className="relative">
              <button
                onClick={() => setShowMilestoneMenu(v => !v)}
                className="flex items-center gap-1.5 text-left group"
              >
                <h1 className="text-2xl font-semibold">{goal.goalTitle}</h1>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground mt-1 transition-transform",
                  showMilestoneMenu && "rotate-180"
                )} />
              </button>
              {showMilestoneMenu && (
                <div className="absolute top-full left-0 mt-1 w-full min-w-[220px] bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {milestones.filter(m => m.status === 'active').map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setActiveMilestoneId(m.id); setShowMilestoneMenu(false); }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted flex items-center justify-between",
                        m.id === goal.id ? "font-semibold text-foreground" : "text-foreground/70"
                      )}
                    >
                      <span>{m.goalTitle}</span>
                      {m.id === goal.id && (
                        <span className="text-xs text-primary font-normal ml-3 shrink-0">viewing</span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => { navigate('/onboarding?new=1'); setShowMilestoneMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-primary border-t border-border hover:bg-muted flex items-center gap-2"
                  >
                    <span className="text-base leading-none">+</span> Add new milestone
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm mt-1.5">
              <span className="text-foreground/60">{goal.dailyMinutes} min/day</span>
              {daysLeft !== null && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  daysLeft <= 7 ? "bg-destructive/10 text-destructive"
                    : daysLeft <= 30 ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {daysLeft}d left
                </span>
              )}
            </div>
          </div>

          {/* ── State Banners ── */}
          {dashState === 'B' && (
            <div className="flex items-start gap-3 bg-muted border border-border rounded-xl p-4 mb-6">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[15px] font-semibold text-foreground" style={{fontFamily:"'Playfair Display',serif"}}>Missed yesterday.</p>
                <p className="text-[14px] text-foreground/70">Let&apos;s reset — check in below.</p>
              </div>
            </div>
          )}

          {dashState === 'C' && pendingCommitment && (
            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
              <CalendarCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[15px] font-semibold text-foreground" style={{fontFamily:"'Playfair Display',serif"}}>Restart scheduled.</p>
                <p className="text-[14px] text-foreground/70">
                  {format(parseISO(pendingCommitment.committedForDate), 'EEEE')} at {pendingCommitment.committedTime} — {pendingCommitment.minutes} min
                </p>
              </div>
            </div>
          )}

          {dashState === 'D' && activePause && (
            <div className="flex items-start gap-3 bg-muted border border-border rounded-xl p-4 mb-6">
              <PauseCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-foreground" style={{fontFamily:"'Playfair Display',serif"}}>Check-ins paused.</p>
                <p className="text-[14px] text-foreground/70">Resuming {format(parseISO(activePause.pausedUntil), 'EEEE, MMMM d')}</p>
              </div>
              <button onClick={() => navigate('/checkin')} className="text-xs text-primary underline-offset-2 hover:underline shrink-0">
                Resume early
              </button>
            </div>
          )}

          {/* ── Day-1 Orientation Banner ── */}
          {!patternsUnlocked && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary/5 border border-primary/15 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
              <p className="text-[12px] text-foreground/65 leading-relaxed">
                Check in each day you study — cards unlock as you build history.
              </p>
            </div>
          )}

          {/* ── Recovery Hero ── */}
          <div className="mb-5">
            <Card className={cn(
              "p-4 relative overflow-hidden transition-colors duration-500",
              isPersonalBest ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                : trend === 'improving' ? "bg-green-50/60 dark:bg-green-950/20 border-green-100 dark:border-green-900"
                : "bg-card"
            )}>
              {(isPersonalBest || trend === 'improving') && (
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-green-400/10 blur-2xl pointer-events-none" />
              )}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light">Recovery speed</p>
                {isPersonalBest && (
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>★</span> Personal best
                  </span>
                )}
                {!isPersonalBest && trend === 'improving' && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">↑ Faster</span>
                )}
                {!isPersonalBest && trend === 'slower' && (
                  <span className="text-xs text-muted-foreground">↓ Slower</span>
                )}
              </div>

              {avgRecovery ? (
                <>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className={cn(
                      "text-5xl font-bold tracking-tight leading-none",
                      isPersonalBest || trend === 'improving' ? "text-green-600 dark:text-green-400" : "text-foreground"
                    )}>{avgRecovery}</span>
                    <span className="text-[13px] text-foreground/50">days to bounce back</span>
                  </div>
                  <p className="text-xs text-foreground/60 mb-3 leading-relaxed">{recoveryMsg}</p>
                  {recoveryPoints.length >= 2 && (
                    <RecoverySparkline points={recoveryPoints} trend={trend} isPersonalBest={isPersonalBest} />
                  )}
                </>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1.5 mb-2 opacity-15 select-none pointer-events-none">
                    <span className="text-5xl font-bold tracking-tight leading-none text-foreground">1.5</span>
                    <span className="text-[13px] text-foreground/50">days to bounce back</span>
                  </div>
                  <svg viewBox="0 0 100 28" className="w-full mb-3 opacity-10" style={{height:28}}>
                    <polyline points="4,22 20,18 36,20 52,12 68,15 84,8 96,10"
                      fill="none" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
                  </svg>
                  <p className="text-[13px] text-foreground/70 leading-relaxed">
                    How fast you bounce back after a missed session. Miss one, return the next day — your speed appears here.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Pattern Cards ── */}
          <div className="grid grid-cols-3 gap-3 mb-5">

            {/* Longest Gap */}
            <Card className="p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-2.5">Longest gap</p>
              {longestGap !== null ? (
                <>
                  <p className="text-2xl font-semibold">{longestGap}</p>
                  <p className="text-xs text-foreground/60">days</p>
                </>
              ) : (
                <div className="flex flex-col items-start gap-2 pt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-foreground/60 leading-tight">Miss streak</p>
                </div>
              )}
            </Card>

            {/* Fragile Day */}
            <Card className="p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-2.5">Fragile day</p>
              {mostFragileDay !== null ? (
                <>
                  <p className="text-2xl font-semibold">{mostFragileDay.slice(0, 3)}</p>
                  <p className="text-xs text-foreground/60">most misses</p>
                </>
              ) : (
                <div className="flex flex-col items-start gap-2 pt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-foreground/60 leading-tight">Skip pattern</p>
                </div>
              )}
            </Card>

            {/* Fastest Back */}
            <Card className="p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light mb-2.5">Fastest back</p>
              {personalBest !== null ? (
                <>
                  <p className="text-2xl font-semibold">{personalBest}</p>
                  <p className="text-xs text-foreground/60">{personalBest === 1 ? 'day' : 'days'}</p>
                </>
              ) : (
                <div className="flex flex-col items-start gap-2 pt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-foreground/60 leading-tight">Best comeback</p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Patterns build callout ── */}
          {!patternsUnlocked && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-muted/70 border border-border mb-5">
              <svg className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="text-[12px] text-foreground/70 leading-relaxed">
                These cards fill in as you log sessions and misses. Patterns usually emerge after{' '}
                <span className="font-semibold text-foreground">5–7 check-ins</span>.
              </p>
            </div>
          )}

          {/* ── Weekly Strip (with inline stats) ── */}
          <Card className="p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-light">This week</h2>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-foreground/60">
                  <span className="font-semibold text-foreground">{sessionsCompleted}</span>
                  <span className="text-foreground/40">/7</span> sessions
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="text-[12px] text-foreground/60">
                  <span className="font-semibold text-foreground">{sessionsCompleted * (goal.dailyMinutes ?? 0)}</span> min
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              {weekDays.map(day => (
                <div key={day.label} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">{day.label}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    day.status === 'done' && "bg-green-500/20 text-green-700 dark:text-green-400",
                    day.status === 'miss' && "bg-muted text-muted-foreground",
                    day.status === 'restart_planned' && "ring-2 ring-primary bg-background text-primary",
                    day.status === 'today' && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                    day.status === 'future' && "bg-muted/50 text-muted-foreground/50",
                  )}>
                    {day.status === 'done' && '✓'}
                    {day.status === 'miss' && '–'}
                    {day.status === 'restart_planned' && '↺'}
                    {(day.status === 'today' || day.status === 'future') && format(day.date, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Pulse Feedback ── */}
          {showPulse && !pulseDismissed && (
            <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] text-primary uppercase tracking-[0.1em] font-light mb-0.5">Day {currentDayMark} check-in</p>
                  <p className="text-[16px] font-semibold text-foreground" style={{fontFamily:"'Playfair Display',serif"}}>
                    Is this helping you restart faster?
                  </p>
                </div>
                <button onClick={() => setPulseDismissed(true)} className="text-muted-foreground/50 hover:text-muted-foreground text-lg leading-none ml-3 mt-0.5">×</button>
              </div>
              {pulseRating === null ? (
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => handlePulseRate(n)}
                      className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all border",
                        "border-border hover:border-primary hover:bg-primary/10 hover:text-primary text-muted-foreground")}>
                      {n}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Thanks for the feedback.</p>
                </div>
              )}
              <div className="flex justify-between mt-2">
                <span className="text-xs text-foreground/50">1 = not at all</span>
                <span className="text-xs text-foreground/50">5 = a lot</span>
              </div>
            </Card>
          )}

        </div>
      </div>

      {/* ── Fixed bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-8 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-md mx-auto">
          {todayLogged ? (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/50 border border-border mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              <p className="text-[13px] text-foreground/70">{todayLoggedMsg}</p>
            </div>
          ) : (
            <Button className="w-full h-14 rounded-2xl text-[15px] font-semibold mb-2.5" size="lg"
              disabled={dashState === 'D'} onClick={() => navigate('/checkin')}>
              Check-in for today <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" size="sm" onClick={() => navigate('/weekly')}>
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Summary
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl" size="sm" onClick={() => navigate('/settings')}>
              <PauseCircle className="w-3.5 h-3.5 mr-1.5" /> Pause
            </Button>
            <Button variant="ghost" className="flex-1 rounded-xl text-muted-foreground" size="sm" onClick={() => navigate('/settings')}>
              Edit
            </Button>
          </div>
          <PoweredByFooter />
        </div>
      </div>

    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function RecoverySparkline({ points, trend, isPersonalBest }: {
  points: number[];
  trend: 'improving'|'slower'|'neutral'|'first';
  isPersonalBest: boolean;
}) {
  const W = 100, H = 40, PAD = 4;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const coords = points.map((p, i) => ({
    x: PAD + (i / (points.length - 1)) * (W - PAD * 2),
    y: H - (PAD + ((p - min) / range) * (H - PAD * 2)),
    val: p,
  }));
  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaD = pathD + ` L ${coords[coords.length-1].x} ${H} L ${coords[0].x} ${H} Z`;
  const isGood = isPersonalBest || trend === 'improving';
  const stroke = isGood ? '#16a34a' : '#94a3b8';
  const fillId = isGood ? 'sparkGreen' : 'sparkNeutral';
  const last = coords[coords.length - 1];

  return (
    <div className="mt-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: 40 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${fillId})`} />
        <path d={pathD} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.slice(0,-1).map((c, i) => <circle key={i} cx={c.x} cy={c.y} r="1.5" fill={stroke} opacity="0.4" />)}
        <circle cx={last.x} cy={last.y} r="3" fill={stroke} />
        <circle cx={last.x} cy={last.y} r="6" fill="none" stroke={stroke} strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="4;8;4" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="flex justify-between mt-0.5">
        <span className="text-xs text-foreground/50">First</span>
        <span className="text-xs text-foreground/50">Latest</span>
      </div>
    </div>
  );
}
