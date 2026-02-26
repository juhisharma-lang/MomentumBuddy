import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserGoal, DailyLog, Commitment, CheckinPause } from '@/types/app';

interface AppState {
  goal: UserGoal | null;
  logs: DailyLog[];
  commitments: Commitment[];
  pauses: CheckinPause[];
  onboarded: boolean;
}

interface AppContextType extends AppState {
  setGoal: (goal: UserGoal) => void;
  addLog: (log: DailyLog) => void;
  addCommitment: (commitment: Commitment) => void;
  addPause: (pause: CheckinPause) => void;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'momentum_buddy_state';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { goal: null, logs: [], commitments: [], pauses: [], onboarded: false };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => { saveState(state); }, [state]);

  const setGoal = (goal: UserGoal) => setState(prev => ({ ...prev, goal }));
  const addLog = (log: DailyLog) => setState(prev => ({ ...prev, logs: [...prev.logs, log] }));
  const addCommitment = (c: Commitment) => setState(prev => ({ ...prev, commitments: [...prev.commitments, c] }));
  const addPause = (p: CheckinPause) => setState(prev => ({ ...prev, pauses: [...prev.pauses, p] }));
  const completeOnboarding = () => setState(prev => ({ ...prev, onboarded: true }));

  return (
    <AppContext.Provider value={{ ...state, setGoal, addLog, addCommitment, addPause, completeOnboarding }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
