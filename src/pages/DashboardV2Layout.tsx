import { useState } from 'react';
import React from 'react';
import TelegramSimulator from '@/components/TelegramSimulator';
import { DEMO_SEEDS } from '@/components/DemoSeeds';

const STORAGE_KEY = 'momentum_buddy_state';
const DEV_MODE_KEY = 'mb_dev_mode';

// ── State definitions ─────────────────────────────────────────────────────────
const STATES = [
  {
    key: 'home', label: 'Home',
    annotation: { trigger: 'New user opens the app for the first time.', app: 'Entry screen - explains what the product does. Flow diagram shows the restart loop.', telegram: 'No interaction yet. User taps Get started to begin setup.' },
  },
  {
    key: 'setup', label: 'Setup',
    annotation: { trigger: 'User taps Get started on the home screen.', app: '3-step onboarding. Goal, check-in time, connect Telegram. Takes 90 seconds. Never repeated.', telegram: 'After setup, user connects bot once. Confirmation sent. Daily check-ins begin tonight.' },
  },
  {
    key: 'A', label: 'A - On track',
    annotation: { trigger: 'User replied "done" to tonight\'s check-in nudge on Telegram.', app: 'Dashboard shows session logged, week grid, recovery speed. Visited occasionally - not daily.', telegram: 'Bot nudged at 9 PM: "did you get your session in?" User replied done. Bot confirmed.' },
  },
  {
    key: 'A_notdone', label: 'A - Not done',
    annotation: { trigger: 'User replied "not done" to tonight\'s check-in nudge - same night, no gap.', app: 'Dashboard moves to missed state. App reflects what happened in Telegram.', telegram: 'Bot immediately asks for restart time. User commits. App enters State C.' },
  },
  {
    key: 'B', label: 'B - Missed',
    annotation: { trigger: 'User did not reply to yesterday\'s nudge at all. Bot detects silence by midnight.', app: 'Dashboard shows restart prompt. Points to Telegram as primary action path.', telegram: 'Next morning bot reaches out: "You missed yesterday - when are you coming back?"' },
  },
  {
    key: 'C', label: 'C - Committed',
    annotation: { trigger: 'User replied with a restart time via Telegram (from A not-done or State B).', app: 'Dashboard holds space. Shows committed time. Nothing for user to do here.', telegram: 'Bot sends 30-minute reminder before committed time. User confirms.' },
  },
  {
    key: 'D', label: 'D - Paused',
    annotation: { trigger: 'User proactively set a pause from Settings. No miss - deliberate rest.', app: 'Dashboard shows pause banner with end date. "I\'m back sooner" reveals intent split.', telegram: 'Bot is silent during pause. On pause end day, bot reaches out to welcome back.' },
  },
  {
    key: 'D_early', label: 'D - Back early',
    annotation: { trigger: 'User messages the bot "I\'m back" before the pause end date.', app: 'App resumes once bot logs the intent. Pause lifted automatically.', telegram: 'Bot asks if session is done or schedules nudge for later that day.' },
  },

];

// ── Demo state loader ─────────────────────────────────────────────────────────
const DEMO_STATES = [
  { key: 'checked_in',             label: '01 Checked In',  redirect: '/dashboard' },
  { key: 'missed_yesterday',       label: '02 Missed',      redirect: '/dashboard' },
  { key: 'on_pause',               label: '03 Paused',      redirect: '/dashboard' },
  { key: 'five_days',              label: '04 History',     redirect: '/dashboard' },
  { key: 'two_milestones_history', label: '05 Summary',     redirect: '/weekly' },
];

function loadDemoState(key: string, redirect: string) {
  const seed = DEMO_SEEDS[key];
  if (!seed) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  localStorage.setItem(DEV_MODE_KEY, 'demo');
  window.location.href = redirect;
}

function loadOriginal() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(DEV_MODE_KEY, 'original');
  window.location.href = '/';
}

