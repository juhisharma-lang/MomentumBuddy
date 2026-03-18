import { useState, useEffect } from 'react';

export type DevMode = 'original' | 'demo' | 'newui';
const DEV_MODE_KEY = 'mb_dev_mode';

export function useDevMode(): DevMode {
  const [mode, setMode] = useState<DevMode>(
    () => (localStorage.getItem(DEV_MODE_KEY) as DevMode) ?? 'newui'
  );
  useEffect(() => {
    const handler = () =>
      setMode((localStorage.getItem(DEV_MODE_KEY) as DevMode) ?? 'newui');
    window.addEventListener('mb_dev_mode_change', handler);
    return () => window.removeEventListener('mb_dev_mode_change', handler);
  }, []);
  return mode;
}

// Shows a small persistent bar at the top when in original or demo mode
// so the user can always navigate back to the New UI overview.
export default function DevModeBar() {
  const mode = useDevMode();
  if (mode === 'newui') return null;

  function goToNewUI() {
    localStorage.setItem(DEV_MODE_KEY, 'newui');
    window.dispatchEvent(new Event('mb_dev_mode_change'));
    window.location.href = '/dashboard';
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9000,
      background: '#22223A', borderBottom: '0.5px solid #32324A',
      padding: '6px 16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', fontFamily: 'system-ui, sans-serif',
    }}>
      <span style={{ fontSize: '10px', color: '#5A5A7A' }}>
        {mode === 'demo' ? 'Demo state' : 'Original app'} — older version
      </span>
      <button
        onClick={goToNewUI}
        style={{
          background: 'transparent', border: '0.5px solid #32324A',
          borderRadius: '6px', padding: '3px 10px', fontSize: '10px',
          color: '#5EC47A', cursor: 'pointer',
        }}
      >
        Back to New UI
      </button>
    </div>
  );
}

