import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { getDashboardState } from '@/types/app';

const today = new Date().toISOString().split('T')[0];

function getWeekDays() {
  const days = [];
  const dow = ['M','T','W','T','F','S','S'];
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({ label: dow[i], date: d.toISOString().split('T')[0] });
  }
  return days;
}

export default function DashboardV2() {
  const navigate = useNavigate();
  const {
    activeMilestone,
    activeLogs,
    activeCommitments,
    activePauses,
    milestones,
    setActiveMilestoneId,
    activeMilestoneId,
    addLog,
    addCommitment,
  } = useApp();

  const [resumeIntent, setResumeIntent] = useState<'idle' | 'asking' | 'later'>('idle');

  if (!activeMilestone) return null;

  const dashState = getDashboardState(
    activeLogs, activeCommitments, activePauses,
    activeMilestone.id, today
  );

  const weekDays = getWeekDays();
  const totalSessions = activeLogs.filter(l => l.completed).length;
  const misses = activeLogs.filter(l => !l.completed);
  const recoveries = misses.map(m => {
    const after = activeLogs.find(l => l.completed && l.date > m.date);
    if (!after) return null;
    const diff = (new Date(after.date).getTime() - new Date(m.date).getTime()) / 86400000;
    return diff;
  }).filter(Boolean) as number[];
  const avgRecovery = recoveries.length
    ? (recoveries.reduce((a, b) => a + b, 0) / recoveries.length).toFixed(1)
    : '—';
  const rate = activeLogs.length
    ? Math.round((totalSessions / activeLogs.length) * 100)
    : 0;

  const activeMilestones = milestones.filter(m => m.status === 'active');

  // ── State helpers ──────────────────────────────────────────────────────────
  function getDayStatus(date: string): 'done' | 'miss' | 'today' | 'future' | 'paused' {
    if (date > today) return 'future';
    if (date === today) return 'today';
    const log = activeLogs.find(l => l.date === date);
    if (!log) return 'future';
    return log.completed ? 'done' : 'miss';
  }

  function handleCheckIn() {
    addLog({ date: today, completed: true, fallbackTriggered: false });
  }

  function handleMiss() {
    addLog({ date: today, completed: false, fallbackTriggered: false });
  }

  // ── Pill config ────────────────────────────────────────────────────────────
  const pillConfig = {
    A: { label: 'On track',         bg: '#1A3028', color: '#5EC47A', dot: '#5EC47A' },
    B: { label: 'Missed yesterday', bg: '#3D1F1C', color: '#FF7B6B', dot: '#FF7B6B' },
    C: { label: 'Restart locked in',bg: '#1A3028', color: '#5EC47A', dot: '#5EC47A' },
    D: { label: 'Paused',           bg: '#2A2440', color: '#B8A8E8', dot: '#7A6E9B' },
  }[dashState];

  return (
    <div style={{ padding: '16px 16px 100px', maxWidth: '430px', margin: '0 auto' }}>

      {/* ── Milestone tabs (multi) ── */}
      {activeMilestones.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto' }}>
          {activeMilestones.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMilestoneId(m.id)}
              style={{
                flexShrink: 0,
                fontSize: '11px',
                fontWeight: 500,
                padding: '5px 12px',
                borderRadius: '8px',
                border: m.id === activeMilestoneId
                  ? '1px solid #5EC47A'
                  : '1px solid #32324A',
                background: m.id === activeMilestoneId ? '#2A2A46' : '#22223A',
                color: m.id === activeMilestoneId ? '#5EC47A' : '#9898BA',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {m.goalTitle.length > 18 ? m.goalTitle.slice(0, 18) + '…' : m.goalTitle}
            </button>
          ))}
          <button
            onClick={() => navigate('/onboarding?new=1')}
            style={{ flexShrink: 0, fontSize: '11px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #32324A', background: 'transparent', color: '#5EC47A', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Add goal
          </button>
          <button
            onClick={() => navigate('/onboarding?edit=1')}
            style={{ flexShrink: 0, fontSize: '11px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #32324A', background: 'transparent', color: '#9898BA', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ✎ Edit
          </button>
        </div>
      )}

      {/* ── Single milestone — show edit + add inline ── */}
      {activeMilestones.length === 1 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          <button
            onClick={() => navigate('/onboarding?new=1')}
            style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #32324A', background: 'transparent', color: '#5EC47A', cursor: 'pointer' }}
          >
            + Add goal
          </button>
          <button
            onClick={() => navigate('/onboarding?edit=1')}
            style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #32324A', background: 'transparent', color: '#9898BA', cursor: 'pointer' }}
          >
            ✎ Edit milestone
          </button>
        </div>
      )}

      {/* ── State pill ── */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: pillConfig.bg, borderRadius: '20px',
        padding: '4px 12px', marginBottom: '12px',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: pillConfig.dot }} />
        <span style={{ fontSize: '11px', fontWeight: 500, color: pillConfig.color }}>
          {pillConfig.label}
        </span>
      </div>

      {/* ── Goal name + sub ── */}
      <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '3px' }}>
        {activeMilestone.goalTitle}
      </div>

      {/* ── State card ── */}
      {dashState === 'A' && (
        <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderLeft: '2px solid #5EC47A', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#F0ECE8', marginBottom: '4px' }}>
            {activeLogs.find(l => l.date === today && l.completed)
              ? 'You showed up today'
              : 'Ready to check in?'}
          </div>
          <div style={{ fontSize: '11px', color: '#9898BA', marginBottom: '12px' }}>
            {totalSessions} sessions in · {activeMilestone.dailyMinutes} min/day
          </div>
          {!activeLogs.find(l => l.date === today) && (
            <>
              <button onClick={handleCheckIn} style={{ width: '100%', background: '#5EC47A', color: '#1A1A2E', border: 'none', borderRadius: '9px', padding: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', marginBottom: '6px' }}>
                Yes, I showed up today
              </button>
              <button onClick={handleMiss} style={{ width: '100%', background: 'transparent', color: '#9898BA', border: '0.5px solid #32324A', borderRadius: '9px', padding: '10px', fontSize: '12px', cursor: 'pointer' }}>
                Missed today — plan tomorrow
              </button>
            </>
          )}
        </div>
      )}

      {dashState === 'B' && (
        <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderLeft: '2px solid #FF7B6B', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#F0ECE8', marginBottom: '4px' }}>When are you coming back?</div>
          <div style={{ fontSize: '11px', color: '#9898BA', marginBottom: '12px', lineHeight: '1.5' }}>
            Yesterday was a miss. A specific restart time makes follow-through 3× more likely.
          </div>
          <button style={{ width: '100%', background: '#FF7B6B', color: '#fff', border: 'none', borderRadius: '9px', padding: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', marginBottom: '6px' }}>
            Lock in a restart time
          </button>
          <div style={{ fontSize: '10px', color: '#5A5A7A', textAlign: 'center' }}>
            Or reply to your Telegram message
          </div>
        </div>
      )}

      {dashState === 'C' && (
        <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderLeft: '2px solid #5EC47A', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#F0ECE8', marginBottom: '4px' }}>Restart locked in</div>
          <div style={{ fontSize: '11px', color: '#9898BA', marginBottom: '8px' }}>
            We'll check in on Telegram at your committed time. Nothing to do right now.
          </div>
        </div>
      )}

      {dashState === 'D' && (
        <div style={{ background: '#2A2440', border: '0.5px solid #3D3560', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#B8A8E8', marginBottom: '4px' }}>Taking a break</div>
          <div style={{ fontSize: '11px', color: '#8880AA', marginBottom: '12px', lineHeight: '1.5' }}>
            Paused until {activePauses[0]?.pausedUntil ?? '—'}. Resumes automatically.
          </div>
          {resumeIntent === 'idle' && (
            <button
              onClick={() => setResumeIntent('asking')}
              style={{ width: '100%', background: 'transparent', color: '#8880AA', border: '1px solid #3D3560', borderRadius: '9px', padding: '9px', fontSize: '11px', cursor: 'pointer' }}
            >
              I'm back sooner
            </button>
          )}
          {resumeIntent === 'asking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: '#8880AA', marginBottom: '2px' }}>Did you already get your session in?</div>
              <button
                onClick={() => navigate('/checkin')}
                style={{ width: '100%', background: '#5EC47A', color: '#1A1A2E', border: 'none', borderRadius: '9px', padding: '9px', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}
              >
                Yes — log it now
              </button>
              <button
                onClick={() => setResumeIntent('later')}
                style={{ width: '100%', background: 'transparent', color: '#8880AA', border: '1px solid #3D3560', borderRadius: '9px', padding: '9px', fontSize: '11px', cursor: 'pointer' }}
              >
                Not yet — nudge me later
              </button>
            </div>
          )}
          {resumeIntent === 'later' && (
            <div style={{ fontSize: '11px', color: '#8880AA', lineHeight: '1.5' }}>
              Got it — we will nudge you before your usual check-in time today.
            </div>
          )}
        </div>
      )}

      {/* ── Week grid ── */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '16px' }}>
        {weekDays.map(({ label, date }) => {
          const status = getDayStatus(date);
          const styles: Record<string, React.CSSProperties> = {
            done:   { background: '#1A3028', color: '#5EC47A' },
            miss:   { background: '#3D1F1C', color: '#FF7B6B' },
            today:  { background: '#32324A', border: '1px solid #5EC47A', color: '#F0ECE8' },
            future: { background: '#22223A', color: '#32324A' },
            paused: { background: '#2A2440', color: '#7A6E9B' },
          };
          return (
            <div key={date} style={{
              flex: 1, aspectRatio: '1', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 500,
              ...styles[status],
            }}>
              {label}
            </div>
          );
        })}
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { num: totalSessions, label: 'sessions' },
          { num: avgRecovery,   label: 'avg recovery' },
          { num: `${rate}%`,    label: 'rate' },
        ].map(({ num, label }) => (
          <div key={label} style={{
            flex: 1, background: '#22223A', border: '0.5px solid #32324A',
            borderRadius: '10px', padding: '10px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#F0ECE8' }}>{num}</div>
            <div style={{ fontSize: '9px', color: '#9898BA', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
