import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp } from '@/contexts/AppContext';
import { FallbackPath, FlowType } from '@/types/app';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { CalendarIcon, Check, Heart, Zap, ArrowRight, Pause, CalendarDays } from 'lucide-react';

type CheckInState =
  | 'question'
  | 'celebration'
  | 'reassurance'
  | 'path_select'
  | 'lock_in'
  | 'confirmation'
  | 'reschedule'
  | 'pause_select'
  | 'pause_confirm';

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const PAUSE_OPTIONS = [
  { label: '2 days', days: 2 },
  { label: '3 days', days: 3 },
  { label: 'Rest of week', days: 0 },
];

export default function CheckIn() {
  const navigate = useNavigate();
  const { goal, addLog, addCommitment, addPause } = useApp();
  const [state, setState] = useState<CheckInState>('question');
  const [selectedPath, setSelectedPath] = useState<FallbackPath>('quick_win');
  const [commitTime, setCommitTime] = useState(goal?.startTime || '09:00');
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>();
  const [pauseDays, setPauseDays] = useState(2);

  if (!goal) {
    navigate('/onboarding');
    return null;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrowFormatted = format(addDays(new Date(), 1), 'EEEE, MMMM d');

  const pathMinutes: Record<FallbackPath, number> = {
    quick_win: Math.round(goal.dailyMinutes * 0.5),
    back_on_track: goal.dailyMinutes,
    make_up: Math.round(goal.dailyMinutes * 1.5),
  };

  const handleYes = () => {
    addLog({ date: today, completed: true, fallbackTriggered: false });
    setState('celebration');
  };

  const handleNo = () => {
    addLog({ date: today, completed: false, fallbackTriggered: true });
    setState('reassurance');
  };

  const handleLockIn = () => {
    const commitDate = state === 'reschedule' && rescheduleDate
      ? format(rescheduleDate, 'yyyy-MM-dd')
      : tomorrow;
    addCommitment({
      id: crypto.randomUUID(),
      committedForDate: commitDate,
      committedTime: commitTime,
      minutes: pathMinutes[selectedPath],
      flowType: state === 'reschedule' ? 'reschedule' : 'lockin',
      confirmed: true,
      fulfilled: false,
    });
    setState('confirmation');
  };

  const handlePause = () => {
    const pauseUntil = format(addDays(new Date(), pauseDays), 'yyyy-MM-dd');
    addPause({ pausedFrom: today, pausedUntil: pauseUntil });
    addCommitment({
      id: crypto.randomUUID(),
      committedForDate: pauseUntil,
      committedTime: commitTime,
      minutes: pathMinutes[selectedPath],
      flowType: 'pause',
      confirmed: true,
      fulfilled: false,
    });
    setState('pause_confirm');
  };

  const commitDateLabel = () => {
    if (state === 'reschedule' && rescheduleDate) return format(rescheduleDate, 'EEEE, MMMM d');
    return tomorrowFormatted;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
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
          {state === 'question' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold mb-3">Evening check-in</h1>
              <p className="text-muted-foreground mb-10">
                Did you get to your <span className="text-foreground font-medium">{goal.goalTitle}</span> learning block today?
              </p>
              <div className="w-full space-y-3">
                <Button size="lg" className="w-full" variant="success" onClick={handleYes}>
                  Yes, I did! <Check className="w-4 h-4 ml-1" />
                </Button>
                <Button size="lg" className="w-full" variant="outline" onClick={handleNo}>
                  Not today
                </Button>
              </div>
            </div>
          )}

          {state === 'celebration' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-6">🎉</div>
              <h1 className="text-2xl font-semibold mb-3">Amazing work!</h1>
              <p className="text-muted-foreground mb-10">
                You showed up for <span className="text-foreground font-medium">{goal.goalTitle}</span> today. That's what momentum looks like.
              </p>
              <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          )}

          {state === 'reassurance' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-6">💛</div>
              <h1 className="text-2xl font-semibold mb-3">That's completely okay</h1>
              <p className="text-muted-foreground mb-3">
                Missing a day doesn't erase your progress. What matters is how quickly you come back.
              </p>
              <p className="text-sm text-muted-foreground mb-10">
                Let's set up a small comeback plan for tomorrow.
              </p>
              <Button size="lg" className="w-full" onClick={() => setState('path_select')}>
                Let's do it <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {state === 'path_select' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-semibold mb-2">Choose your comeback</h1>
              <p className="text-muted-foreground mb-8">Any option is a win. The default is easiest.</p>
              <div className="space-y-3 mb-8">
                {([
                  { path: 'quick_win' as FallbackPath, label: 'Quick win', desc: 'Half session — just get started', icon: <Zap className="w-5 h-5" />, default: true },
                  { path: 'back_on_track' as FallbackPath, label: 'Back on track', desc: 'Full session — business as usual', icon: <ArrowRight className="w-5 h-5" /> },
                  { path: 'make_up' as FallbackPath, label: 'Make up session', desc: 'Extended session — extra momentum', icon: <Zap className="w-5 h-5" /> },
                ]).map(option => (
                  <button
                    key={option.path}
                    onClick={() => setSelectedPath(option.path)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all",
                      selectedPath === option.path
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <span className={cn(
                      "p-2 rounded-lg",
                      selectedPath === option.path ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {option.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {option.label}
                        <span className="text-sm text-muted-foreground">({pathMinutes[option.path]} min)</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                    {option.default && selectedPath === option.path && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">default</span>
                    )}
                  </button>
                ))}
              </div>
              <Button size="lg" className="w-full mb-3" onClick={() => setState('lock_in')}>
                Lock it in <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setState('reschedule')}>
                  <CalendarDays className="w-4 h-4 mr-1" /> Reschedule
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setState('pause_select')}>
                  <Pause className="w-4 h-4 mr-1" /> Pause check-ins
                </Button>
              </div>
            </div>
          )}

          {state === 'lock_in' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-semibold mb-2">Lock in your plan</h1>
              <p className="text-muted-foreground mb-8">When will you do it tomorrow?</p>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Start time</label>
                <Input
                  type="time"
                  value={commitTime}
                  onChange={e => setCommitTime(e.target.value)}
                  className="py-6 bg-card text-lg"
                />
              </div>
              <div className="bg-card border border-border rounded-xl p-5 mb-8">
                <p className="text-sm text-muted-foreground mb-1 italic font-serif">Your implementation intention:</p>
                <p className="font-medium font-serif text-lg">
                  "If it is <span className="text-primary">{commitTime}</span> on{' '}
                  <span className="text-primary">{tomorrowFormatted}</span>, I will spend{' '}
                  <span className="text-primary">{pathMinutes[selectedPath]} minutes</span> on{' '}
                  <span className="text-primary">{goal.goalTitle}</span>."
                </p>
              </div>
              <Button size="lg" className="w-full" variant="success" onClick={handleLockIn}>
                I commit <Check className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {state === 'reschedule' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-semibold mb-2">Reschedule</h1>
              <p className="text-muted-foreground mb-6">Pick a date that works. We'll pause check-ins until then.</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start py-6 bg-card mb-6", !rescheduleDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate ? format(rescheduleDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    disabled={d => d <= new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {rescheduleDate && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Start time</label>
                    <Input
                      type="time"
                      value={commitTime}
                      onChange={e => setCommitTime(e.target.value)}
                      className="py-6 bg-card text-lg"
                    />
                  </div>
                  <div className="bg-card border border-border rounded-xl p-5 mb-6">
                    <p className="font-medium font-serif">
                      "On <span className="text-primary">{format(rescheduleDate, 'EEEE, MMMM d')}</span> at{' '}
                      <span className="text-primary">{commitTime}</span>, I will spend{' '}
                      <span className="text-primary">{pathMinutes[selectedPath]} minutes</span> on{' '}
                      <span className="text-primary">{goal.goalTitle}</span>."
                    </p>
                  </div>
                  <Button size="lg" className="w-full" variant="success" onClick={handleLockIn}>
                    Confirm <Check className="w-4 h-4 ml-1" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setState('path_select')}>
                ← Back to options
              </Button>
            </div>
          )}

          {state === 'pause_select' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-semibold mb-2">Take a breather</h1>
              <p className="text-muted-foreground mb-8">We'll pause check-ins and come back when you're ready.</p>
              <div className="space-y-3 mb-8">
                {PAUSE_OPTIONS.map(opt => {
                  const days = opt.days === 0
                    ? Math.max(1, 7 - new Date().getDay())
                    : opt.days;
                  const resumeDate = format(addDays(new Date(), days), 'EEEE, MMMM d');
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setPauseDays(days)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all",
                        pauseDays === days
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/30"
                      )}
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-sm text-muted-foreground">Resume on {resumeDate}</div>
                    </button>
                  );
                })}
              </div>
              <Button size="lg" className="w-full" onClick={handlePause}>
                Pause check-ins
              </Button>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setState('path_select')}>
                ← Back to options
              </Button>
            </div>
          )}

          {state === 'confirmation' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-6">✅</div>
              <h1 className="text-2xl font-semibold mb-3">You're locked in</h1>
              <div className="bg-card border border-border rounded-xl p-5 mb-8 w-full text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{commitDateLabel()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{commitTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{pathMinutes[selectedPath]} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Goal</span>
                    <span className="font-medium">{goal.goalTitle}</span>
                  </div>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          )}

          {state === 'pause_confirm' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-6">🌿</div>
              <h1 className="text-2xl font-semibold mb-3">Check-ins paused</h1>
              <p className="text-muted-foreground mb-8">
                We'll check in again on <span className="text-foreground font-medium">{format(addDays(new Date(), pauseDays), 'EEEE, MMMM d')}</span>.
                Take care of yourself.
              </p>
              <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
