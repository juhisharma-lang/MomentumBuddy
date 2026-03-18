import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp } from '@/contexts/AppContext';
import { GoalType, ChannelType } from '@/types/app';
import { format } from 'date-fns';
import { CalendarIcon, Briefcase, Award, Lightbulb, Sparkles, Check, Send, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import PoweredByFooter from '@/components/PoweredByFooter';
const GOAL_TYPES: { value: GoalType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'job_switch',     label: 'Job Switch',    icon: <Briefcase className="w-5 h-5" />, desc: 'Preparing for a career move' },
  { value: 'certification',  label: 'Certification', icon: <Award className="w-5 h-5" />,     desc: 'Studying for an exam' },
  { value: 'skill_building', label: 'Skill Building',icon: <Lightbulb className="w-5 h-5" />, desc: 'Learning something new' },
  { value: 'other',          label: 'Other',         icon: <Sparkles className="w-5 h-5" />,  desc: 'Something else entirely' },
];

const MINUTE_OPTIONS = [30, 45, 60, 90];
const TOTAL_FIELDS = 6;

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddingNew = searchParams.get('new') === '1';
  const { addMilestone, setActiveMilestoneId, completeOnboarding } = useApp();

  const [goalType, setGoalType]               = useState<GoalType | null>(null);
  const [goalTitle, setGoalTitle]             = useState('');
  const [deadlineType, setDeadlineType]       = useState<'fixed' | 'flexible' | null>(null);
  const [deadline, setDeadline]               = useState<Date | undefined>();
  const [dailyMinutes, setDailyMinutes]       = useState<number | null>(null);
  const [startTime, setStartTime]             = useState('');
  const [checkinTime, setCheckinTime]         = useState('');
  const [channelType, setChannelType]         = useState<ChannelType | null>(null);
  const [telegramHandle, setTelegramHandle]   = useState('');
  const [email, setEmail]                     = useState('');
  const [showCustomMinutes, setShowCustomMinutes] = useState(false); // ← add here

  const channelFilled =
    channelType === 'telegram' ? telegramHandle.trim().length > 0
    : channelType === 'email'  ? email.includes('@')
    : false;

  const filledCount = useMemo(() => {
    let n = 0;
    if (goalType) n++;
    if (goalTitle.trim()) n++;
    if (deadlineType === 'flexible' || (deadlineType === 'fixed' && deadline)) n++;
    if (dailyMinutes !== null) n++;
    if (startTime && checkinTime) n++;
    if (channelFilled) n++;
    return n;
  }, [goalType, goalTitle, deadlineType, deadline, dailyMinutes, startTime, checkinTime, channelFilled]);

  const progressPct = Math.round((filledCount / TOTAL_FIELDS) * 100);

  const canSubmit =
    !!goalType &&
    goalTitle.trim().length > 0 &&
    (deadlineType === 'flexible' || (deadlineType === 'fixed' && !!deadline)) &&
    dailyMinutes !== null &&
    startTime !== '' &&
    checkinTime !== '' &&
    channelFilled;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const newId = crypto.randomUUID();
    addMilestone({
      id: newId,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      activatedAt: new Date().toISOString().split('T')[0],
      goalType: goalType!,
      goalTitle,
      deadlineType: deadlineType as 'fixed' | 'flexible',
      deadline: deadline ? format(deadline, 'yyyy-MM-dd') : undefined,
      dailyMinutes: dailyMinutes!,
      startTime,
      checkinTime,
      channelType: channelType!,
      telegramHandle: channelType === 'telegram' ? telegramHandle : undefined,
      email: channelType === 'email' ? email : undefined,
    });
    if (isAddingNew) {
      // Adding a second milestone from dashboard — switch to it and go back
      setActiveMilestoneId(newId);
    } else {
      // First-time setup
      completeOnboarding();
    }
    navigate('/dashboard');
  };

  return (
    <div className="relative bg-background flex flex-col min-h-[100dvh]">

      {/* Sticky progress bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">
              {isAddingNew ? 'Adding new milestone' : 'Setting up your plan'}
            </p>
            <p className="text-xs text-muted-foreground">{filledCount} / {TOTAL_FIELDS}</p>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 py-6 space-y-4 pb-32">

        {/* 1 — Milestone type */}
        <OnboardingCard number={1} label="What milestone are you preparing for?" filled={!!goalType}>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_TYPES.map(gt => (
              <button
                key={gt.value}
                onClick={() => setGoalType(gt.value)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                  goalType === gt.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/30"
                )}
              >
                <span className={cn(
                  "p-1.5 rounded-md shrink-0",
                  goalType === gt.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {gt.icon}
                </span>
                <div>
                  <div className="text-[14px] font-semibold text-foreground">{gt.label}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{gt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </OnboardingCard>

        {/* 2 — Goal name */}
        <OnboardingCard number={2} label="Name your goal" filled={goalTitle.trim().length > 0}>
          <Input
            placeholder="e.g. Product Management Fundamentals"
            value={goalTitle}
            onChange={e => setGoalTitle(e.target.value)}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Be specific — this appears in every check-in.
          </p>
        </OnboardingCard>

        {/* 3 — Deadline */}
        <OnboardingCard
          number={3}
          label="Do you have a deadline?"
          filled={deadlineType === 'flexible' || (deadlineType === 'fixed' && !!deadline)}
        >
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setDeadlineType('fixed')}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                deadlineType === 'fixed' ? "border-primary bg-primary/5" : "border-border bg-background"
              )}
            >
              Fixed date
            </button>
            <button
              onClick={() => setDeadlineType('flexible')}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                deadlineType === 'flexible' ? "border-primary bg-primary/5" : "border-border bg-background"
              )}
            >
              Flexible / none
            </button>
          </div>
          {deadlineType === 'fixed' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start bg-background", !deadline && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, 'PPP') : 'Pick a date'}
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
          {deadlineType === 'flexible' && (
            <p className="text-xs text-muted-foreground">
              You can add a deadline later from settings.
            </p>
          )}
        </OnboardingCard>

{/* 4 — Daily minutes */}
<OnboardingCard number={4} label="Daily commitment" filled={dailyMinutes !== null}>
  <div className="grid grid-cols-4 gap-2 mb-2">
    {MINUTE_OPTIONS.map(m => (
      <button
        key={m}
        onClick={() => { setDailyMinutes(m); setShowCustomMinutes(false); }}
        className={cn(
          "py-4 rounded-lg border-2 font-semibold text-lg transition-all",
          dailyMinutes === m && !showCustomMinutes
            ? "border-primary bg-primary/5 text-primary"
            : "border-border bg-background text-foreground hover:border-primary/30"
        )}
      >
        {m}
        <span className="block text-xs font-normal text-muted-foreground">min</span>
      </button>
    ))}
  </div>
  <button
    onClick={() => { setShowCustomMinutes(true); setDailyMinutes(null); }}
    className={cn(
      "w-full py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
      showCustomMinutes ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-foreground"
    )}
  >
    Custom
  </button>
  {showCustomMinutes && (
    <Input
      type="number"
      placeholder="e.g. 20"
      className="bg-background mt-2"
      onChange={e => setDailyMinutes(parseInt(e.target.value) || null)}
    />
  )}
</OnboardingCard>
{/* 5 — Schedule */}
<OnboardingCard number={5} label="When should we check in with you?" filled={checkinTime !== ''}>
  <div className="grid grid-cols-2 gap-2 mb-3">
    {[
      { label: 'Morning',   sub: '6–9 AM',   value: '07:30' },
      { label: 'Afternoon', sub: '12–3 PM',  value: '13:30' },
      { label: 'Evening',   sub: '6–9 PM',   value: '19:30' },
      { label: 'Night',     sub: '9–11 PM',  value: '21:00' },
    ].map(t => (
      <button
        key={t.value}
        onClick={() => { setCheckinTime(t.value); setStartTime(t.value); }}
        className={cn(
          "py-3 px-3 rounded-lg border-2 text-left transition-all",
          checkinTime && checkinTime === t.value || 
          (checkinTime && checkinTime !== '07:30' && checkinTime !== '13:30' && checkinTime !== '19:30' && checkinTime !== '21:00' && t.value === startTime)
            ? "border-primary bg-primary/5" 
            : "border-border bg-background"
        )}
      >
        <div className="text-[14px] font-semibold text-foreground">{t.label}</div>
        <div className="text-xs text-muted-foreground">{t.sub}</div>
      </button>
    ))}
  </div>

  {startTime !== '' && (
    <div className="mt-1">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        What time exactly?
      </label>
      <Input
        type="time"
        value={checkinTime}
        onChange={e => setCheckinTime(e.target.value)}
        className="bg-background"
      />
      <p className="text-xs text-muted-foreground mt-1.5">
        We'll send your daily check-in at this exact time.
      </p>
    </div>
  )}
</OnboardingCard>
        {/* 6 — Channel */}
        <OnboardingCard number={6} label="Where should we check in?" filled={channelFilled}>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setChannelType('telegram')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                channelType === 'telegram' ? "border-primary bg-primary/5" : "border-border bg-background"
              )}
            >
              <Send className="w-3.5 h-3.5" />
              Telegram
              {channelType !== 'telegram' && (
                <span className="text-xs text-muted-foreground">· Recommended</span>
              )}
            </button>
            <button
              onClick={() => setChannelType('email')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                channelType === 'email' ? "border-primary bg-primary/5" : "border-border bg-background"
              )}
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
          </div>

          {channelType === 'telegram' && (
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  placeholder="username"
                  value={telegramHandle}
                  onChange={e => setTelegramHandle(e.target.value.replace('@', ''))}
                  className="bg-background pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                First start a chat with{' '}
                <span className="font-medium text-foreground">@MomentumBuddyBot</span>{' '}
                on Telegram, then enter your username above.
              </p>
            </div>
          )}

          {channelType === 'email' && (
            <div>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Sent from hello@momentumbuddy.app. No marketing emails.
              </p>
            </div>
          )}
        </OnboardingCard>

      </div>
      </div>

      {/* Fixed CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-8 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-md mx-auto">
          <Button size="lg" className="w-full h-14 rounded-2xl text-[15px] font-semibold" disabled={!canSubmit} onClick={handleSubmit}>
            Begin <Check className="w-4 h-4 ml-1" />
          </Button>
          <PoweredByFooter />
        </div>
      </div>

    </div>
  );
}

function OnboardingCard({
  number,
  label,
  filled,
  children,
}: {
  number: number;
  label: string;
  filled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-xl border-2 p-5 transition-all duration-200",
      filled ? "border-primary/30 bg-card" : "border-border bg-card"
    )}>
      <div className="flex items-center gap-3 mb-4">
        <span className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all",
          filled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {filled ? <Check className="w-3 h-3" /> : number}
        </span>
        <p className="text-[15px] font-semibold text-foreground" style={{fontFamily:"'Playfair Display',serif"}}>{label}</p>
      </div>
      {children}
    </div>
  );
}
