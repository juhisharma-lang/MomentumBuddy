import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'momentum_buddy_state';

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

const BASE_MILESTONE = {
  id: 'demo-milestone-1',
  status: 'active' as const,
  createdAt: daysAgo(14),
  goalTitle: 'Complete AI PM Certification',
  goalType: 'certification' as const,
  deadlineType: 'fixed' as const,
  deadline: daysFromNow(44),
  dailyMinutes: 60,
  startTime: '08:00',
  checkinTime: '21:00',
  channelType: 'telegram' as const,
  telegramHandle: '@demobeta',
  activatedAt: daysAgo(14),
};

const SEEDS: Record<string, object> = {

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
      },
    ],
    achievements: [],
    feedback: [],
    onboarded: true,
  },

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
      },
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

  five_days: {
    milestones: [{ ...BASE_MILESTONE, createdAt: daysAgo(14), activatedAt: daysAgo(14) }],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
      { milestoneId: 'demo-milestone-1', date: daysAgo(9), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(8), completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(7), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(6), completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(5), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(3), completed: true, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(2), completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(1), completed: true, fallbackTriggered: false },
    ],
    commitments: [],
    pauses: [],
    achievements: [],
    feedback: [
      { id: 'fb-1', milestoneId: 'demo-milestone-1', rating: 4, dayNumber: 7, recordedAt: daysAgo(3) },
    ],
    onboarded: true,
  },
};

const STATES = [
  {
    key: 'fresh',
    label: 'Fresh Start',
    description: 'No data — lands on the welcome screen. Use this to demo onboarding.',
    tag: 'New user',
    redirectTo: '/',
    color: '#7A9E87',
    number: '01',
  },
  {
    key: 'checked_in',
    label: 'Just Checked In',
    description: 'Today already logged. Dashboard in resting state — nothing left to do today.',
    tag: 'State A',
    redirectTo: '/dashboard',
    color: '#5E8C70',
    number: '02',
  },
  {
    key: 'missed_yesterday',
    label: 'Missed Yesterday',
    description: 'Yesterday was a miss. Re-entry prompt is visible. Use to demo recovery flow.',
    tag: 'State B',
    redirectTo: '/dashboard',
    color: '#C47A5A',
    number: '03',
  },
  {
    key: 'on_pause',
    label: 'On a Pause',
    description: 'Active pause covering today and the next 3 days. Pause banner visible.',
    tag: 'State D',
    redirectTo: '/dashboard',
    color: '#9B8EA0',
    number: '04',
  },
  {
    key: 'two_milestones',
    label: 'Two Milestones',
    description: 'One active milestone, one placeholder queued up. Shows multi-milestone view.',
    tag: 'Multi-goal',
    redirectTo: '/dashboard',
    color: '#7A8FA0',
    number: '05',
  },
  {
    key: 'five_days',
    label: '5 Days of History',
    description: 'Multiple miss-recovery cycles, pulse feedback recorded. All metrics cards populated.',
    tag: 'With data',
    redirectTo: '/dashboard',
    color: '#B85C38',
    number: '06',
  },
];

export default function DemoLauncher() {
  const _navigate = useNavigate();

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
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: '#F0ECE8' }}>
          Momentum Buddy
        </span>
        <span style={{ color: '#B5AFA6', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
          Demo Launcher
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5E8C70' }} />
          <span style={{ fontSize: '12px', color: '#5E8C70', letterSpacing: '0.05em' }}>LOCAL ONLY</span>
        </div>
      </div>

      <div style={{ padding: '40px 32px 24px', maxWidth: '720px' }}>
        <p style={{ fontSize: '14px', color: '#6B5C4C', lineHeight: 1.7, margin: 0 }}>
          Click any state to instantly load it. The app will open with that data already in place.
          To switch states mid-demo, come back here and click a different one.
        </p>
      </div>

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
              flexDirection: 'column' as const,
              gap: '12px',
              position: 'relative' as const,
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
            <span style={{
              position: 'absolute' as const,
              top: '16px',
              right: '20px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#E2DDD5',
              letterSpacing: '0.05em',
            }}>
              {s.number}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: s.color, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' as const }}>
                {s.tag}
              </span>
            </div>

            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#F0ECE8',
              lineHeight: 1.2,
            }}>
              {s.label}
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6B5C4C',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {s.description}
            </p>

            <div style={{
              marginTop: '4px',
              fontSize: '12px',
              color: s.color,
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              Load this state →
            </div>
          </button>
        ))}
      </div>

      <div style={{
        padding: '20px 32px',
        borderTop: '1px solid #E2DDD5',
        fontSize: '12px',
        color: '#B5AFA6',
      }}>
        Tip: keep this tab open alongside the app tab during your demo. Switch states in seconds.
      </div>
    </div>
  );
}
