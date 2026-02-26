import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp } from '@/contexts/AppContext';
import { GoalType } from '@/types/app';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRight, ArrowLeft, Briefcase, Award, Lightbulb, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const GOAL_TYPES: { value: GoalType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'job_switch', label: 'Job Switch', icon: <Briefcase className="w-6 h-6" />, desc: 'Preparing for a career move' },
  { value: 'certification', label: 'Certification', icon: <Award className="w-6 h-6" />, desc: 'Studying for an exam' },
  { value: 'skill_building', label: 'Skill Building', icon: <Lightbulb className="w-6 h-6" />, desc: 'Learning something new' },
  { value: 'other', label: 'Other', icon: <Sparkles className="w-6 h-6" />, desc: 'Something else entirely' },
];

const MINUTE_OPTIONS = [15, 30, 45, 60, 90];

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { setGoal, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);

  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [deadlineType, setDeadlineType] = useState<'fixed' | 'flexible'>('flexible');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [startTime, setStartTime] = useState('09:00');
  const [checkinTime, setCheckinTime] = useState('20:00');
  const [email, setEmail] = useState('');

  const totalSteps = 7;

  const canAdvance = () => {
    switch (step) {
      case 0: return !!goalType;
      case 1: return goalTitle.trim().length > 0;
      case 2: return deadlineType === 'flexible' || !!deadline;
      case 3: return true;
      case 4: return true;
      case 5: return email.includes('@');
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleConfirm = () => {
    setGoal({
      goalType: goalType!,
      goalTitle,
      deadlineType,
      deadline: deadline ? format(deadline, 'yyyy-MM-dd') : undefined,
      dailyMinutes,
      startTime,
      checkinTime,
      email,
    });
    completeOnboarding();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full flex-1 transition-all duration-300",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            {step === 0 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-semibold mb-2">What are you working toward?</h1>
                <p className="text-muted-foreground mb-8">Pick the category that fits best.</p>
                <div className="space-y-3">
                  {GOAL_TYPES.map(gt => (
                    <button
                      key={gt.value}
                      onClick={() => setGoalType(gt.value)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all",
                        goalType === gt.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/30"
                      )}
                    >
                      <span className={cn(
                        "p-2 rounded-lg",
                        goalType === gt.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {gt.icon}
                      </span>
                      <div>
                        <div className="font-medium">{gt.label}</div>
                        <div className="text-sm text-muted-foreground">{gt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-semibold mb-2">Name your goal</h1>
                <p className="text-muted-foreground mb-8">Be specific — we'll use this throughout the app.</p>
                <Input
                  placeholder="e.g. AWS Solutions Architect exam"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  className="text-lg py-6 bg-card"
                  autoFocus
                />
                {goalTitle && (
                  <p className="mt-4 text-sm text-muted-foreground italic font-serif">
                    "I'm committed to <span className="text-foreground font-medium">{goalTitle}</span>"
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-semibold mb-2">Do you have a deadline?</h1>
                <p className="text-muted-foreground mb-8">No pressure — flexible works too.</p>
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setDeadlineType('fixed')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all",
                      deadlineType === 'fixed' ? "border-primary bg-primary/5" : "border-border bg-card"
                    )}
                  >
                    Fixed date
                  </button>
                  <button
                    onClick={() => setDeadlineType('flexible')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all",
                      deadlineType === 'flexible' ? "border-primary bg-primary/5" : "border-border bg-card"
                    )}
                  >
                    Flexible
                  </button>
                </div>
                {deadlineType === 'fixed' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left py-6 bg-card", !deadline && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, 'PPP') : 'Pick your deadline'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        disabled={d => d < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-semibold mb-2">Daily commitment</h1>
                <p className="text-muted-foreground mb-8">How many minutes a day for <span className="text-foreground">{goalTitle || 'your goal'}</span>?</p>
                <div className="grid grid-cols-3 gap-3">
                  {MINUTE_OPTIONS.map(m => (
                    <button
                      key={m}
                      onClick={() => setDailyMinutes(m)}
                      className={cn(
                        "py-6 rounded-lg border-2 font-semibold text-xl transition-all",
                        dailyMinutes === m
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/30"
                      )}
                    >
                      {m}<span className="text-sm font-normal text-muted-foreground ml-1">min</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-semibold mb-2">Your schedule</h1>
                <p className="text-muted-foreground mb-8">When do you usually learn, and when should we check in?</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred learning time</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="py-6 bg-card text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Evening check-in time</label>
                    <Input
                      type="time"
                      value={checkinTime}
                      onChange={e => setCheckinTime(e.target.value)}
                      className="py-6 bg-card text-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2">We'll ask if you got your learning in.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-semibold mb-2">Stay in the loop</h1>
                <p className="text-muted-foreground mb-8">We'll send gentle check-in reminders — nothing spammy.</p>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="py-6 bg-card text-lg"
                  autoFocus
                />
              </div>
            )}

            {step === 6 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-semibold mb-2">You're all set 🎯</h1>
                <p className="text-muted-foreground mb-8">Here's your plan. Ready to start?</p>
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <SummaryRow label="Goal" value={goalTitle} />
                  <SummaryRow label="Type" value={GOAL_TYPES.find(g => g.value === goalType)?.label || ''} />
                  <SummaryRow
                    label="Deadline"
                    value={deadlineType === 'fixed' && deadline ? format(deadline, 'PPP') : 'Flexible'}
                  />
                  <SummaryRow label="Daily target" value={`${dailyMinutes} minutes`} />
                  <SummaryRow label="Learning time" value={startTime} />
                  <SummaryRow label="Check-in at" value={checkinTime} />
                  <SummaryRow label="Email" value={email} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 flex gap-3">
        {step > 0 && (
          <Button variant="ghost" size="lg" onClick={handleBack} className="px-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <Button
          size="lg"
          className="flex-1"
          disabled={!canAdvance()}
          onClick={step === totalSteps - 1 ? handleConfirm : handleNext}
          variant={step === totalSteps - 1 ? 'success' : 'default'}
        >
          {step === totalSteps - 1 ? (
            <>Let's go <Check className="w-4 h-4 ml-1" /></>
          ) : (
            <>Continue <ArrowRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
