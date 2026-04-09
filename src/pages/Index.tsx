import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useDevMode } from '@/components/DevModeBar';
import PoweredByFooter from '@/components/PoweredByFooter';
import { ArrowRight } from 'lucide-react';

const HERO_BODY = 'Most tools assume you showed up. We are built for what happens when you did not.';
const QUOTE = '\u201cI\u2019d miss two days and then lose the whole week. Now I\u2019m back the next morning.\u201d';

const FLOW_STEPS = [
  {
    icon: '✕',
    iconBg: '#3D1F1C',
    iconBorder: '#FF7B6B',
    iconColor: '#FF7B6B',
    title: 'You miss a session',
    sub: 'Life gets in the way - it happens',
  },
  {
    icon: '💬',
    iconBg: '#22223A',
    iconBorder: '#32324A',
    iconColor: '#9898BA',
    title: 'We reach out',
    sub: 'via Telegram or email',
  },
  {
    icon: '🔒',
    iconBg: '#22223A',
    iconBorder: '#32324A',
    iconColor: '#9898BA',
    title: 'You lock in a restart time',
    sub: 'specific, committed, no guilt',
  },
  {
    icon: '✓',
    iconBg: '#1A3028',
    iconBorder: '#5EC47A',
    iconColor: '#5EC47A',
    title: 'Back in one day, not three',
    sub: 'momentum restored',
  },
];

export default function Index() {
  const navigate = useNavigate();
  const { onboarded } = useApp();
  const devMode = useDevMode();

  useEffect(() => {
    if (devMode === 'newui') navigate('/dashboard', { replace: true });
    else if (onboarded) navigate('/dashboard', { replace: true });
  }, [onboarded, navigate, devMode]);

  if (onboarded || devMode === 'newui') return null;

  return (
    <div className="relative bg-background flex flex-col min-h-[100dvh] overflow-hidden">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-5 pt-12 pb-36">

          {/* Hero */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-light mb-3">
              Momentum Buddy
            </p>
            <h1
              className="text-[26px] font-bold leading-tight mb-3 text-foreground"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}
            >
              The learning app built for when life gets in the way.
            </h1>
            <p className="text-foreground/65 text-[14px] leading-relaxed">{HERO_BODY}</p>
          </div>

          {/* Flow diagram */}
          <div className="mb-8">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.title}>
                {/* Step row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Icon circle */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: step.iconBg,
                    border: `1px solid ${step.iconBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '13px', color: step.iconColor, fontWeight: 600,
                  }}>
                    {step.icon}
                  </div>
                  {/* Text */}
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 500, color: '#F0ECE8', lineHeight: 1.3 }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9898BA', marginTop: '1px' }}>
                      {step.sub}
                    </div>
                  </div>
                </div>

                {/* Connector line between steps */}
                {i < FLOW_STEPS.length - 1 && (
                  <div style={{
                    width: '1px', height: '28px',
                    background: '#32324A',
                    marginLeft: '17px',
                    marginTop: '2px', marginBottom: '2px',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Quote */}
          <div
            className="rounded-2xl px-4 py-3.5 mb-2"
            style={{ background: '#22223A', borderLeft: '2px solid #5EC47A' }}
          >
            <p className="text-[15px] text-foreground/70 italic leading-relaxed">{QUOTE}</p>
            <p className="text-[11px] text-foreground/40 mt-1.5 tracking-wide">
              - Early user, preparing for a PM role switch
            </p>
          </div>

        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-6 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/onboarding')}
            style={{
              width: '100%',
              background: '#FF7B6B',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            Get started <ArrowRight size={16} />
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-2.5 font-light">
            Takes 2 minutes to set up. No credit card.
          </p>
          <PoweredByFooter />
        </div>
      </div>

    </div>
  );
}
