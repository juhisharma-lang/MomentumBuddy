import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'momentum_buddy_state';
// ── Date helpers ──────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0];
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ── Seed data factories ───────────────────────────────────

const BASE_MILESTONE = {
  id: 'demo-milestone-1',
  status: 'active' as const,
  createdAt: daysAgo(10),
  goalTitle: 'Complete AI PM Certification',
  goalType: 'certification' as const,
  deadlineType: 'fixed' as const,
  deadline: daysFromNow(45),
  dailyMinutes: 60,
  startTime: '08:00',
  checkinTime: '21:00',
  channelType: 'telegram' as const,
  telegramHandle: '@demobeta',
  activatedAt: daysAgo(10),
};

const SEEDS: Record<string, object> = {

  // 1 — Fresh start: no onboarding done yet
  fresh: {
    milestones: [],
    activeMilestoneId: null,
    logs: [],
    commitments: [],
    pauses: [],
    achievements: [],
    feedback: [],
    onboarded: false,
  },

  // 2 — Checked in today: State A, today logged complete
  checked_in: {
    milestones: [BASE_MILESTONE],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
      { milestoneId: 'demo-milestone-1', date: daysAgo(4), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(3), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(2), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(1), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: today(), completed: true, fallbackTriggered: false },
    ],
    commitments: [],
    pauses: [],
    achievements: [],
    feedback: [],
    onboarded: true,
  },

  // 3 — Missed yesterday: State B — re-entry prompt visible
  missed_yesterday: {
    milestones: [BASE_MILESTONE],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
      { milestoneId: 'demo-milestone-1', date: daysAgo(4), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(3), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(2), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(1), completed: false, fallbackTriggered: false },
    ],
    commitments: [],
    pauses: [],
    achievements: [],
    feedback: [],
    onboarded: true,
  },

  // 4 — On pause: State D — active pause covering today
  on_pause: {
    milestones: [BASE_MILESTONE],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
      { milestoneId: 'demo-milestone-1', date: daysAgo(5), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(4), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(3), completed: true, fallbackTriggered: false },
    ],
    commitments: [],
    pauses: [
      {
        milestoneId: 'demo-milestone-1',
        pausedFrom: daysAgo(2),
        pausedUntil: daysFromNow(3),
      }
    ],
    achievements: [],
    feedback: [],
    onboarded: true,
  },

  // 5 — Two milestones: one active, one placeholder
  two_milestones: {
    milestones: [
      BASE_MILESTONE,
      {
        id: 'demo-milestone-2',
        status: 'placeholder' as const,
        createdAt: daysAgo(2),
        goalTitle: 'Build side project portfolio',
        goalType: 'skill_building' as const,
        deadline: daysFromNow(90),
      }
    ],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
      { milestoneId: 'demo-milestone-1', date: daysAgo(3), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(2), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(1), completed: true, fallbackTriggered: false },
    ],
    commitments: [],
    pauses: [],
    achievements: [],
    feedback: [],
    onboarded: true,
  },

  // 6 — 5 days of history: 3 done, 2 misses, metrics visible
  five_days: {
    milestones: [{ ...BASE_MILESTONE, createdAt: daysAgo(7), activatedAt: daysAgo(7) }],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
  { milestoneId: 'demo-milestone-1', date: daysAgo(5), completed: true, fallbackTriggered: false },
  { milestoneId: 'demo-milestone-1', date: daysAgo(4), completed: false, fallbackTriggered: false },
  { milestoneId: 'demo-milestone-1', date: daysAgo(3), completed: true, fallbackTriggered: false },
  { milestoneId: 'demo-milestone-1', date: daysAgo(2), completed: false, fallbackTriggered: false },
  { milestoneId: 'demo-milestone-1', date: daysAgo(1), completed: true, fallbackTriggered: false },
],
    commitments: [],
    pauses: [],
    achievements: [],
    feedback: [
      { id: 'fb-1', milestoneId: 'demo-milestone-1', rating: 4, dayNumber: 7, recordedAt: daysAgo(1) }
    ],
    onboarded: true,
  },
};

// ── UI config ─────────────────────────────────────────────

