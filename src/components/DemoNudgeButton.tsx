import { useState } from 'react';
import { sendTelegramNudge } from '@/lib/telegram';

const NUDGES = [
  { label: 'Session reminder (30m)', message: '⏰ Your AI PM Certification block starts in 30 minutes. Ready to show up?' },
  { label: 'Session reminder (now)', message: '🟢 It\'s your AI PM Certification time. Your session starts now — even 20 minutes counts.' },
  { label: 'Missed — no plan', message: '👋 You missed yesterday\'s session and haven\'t planned a restart yet. When are you coming back? Open the app to lock in a time.' },
  { label: 'Commitment reminder', message: '🔔 You committed to restarting your AI PM Certification session in 30 minutes. You\'ve got this.' },
  { label: 'Pause expired', message: '🌱 Your pause just ended. Welcome back — today\'s a fresh start. Open the app to check in.' },
  { label: 'Deadline approaching', message: '📅 Your AI PM Certification deadline is in 7 days. You\'ve got this — one session at a time.' },
];

export default function DemoNudgeButton() {
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  async function trigger(nudge: typeof NUDGES[0]) {
    setSending(nudge.label);
    const ok = await sendTelegramNudge(nudge.message);
    setSending(null);
    if (ok) {
      setSent(nudge.label);
      setTimeout(() => setSent(null), 3000);
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 items-end">
      {NUDGES.map(n => (
        <button
          key={n.label}
          onClick={() => trigger(n)}
          disabled={!!sending}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary transition-all shadow-sm disabled:opacity-50"
        >
          {sending === n.label ? 'Sending...' : sent === n.label ? '✓ Sent' : `📲 ${n.label}`}
        </button>
      ))}
    </div>
  );
}
