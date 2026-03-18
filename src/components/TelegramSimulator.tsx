import { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  from: 'bot' | 'user';
  text: string;
  delay: number;
  accent?: 'green' | 'terra' | 'purple';
};

const SCRIPTS: Record<string, Message[]> = {
  home: [],
  setup: [
    { id: 1, from: 'bot', text: 'Welcome to Momentum Buddy.\n\nAI PM Certification - check-in at 9 PM.\n\nI will reach out tonight. Reply done when you finish your session.', delay: 600, accent: 'green' },
  ],
  A: [
    { id: 1, from: 'bot', text: 'It\'s 9 PM — did you get your AI PM Certification session in today?\n\nReply done if yes, or not done if you missed.', delay: 600, accent: 'green' },
    { id: 2, from: 'user', text: 'done', delay: 2200 },
    { id: 3, from: 'bot', text: 'Logged ✓  See you tomorrow.', delay: 900, accent: 'green' },
  ],
  A_notdone: [
    { id: 1, from: 'bot', text: 'It\'s 9 PM — did you get your AI PM Certification session in today?\n\nReply done if yes, or not done if you missed.', delay: 600, accent: 'green' },
    { id: 2, from: 'user', text: 'not done', delay: 2200 },
    { id: 3, from: 'bot', text: 'No worries — these things happen.\n\nWhen are you coming back? Reply with a time.\n\ne.g. tomorrow 9pm', delay: 900, accent: 'terra' },
    { id: 4, from: 'user', text: 'tomorrow 9pm', delay: 2400 },
    { id: 5, from: 'bot', text: 'Locked in. I will check in tomorrow at 8:30 PM.\n\nYou\'ve got this.', delay: 800, accent: 'terra' },
  ],
  B: [
    { id: 1, from: 'bot', text: 'You missed yesterday\'s session and haven\'t planned a restart yet.\n\nWhen are you coming back? Reply with a time.\n\ne.g. tomorrow 9pm', delay: 600, accent: 'terra' },
    { id: 2, from: 'user', text: 'tomorrow 9pm', delay: 2800 },
    { id: 3, from: 'bot', text: 'Locked in. I will check in tomorrow at 8:30 PM.\n\nYou\'ve got this.', delay: 900, accent: 'terra' },
  ],
  C: [
    { id: 1, from: 'bot', text: 'You committed to restarting tonight at 9 PM — that\'s 30 minutes away.\n\nReady?', delay: 600, accent: 'green' },
    { id: 2, from: 'user', text: 'yes', delay: 1800 },
    { id: 3, from: 'bot', text: 'I will check back at 9 PM. You\'ve got this.', delay: 800, accent: 'green' },
  ],
  D_set: [
    { id: 1, from: 'bot', text: 'Check-ins paused until Sunday.\n\nIf you are back sooner, just message me "I\'m back" and I will pick up from there.', delay: 600, accent: 'purple' },
  ],
  D: [
    { id: 1, from: 'bot', text: 'Your pause ended today. Welcome back — no pressure.\n\nReady to restart? Reply yes and I will check in tonight at your usual time.', delay: 600, accent: 'purple' },
    { id: 2, from: 'user', text: 'yes', delay: 2400 },
    { id: 3, from: 'bot', text: 'Back in. See you tonight at 9 PM.', delay: 800, accent: 'purple' },
  ],
  D_early: [
    { id: 1, from: 'bot', text: 'Your pause runs until Sunday.\n\nStill paused - I will reach out when it ends.', delay: 600, accent: 'purple' },
    { id: 2, from: 'user', text: 'I\'m back', delay: 2400 },
    { id: 3, from: 'bot', text: 'Back sooner - did you already get your session in today?', delay: 800, accent: 'purple' },
    { id: 4, from: 'user', text: 'not yet', delay: 1800 },
    { id: 5, from: 'bot', text: 'Got it - I will check in with you tonight at your usual time.', delay: 800, accent: 'purple' },
  ],
  multi: [
    { id: 1, from: 'bot', text: 'Portfolio project — it\'s 7 PM.\n\nDid you get your session in? Reply done.', delay: 600, accent: 'green' },
    { id: 2, from: 'user', text: 'done', delay: 2000 },
    { id: 3, from: 'bot', text: 'Logged ✓', delay: 700, accent: 'green' },
    { id: 4, from: 'bot', text: 'AI PM Certification — it\'s 9 PM.\n\nDid you get your session in? Reply done.', delay: 1400, accent: 'purple' },
    { id: 5, from: 'user', text: 'done both', delay: 2200 },
    { id: 6, from: 'bot', text: 'Both logged ✓  Solid day.', delay: 800, accent: 'green' },
  ],
};

