import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw, ShieldOff, CalendarCheck, Briefcase } from 'lucide-react';
import PoweredByFooter from '@/components/PoweredByFooter';

// Strings with apostrophes kept in JS constants — never in JSX text nodes
const CALLOUTS = [
  {
    icon: <RotateCcw className="w-4 h-4" />,
    title: 'Back in one day, not three',
    desc: 'When life interrupts, we help you lock in a concrete restart — not a vague "I\'ll try again soon."',
  },
  {
    icon: <ShieldOff className="w-4 h-4" />,
    title: 'No streaks. No guilt.',
    desc: 'We track how fast you recover, not how perfect your record looks. Missing a day is not failure — staying gone is.',
  },
  {
    icon: <CalendarCheck className="w-4 h-4" />,
    title: 'A plan you actually commit to',
    desc: 'Each restart is a specific time, a specific duration. Not a reminder. A decision you have already made.',
  },
  {
    icon: <Briefcase className="w-4 h-4" />,
    title: 'Built for milestone learners',
    desc: 'Job switches. Certifications. Promotions. Built for people with real deadlines and unpredictable days.',
  },
];

const HERO_BODY = 'Most tools assume you showed up. We are built for what happens when you did not.';
const QUOTE = '\u201cI\u2019d miss two days and then lose the whole week. Now I\u2019m back the next morning.\u201d';

export default function Index() {
  const navigate = useNavigate();
  const { onboarded } = useApp();

  useEffect(() => {
    if (onboarded) navigate('/dashboard', { replace: true });
  }, [onboarded, navigate]);

  if (onboarded) return null;

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

          {/* Callouts */}
          <div className="space-y-2.5 mb-8">
            {CALLOUTS.map(c => (
              <div
                key={c.title}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-border bg-card"
              >
                <span className="mt-0.5 p-1.5 rounded-lg bg-background text-muted-foreground shrink-0">
                  {c.icon}
                </span>
                <div>
                  <p
                    className="text-[14px] font-semibold mb-0.5 text-foreground leading-snug"
                    style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.01em' }}
                  >
                    {c.title}
                  </p>
                  <p className="text-[13px] text-foreground/65 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="bg-muted/40 border border-border rounded-2xl px-4 py-3.5">
            <p className="text-[13px] text-foreground/60 italic leading-relaxed">{QUOTE}</p>
            <p className="text-[11px] text-foreground/40 mt-1.5 tracking-wide">
              — Early user, preparing for a PM role switch
            </p>
          </div>

        </div>
      </div>{/* end scrollable */}

      {/* Fixed bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-6 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full text-[15px] font-semibold h-14 rounded-2xl"
            onClick={() => navigate('/onboarding')}
          >
            Get started <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-[11px] text-muted-foreground text-center mt-2.5 font-light">
            Takes 2 minutes to set up. No credit card.
          </p>
          <PoweredByFooter />
        </div>
      </div>

    </div>
  );
}
