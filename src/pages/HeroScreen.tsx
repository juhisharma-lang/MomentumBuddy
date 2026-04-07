import { useNavigate } from 'react-router-dom';
import PlantVisual from '@/components/PlantVisual';

export default function HeroScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-m3-bg font-jakarta flex flex-col overflow-hidden">

      {/* Top — brand name */}
      <header className="flex-shrink-0 px-6 pt-8 pb-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a63c2a]">
          Learners Buddy
        </p>
      </header>

      {/* Middle — plant + headline */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">

        {/* Plant — large, centred, the emotional hero */}
        <div className="mb-8">
          <PlantVisual state="growing" className="w-44 h-44" />
        </div>

        {/* Headline */}
        <h1 className="text-[2rem] font-black text-on-surface leading-[1.15] tracking-tight mb-4">
          Your course isn't{' '}
          <span className="text-[#a63c2a] italic">abandoned.</span>
          <br />
          You just need a way back in.
        </h1>

        {/* Subtext */}
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-[280px]">
          Pick your learning journey. We'll break it down, track your progress, and help you come back every time life gets in the way.
        </p>

      </main>

      {/* Bottom — CTA + soft reassurance */}
      <div className="flex-shrink-0 px-6 pb-10">
        <button
          onClick={() => navigate('/onboarding-v3')}
          className="bg-[#a63c2a] text-[#fff7f6] rounded-full w-full py-4 font-bold text-base shadow-lg shadow-[#a63c2a]/20 active:scale-95 transition-transform mb-4"
        >
          Start your journey
        </button>
        <p className="text-center text-[11px] text-on-surface-variant leading-relaxed">
          No streaks. No shame. Just progress that fits your life.
        </p>
      </div>

    </div>
  );
}