// ── Hamburger menu ────────────────────────────────────────────────────────────
function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 10000, background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: '16px', height: '1.5px', background: '#9898BA', borderRadius: '2px' }} />)}
      </button>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)' }} />}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999, width: '240px', background: '#1A1A2E', borderLeft: '0.5px solid #32324A', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.2s ease', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '0.5px solid #32324A' }}>
          <div style={{ fontSize: '10px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px' }}>Older versions</div>
          <div style={{ fontSize: '11px', color: '#5A5A7A', lineHeight: '1.5' }}>Reference builds - not current product direction</div>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #32324A' }}>
          <div style={{ fontSize: '11px', color: '#9898BA', marginBottom: '8px', fontWeight: 500 }}>Original app</div>
          <button onClick={() => { setOpen(false); loadOriginal(); }} style={{ width: '100%', background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#F0ECE8', cursor: 'pointer', textAlign: 'left' }}>Open original</button>
        </div>
        <div style={{ padding: '12px 16px', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#9898BA', marginBottom: '8px', fontWeight: 500 }}>Demo states</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {DEMO_STATES.map(ds => (
              <button key={ds.key} onClick={() => { setOpen(false); loadDemoState(ds.key, ds.redirect); }} style={{ width: '100%', background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#F0ECE8', cursor: 'pointer', textAlign: 'left' }}>
                {ds.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '0.5px solid #32324A' }}>
          <button onClick={() => setOpen(false)} style={{ width: '100%', background: 'transparent', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px', fontSize: '11px', color: '#9898BA', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function Pill({ label, bg, color, dot }: { label: string; bg: string; color: string; dot: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: bg, borderRadius: '20px', padding: '4px 10px', marginBottom: '12px' }}>
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: dot }} />
      <span style={{ fontSize: '9px', fontWeight: 500, color }}>{label}</span>
    </div>
  );
}

function GoalLabel({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <div style={{ fontSize: '8px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#F0ECE8', marginBottom: '3px' }}>{sub}</div>
    </>
  );
}

function Card({ accent, children }: { accent: string; children: React.ReactNode }) {
  return <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderLeft: `2px solid ${accent}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' }}>{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '11px', fontWeight: 500, color: '#F0ECE8', marginBottom: '3px' }}>{children}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '9px', color: '#9898BA', lineHeight: '1.5', marginBottom: '8px' }}>{children}</div>;
}

function Btn({ bg, color, border, onClick, children }: { bg: string; color: string; border?: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} style={{ background: bg, color, border: border ?? 'none', borderRadius: '8px', padding: '8px 10px', fontSize: '10px', fontWeight: 500, textAlign: 'center', marginBottom: '5px', cursor: onClick ? 'pointer' : 'default' }}>
      {children}
    </div>
  );
}

function WeekGrid({ pattern }: { pattern: ('done' | 'miss' | 'today' | 'fut')[] }) {
  const labels = ['M','T','W','T','F','S','S'];
  const s = { done: { background: '#1A3028', color: '#5EC47A' }, miss: { background: '#3D1F1C', color: '#FF7B6B' }, today: { background: '#32324A', border: '0.5px solid #5EC47A', color: '#F0ECE8' }, fut: { background: '#22223A', color: '#32324A' } };
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
      {pattern.map((p, i) => <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 500, ...s[p] }}>{labels[i]}</div>)}
    </div>
  );
}

function Stats({ items }: { items: { num: string | number; label: string }[] }) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
      {items.map(({ num, label }) => (
        <div key={label} style={{ flex: 1, background: '#22223A', border: '0.5px solid #32324A', borderRadius: '6px', padding: '5px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#F0ECE8' }}>{num}</div>
          <div style={{ fontSize: '7px', color: '#9898BA', marginTop: '1px' }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Home screen ───────────────────────────────────────────────────────────────
function ScreenHome({ onGetStarted }: { onGetStarted: () => void }) {
  const FLOW_STEPS = [
    { icon: '✕', iconBg: '#3D1F1C', iconBorder: '#FF7B6B', iconColor: '#FF7B6B', title: 'You miss a session', sub: 'Life gets in the way - it happens' },
    { icon: '💬', iconBg: '#22223A', iconBorder: '#32324A', iconColor: '#9898BA', title: 'We reach out on Telegram', sub: 'no app to open, just reply' },
    { icon: '🔒', iconBg: '#22223A', iconBorder: '#32324A', iconColor: '#9898BA', title: 'You lock in a restart time', sub: 'specific, committed, no guilt' },
    { icon: '✓', iconBg: '#1A3028', iconBorder: '#5EC47A', iconColor: '#5EC47A', title: 'Back in one day, not three', sub: 'momentum restored' },
  ];
  return (
    <div style={{ padding: '14px 14px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '8px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px' }}>Momentum Buddy</div>
      <div style={{ fontSize: '15px', fontWeight: 500, color: '#F0ECE8', lineHeight: 1.3, marginBottom: '6px' }}>Missing a session is not the end. It is where we start.</div>
      <div style={{ fontSize: '10px', color: '#9898BA', lineHeight: 1.5, marginBottom: '14px' }}>We reach out, get you to commit to a restart time, and bring you back in one day.</div>
      {FLOW_STEPS.map((step, i) => (
        <div key={step.title}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step.iconBg, border: `1px solid ${step.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', color: step.iconColor, fontWeight: 600 }}>{step.icon}</div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#F0ECE8', lineHeight: 1.3 }}>{step.title}</div>
              <div style={{ fontSize: '9px', color: '#9898BA', marginTop: '1px' }}>{step.sub}</div>
            </div>
          </div>
          {i < FLOW_STEPS.length - 1 && <div style={{ width: '1px', height: '14px', background: '#32324A', marginLeft: '13px', marginTop: '2px', marginBottom: '2px' }} />}
        </div>
      ))}
      <div style={{ background: '#22223A', borderLeft: '2px solid #5EC47A', borderRadius: '0 8px 8px 0', padding: '8px 10px', margin: '12px 0' }}>
        <div style={{ fontSize: '10px', color: '#9898BA', fontStyle: 'italic', lineHeight: 1.5 }}>"I missed two days and then lost the whole week. Now I'm back the next morning."</div>
        <div style={{ fontSize: '8px', color: '#5A5A7A', marginTop: '3px' }}>Early user, preparing for a PM role switch</div>
      </div>
      <div onClick={onGetStarted} style={{ background: '#FF7B6B', color: '#fff', borderRadius: '10px', padding: '10px', fontSize: '11px', fontWeight: 500, textAlign: 'center', cursor: 'pointer', marginTop: 'auto' }}>
        Get started
      </div>
      <div style={{ fontSize: '9px', color: '#5A5A7A', textAlign: 'center', marginTop: '5px' }}>Takes 2 minutes. No credit card.</div>
    </div>
  );
}

