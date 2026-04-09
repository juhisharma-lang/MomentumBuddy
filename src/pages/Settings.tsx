import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { format, addDays } from 'date-fns';
import { ArrowLeft, BellOff, Trophy } from 'lucide-react';
import { queuePauseExpiredNudge } from '@/lib/nudgeQueue';
import { syncScheduleToSW } from '@/lib/notifications';

const PAUSE_OPTIONS = [
  { label: '2 days', days: 2 },
  { label: '3 days', days: 3 },
  { label: '5 days', days: 5 },
  { label: '1 week', days: 7 },
];

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS: Record<string, string> = {
  Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S',
};

export default function Settings() {
  const navigate = useNavigate();
  const { activeMilestone, activePauses, activeLogs, addPause, completeMilestone, updateMilestone } = useApp();

  const [pauseDays, setPauseDays] = useState<number | null>(null);
  const [pauseConfirmed, setPauseConfirmed] = useState(false);

  const [studyDays, setStudyDays] = useState<string[]>(
    activeMilestone?.studyDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  );
  const [studyDaysSaved, setStudyDaysSaved] = useState(false);

  if (!activeMilestone) {
    navigate('/welcome');
    return null;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const activePause = activePauses.find(p => p.pausedFrom <= today && p.pausedUntil >= today);

  function handlePause() {
    if (!pauseDays) return;
    const until = format(addDays(new Date(), pauseDays), 'yyyy-MM-dd');
    addPause({ pausedFrom: today, pausedUntil: until });
    queuePauseExpiredNudge(activeMilestone, until);
    setPauseConfirmed(true);
  }

  function toggleDay(day: string) {
    setStudyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
    setStudyDaysSaved(false);
  }

  function handleSaveStudyDays() {
    if (studyDays.length === 0) return;
    updateMilestone(activeMilestone.id, { studyDays });
    // Sync updated schedule to SW
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    syncScheduleToSW({
      reminderTime: activeMilestone.notifReminderTime ?? '07:00 PM',
      checkinTime: activeMilestone.notifCheckinTime ?? '09:00 PM',
      studyDays,
      todayLogged: !!activeLogs.find(l => l.date === todayStr && l.completed),
      missedYesterday: !!activeLogs.find(l => l.date === yesterdayStr && !l.completed),
      missStreak: 0,
    });
    setStudyDaysSaved(true);
  }

  const resumeDate = activePause
    ? format(new Date(activePause.pausedUntil), 'EEEE, MMMM d')
    : pauseDays ? format(addDays(new Date(), pauseDays), 'EEEE, MMMM d') : null;

  return (
    <div className="h-screen bg-m3-bg font-jakarta flex flex-col overflow-hidden">
      <header className="flex-shrink-0 flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => navigate('/dashboard-v3')}
          className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4 text-on-surface" />
        </button>
        <h1 className="text-base font-black text-on-surface">Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">

        {/* Study days */}
        <section className="bg-surface-container rounded-bento p-5 mb-3">
          <h2 className="text-sm font-black text-on-surface mb-1">Study days</h2>
          <p className="text-xs text-on-surface-variant mb-4">
            Change which days you plan to study. Nudges will update automatically.
          </p>
          <div className="flex gap-1.5 mb-4">
            {ALL_DAYS.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`flex-1 h-10 rounded-bento font-jakarta font-bold text-sm transition-all duration-200 ${
                  studyDays.includes(day)
                    ? 'bg-[#a63c2a] text-[#fff7f6]'
                    : 'bg-surface-container-lowest text-on-surface-variant'
                }`}
              >
                {DAY_LABELS[day]}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-on-surface-variant mb-4">
            {studyDays.length} days selected
          </p>
          {studyDaysSaved ? (
            <div className="w-full py-3 rounded-full bg-[#4ade80]/15 border border-[#16a34a]/30 flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-[#16a34a]">Study days updated</span>
            </div>
          ) : (
            <button
              onClick={handleSaveStudyDays}
              disabled={studyDays.length === 0}
              className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-3 font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              Save study days
            </button>
          )}
        </section>

        {/* Pause check-ins */}
        <section className="bg-surface-container rounded-bento p-5 mb-3">
          <h2 className="text-sm font-black text-on-surface mb-1">Pause check-ins</h2>
          <p className="text-xs text-on-surface-variant mb-4">
            Taking a break? Pause reminders - your journey stays active.
          </p>

          {pauseConfirmed || activePause ? (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-surface-container-lowest rounded-bento flex items-center justify-center flex-shrink-0">
                <BellOff className="w-4 h-4 text-on-surface-variant" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Check-ins paused</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Resuming {resumeDate ?? 'soon'}</p>
                <p className="text-xs text-on-surface-variant mt-1 opacity-70">You can still check in early from the dashboard.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap mb-4">
                {PAUSE_OPTIONS.map(opt => (
                  <button
                    key={opt.days}
                    onClick={() => setPauseDays(opt.days)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      pauseDays === opt.days
                        ? 'bg-[#a63c2a] text-[#fff7f6]'
                        : 'bg-surface-container-lowest text-on-surface-variant'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {pauseDays && resumeDate && (
                <p className="text-xs text-on-surface-variant mb-4">
                  Resumes on <span className="font-bold text-on-surface">{resumeDate}</span>.
                </p>
              )}
              <button
                onClick={handlePause}
                disabled={!pauseDays}
                className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-3 font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                Pause check-ins
              </button>
            </>
          )}
        </section>

        {/* Mark complete */}
        <section className="bg-surface-container rounded-bento p-5 mb-3">
          <h2 className="text-sm font-black text-on-surface mb-1">Reached your goal?</h2>
          <p className="text-xs text-on-surface-variant mb-4">
            Mark this milestone as complete and see your full summary.
          </p>
          <button
            onClick={() => {
              completeMilestone(activeMilestone.id);
              navigate(`/complete?id=${activeMilestone.id}`);
            }}
            className="w-full py-3 rounded-full border border-[#a63c2a]/40 text-[#a63c2a] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Trophy className="w-4 h-4" />
            Mark as complete
          </button>
        </section>

      </main>
    </div>
  );
}