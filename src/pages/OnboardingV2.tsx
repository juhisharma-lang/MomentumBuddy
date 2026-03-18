import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Milestone } from '@/types/app';

type Step = 1 | 2 | 3;

const TIME_BLOCKS = [
  { label: 'Morning',   sub: '6–9 AM',   value: '07:00' },
  { label: 'Afternoon', sub: '12–3 PM',  value: '13:00' },
  { label: 'Evening',   sub: '6–9 PM',   value: '19:00' },
  { label: 'Night',     sub: '9–11 PM',  value: '21:00' },
];

const MINUTE_OPTIONS = [30, 45, 60, 90];

export default function OnboardingV2() {
  const { addMilestone, completeOnboarding } = useApp();

  const [step, setStep] = useState<Step>(1);
  const [goalTitle, setGoalTitle] = useState('');
  const [minutes, setMinutes] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [hasDeadline, setHasDeadline] = useState<boolean | null>(null);
  const [deadline, setDeadline] = useState('');
  const [timeBlock, setTimeBlock] = useState<string | null>(null);
  const [channel, setChannel] = useState<'telegram' | 'email'>('telegram');

  function daysFromNow(n: number) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  }

  function canProceedStep1() {
    const mins = showCustom ? parseInt(customMinutes) : minutes;
    return goalTitle.trim().length > 0 && mins && mins > 0 && hasDeadline !== null;
  }

  function canProceedStep2() {
    return timeBlock !== null;
  }

  function handleFinish() {
    const mins = showCustom ? parseInt(customMinutes) : minutes!;
    const checkinHour = parseInt(timeBlock!.split(':')[0]) + 2;
    const checkinTime = `${String(checkinHour).padStart(2, '0')}:00`;

    const milestone: Milestone = {
      id: crypto.randomUUID(),
      status: 'active',
      goalTitle: goalTitle.trim(),
      goalType: 'certification',
      deadlineType: hasDeadline ? 'fixed' : 'flexible',
      deadline: hasDeadline && deadline ? deadline : daysFromNow(90),
      dailyMinutes: mins,
      startTime: timeBlock!,
      checkinTime,
      channelType: channel,
      telegramHandle: channel === 'telegram' ? '' : undefined,
      email: channel === 'email' ? '' : undefined,
      createdAt: new Date().toISOString().split('T')[0],
      activatedAt: new Date().toISOString().split('T')[0],
    };

    addMilestone(milestone);
    completeOnboarding();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#22223A',
    border: '0.5px solid #32324A',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '13px',
    color: '#F0ECE8',
    outline: 'none',
  };

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    background: '#5EC47A',
    color: '#1A1A2E',
    border: 'none',
    borderRadius: '12px',
    padding: '13px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 'auto',
  };

  const btnDisabled: React.CSSProperties = {
    ...btnPrimary,
    background: '#1A3028',
    color: '#5A5A7A',
    cursor: 'not-allowed',
  };

  return (
    <div style={{ padding: '24px 20px 40px', maxWidth: '430px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            height: '3px', flex: 1, borderRadius: '2px',
            background: s <= step ? '#5EC47A' : '#32324A',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '20px' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
              What are you working toward?
            </div>
            <input
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
              placeholder="e.g. AWS certification, portfolio project…"
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
              How many minutes a day?
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {MINUTE_OPTIONS.map(m => (
                <button
                  key={m}
                  onClick={() => { setMinutes(m); setShowCustom(false); }}
                  style={{
                    flex: 1, minWidth: '56px',
                    background: minutes === m && !showCustom ? '#2A2A46' : '#22223A',
                    border: minutes === m && !showCustom ? '1px solid #5EC47A' : '0.5px solid #32324A',
                    borderRadius: '8px', padding: '10px 6px',
                    fontSize: '12px', fontWeight: 500,
                    color: minutes === m && !showCustom ? '#5EC47A' : '#9898BA',
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
              <button
                onClick={() => { setShowCustom(true); setMinutes(null); }}
                style={{
                  flex: 1, minWidth: '56px',
                  background: showCustom ? '#2A2A46' : '#22223A',
                  border: showCustom ? '1px solid #5EC47A' : '0.5px solid #32324A',
                  borderRadius: '8px', padding: '10px 6px',
                  fontSize: '12px', color: showCustom ? '#5EC47A' : '#9898BA',
                  cursor: 'pointer',
                }}
              >
                Custom
              </button>
            </div>
            {showCustom && (
              <input
                type="number"
                value={customMinutes}
                onChange={e => setCustomMinutes(e.target.value)}
                placeholder="e.g. 20"
                style={{ ...inputStyle, marginTop: '8px' }}
              />
            )}
          </div>

          <div>
            <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Do you have a deadline?
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[true, false].map(v => (
                <button
                  key={String(v)}
                  onClick={() => setHasDeadline(v)}
                  style={{
                    flex: 1,
                    background: hasDeadline === v ? '#2A2A46' : '#22223A',
                    border: hasDeadline === v ? '1px solid #5EC47A' : '0.5px solid #32324A',
                    borderRadius: '8px', padding: '10px',
                    fontSize: '12px', fontWeight: 500,
                    color: hasDeadline === v ? '#5EC47A' : '#9898BA',
                    cursor: 'pointer',
                  }}
                >
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            {hasDeadline && (
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                style={{ ...inputStyle, marginTop: '8px', colorScheme: 'dark' }}
              />
            )}
          </div>

          <button
            onClick={() => canProceedStep1() && setStep(2)}
            style={canProceedStep1() ? btnPrimary : btnDisabled}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '20px' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
              When should we check in with you?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {TIME_BLOCKS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTimeBlock(t.value)}
                  style={{
                    background: timeBlock === t.value ? '#2A2A46' : '#22223A',
                    border: timeBlock === t.value ? '1px solid #5EC47A' : '0.5px solid #32324A',
                    borderRadius: '10px', padding: '12px',
                    textAlign: 'center', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 500, color: timeBlock === t.value ? '#5EC47A' : '#F0ECE8', marginBottom: '2px' }}>{t.label}</div>
                  <div style={{ fontSize: '10px', color: '#9898BA' }}>{t.sub}</div>
                </button>
              ))}
            </div>
            {timeBlock && (
              <div>
                <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  What time exactly?
                </div>
                <input
                  type="time"
                  value={timeBlock}
                  onChange={e => setTimeBlock(e.target.value)}
                  style={{ width: '100%', background: '#22223A', border: '0.5px solid #32324A', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#F0ECE8', outline: 'none', colorScheme: 'dark' }}
                />
                <div style={{ fontSize: '10px', color: '#5A5A7A', marginTop: '5px' }}>
                We will send a message — reply <strong style={{ color: '#9898BA' }}>done</strong> to log your session 
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Where should we check in?
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['telegram', 'email'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  style={{
                    flex: 1,
                    background: channel === c ? '#2A2A46' : '#22223A',
                    border: channel === c ? '1px solid #5EC47A' : '0.5px solid #32324A',
                    borderRadius: '8px', padding: '10px',
                    fontSize: '12px', fontWeight: 500,
                    color: channel === c ? '#5EC47A' : '#9898BA',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '10px', color: '#5A5A7A', marginTop: '6px' }}>
              We'll send a message — reply <strong style={{ color: '#9898BA' }}>done</strong> to log your session
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button
              onClick={() => setStep(1)}
              style={{ ...btnPrimary, background: 'transparent', color: '#9898BA', border: '0.5px solid #32324A', flex: '0 0 80px' }}
            >
              ← Back
            </button>
            <button
              onClick={() => canProceedStep2() && setStep(3)}
              style={canProceedStep2() ? { ...btnPrimary, flex: 1 } : { ...btnDisabled, flex: 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Confirm ── */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#1A3028', border: '1px solid #5EC47A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '22px' }}>
              ✓
            </div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#F0ECE8', marginBottom: '6px' }}>You're set up</div>
            <div style={{ fontSize: '11px', color: '#9898BA', lineHeight: '1.7' }}>
              {goalTitle}<br />
              {showCustom ? customMinutes : minutes} min/day ·{' '}
              {TIME_BLOCKS.find(t => t.value === timeBlock)?.label} ·{' '}
              {channel === 'telegram' ? 'Telegram' : 'Email'}
            </div>
          </div>

          <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderLeft: '2px solid #5EC47A', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#F0ECE8', marginBottom: '4px' }}>
              {channel === 'telegram' ? 'Connect Telegram' : 'Check your email'}
            </div>
            <div style={{ fontSize: '11px', color: '#9898BA', marginBottom: '10px', lineHeight: '1.5' }}>
              {channel === 'telegram'
? "Search @MomentumBuddyNotifyBot and tap Start. We will send your first check-in tonight."
: "We will send your first check-in to your email at your session time."}
            </div>
            {channel === 'telegram' && (
              <button
                onClick={() => window.open('https://t.me/MomentumBuddyNotifyBot', '_blank')}
                style={{ width: '100%', background: '#5EC47A', color: '#1A1A2E', border: 'none', borderRadius: '9px', padding: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                Open Telegram →
              </button>
            )}
          </div>

          <div style={{ fontSize: '10px', color: '#5A5A7A', textAlign: 'center', marginBottom: '20px' }}>
            After this, the app is for viewing your progress.<br />Daily habit lives in {channel === 'telegram' ? 'Telegram' : 'your inbox'}.
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button
              onClick={() => setStep(2)}
              style={{ ...btnPrimary, background: 'transparent', color: '#9898BA', border: '0.5px solid #32324A', flex: '0 0 80px' }}
            >
              ← Back
            </button>
            <button onClick={handleFinish} style={{ ...btnPrimary, flex: 1 }}>
              Go to dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