// ── Setup screen (interactive 3 steps) ───────────────────────────────────────
function ScreenSetup() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('AI PM Certification');
  const [mins, setMins] = useState<number | null>(45);
  const [customMins, setCustomMins] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [timeBlock, setTimeBlock] = useState('21:00');
  const [exactTime, setExactTime] = useState('21:00');
  const [done, setDone] = useState(false);
  const [deadline, setDeadline] = useState<'Yes'|'No'>('No');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');

  const canProceed1 = goal.trim().length > 0
    && (mins !== null || (showCustom && parseInt(customMins) > 0))
    && deadline !== null
    && (deadline === 'No' || (deadline === 'Yes' && deadlineDate.length > 0));

  const canProceed2 = timeBlock !== null && telegramHandle.trim().length > 0;

  if (done) return (
    <div style={{ padding: '16px 14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Confirmation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1A3028', border: '1px solid #5EC47A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>✓</div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#F0ECE8' }}>You are set up</div>
          <div style={{ fontSize: '9px', color: '#9898BA' }}>{goal} - check-in at {exactTime} via Telegram</div>
        </div>
      </div>

      {/* Day 1 prediction card */}
      <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderLeft: '2px solid #FF7B6B', borderRadius: '10px', padding: '10px 12px' }}>
        <div style={{ fontSize: '8px', color: '#FF7B6B', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>What to expect</div>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#F0ECE8', marginBottom: '5px' }}>Most learners miss their first session within 5 days.</div>
        <div style={{ fontSize: '9px', color: '#9898BA', lineHeight: 1.6 }}>That is not failure - it is normal. When it happens, we will reach out and get you back on track the next day.</div>
      </div>

      {/* What happens next */}
      <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderLeft: '2px solid #5EC47A', borderRadius: '10px', padding: '10px 12px' }}>
        <div style={{ fontSize: '8px', color: '#5EC47A', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>Your north star</div>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#F0ECE8', marginBottom: '5px' }}>Recovery speed</div>
        <div style={{ fontSize: '9px', color: '#9898BA', lineHeight: 1.6 }}>We measure how fast you bounce back after a miss. The goal is not a perfect streak - it is getting back in one day instead of three.</div>
      </div>

      {/* Connect Telegram */}
      <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '10px', padding: '10px 12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 500, color: '#F0ECE8', marginBottom: '4px' }}>Connect Telegram to begin</div>
        <div style={{ fontSize: '9px', color: '#9898BA', marginBottom: '8px' }}>Search @MomentumBuddyNotifyBot and tap Start.</div>
        <div style={{ background: '#5EC47A', color: '#1A1A2E', borderRadius: '7px', padding: '8px', fontSize: '10px', fontWeight: 500, textAlign: 'center', cursor: 'pointer' }}>Open Telegram</div>
      </div>
      <div onClick={() => {}} style={{ fontSize: '9px', color: '#9898BA', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline' }}>I have connected the bot - go to dashboard</div>
    </div>
  );

  return (
    <div style={{ padding: '14px 14px 20px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {[1,2,3].map(s => <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? '#5EC47A' : '#32324A', transition: 'background 0.3s' }} />)}
      </div>

      {step === 1 && (
        <>
          <div style={{ fontSize: '9px', color: '#9898BA', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Step 1 of 3 - Your goal</div>
          <div style={{ fontSize: '10px', color: '#9898BA', marginBottom: '4px' }}>What are you working toward?</div>
          <input value={goal} onChange={e => setGoal(e.target.value)} style={{ width: '100%', background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#F0ECE8', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
          <div style={{ fontSize: '10px', color: '#9898BA', marginBottom: '6px' }}>How many minutes a day?</div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            {[30,45,60,90].map(m => (
              <div key={m} onClick={() => { setMins(m); setShowCustom(false); }} style={{ flex: 1, background: mins === m && !showCustom ? '#2A2A46' : '#22223A', border: mins === m && !showCustom ? '1px solid #5EC47A' : '0.5px solid #32324A', borderRadius: '6px', padding: '7px 4px', fontSize: '9px', textAlign: 'center', color: mins === m && !showCustom ? '#5EC47A' : '#9898BA', cursor: 'pointer' }}>{m}</div>
            ))}
            <div onClick={() => { setShowCustom(true); setMins(null); }} style={{ flex: 1, background: showCustom ? '#2A2A46' : '#22223A', border: showCustom ? '1px solid #5EC47A' : '0.5px solid #32324A', borderRadius: '6px', padding: '7px 4px', fontSize: '8px', textAlign: 'center', color: showCustom ? '#5EC47A' : '#9898BA', cursor: 'pointer' }}>custom</div>
          </div>
          {showCustom && <input type="number" value={customMins} onChange={e => setCustomMins(e.target.value)} placeholder="e.g. 20" style={{ width: '100%', background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '7px 10px', fontSize: '11px', color: '#F0ECE8', outline: 'none', marginBottom: '6px', boxSizing: 'border-box' }} />}
          <div style={{ fontSize: '10px', color: '#9898BA', marginBottom: '6px', marginTop: '6px' }}>Do you have a deadline?</div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {(['Yes','No'] as const).map(v => <div key={v} onClick={() => setDeadline(v)} style={{ flex: 1, background: deadline === v ? '#2A2A46' : '#22223A', border: deadline === v ? '1px solid #5EC47A' : '0.5px solid #32324A', borderRadius: '6px', padding: '8px', fontSize: '10px', textAlign: 'center', color: deadline === v ? '#5EC47A' : '#9898BA', cursor: 'pointer' }}>{v}</div>)}
          </div>
          {deadline === 'Yes' && (
            <input type="date" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} style={{ width: '100%', background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#F0ECE8', outline: 'none', marginBottom: '6px', colorScheme: 'dark', boxSizing: 'border-box' }} />
          )}
          <div onClick={() => canProceed1 && setStep(2)} style={{ background: canProceed1 ? '#5EC47A' : '#2A2A46', color: canProceed1 ? '#1A1A2E' : '#5A5A7A', borderRadius: '9px', padding: '9px', fontSize: '10px', fontWeight: 500, textAlign: 'center', cursor: canProceed1 ? 'pointer' : 'not-allowed' }}>Next</div>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: '9px', color: '#9898BA', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Step 2 of 3 - Check-in time</div>
          <div style={{ fontSize: '10px', color: '#9898BA', marginBottom: '6px' }}>When should we check in with you?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '8px' }}>
            {[{ l: 'Morning', s: '6-9 AM', v: '07:30' },{ l: 'Afternoon', s: '12-3 PM', v: '13:30' },{ l: 'Evening', s: '6-9 PM', v: '19:30' },{ l: 'Night', s: '9-11 PM', v: '21:00' }].map(t => (
              <div key={t.v} onClick={() => { setTimeBlock(t.v); setExactTime(t.v); }} style={{ background: timeBlock === t.v ? '#2A2A46' : '#22223A', border: timeBlock === t.v ? '1px solid #5EC47A' : '0.5px solid #32324A', borderRadius: '8px', padding: '8px 6px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '10px', fontWeight: 500, color: timeBlock === t.v ? '#5EC47A' : '#F0ECE8' }}>{t.l}</div>
                <div style={{ fontSize: '8px', color: '#9898BA' }}>{t.s}</div>
              </div>
            ))}
          </div>
          {timeBlock && (
            <>
              <div style={{ fontSize: '10px', color: '#9898BA', marginBottom: '4px' }}>What time exactly?</div>
              <input type="time" value={exactTime} onChange={e => setExactTime(e.target.value)} style={{ width: '100%', background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#F0ECE8', outline: 'none', marginBottom: '8px', colorScheme: 'dark', boxSizing: 'border-box' }} />
            </>
          )}
          <div style={{ fontSize: '10px', color: '#9898BA', marginBottom: '4px' }}>Your Telegram username</div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', overflow: 'hidden', marginBottom: '6px' }}>
            <span style={{ padding: '0 8px', fontSize: '11px', color: '#9898BA' }}>@</span>
            <input value={telegramHandle} onChange={e => setTelegramHandle(e.target.value.replace('@',''))} placeholder="username" style={{ flex: 1, background: 'transparent', border: 'none', padding: '8px 8px 8px 0', fontSize: '11px', color: '#F0ECE8', outline: 'none' }} />
          </div>
          <div style={{ fontSize: '9px', color: '#5A5A7A', marginBottom: '12px' }}>We check in via Telegram daily. Reply done to log your session.</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div onClick={() => setStep(1)} style={{ flex: '0 0 60px', background: 'transparent', border: '0.5px solid #32324A', borderRadius: '9px', padding: '9px', fontSize: '10px', color: '#9898BA', textAlign: 'center', cursor: 'pointer' }}>Back</div>
            <div onClick={() => canProceed2 && setStep(3)} style={{ flex: 1, background: canProceed2 ? '#5EC47A' : '#2A2A46', color: canProceed2 ? '#1A1A2E' : '#5A5A7A', borderRadius: '9px', padding: '9px', fontSize: '10px', fontWeight: 500, textAlign: 'center', cursor: canProceed2 ? 'pointer' : 'not-allowed' }}>Next</div>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div style={{ fontSize: '9px', color: '#9898BA', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Step 3 of 3 - Confirm</div>
          <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
            {[
              { l: 'Goal', v: goal || 'AI PM Certification' },
              { l: 'Daily', v: `${showCustom ? customMins : mins} min` },
              { l: 'Deadline', v: deadline === 'Yes' ? (deadlineDate || 'TBD') : 'None' },
              { l: 'Check-in', v: exactTime },
              { l: 'Telegram', v: telegramHandle ? '@' + telegramHandle : 'Not set' },
            ].map(({ l, v }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '0.5px solid #32324A' }}>
                <span style={{ fontSize: '9px', color: '#9898BA' }}>{l}</span>
                <span style={{ fontSize: '9px', color: '#F0ECE8', textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div onClick={() => setStep(2)} style={{ flex: '0 0 60px', background: 'transparent', border: '0.5px solid #32324A', borderRadius: '9px', padding: '9px', fontSize: '10px', color: '#9898BA', textAlign: 'center', cursor: 'pointer' }}>Back</div>
            <div onClick={() => setDone(true)} style={{ flex: 1, background: '#5EC47A', color: '#1A1A2E', borderRadius: '9px', padding: '9px', fontSize: '10px', fontWeight: 500, textAlign: 'center', cursor: 'pointer' }}>Let's go</div>
          </div>
        </>
      )}


    </div>
  );
}

// ── Recovery hero card ────────────────────────────────────────────────────────
function RecoveryCard({ avg, best, trend, note }: { avg: string; best: number; trend: string; note: string }) {
  return (
    <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px 10px', marginBottom: '8px' }}>
      <div style={{ fontSize: '8px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px' }}>Recovery speed</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '3px' }}>
        <span style={{ fontSize: '28px', fontWeight: 500, color: trend === 'improving' ? '#5EC47A' : '#F0ECE8', lineHeight: 1 }}>{avg}</span>
        <span style={{ fontSize: '9px', color: '#9898BA' }}>avg days to bounce back</span>
      </div>
      <div style={{ fontSize: '9px', color: '#9898BA', lineHeight: 1.5, marginBottom: '8px' }}>{note}</div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '24px', marginBottom: '3px' }}>
        {[2, 1.5, 1.8, 1, 1.2].map((v, i) => (
          <div key={i} style={{ flex: 1, background: i === 4 ? '#5EC47A' : '#32324A', borderRadius: '2px', height: `${(v / 2.2) * 100}%` }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '7px', color: '#5A5A7A' }}>Oldest (days)</span>
        <span style={{ fontSize: '7px', color: '#5EC47A' }}>5 misses tracked</span>
        <span style={{ fontSize: '7px', color: '#5A5A7A' }}>Most recent</span>
      </div>
    </div>
  );
}

// ── Pattern cards ─────────────────────────────────────────────────────────────
function PatternCards({ gap, fragile, best }: { gap: number; fragile: string; best: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginBottom: '8px' }}>
      {[
        { label: 'Longest gap', val: gap, sub: 'days', color: '#F0ECE8' },
        { label: 'Fragile day', val: fragile, sub: 'most misses', color: '#F0ECE8' },
        { label: 'Fastest back', val: best, sub: 'day', color: '#5EC47A' },
      ].map(({ label, val, sub, color }) => (
        <div key={label} style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '6px', padding: '5px 6px' }}>
          <div style={{ fontSize: '6px', color: '#9898BA', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color, lineHeight: 1 }}>{val}</div>
          <div style={{ fontSize: '7px', color: '#9898BA', marginTop: '2px' }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Pause confirm widget ──────────────────────────────────────────────────────
function PauseConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) return (
    <div style={{ background: '#2A2440', border: '0.5px solid #3D3560', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 500, color: '#B8A8E8', marginBottom: '2px' }}>Check-ins paused for {selected}</div>
      <div style={{ fontSize: '9px', color: '#8880AA' }}>We will reach out when your pause ends. Message "I'm back" anytime to resume early.</div>
    </div>
  );

  return (
    <div style={{ background: '#2A2440', border: '0.5px solid #3D3560', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' }}>
      <div style={{ fontSize: '11px', fontWeight: 500, color: '#B8A8E8', marginBottom: '3px' }}>Pause check-ins?</div>
      <div style={{ fontSize: '9px', color: '#8880AA', marginBottom: '8px' }}>How long do you need?</div>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
        {['3 days','1 week','2 weeks'].map(d => (
          <div key={d} onClick={() => setSelected(d)} style={{ flex: 1, background: selected === d ? '#3D3560' : '#22223A', border: selected === d ? '1px solid #B8A8E8' : '0.5px solid #3D3560', borderRadius: '6px', padding: '6px 4px', fontSize: '8px', color: selected === d ? '#B8A8E8' : '#8880AA', textAlign: 'center', cursor: 'pointer' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <div onClick={onCancel} style={{ flex: 1, fontSize: '9px', color: '#5A5A7A', textAlign: 'center', cursor: 'pointer', padding: '6px', border: '0.5px solid #32324A', borderRadius: '6px' }}>Cancel</div>
        <div onClick={() => selected && setConfirmed(true)} style={{ flex: 2, fontSize: '9px', fontWeight: 500, textAlign: 'center', cursor: selected ? 'pointer' : 'not-allowed', padding: '6px', borderRadius: '6px', background: selected ? '#B8A8E8' : '#32324A', color: selected ? '#1A1A2E' : '#5A5A7A' }}>
          {selected ? `Pause for ${selected}` : 'Select duration'}
        </div>
      </div>
    </div>
  );
}

// ── Shared dashboard chrome: three-dot menu + summary sheet ──────────────────
function DashboardChrome({ children, isPaused }: { children: React.ReactNode; isPaused?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryTab, setSummaryTab] = useState<'weekly'|'monthly'>('weekly');

  return (
    <div style={{ padding: '14px 14px 16px', position: 'relative' }}>

      {/* Three-dot menu trigger */}
      <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10 }}>
        <div onClick={() => setMenuOpen(o => !o)} style={{ cursor: 'pointer', fontSize: '14px', color: '#9898BA', letterSpacing: '1px', lineHeight: 1 }}>•••</div>
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
            <div style={{ position: 'absolute', top: '20px', right: 0, background: '#22223A', border: '0.5px solid #32324A', borderRadius: '10px', overflow: 'hidden', zIndex: 10, width: '150px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              <div onClick={() => { setMenuOpen(false); }} style={{ padding: '10px 12px', fontSize: '11px', color: '#F0ECE8', cursor: 'pointer', borderBottom: '0.5px solid #32324A' }}>✎ Edit milestone</div>
              {!isPaused && <div onClick={() => { setMenuOpen(false); setPaused(true); }} style={{ padding: '10px 12px', fontSize: '11px', color: '#F0ECE8', cursor: 'pointer', borderBottom: '0.5px solid #32324A' }}>⏸ Pause check-ins</div>}
              {isPaused && <div style={{ padding: '10px 12px', fontSize: '11px', color: '#9898BA', borderBottom: '0.5px solid #32324A' }}>⏸ Already paused</div>}
              <div onClick={() => { setMenuOpen(false); }} style={{ padding: '10px 12px', fontSize: '11px', color: '#9898BA', cursor: 'pointer', borderBottom: '0.5px solid #32324A' }}>✎ Edit Telegram ID</div>
              <div onClick={() => { setMenuOpen(false); }} style={{ padding: '10px 12px', fontSize: '11px', color: '#5EC47A', cursor: 'pointer' }}>+ Add milestone</div>
            </div>
          </>
        )}
      </div>

      {/* Pause confirmation */}
      {paused && (
        <PauseConfirm onCancel={() => setPaused(false)} onConfirm={() => setPaused(false)} />
      )}

      {children}

      {/* Summary button */}
      <div onClick={() => setSummaryOpen(true)} style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px 10px', fontSize: '9px', color: '#9898BA', textAlign: 'center', cursor: 'pointer', marginTop: '4px' }}>
        Summary
      </div>

      {/* Summary slide-up sheet */}
      {summaryOpen && (
        <>
          <div onClick={() => setSummaryOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 20, borderRadius: '28px' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#1A1A2E', border: '0.5px solid #32324A', borderRadius: '16px 16px 28px 28px', zIndex: 21, padding: '12px 14px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#F0ECE8' }}>Summary</div>
              <div onClick={() => setSummaryOpen(false)} style={{ fontSize: '16px', color: '#9898BA', cursor: 'pointer', lineHeight: 1 }}>×</div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {(['weekly','monthly'] as const).map(t => (
                <div key={t} onClick={() => setSummaryTab(t)} style={{ flex: 1, background: summaryTab === t ? '#2A2A46' : '#22223A', border: summaryTab === t ? '1px solid #5EC47A' : '0.5px solid #32324A', borderRadius: '6px', padding: '6px', fontSize: '10px', textAlign: 'center', color: summaryTab === t ? '#5EC47A' : '#9898BA', cursor: 'pointer', textTransform: 'capitalize' }}>{t}</div>
              ))}
            </div>
            {summaryTab === 'weekly' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                  {[{ n: '5', l: 'sessions this week' },{ n: '1', l: 'miss' },{ n: '1.2', l: 'avg recovery' }].map(s => (
                    <div key={s.l} style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 500, color: '#F0ECE8' }}>{s.n}</div>
                      <div style={{ fontSize: '8px', color: '#9898BA' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '8px', color: '#9898BA', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>This week</div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {['M','T','W','T','F','S','S'].map((d, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '7px', color: '#5A5A7A', marginBottom: '3px' }}>{d}</div>
                        <div style={{ height: '20px', borderRadius: '3px', background: [0,1,3,4].includes(i) ? '#5EC47A' : i === 2 ? '#FF7B6B' : '#32324A' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                  {[{ n: '19', l: 'sessions this month' },{ n: '3', l: 'misses' },{ n: '1.3', l: 'avg recovery' }].map(s => (
                    <div key={s.l} style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 500, color: '#F0ECE8' }}>{s.n}</div>
                      <div style={{ fontSize: '8px', color: '#9898BA' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '8px', color: '#9898BA', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>March consistency</div>
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '32px' }}>
                    {[4,3,5,4,5,3,4,5,4,2,4,5,4,3,5,4,5,4,3,5,4,4,5,3,4,5,4,3,4,5].map((v, i) => (
                      <div key={i} style={{ flex: 1, background: v >= 4 ? '#5EC47A' : v === 3 ? '#32324A' : '#FF7B6B', borderRadius: '1px', height: `${(v/5)*100}%` }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                    <span style={{ fontSize: '7px', color: '#5A5A7A' }}>Mar 1</span>
                    <span style={{ fontSize: '7px', color: '#5A5A7A' }}>Mar 30</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── State A ───────────────────────────────────────────────────────────────────
function ScreenA() {
  const [hasData] = useState(true); // toggle to false to see Day 1 state
  return (
    <DashboardChrome>
      <Pill label="On track" bg="#1A3028" color="#5EC47A" dot="#5EC47A" />
      <GoalLabel title="AI PM Certification" sub="You showed up today" />
      <WeekGrid pattern={['done','done','miss','done','done','fut','fut']} />
      {hasData ? (
        <>
          <RecoveryCard avg="1.2" best={1} trend="improving" note="Your recent recoveries are getting faster. Personal best is 1 day." />
          <PatternCards gap={3} fragile="Wed" best={1} />
          <Stats items={[{ num: 12, label: 'sessions logged' }]} />
        </>
      ) : (
        <>
          <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderLeft: '2px solid #5EC47A', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
            <div style={{ fontSize: '9px', color: '#5EC47A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>You showed up</div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#F0ECE8', marginBottom: '4px' }}>Session 1 logged.</div>
            <div style={{ fontSize: '9px', color: '#9898BA', lineHeight: 1.6 }}>Your recovery speed card unlocks after your first miss and return. Keep going - the data builds over time.</div>
          </div>
          <Stats items={[{ num: 1, label: 'sessions logged' }]} />
        </>
      )}
    </DashboardChrome>
  );
}

// ── State A not done ──────────────────────────────────────────────────────────
function ScreenANotDone() {
  return (
    <DashboardChrome>
      <Pill label="Missed - restart committed" bg="#3D1F1C" color="#FF7B6B" dot="#FF7B6B" />
      <GoalLabel title="AI PM Certification" sub="Coming back tomorrow" />
      <div style={{ fontSize: '9px', color: '#9898BA', marginBottom: '12px' }}>Committed via Telegram tonight</div>
      <Card accent="#FF7B6B">
        <CardTitle>Restart locked in</CardTitle>
        <CardBody>You replied "not done" tonight and committed to coming back tomorrow at 9 PM. Nothing to do right now.</CardBody>
      </Card>
      <WeekGrid pattern={['done','done','done','done','miss','today','fut']} />
      <RecoveryCard avg="1.2" best={1} trend="neutral" note="Recovery clock starts now. Last time you were back in 1 day." />
      <PatternCards gap={3} fragile="Wed" best={1} />
      <Stats items={[{ num: 12, label: 'sessions logged' }]} />
    </DashboardChrome>
  );
}

// ── State B ───────────────────────────────────────────────────────────────────
function ScreenB() {
  return (
    <DashboardChrome>
      <Pill label="Missed yesterday" bg="#3D1F1C" color="#FF7B6B" dot="#FF7B6B" />
      <GoalLabel title="AI PM Certification" sub="When are you coming back?" />
      <div style={{ fontSize: '9px', color: '#9898BA', marginBottom: '12px' }}>No reply to yesterday's check-in.</div>
      <Card accent="#FF7B6B">
        <CardTitle>Plan your restart</CardTitle>
        <CardBody>A specific time makes follow-through 3x more likely.</CardBody>
        <div style={{ background: '#3D1F1C', border: '0.5px solid #FF7B6B', borderRadius: '8px', padding: '8px 10px', fontSize: '9px', color: '#FF7B6B', textAlign: 'center', lineHeight: 1.5 }}>
          Reply to your Telegram message with a restart time.<br />e.g. tomorrow 9pm
        </div>
      </Card>
      <WeekGrid pattern={['done','done','done','done','miss','today','fut']} />
      <RecoveryCard avg="1.4" best={1} trend="neutral" note="Average time to bounce back after a miss. Your best is 1 day." />
      <PatternCards gap={3} fragile="Wed" best={1} />
      <Stats items={[{ num: 11, label: 'sessions logged' }]} />
    </DashboardChrome>
  );
}

// ── State C ───────────────────────────────────────────────────────────────────
function ScreenC() {
  return (
    <DashboardChrome>
      <Pill label="Restart tonight" bg="#1A3028" color="#5EC47A" dot="#5EC47A" />
      <GoalLabel title="AI PM Certification" sub="You're coming back tonight" />
      <div style={{ fontSize: '9px', color: '#9898BA', marginBottom: '12px' }}>Session locked in for 9 PM</div>
      <Card accent="#5EC47A">
        <CardTitle>30 min until your session</CardTitle>
        <CardBody>We will check in on Telegram at 9 PM. Nothing to do right now.</CardBody>
      </Card>
      <RecoveryCard avg="1.4" best={1} trend="neutral" note="You committed to coming back tonight. Recovery clock starts now." />
      <PatternCards gap={3} fragile="Wed" best={1} />
      <Stats items={[{ num: 11, label: 'sessions logged' }]} />
    </DashboardChrome>
  );
}

// ── State D ───────────────────────────────────────────────────────────────────
function ScreenD({ onEarlyResume }: { onEarlyResume: () => void }) {
  const [intent, setIntent] = useState<'idle'|'asking'|'later'>('idle');
  return (
    <DashboardChrome isPaused>
      <Pill label="Paused" bg="#2A2440" color="#B8A8E8" dot="#7A6E9B" />
      <GoalLabel title="AI PM Certification" sub="Taking a break" />
      <div style={{ fontSize: '9px', color: '#9898BA', marginBottom: '12px' }}>Paused until Sunday. Resumes automatically.</div>
      <div style={{ background: '#2A2440', border: '0.5px solid #3D3560', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#B8A8E8', marginBottom: '3px' }}>Pause ends Sunday</div>
        <div style={{ fontSize: '9px', color: '#8880AA', lineHeight: '1.5' }}>We will reach out when your pause ends.</div>
      </div>
      {intent === 'idle' && <div onClick={() => setIntent('asking')} style={{ background: 'transparent', border: '0.5px solid #3D3560', borderRadius: '8px', padding: '8px', fontSize: '9px', color: '#8880AA', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' }}>I'm back sooner</div>}
      {intent === 'asking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          <div style={{ fontSize: '9px', color: '#9898BA', marginBottom: '2px' }}>Did you already get your session in?</div>
          <div onClick={onEarlyResume} style={{ background: '#5EC47A', color: '#1A1A2E', borderRadius: '8px', padding: '8px', fontSize: '9px', fontWeight: 500, textAlign: 'center', cursor: 'pointer' }}>Yes - log it now</div>
          <div onClick={() => setIntent('later')} style={{ background: 'transparent', border: '0.5px solid #32324A', borderRadius: '8px', padding: '8px', fontSize: '9px', color: '#9898BA', textAlign: 'center', cursor: 'pointer' }}>Not yet - nudge me later</div>
        </div>
      )}
      {intent === 'later' && <div style={{ fontSize: '9px', color: '#9898BA', lineHeight: '1.5', padding: '8px 0', marginBottom: '10px' }}>Got it - we will nudge you before your usual check-in time today.</div>}
      <RecoveryCard avg="1.2" best={1} trend="neutral" note="Your history while you rest. Recovery tracking resumes when you return." />
      <PatternCards gap={3} fragile="Wed" best={1} />
      <Stats items={[{ num: 11, label: 'sessions logged' }]} />
    </DashboardChrome>
  );
}

// ── State D early ─────────────────────────────────────────────────────────────
function ScreenDEarly() {
  return (
    <DashboardChrome>
      <Pill label="Resuming early" bg="#2A2440" color="#B8A8E8" dot="#5EC47A" />
      <GoalLabel title="AI PM Certification" sub="Back sooner than planned" />
      <div style={{ fontSize: '9px', color: '#9898BA', marginBottom: '12px' }}>You messaged "I'm back" on Telegram.</div>
      <Card accent="#5EC47A">
        <CardTitle>Pause lifted</CardTitle>
        <CardBody>Check-ins resume from today. We will nudge you at your usual time tonight.</CardBody>
      </Card>
      <RecoveryCard avg="1.2" best={1} trend="improving" note="Back early - that is a good sign. Your avg recovery is improving." />
      <PatternCards gap={4} fragile="Mon" best={1} />
      <Stats items={[{ num: 11, label: 'sessions logged' }]} />
    </DashboardChrome>
  );
}

// ── Multi ─────────────────────────────────────────────────────────────────────
function ScreenMulti() {
  const [active, setActive] = useState(0);
  return (
    <div style={{ padding: '14px 14px 20px' }}>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '12px' }}>
        {['AI PM Cert', 'Portfolio'].map((t, i) => (
          <div key={t} onClick={() => setActive(i)} style={{ flex: 1, padding: '5px 6px', borderRadius: '6px', fontSize: '8px', textAlign: 'center', border: active === i ? '0.5px solid #5EC47A' : '0.5px solid #32324A', background: active === i ? '#2A2A46' : '#22223A', color: active === i ? '#5EC47A' : '#9898BA', cursor: 'pointer' }}>{t}</div>
        ))}
        <div style={{ flex: '0 0 auto', padding: '5px 8px', borderRadius: '6px', fontSize: '8px', textAlign: 'center', border: '0.5px solid #32324A', background: '#22223A', color: '#5EC47A' }}>+ Add</div>
      </div>
      <Pill label="On track" bg="#1A3028" color="#5EC47A" dot="#5EC47A" />
      <GoalLabel title={active === 0 ? 'AI PM Certification' : 'Portfolio project'} sub="You showed up today" />
      <WeekGrid pattern={['done','done','miss','done','done','fut','fut']} />
      <Card accent="#5EC47A">
        <CardTitle>Across both milestones</CardTitle>
        <CardBody>23 sessions - avg recovery 1.1 days - best streak 8</CardBody>
      </Card>
      <RecoveryCard avg="1.1" best={1} trend="improving" note="Across both milestones. Best streak is 8 days." />
      <PatternCards gap={2} fragile="Fri" best={1} />
      <Stats items={[{ num: 23, label: 'sessions logged' }]} />
    </div>
  );
}

// ── Phone shell ───────────────────────────────────────────────────────────────
function AppScreen({ stateKey, onNavigate }: { stateKey: string; onNavigate: (key: string) => void }) {
  const screens: Record<string, React.ReactNode> = {
    home: <ScreenHome onGetStarted={() => onNavigate('setup')} />,
    setup: <ScreenSetup />,
    A: <ScreenA />,
    A_notdone: <ScreenANotDone />,
    B: <ScreenB />,
    C: <ScreenC />,
    D: <ScreenD onEarlyResume={() => onNavigate('D_early')} />,
    D_early: <ScreenDEarly />,
    multi: <ScreenMulti />,  // kept for reference, tab removed from nav
  };
  return (
    <div style={{ background: '#1A1A2E', border: '0.5px solid #32324A', borderRadius: '28px', overflow: 'hidden', width: '220px', height: '480px', display: 'flex', flexDirection: 'column', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '8px 14px 2px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '8px', color: '#5A5A7A' }}>9:00 PM</span>
        <span style={{ fontSize: '8px', color: '#5A5A7A' }}>●●●</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>{screens[stateKey]}</div>
    </div>
  );
}

// ── Annotation ────────────────────────────────────────────────────────────────
function Annotation({ data }: { data: { trigger: string; app: string; telegram: string } }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '16px 48px', borderTop: '0.5px solid #32324A', background: '#131320' }}>
      {[
        { label: 'What triggered this', text: data.trigger, color: '#9898BA' },
        { label: 'What the app shows', text: data.app, color: '#5EC47A' },
        { label: 'What Telegram does', text: data.telegram, color: '#FF7B6B' },
      ].map(({ label, text, color }) => (
        <div key={label}>
          <div style={{ fontSize: '9px', fontWeight: 500, color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>{label}</div>
          <div style={{ fontSize: '11px', color: '#9898BA', lineHeight: '1.6' }}>{text}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────
export default function DashboardV2Layout() {
  const [activeState, setActiveState] = useState('home');
  const current = STATES.find(s => s.key === activeState)!;

  return (
    <>
      <HamburgerMenu />
      <div style={{ fontFamily: 'system-ui, sans-serif', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw', background: '#1A1A2E' }}>

        {/* Header */}
        <div style={{ padding: '14px 48px 10px', borderBottom: '0.5px solid #32324A' }}>
          <div style={{ fontSize: '11px', color: '#5EC47A', fontWeight: 500, marginBottom: '2px' }}>Momentum Buddy - Product Direction</div>
          <div style={{ fontSize: '11px', color: '#5A5A7A' }}>Bot-first interaction model - App as insight layer - Telegram as daily surface</div>
        </div>

        {/* State nav */}
        <div style={{ display: 'flex', gap: '6px', padding: '10px 48px', borderBottom: '0.5px solid #32324A', overflowX: 'auto', background: '#1A1A2E' }}>
          {STATES.map(s => (
            <button key={s.key} onClick={() => setActiveState(s.key)} style={{ flexShrink: 0, fontSize: '11px', fontWeight: 500, padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', border: activeState === s.key ? '1px solid #5EC47A' : '1px solid #32324A', background: activeState === s.key ? '#2A2A46' : '#22223A', color: activeState === s.key ? '#5EC47A' : '#9898BA', whiteSpace: 'nowrap' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Split screen */}
        <div style={{ display: 'flex', gap: '48px', padding: '32px 48px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto', minHeight: 'unset' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase' }}>App</div>
            <AppScreen stateKey={activeState} onNavigate={setActiveState} />
          </div>
          <div style={{ flexShrink: 0, position: 'sticky', top: '60px' }}>
            <TelegramSimulator stateKey={activeState} />
          </div>
        </div>

        <Annotation data={current.annotation} />
      </div>
    </>
  );
}
