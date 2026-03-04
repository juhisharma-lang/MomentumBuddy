import { Milestone, DailyLog, Commitment, CheckinPause, MilestoneAchievements, PulseFeedback } from '@/types/app'

export interface AppState {
  milestones: Milestone[];
  activeMilestoneId: string | null;
  logs: DailyLog[];
  commitments: Commitment[];
  pauses: CheckinPause[];
  achievements: MilestoneAchievements[];
  feedback: PulseFeedback[];
  onboarded: boolean;
}