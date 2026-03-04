import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { Check, ArrowRight, RotateCcw } from 'lucide-react';
import { queueDailySessionNudges, queueCommitmentNudges } from '@/lib/nudgeQueue';
import PoweredByFooter from '@/components/PoweredByFooter';

type CheckInState =
  | 'question'
  | 'logged'
  | 'reset'
  | 'path_select'
  | 'confirmation';

const MINUTE_OPTIONS = [30, 45, 60, 90];

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function CheckIn() {
  const navigate = useNavigate();
  const { activeMilestone: goal, activeLogs: logs, addLog, addCommitment } = useApp();
  const [state, setState] = useState<CheckInState>('question');
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [commitTime, setCommitTime] = useState(goal?.startTime || '09:00');

  if (!goal) {
    navigate('/onboarding');
    return null;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrowFormatted = format(addDays(new Date(), 1), 'EEEE, MMMM d');

  // Avg restart delay for display on logged screen
  const missLogs = logs.filter(l => !l.completed);
  let totalRecovery = 0;
  let recoveryCount = 0;
  for (const miss of missLogs) {
    const nextComplete = logs.find(l => l.completed && l.date > miss.date);
    if (nextComplete) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const delay = (new Date(nextComplete.date).getTime() - new Date(miss.date).getTime()) / msPerDay;
      totalRecovery += delay;
      recoveryCount++;
    }
  }
  const avgRecovery = recoveryCount > 0 ? (totalRecovery / recoveryCount).toFixed(1) : null;

  const handleYes = () => {
    addLog({ date: today, completed: true, fallbackTriggered: false });
    // Queue 30-min + start-time reminders for tomorrow's session
    queueDailySessionNudges(goal, tomorrow);
    setState('logged');
  };

  const handleNo = () => {
    addLog({ date: today, completed: false, fallbackTriggered: true });
    setState('reset');
  };

  const handleLockIn = () => {
    if (!selectedMinutes) return;
    addCommitment({
      id: crypto.randomUUID(),
      committedForDate: tomorrow,
      committedTime: commitTime,
      minutes: selectedMinutes,
      flowType: 'lockin',
      confirmed: true,
      fulfilled: false,
    });
    // Queue 30-min reminder before committed restart time
    queueCommitmentNudges(goal, tomorrow, commitTime, selectedMinutes);
    setState('confirmation');
  };

  const canLockIn = selectedMinutes !== null && commitTime !== '';

  return (
    <div className="relative bg-background flex flex-col min-h-[100dvh]">
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 py-10 min-h-[100dvh] flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >

          {/* ── Question ── */}
          {state === 'question' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-2xl font-semibold mb-3">Check-in</h1>
              <p className="text-[14px] text-foreground/65 leading-relaxed mb-10">
                Did you get to your{' '}
                <span className="text-foreground font-medium">{goal.goalTitle}</span>{' '}
                learning block today?
              </p>
              <div className="w-full space-y-3">
                <Button size="lg" className="w-full" variant="success" onClick={handleYes}>
                  Yes <Check className="w-4 h-4 ml-1" />
                </Button>
                <Button size="lg" className="w-full" variant="outline" onClick={handleNo}>
                  Not today
                </Button>
              </div>
            </div>
          )}

          {/* ── Logged (Yes flow) ── */}
          {state === 'logged' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-6">
                <Check className="w-7 h-7 text-success" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">Session logged.</h1>
              <p className="text-[14px] text-foreground/65 mb-8">See you tomorrow.</p>
              {avgRecovery && (
                <div className="bg-card border border-border rounded-xl p-4 mb-8 w-full">
                  <p className="text-xs text-muted-foreground mb-1">Avg restart delay</p>
                  <p className="text-2xl font-semibold">
                    {avgRecovery}{' '}
                    <span className="text-[13px] text-foreground/50">days</span>
                  </p>
                </div>
              )}
              <Button size="lg" className="w-full" variant="outline" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          )}

          {/* ── Reset (No flow) ── */}
          {state === 'reset' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-6">
                <RotateCcw className="w-7 h-7 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">Let&apos;s reset.</h1>
              <p className="text-[14px] text-foreground/65 leading-relaxed mb-10">
                What matters is how quickly you come back.
              </p>
              <Button size="lg" className="w-full" onClick={() => setState('path_select')}>
                Plan tomorrow <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* ── Path select — minutes + time, no Steady/Full push ── */}
          {state === 'path_select' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-semibold mb-2">Plan tomorrow&apos;s session</h1>
              <p className="text-[14px] text-foreground/65 leading-relaxed mb-8">
                Pick what you can commit to for{' '}
                <span className="text-foreground font-medium">{tomorrowFormatted}</span>.
              </p>

              {/* Minute pills */}
              <p className="text-sm font-medium mb-3">How long?</p>
              <div className="grid grid-cols-4 gap-2 mb-8">
                {MINUTE_OPTIONS.map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMinutes(m)}
                    className={cn(
                      "py-4 rounded-lg border-2 font-semibold text-lg transition-all",
                      selectedMinutes === m
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    )}
                  >
                    {m}
                    <span className="block text-xs font-normal text-muted-foreground">min</span>
                  </button>
                ))}
              </div>

              {/* Time picker */}
              <p className="text-sm font-medium mb-3">What time?</p>
              <Input
                type="time"
                value={commitTime}
                onChange={e => setCommitTime(e.target.value)}
                className="py-6 bg-card text-lg mb-3"
              />
              <p className="text-xs text-muted-foreground mb-8">
                Defaults to your usual learning time. Change it if tomorrow is different.
              </p>

              {/* If-then sentence — appears once both are selected */}
              {selectedMinutes && commitTime && (
                <div className="bg-card border border-border rounded-xl p-5 mb-8">
                  <p className="font-medium font-serif text-base leading-relaxed">
                    "If it is{' '}
                    <span className="text-primary">{commitTime}</span>{' '}
                    on{' '}
                    <span className="text-primary">{tomorrowFormatted}</span>, I will spend{' '}
                    <span className="text-primary">{selectedMinutes} minutes</span>{' '}
                    on{' '}
                    <span className="text-primary">{goal.goalTitle}</span>."
                  </p>
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                disabled={!canLockIn}
                onClick={handleLockIn}
              >
                Lock it in <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* ── Confirmation ── */}
          {state === 'confirmation' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Check className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">You&apos;re locked in.</h1>
              <p className="text-[14px] text-foreground/65 mb-8">We&apos;ll check in tomorrow evening.</p>
              <div className="bg-card border border-border rounded-xl p-5 mb-8 w-full text-left">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{tomorrowFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{commitTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{selectedMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Goal</span>
                    <span className="font-medium">{goal.goalTitle}</span>
                  </div>
                </div>
              </div>
              <Button size="lg" className="w-full" variant="outline" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
      <PoweredByFooter />
      </div>
      </div>
    </div>
  );
}
