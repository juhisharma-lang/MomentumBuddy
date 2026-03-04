import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Milestone, DailyLog, Commitment, CheckinPause,
  MilestoneAchievements, PulseFeedback, computeAchievements
} from '@/types/app';

// ── State shape ───────────────────────────────────────────────────────────────

interface AppState {
  milestones: Milestone[];
  activeMilestoneId: string | null;
  logs: DailyLog[];
  commitments: Commitment[];
  pauses: CheckinPause[];
  achievements: MilestoneAchievements[];
  feedback: PulseFeedback[];
  onboarded: boolean;
}

interface AppContextType extends AppState {
  addMilestone: (milestone: Milestone) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  setActiveMilestoneId: (id: string) => void;
  completeMilestone: (id: string) => void;
  abandonMilestone: (id: string) => void;
  activeMilestone: Milestone | null;
  addLog: (log: Omit<DailyLog, 'milestoneId'>) => void;
  addCommitment: (commitment: Omit<Commitment, 'milestoneId'>) => void;
  addPause: (pause: Omit<CheckinPause, 'milestoneId'>) => void;
  activeLogs: DailyLog[];
  activeCommitments: Commitment[];
  activePauses: CheckinPause[];
  addFeedback: (feedback: Omit<PulseFeedback, 'id' | 'recordedAt'>) => void;
  completeOnboarding: () => void;
}

const DEFAULT_STATE: AppState = {
  milestones: [],
  activeMilestoneId: null,
  logs: [],
  commitments: [],
  pauses: [],
  achievements: [],
  feedback: [],
  onboarded: false,
};

const STORAGE_KEY = 'momentum_buddy_state';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  // Persist on every state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ── Pause expiry check (runs once on mount) ────────────────────────────────
  // Problem: when a pause ends and the user never returns, getDashboardState
  // stays in 'D' (paused) because there is no miss log for the day after the
  // pause ended. Fix: on app load, for every expired pause, if the first
  // expected check-in day (pausedUntil + 1) has no log and is <= yesterday,
  // insert a miss so State B fires correctly on next open.
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    setState(prev => {
      let newLogs = [...prev.logs];
      let dirty = false;

      for (const pause of prev.pauses) {
        // Skip pauses still active or in the future
        if (pause.pausedUntil >= todayStr) continue;

        // First day user should have checked in after pause
        const resumeDate = new Date(pause.pausedUntil);
        resumeDate.setDate(resumeDate.getDate() + 1);
        const resumeDateStr = resumeDate.toISOString().split('T')[0];

        // Resume day is today — let the user act themselves
        if (resumeDateStr > yesterdayStr) continue;

        const alreadyLogged = newLogs.some(
          l => l.milestoneId === pause.milestoneId && l.date === resumeDateStr
        );

        if (!alreadyLogged) {
          newLogs = [
            ...newLogs,
            {
              milestoneId: pause.milestoneId,
              date: resumeDateStr,
              completed: false,
              fallbackTriggered: false,
            },
          ];
          dirty = true;
        }
      }

      return dirty ? { ...prev, logs: newLogs } : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  // ── Helpers ────────────────────────────────────────────────────────────────

  const activeMilestone = state.milestones.find(
    m => m.id === state.activeMilestoneId
  ) ?? null;

  const activeLogs = state.logs.filter(
    l => l.milestoneId === state.activeMilestoneId
  );
  const activeCommitments = state.commitments.filter(
    c => c.milestoneId === state.activeMilestoneId
  );
  const activePauses = state.pauses.filter(
    p => p.milestoneId === state.activeMilestoneId
  );

  // ── Milestone actions ──────────────────────────────────────────────────────

  const addMilestone = (milestone: Milestone) => {
    setState(prev => {
      const milestones = [...prev.milestones, milestone];
      const activeMilestoneId =
        prev.activeMilestoneId ?? (milestone.status === 'active' ? milestone.id : null);
      return { ...prev, milestones, activeMilestoneId };
    });
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setState(prev => ({
      ...prev,
      milestones: prev.milestones.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  };

  const setActiveMilestoneId = (id: string) => {
    setState(prev => ({ ...prev, activeMilestoneId: id }));
  };

  const completeMilestone = (id: string) => {
    setState(prev => {
      const milestone = prev.milestones.find(m => m.id === id);
      if (!milestone) return prev;

      const completedAt = new Date().toISOString().split('T')[0];
      const updatedMilestone: Milestone = {
        ...milestone, status: 'completed', completedAt
      };
      const updatedMilestones = prev.milestones.map(m =>
        m.id === id ? updatedMilestone : m
      );

      const achievement = computeAchievements(updatedMilestone, prev.logs);
      const achievements = [
        ...prev.achievements.filter(a => a.milestoneId !== id),
        achievement,
      ];

      const nextActive = updatedMilestones.find(
        m => m.status === 'active' && m.id !== id
      );
      const activeMilestoneId = nextActive?.id ?? null;

      return { ...prev, milestones: updatedMilestones, achievements, activeMilestoneId };
    });
  };

  const abandonMilestone = (id: string) => {
    setState(prev => {
      const abandonedAt = new Date().toISOString().split('T')[0];
      const updatedMilestones = prev.milestones.map(m =>
        m.id === id ? { ...m, status: 'abandoned' as const, abandonedAt } : m
      );
      const nextActive = updatedMilestones.find(
        m => m.status === 'active' && m.id !== id
      );
      const activeMilestoneId = nextActive?.id ?? prev.activeMilestoneId;
      return { ...prev, milestones: updatedMilestones, activeMilestoneId };
    });
  };

  // ── Log / commitment / pause actions ──────────────────────────────────────

  const addLog = (log: Omit<DailyLog, 'milestoneId'>) => {
    if (!state.activeMilestoneId) return;
    const full: DailyLog = { ...log, milestoneId: state.activeMilestoneId };
    setState(prev => ({
      ...prev,
      logs: [
        ...prev.logs.filter(
          l => !(l.date === log.date && l.milestoneId === prev.activeMilestoneId)
        ),
        full,
      ],
    }));
  };

  const addCommitment = (commitment: Omit<Commitment, 'milestoneId'>) => {
    if (!state.activeMilestoneId) return;
    const full: Commitment = { ...commitment, milestoneId: state.activeMilestoneId };
    setState(prev => ({ ...prev, commitments: [...prev.commitments, full] }));
  };

  const addPause = (pause: Omit<CheckinPause, 'milestoneId'>) => {
    if (!state.activeMilestoneId) return;
    const full: CheckinPause = { ...pause, milestoneId: state.activeMilestoneId };
    setState(prev => ({ ...prev, pauses: [...prev.pauses, full] }));
  };

  const addFeedback = (entry: Omit<PulseFeedback, 'id' | 'recordedAt'>) => {
    const full: PulseFeedback = {
      ...entry,
      id: crypto.randomUUID(),
      recordedAt: new Date().toISOString().split('T')[0],
    };
    setState(prev => ({ ...prev, feedback: [...prev.feedback, full] }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, onboarded: true }));
  };

  // ── Context value ──────────────────────────────────────────────────────────

  return (
    <AppContext.Provider value={{
      ...state,
      activeMilestone,
      activeLogs,
      activeCommitments,
      activePauses,
      addMilestone,
      updateMilestone,
      setActiveMilestoneId,
      completeMilestone,
      abandonMilestone,
      addLog,
      addCommitment,
      addPause,
      addFeedback,
      completeOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
