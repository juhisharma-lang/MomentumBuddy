import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { getAvailableJourneys, Journey } from '@/data/journeys';
import PlantVisual from '@/components/PlantVisual';
import {
  BrainCircuit, Cloud, LayoutDashboard, BarChart2, ClipboardList,
  Figma, ShieldCheck, Sparkles, TrendingUp, Code2,
  ArrowRight, ArrowLeft, Bell, Calendar, Clock,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { requestNotificationPermission, sendLocalNotification, saveStudyTime } from '@/lib/notifications';
// ── Icon map ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BrainCircuit, Cloud, LayoutDashboard, BarChart2, ClipboardList,
  Figma, ShieldCheck, Sparkles, TrendingUp, Code2,
};

function JourneyIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Cloud;
  return <Icon className={className} />;
}

// ── Shared ────────────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-jakarta text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Step {current} of {total}
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < current ? 'bg-[#a63c2a] w-5' : 'bg-outline-variant w-3'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function BentoHeader({ step, total, onBack }: {
  step: number;
  total: number;
  onBack?: () => void;
}) {
  return (
    <header className="flex-shrink-0 flex justify-between items-center px-5 py-4 bg-m3-bg">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4 text-on-surface" />
          </button>
        ) : (
          <h1 className="font-jakarta font-bold text-base tracking-tight text-[#a63c2a]">
            Learners Buddy
          </h1>
        )}
      </div>
      <StepIndicator current={step} total={total} />
    </header>
  );
}