const ACCENT_COLOR = { green: '#5EC47A', terra: '#FF7B6B', purple: '#7A6E9B' };

export default function TelegramSimulator({ stateKey }: { stateKey: string }) {
  // D state shows the "pause set" message (with I'm back tip), not the expiry message
  const scriptKey = stateKey === 'D' ? 'D_set' : stateKey;
  const script = SCRIPTS[scriptKey] ?? SCRIPTS['A'];
  const isEmpty = script.length === 0;
  const [visibleCount, setVisibleCount] = useState(0);
  const [replaying, setReplaying] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  function runAnimation(messages: Message[]) {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setVisibleCount(0);
    let cumulative = 500;
    messages.forEach((_, i) => {
      cumulative += messages[i].delay;
      const t = setTimeout(() => setVisibleCount(i + 1), cumulative);
      timeouts.current.push(t);
    });
  }

  useEffect(() => {
    runAnimation(script);
    return () => timeouts.current.forEach(clearTimeout);
  }, [scriptKey]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [visibleCount]);

  function replay() {
    setReplaying(true);
    runAnimation(script);
    setTimeout(() => setReplaying(false), 500);
  }

  return (
    <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '9px', color: '#9898BA', letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: 'center' }}>
        Telegram
      </div>
      <div style={{ background: '#1A1A2E', border: '0.5px solid #32324A', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px 2px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '8px', color: '#5A5A7A' }}>9:00 PM</span>
          <span style={{ fontSize: '8px', color: '#5A5A7A' }}>●●●</span>
        </div>
        <div style={{ background: '#22223A', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '0.5px solid #32324A' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2A2A46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#5EC47A', fontSize: '8px', fontWeight: 500 }}>MB</span>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#F0ECE8' }}>Momentum Buddy</div>
            <div style={{ fontSize: '9px', color: '#9898BA' }}>bot</div>
          </div>
        </div>
        <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '6px', height: '300px', maxHeight: '300px', background: '#131328', overflowY: 'auto' }}>
          {isEmpty ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.5, padding: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#22223A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>💬</div>
              <div style={{ fontSize: '10px', color: '#9898BA', textAlign: 'center', lineHeight: 1.5 }}>Telegram connects after setup. This is where daily check-ins happen.</div>
            </div>
          ) : (
            <>
              {script.slice(0, visibleCount).map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.3s ease' }}>
                  <div style={{
                    maxWidth: '88%', padding: '7px 10px', borderRadius: '12px',
                    fontSize: '10px', lineHeight: '1.6', whiteSpace: 'pre-line',
                    ...(msg.from === 'bot' ? {
                      background: '#22223A', border: '0.5px solid #32324A',
                      borderLeft: msg.accent ? `2px solid ${ACCENT_COLOR[msg.accent]}` : '0.5px solid #32324A',
                      color: '#F0ECE8', borderBottomLeftRadius: '3px',
                    } : {
                      background: '#2A2A46', color: '#F0ECE8', borderBottomRightRadius: '3px',
                    }),
                  }}>
                    {msg.text}
                  </div>
                  {msg.from === 'user' && <span style={{ fontSize: '8px', color: '#5EC47A', marginTop: '1px' }}>✓✓</span>}
                </div>
              ))}
              {visibleCount < script.length && visibleCount > 0 && script[visibleCount]?.from === 'bot' && (
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ background: '#22223A', border: '0.5px solid #32324A', borderRadius: '12px', borderBottomLeftRadius: '3px', padding: '8px 12px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#5A5A7A', animation: `bounce 1s ease ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ background: '#22223A', borderTop: '0.5px solid #32324A', padding: '8px 12px', display: 'flex', justifyContent: 'center', minHeight: '36px' }}>
          {!isEmpty && (
            <button onClick={replay} style={{ fontSize: '10px', color: replaying ? '#5A5A7A' : '#5EC47A', background: 'transparent', border: '0.5px solid #32324A', borderRadius: '20px', padding: '4px 14px', cursor: 'pointer' }}>
              {replaying ? 'Replaying...' : 'Replay'}
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}
