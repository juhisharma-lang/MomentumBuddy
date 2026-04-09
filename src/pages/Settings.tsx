import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { format, addDays } from 'date-fns';
import { ArrowLeft, PauseCircle, BellOff, Check, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { queuePauseExpiredNudge } from '@/lib/nudgeQueue';
import PoweredByFooter from '@/components/PoweredByFooter';

const PAUSE_OPTIONS = [
  { label: '2 days', days: 2 },
  { label: '3 days', days: 3 },
  { label: '5 days', days: 5 },
  { label: '1 week', days: 7 },
];

export default function Settings() {
  const navigate = useNavigate();
  const { activeMilestone: goal, activePauses: pauses, addPause, completeMilestone } = useApp();

  const [pauseDays, setPauseDays] = useState<number | null>(null);
  const [pauseConfirmed, setPauseConfirmed] = useState(false);

  if (!goal) { navigate('/onboarding'); return null; }

  const today = format(new Date(), 'yyyy-MM-dd');
  const activePause = pauses.find(p => p.pausedFrom <= today && p.pausedUntil >= today);

  const handlePause = () => {
    if (!pauseDays) return;
    const until = format(addDays(new Date(), pauseDays), 'yyyy-MM-dd');
    addPause({ pausedFrom: today, pausedUntil: until });
    queuePauseExpiredNudge(goal, until);
    setPauseConfirmed(true);
  };

  const resumeDate = activePause
    ? format(new Date(activePause.pausedUntil), 'EEEE, MMMM d')
    : pauseDays ? format(addDays(new Date(), pauseDays), 'EEEE, MMMM d') : null;

  return (
    <div className="relative bg-background flex flex-col min-h-[100dvh]">
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 py-8">

        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Pause check-ins</h1>
        </div>

        <Card className="p-5 mb-8">
          {pauseConfirmed || activePause ? (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <BellOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5">Check-ins paused</p>
                <p className="text-sm text-foreground/70">Resuming {resumeDate || 'soon'}</p>
                <p className="text-xs text-muted-foreground mt-2">You can still check in early from the dashboard.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-5">
                <PauseCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-0.5">Taking a break?</p>
                  <p className="text-sm text-foreground/70">Pause check-in reminders. Your goal stays active - resume any time.</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-5">
                {PAUSE_OPTIONS.map(opt => (
                  <button
                    key={opt.days}
                    onClick={() => setPauseDays(opt.days)}
                    className={cn(
                      "py-3 rounded-lg border-2 text-sm font-medium transition-all",
                      pauseDays === opt.days
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/30"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {pauseDays && resumeDate && (
                <p className="text-xs text-foreground/70 mb-4">
                  Check-ins resume on <span className="font-medium text-foreground">{resumeDate}</span>.
                </p>
              )}

              <Button className="w-full" disabled={!pauseDays} onClick={handlePause}>
                Pause check-ins <Check className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}
        </Card>

        {/* ── Mark as complete ── */}
        <Card className="p-5 mb-8 border-border">
          <div className="flex items-start gap-3 mb-5">
            <Trophy className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-0.5">Reached your goal?</p>
              <p className="text-sm text-foreground/70">Mark this milestone as complete and see your full summary.</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/5"
            onClick={() => {
              completeMilestone(goal.id);
              navigate(`/complete?id=${goal.id}`);
            }}
          >
            Mark as complete <Trophy className="w-4 h-4 ml-1.5" />
          </Button>
        </Card>

        <PoweredByFooter />
      </div>
      </div>
    </div>
  );
}