function DayChip({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-10 rounded-bento font-jakarta font-bold text-sm transition-all duration-200 ${
        active
          ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary-container/50'
          : 'bg-surface-container-lowest text-on-surface'
      }`}
    >
      {label}
    </button>
  );
}

// ── Screen 1: Journey Selection ───────────────────────────────────────────────

function Screen1({ onSelect }: { onSelect: (journey: Journey) => void }) {
  const available = getAvailableJourneys();
  const featured = available.find(j => j.id === 'aws-saa') ?? available[0];
  const rest = available.filter(j => j.id !== featured.id);

  const tileColors: Record<string, string> = {
    'aiml':                'bg-[#e0f2f1]',
    'pm-transition':       'bg-[#f3e5f5]',
    'data-analytics':      'bg-[#e3f2fd]',
    'pmp':                 'bg-[#fff8e1]',
    'ux-design':           'bg-[#fce4ec]',
    'cybersecurity':       'bg-[#e8f5e9]',
    'gen-ai-nontechnical': 'bg-[#fff3e0]',
    'cfa-level1':          'bg-[#ede7f6]',
    'dsa-system-design':   'bg-[#e8eaf6]',
  };

  return (
    <div className="h-screen bg-m3-bg font-jakarta flex flex-col overflow-hidden">
      <BentoHeader step={1} total={3} />

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        <section className="mb-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface leading-tight">
            Choose your{' '}
            <span className="text-[#a63c2a] italic">horizon.</span>
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Pick a curated path built for your goal.
          </p>
        </section>

        {/* Featured tile */}
        <div className="bg-surface-container-lowest rounded-bento p-5 relative overflow-hidden mb-3 border border-outline-variant/10 shadow-sm">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Popular Path
          </span>
          <h3 className="text-xl font-extrabold text-on-surface mb-1 leading-tight">
            {featured.name}
          </h3>
          <p className="text-on-surface-variant text-xs mb-4">
            {featured.category} · {featured.weeksMin}–{featured.weeksMax} weeks · {featured.weeks.length} weeks mapped
          </p>
          <button
            onClick={() => onSelect(featured)}
            className="bg-[#a63c2a] text-[#fff7f6] px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
          >
            Start Journey
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <JourneyIcon name={featured.icon} className="w-20 h-20 text-[#a63c2a] opacity-10" />
          </div>
        </div>

        {/* All other journeys — 2 column grid */}
        <div className="grid grid-cols-2 gap-3">
          {rest.map(journey => (
            <button
              key={journey.id}
              onClick={() => onSelect(journey)}
              className={`${tileColors[journey.id] ?? 'bg-surface-container-low'} rounded-bento p-4 flex flex-col justify-between text-left active:scale-95 transition-transform min-h-[110px]`}
            >
              <div className="w-8 h-8 bg-white/60 rounded-bento flex items-center justify-center mb-2">
                <JourneyIcon name={journey.icon} className="w-4 h-4 text-on-surface" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface leading-tight mb-0.5">
                  {journey.name}
                </h4>
                <p className="text-on-surface-variant text-[10px]">
                  {journey.weeksMin}–{journey.weeksMax} wks
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

// ── Screen 2: Set Your Plan ───────────────────────────────────────────────────

function Screen2({
  journey,
  onNext,
  onBack,
}: {
  journey: Journey;
  onNext: (data: {
    deadline: string;
    dailyMinutes: number;
    studyDays: string[];
    notebookOutline: string;
  }) => void;
  onBack: () => void;
}) {
  const today = new Date();
  const defaultDeadline = new Date(today);
  defaultDeadline.setDate(today.getDate() + journey.weeksMin * 7);
  const defaultDeadlineStr = defaultDeadline.toISOString().split('T')[0];

  const [deadline, setDeadline] = useState(defaultDeadlineStr);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [customMinutes, setCustomMinutes] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [studyDays, setStudyDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function toggleDay(day: string) {
    setStudyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  function weeksRemaining(): string {
    const ms = new Date(deadline).getTime() - today.getTime();
    const weeks = Math.round(ms / (1000 * 60 * 60 * 24 * 7));
    if (weeks < 1) return 'too tight ⚠️';
    if (weeks < journey.weeksMin) return `${weeks} weeks - tight but doable`;
    if (weeks <= journey.weeksMax) return `${weeks} weeks - achievable ✓`;
    return `${weeks} weeks - comfortable pace`;
  }

  const effectiveMinutes = useCustom ? parseInt(customMinutes) || 0 : dailyMinutes;

  function formatMinutes(m: number): string {
    if (m <= 0) return '—';
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }

  const quotes = [
    '"Growth is not a sprint, it\'s a series of small, intentional breaths."',
    '"The secret of getting ahead is getting started."',
    '"A little progress each day adds up to big results."',
  ];
  const quote = quotes[journey.id.length % quotes.length];

  return (
    <div className="h-screen bg-m3-bg font-jakarta flex flex-col overflow-hidden">
      <BentoHeader step={2} total={3} onBack={onBack} />

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
            {journey.name}
          </p>
          <h2 className="text-2xl font-black tracking-tight text-[#a63c2a]">Set Your Plan</h2>
        </div>

        <div className="flex flex-col gap-3">

          {/* Target date */}
          <section className="bg-surface-container rounded-bento p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-[#ffac9d] p-1.5 rounded-bento">
                <Calendar className="w-4 h-4 text-[#76190b]" />
              </div>
              <h3 className="text-sm font-bold">Target Completion Date</h3>
            </div>
            <input
              type="date"
              value={deadline}
              min={today.toISOString().split('T')[0]}
              onChange={e => setDeadline(e.target.value)}
              className="bg-white/70 rounded-bento px-3 py-2 text-base font-bold w-full border border-outline-variant/20 text-on-surface focus:outline-none"
            />
            <p className="text-xs text-on-surface-variant mt-2">{weeksRemaining()}</p>
          </section>

          {/* Daily time */}
          <section className="bg-surface-container rounded-bento p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#ffac9d] p-1.5 rounded-bento">
                  <Clock className="w-4 h-4 text-[#76190b]" />
                </div>
                <h3 className="text-sm font-bold">Daily Time Commitment</h3>
              </div>
              <span className="text-sm font-black text-[#a63c2a]">
                {formatMinutes(effectiveMinutes)}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              {[15, 30, 45, 60, 90].map(m => (
                <button
                  key={m}
                  onClick={() => { setDailyMinutes(m); setUseCustom(false); setCustomMinutes(''); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    !useCustom && dailyMinutes === m
                      ? 'bg-[#a63c2a] text-[#fff7f6]'
                      : 'bg-surface-container-lowest text-on-surface-variant'
                  }`}
                >
                  {m < 60 ? `${m}m` : `${m / 60}h`}
                </button>
              ))}
            </div>

            {!useCustom && (
              <input
                type="range"
                min={15} max={180} step={15}
                value={dailyMinutes}
                onChange={e => setDailyMinutes(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#a63c2a] mb-2"
              />
            )}

            {useCustom ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 110"
                  value={customMinutes}
                  onChange={e => setCustomMinutes(e.target.value)}
                  className="flex-1 bg-surface-container-lowest rounded-bento px-3 py-2 text-sm font-bold border border-[#a63c2a]/40 focus:outline-none text-on-surface"
                />
                <span className="text-xs text-on-surface-variant">minutes</span>
                <button
                  onClick={() => { setUseCustom(false); setCustomMinutes(''); }}
                  className="text-xs text-on-surface-variant underline"
                >
                  cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setUseCustom(true)}
                className="text-xs text-on-surface-variant underline mt-1"
              >
                Enter a custom duration in minutes
              </button>
            )}
          </section>

          {/* Study days */}
          <section className="bg-surface-container rounded-bento p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-secondary-container p-1.5 rounded-bento">
                <Clock className="w-4 h-4 text-on-secondary-container" />
              </div>
              <h3 className="text-sm font-bold">Study Days</h3>
            </div>
            <div className="flex gap-1.5">
              {days.map(day => (
                <DayChip
                  key={day}
                  label={day.slice(0, 1)}
                  active={studyDays.includes(day)}
                  onClick={() => toggleDay(day)}
                />
              ))}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2">
              {studyDays.length} days selected
            </p>
          </section>

          {/* Sprout quote */}
          <section className="bg-tertiary-container rounded-bento p-5 flex items-center gap-4">
            <PlantVisual state="growing" className="w-14 h-14 flex-shrink-0 opacity-60" />
            <p className="text-sm italic font-medium text-on-tertiary-container leading-snug">
              {quote}
            </p>
          </section>

          {/* DISABLED — Phase 2: course outline field */}

        </div>
      </main>

      <div className="flex-shrink-0 px-4 py-4 bg-m3-bg border-t border-outline-variant/20">
        <button
          onClick={() => onNext({ deadline, dailyMinutes: effectiveMinutes, studyDays, notebookOutline: '' })}
          disabled={effectiveMinutes <= 0}
          className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-lg shadow-[#a63c2a]/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          Confirm My Plan
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ── Screen 3: Notifications ───────────────────────────────────────────────────

function Screen3({
  journey,
  onFinish,
  onBack,
}: {
  journey: Journey;
  onFinish: (data: {
    reminderTime: string;
    checkinTime: string;
    permissionGranted: boolean;
  }) => void;
  onBack: () => void;
}) {
  const [studyHH, setStudyHH] = useState('07');
  const [studyMM, setStudyMM] = useState('00');
  const [studyAMPM, setStudyAMPM] = useState<'AM' | 'PM'>('PM');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !('MSStream' in window);

  const isInStandaloneMode =
    typeof window !== 'undefined' &&
    ('standalone' in window.navigator) &&
    (window.navigator as { standalone?: boolean }).standalone;

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (granted) {
      saveStudyTime(
        `${studyHH}:${studyMM} ${studyAMPM}`,
        deriveCheckinTime()
      );
      // Fire a welcome notification immediately so they see it works
      await sendLocalNotification(
        'Learners Buddy 🌱',
        'Notifications enabled. We\'ll remind you before your study time.',
        '/dashboard-v3'
      );
    }
  }
function deriveCheckinTime(): string {
    const h = parseInt(studyHH);
    const hour24 = studyAMPM === 'PM' && h !== 12 ? h + 12 : studyAMPM === 'AM' && h === 12 ? 0 : h;
    const uncappedHour = hour24 + 2;
    // Cap at 23:00 (11 PM)
    const checkinHour = uncappedHour >= 23 ? 23 : uncappedHour % 24;
    const checkinMin = uncappedHour >= 23 ? 0 : parseInt(studyMM);
    const ampm = checkinHour >= 12 ? 'PM' : 'AM';
    const display = checkinHour > 12 ? checkinHour - 12 : checkinHour === 0 ? 12 : checkinHour;
    return `${String(display).padStart(2, '0')}:${String(checkinMin).padStart(2, '0')} ${ampm}`;
  }

  function checkinIsCapped(): boolean {
    const h = parseInt(studyHH);
    const hour24 = studyAMPM === 'PM' && h !== 12 ? h + 12 : studyAMPM === 'AM' && h === 12 ? 0 : h;
    return hour24 + 2 >= 23;
  }

  function handleFinish() {
    onFinish({
      reminderTime: `${studyHH}:${studyMM} ${studyAMPM}`,
      checkinTime: deriveCheckinTime(),
      permissionGranted,
    });
  }

  return (
    <div className="h-screen bg-m3-bg font-jakarta flex flex-col overflow-hidden">
      <BentoHeader step={3} total={3} onBack={onBack} />

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
            {journey.name}
          </p>
          <h2 className="text-2xl font-black tracking-tight text-[#a63c2a]">
            When do you usually study?
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            We'll remind you before and check in after.
          </p>
        </div>

        <div className="flex flex-col gap-3">

          {/* Time picker */}
          <section className="bg-surface-container rounded-bento p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-secondary-container p-1.5 rounded-bento">
                <Clock className="w-4 h-4 text-on-secondary-container" />
              </div>
              <h3 className="font-bold text-on-surface text-sm">My usual study time</h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setStudyHH(prev => {
                    const h = parseInt(prev);
                    const next = h >= 12 ? 1 : h + 1;
                    if (h === 11 || h === 12) setStudyAMPM(p => p === 'AM' ? 'PM' : 'AM');
                    return String(next).padStart(2, '0');
                  })}
                  className="w-16 py-1 text-on-surface-variant hover:text-on-surface text-xl font-black"
                >▲</button>
                <div className="w-16 text-2xl font-black text-on-surface bg-surface-container-lowest rounded-bento p-2 text-center border border-outline-variant/20">
                  {studyHH}
                </div>
                <button
                  onClick={() => setStudyHH(prev => {
                    const h = parseInt(prev);
                    const next = h <= 1 ? 12 : h - 1;
                    if (h === 12 || h === 1) setStudyAMPM(p => p === 'AM' ? 'PM' : 'AM');
                    return String(next).padStart(2, '0');
                  })}
                  className="w-16 py-1 text-on-surface-variant hover:text-on-surface text-xl font-black"
                >▼</button>
              </div>

              <span className="text-2xl font-black text-on-surface-variant">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    const m = parseInt(studyMM);
                    if (m >= 55) {
                      setStudyMM('00');
                      setStudyHH(prev => {
                        const h = parseInt(prev);
                        const next = h >= 12 ? 1 : h + 1;
                        if (h === 11 || h === 12) setStudyAMPM(p => p === 'AM' ? 'PM' : 'AM');
                        return String(next).padStart(2, '0');
                      });
                    } else {
                      setStudyMM(String(m + 5).padStart(2, '0'));
                    }
                  }}
                  className="w-16 py-1 text-on-surface-variant hover:text-on-surface text-xl font-black"
                >▲</button>
                <div className="w-16 text-2xl font-black text-on-surface bg-surface-container-lowest rounded-bento p-2 text-center border border-outline-variant/20">
                  {studyMM}
                </div>
                <button
                  onClick={() => {
                    const m = parseInt(studyMM);
                    if (m <= 0) {
                      setStudyMM('55');
                      setStudyHH(prev => {
                        const h = parseInt(prev);
                        const next = h <= 1 ? 12 : h - 1;
                        if (h === 12 || h === 1) setStudyAMPM(p => p === 'AM' ? 'PM' : 'AM');
                        return String(next).padStart(2, '0');
                      });
                    } else {
                      setStudyMM(String(m - 5).padStart(2, '0'));
                    }
                  }}
                  className="w-16 py-1 text-on-surface-variant hover:text-on-surface text-xl font-black"
                >▼</button>
              </div>

              {/* AM/PM */}
              <div className="flex flex-col gap-1 ml-1">
                {(['AM', 'PM'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setStudyAMPM(v)}
                    className={`px-2.5 py-1 rounded-bento text-xs font-bold transition-all ${
                      studyAMPM === v
                        ? 'bg-[#a63c2a] text-[#fff7f6]'
                        : 'bg-surface-container-lowest text-on-surface-variant'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
       </div>
            {checkinIsCapped() && (
              <p className="text-xs text-on-surface-variant mt-3">
                ⚠️ Late study time detected — check-in capped at 11:00 PM so nudges have time to fire.
              </p>
            )}
          </section>

          {/* How nudges work */}
          <section className="bg-surface-container-lowest rounded-bento p-5 border border-outline-variant/15">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              What this means
            </p>
           <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-secondary-container rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5 text-on-secondary-container" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Study reminder</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    We'll nudge you 10 minutes before your study time so you can wrap up and start.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-[#ffac9d] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5 text-[#76190b]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Evening check-in</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    About 2 hours after your study time, we'll ask: "Did you get your session in?" - one tap to answer.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-surface-container rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">ℹ️</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">How nudges work right now</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Nudges fire while the app is open in your browser. Background notifications are coming in the next update.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* iOS prompt */}
          {isIOS && !isInStandaloneMode && (
            <div className="bg-secondary-container rounded-bento p-4 flex items-start gap-3">
              <span className="text-xl">📱</span>
              <div>
                <p className="font-bold text-on-secondary-container text-sm">Add to Home Screen first</p>
                <p className="text-on-secondary-container/80 text-xs mt-1">
                  Tap Share in Safari → "Add to Home Screen" to enable notifications on iPhone.
                </p>
              </div>
            </div>
          )}

          {/* Notification permission */}
          <div className="bg-surface-container-lowest rounded-bento p-5 border border-outline-variant/15">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ffac9d] rounded-bento flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-[#76190b]" />
              </div>
              <div>
                <p className="font-bold text-on-surface text-sm">Allow notifications</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  No marketing. Only your study reminders and check-ins.
                </p>
              </div>
            </div>
            {permissionGranted ? (
              <div className="flex items-center gap-2 text-sm font-bold text-[#4ade80]">
                <span>✓</span> You're all set
              </div>
            ) : (
              <>
                <button
                  onClick={handleEnableNotifications}
                  className="w-full py-2.5 rounded-full border-2 border-[#a63c2a] text-[#a63c2a] font-bold text-sm hover:bg-[#ffac9d]/20 transition-colors"
                >
                  Enable Notifications
                </button>
                <p className="text-center text-[10px] text-on-surface-variant mt-2">
                  Notifications are being rolled out — we'll activate them in the next update.
                </p>
              </>
            )}
          </div>

        </div>
      </main>

      <div className="flex-shrink-0 px-4 py-4 bg-m3-bg border-t border-outline-variant/20">
        <button
          onClick={handleFinish}
          className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-xl shadow-[#a63c2a]/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          Start my journey
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ── Main orchestrator ─────────────────────────────────────────────────────────

export default function OnboardingV3() {
  const navigate = useNavigate();
  const { addMilestone, completeOnboarding } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [planData, setPlanData] = useState<{
    deadline: string;
    dailyMinutes: number;
    studyDays: string[];
    notebookOutline: string;
  } | null>(null);

  function handleJourneySelect(journey: Journey) {
    setSelectedJourney(journey);
    setStep(2);
  }

  function handlePlanNext(data: {
    deadline: string;
    dailyMinutes: number;
    studyDays: string[];
    notebookOutline: string;
  }) {
    setPlanData(data);
    setStep(3);
  }

  function handleFinish(notifData: {
    reminderTime: string;
    checkinTime: string;
    permissionGranted: boolean;
  }) {
    if (!selectedJourney || !planData) return;

    const id = crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];

    addMilestone({
      id,
      status: 'active',
      createdAt: today,
      activatedAt: today,
      goalTitle: selectedJourney.name,
      goalType: 'certification',
      deadlineType: 'fixed',
      deadline: planData.deadline,
      dailyMinutes: planData.dailyMinutes,
      journeyId: selectedJourney.id,
      studyDays: planData.studyDays,
      notebookOutline: planData.notebookOutline || undefined,
      notifReminderTime: notifData.reminderTime,
      notifCheckinTime: notifData.checkinTime,
      notifPermissionGranted: notifData.permissionGranted,
    });

    completeOnboarding();
    navigate('/dashboard-v3');
  }

  if (step === 1) return <Screen1 onSelect={handleJourneySelect} />;
  if (step === 2 && selectedJourney) return <Screen2 journey={selectedJourney} onNext={handlePlanNext} onBack={() => setStep(1)} />;
  if (step === 3 && selectedJourney) return <Screen3 journey={selectedJourney} onFinish={handleFinish} onBack={() => setStep(2)} />;
  return null;
}