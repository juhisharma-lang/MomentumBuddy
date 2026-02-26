import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { onboarded } = useApp();

  useEffect(() => {
    if (onboarded) navigate('/dashboard', { replace: true });
  }, [onboarded, navigate]);

  if (onboarded) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <div className="text-5xl mb-6">🌱</div>
        <h1 className="text-3xl font-semibold mb-3">Momentum Buddy</h1>
        <p className="text-muted-foreground mb-2 text-lg">
          Your learning comeback partner.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          Miss a session? No guilt. Just a gentle plan to get back on track — fast.
        </p>
        <Button size="lg" className="w-full" onClick={() => navigate('/onboarding')}>
          Get started <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