const STATES = [
  {
    key: 'fresh',
    label: 'Fresh Start',
    description: 'No data — lands on the welcome screen. Use this to demo onboarding.',
    tag: 'State: New user',
    redirectTo: '/',
    color: '#7A9E87',
    number: '01',
  },
  {
    key: 'checked_in',
    label: 'Just Checked In',
    description: 'Today already logged. Dashboard in resting state — nothing left to do today.',
    tag: 'State: A (normal)',
    redirectTo: '/dashboard',
    color: '#5E8C70',
    number: '02',
  },
  {
    key: 'missed_yesterday',
    label: 'Missed Yesterday',
    description: 'Yesterday was a miss. Re-entry prompt is visible. Use to demo recovery flow.',
    tag: 'State: B (missed)',
    redirectTo: '/dashboard',
    color: '#C47A5A',
    number: '03',
  },
  {
    key: 'on_pause',
    label: 'On a Pause',
    description: 'Active pause covering today and the next 3 days. Pause banner visible.',
    tag: 'State: D (paused)',
    redirectTo: '/dashboard',
    color: '#9B8EA0',
    number: '04',
  },
  {
    key: 'two_milestones',
    label: 'Two Milestones',
    description: 'One active milestone, one placeholder queued up. Shows multi-milestone view.',
    tag: 'State: Multi-goal',
    redirectTo: '/dashboard',
    color: '#7A8FA0',
    number: '05',
  },
  {
    key: 'five_days',
    label: '5 Days of History',
    description: '3 check-ins, 2 misses, pulse feedback recorded. Metrics and pattern cards visible.',
    tag: 'State: With data',
    redirectTo: '/dashboard',
    color: '#B85C38',
    number: '06',
  },
];

export default function DemoLauncher() {
  const navigate = useNavigate();

function loadState(key: string, redirectTo: string) {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEEDS[key]));
  window.location.href = redirectTo;
}
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF8F4',
      fontFamily: "'DM Sans', sans-serif",
      padding: '0',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #E2DDD5',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'baseline',
        gap: '12px',
        background: '#FAF8F4',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: '#3A3028' }}>
          Momentum Buddy
        </span>
        <span style={{ color: '#B5AFA6', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Demo Launcher
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5E8C70' }} />
          <span style={{ fontSize: '12px', color: '#5E8C70', letterSpacing: '0.05em' }}>LOCAL ONLY</span>
        </div>
      </div>

      {/* Intro */}
      <div style={{ padding: '40px 32px 24px', maxWidth: '720px' }}>
        <p style={{ fontSize: '14px', color: '#6B5C4C', lineHeight: 1.7, margin: 0 }}>
          Click any state to instantly load it. The app will open with that data already in place —
          no waiting, no setup. To switch states mid-demo, come back here and click a different one.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        padding: '0 32px 48px',
        maxWidth: '1000px',
      }}>
        {STATES.map((s) => (
          <button
            key={s.key}
            onClick={() => loadState(s.key, s.redirectTo)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2DDD5',
              borderRadius: '16px',
              padding: '28px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = s.color;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${s.color}22`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2DDD5';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            {/* Number watermark */}
            <span style={{
              position: 'absolute',
              top: '16px',
              right: '20px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#E2DDD5',
              letterSpacing: '0.05em',
            }}>
              {s.number}
            </span>

            {/* Colour dot + tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: s.color, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
                {s.tag}
              </span>
            </div>

            {/* Label */}
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#3A3028',
              lineHeight: 1.2,
            }}>
              {s.label}
            </div>

            {/* Description */}
            <p style={{
              fontSize: '13px',
              color: '#6B5C4C',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {s.description}
            </p>

            {/* CTA */}
            <div style={{
              marginTop: '4px',
              fontSize: '12px',
              color: s.color,
              fontWeight: 600,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              Load this state →
            </div>
          </button>
        ))}
      </div>

      {/* Footer tip */}
      <div style={{
        padding: '20px 32px',
        borderTop: '1px solid #E2DDD5',
        fontSize: '12px',
        color: '#B5AFA6',
      }}>
        Tip: keep this tab open alongside the app tab during your demo. Switch states in seconds without touching the terminal.
      </div>
    </div>
  );
}
