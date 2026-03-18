// ── DemoSeeds.ts ─────────────────────────────────────────────────────────────
// Single source of truth for all demo state seeds.
// Used by both DevModeBar (inline toggle) and DemoLauncher (/demo page).
// ─────────────────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

const today = new Date().toISOString().split('T')[0];

const BASE_MILESTONE = {
  id: 'demo-milestone-1',
  status: 'active' as const,
  goalTitle: 'AI PM Certification',
  goalType: 'certification' as const,
  deadlineType: 'fixed' as const,
  deadline: daysFromNow(45),
  dailyMinutes: 45,
  startTime: '21:00',
  checkinTime: '22:00',
  channelType: 'telegram' as const,
  telegramHandle: '@demo_user',
  createdAt: daysAgo(20),
  activatedAt: daysAgo(20),
};

// ── Seed data ─────────────────────────────────────────────────────────────────

export const DEMO_SEEDS: Record<string, object> = {


  checked_in: {
    milestones: [BASE_MILESTONE],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
      { milestoneId: 'demo-milestone-1', date: daysAgo(4), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(3), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(2), completed: false, fallbackTriggered: true  },
      { milestoneId: 'demo-milestone-1', date: daysAgo(1), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: today,      completed: true,  fallbackTriggered: false },
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
      { milestoneId: 'demo-milestone-1', date: daysAgo(4), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(3), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(2), completed: true,  fallbackTriggered: false },
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
        pausedFrom: today,
        pausedUntil: daysFromNow(3),
      },
    ],
    achievements: [],
    feedback: [],
    onboarded: true,
  },


  five_days: {
    milestones: [BASE_MILESTONE],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
      { milestoneId: 'demo-milestone-1', date: daysAgo(13), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(12), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(11), completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(10), completed: false, fallbackTriggered: true  },
      { milestoneId: 'demo-milestone-1', date: daysAgo(9),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(8),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(7),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(6),  completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(5),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(4),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(3),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(2),  completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(1),  completed: true,  fallbackTriggered: false },
    ],
    commitments: [],
    pauses: [],
    achievements: [],
    feedback: [
      { id: 'fb-1', milestoneId: 'demo-milestone-1', rating: 4, note: 'Good week overall', recordedAt: daysAgo(7) },
      { id: 'fb-2', milestoneId: 'demo-milestone-1', rating: 3, note: 'Struggled mid week',  recordedAt: daysAgo(7) },
    ],
    onboarded: true,
  },

  two_milestones_history: {
    milestones: [
      BASE_MILESTONE,
      {
        id: 'demo-milestone-2',
        status: 'active' as const,
        goalTitle: 'Build side project portfolio',
        goalType: 'skill_building' as const,
        deadlineType: 'fixed' as const,
        deadline: daysFromNow(60),
        dailyMinutes: 45,
        startTime: '19:00',
        checkinTime: '22:00',
        channelType: 'telegram' as const,
        telegramHandle: '@demo_user',
        createdAt: daysAgo(10),
        activatedAt: daysAgo(10),
      },
    ],
    activeMilestoneId: 'demo-milestone-1',
    logs: [
      // milestone 1 — 18 days, mix of hits and misses
      { milestoneId: 'demo-milestone-1', date: daysAgo(18), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(17), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(16), completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(15), completed: false, fallbackTriggered: true  },
      { milestoneId: 'demo-milestone-1', date: daysAgo(14), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(13), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(12), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(11), completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(10), completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(9),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(8),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(7),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(6),  completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(5),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(4),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(3),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(2),  completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-1', date: daysAgo(1),  completed: true,  fallbackTriggered: false },
      // milestone 2 — 9 days
      { milestoneId: 'demo-milestone-2', date: daysAgo(9),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-2', date: daysAgo(8),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-2', date: daysAgo(7),  completed: false, fallbackTriggered: false },
      { milestoneId: 'demo-milestone-2', date: daysAgo(6),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-2', date: daysAgo(5),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-2', date: daysAgo(4),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-2', date: daysAgo(3),  completed: false, fallbackTriggered: true  },
      { milestoneId: 'demo-milestone-2', date: daysAgo(2),  completed: true,  fallbackTriggered: false },
      { milestoneId: 'demo-milestone-2', date: daysAgo(1),  completed: true,  fallbackTriggered: false },
    ],
    commitments: [],
    pauses: [],
    achievements: [],
    feedback: [
      { id: 'fb-1', milestoneId: 'demo-milestone-1', rating: 4, note: '', recordedAt: daysAgo(7) },
      { id: 'fb-2', milestoneId: 'demo-milestone-1', rating: 3, note: '', recordedAt: daysAgo(7) },
    ],
    onboarded: true,
  },
};