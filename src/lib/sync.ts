import { supabase } from './supabase'
import { getDeviceId } from './deviceId'

// ─────────────────────────────────────────────────────────────
// Types (mirror of AppState from AppContext)
// ─────────────────────────────────────────────────────────────

interface SyncState {
  milestones: any[]
  activeMilestoneId: string | null
  logs: any[]
  commitments: any[]
  pauses: any[]
  achievements: any[]
  feedback: any[]
  onboarded: boolean
}

interface SyncSettings {
  reminderTime?: string
  checkinTime?: string
  customJourney?: any
  goalEdits?: any
  lapseFeedback?: string
}

// ─────────────────────────────────────────────────────────────
// Debounce — waits 2s after last state change before syncing
// ─────────────────────────────────────────────────────────────

let syncTimer: ReturnType<typeof setTimeout> | null = null

export function syncToSupabase(state: SyncState) {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => doSync(state), 2000)
}

export function syncSettingsToSupabase(settings: SyncSettings) {
  doSyncSettings(settings)
}

// ─────────────────────────────────────────────────────────────
// Get or create user row, returns userId
// ─────────────────────────────────────────────────────────────

async function getOrCreateUser(deviceId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('device_id', deviceId)
    .maybeSingle()

  if (existing) return existing.id

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ device_id: deviceId })
    .select('id')
    .single()

  if (error) throw error
  return newUser.id
}

// ─────────────────────────────────────────────────────────────
// Main sync — writes all state slices to normalised tables
// ─────────────────────────────────────────────────────────────

async function doSync(state: SyncState) {
  try {
    const deviceId = getDeviceId()
    const userId = await getOrCreateUser(deviceId)

    // Update user-level fields
    await supabase
      .from('users')
      .update({
        onboarded: state.onboarded,
        active_milestone_id: state.activeMilestoneId ?? null,
        full_state: state,
      })
      .eq('id', userId)

    // Milestones
    if (state.milestones.length > 0) {
      await supabase
        .from('milestones')
        .upsert(
          state.milestones.map((m: any) => ({
            id: m.id,
            user_id: userId,
            title: m.goalTitle,
            goal_type: m.goalType ?? null,
            journey_id: m.journeyId ?? null,
            study_days: m.studyDays ?? null,
            daily_minutes: m.dailyMinutes ?? 0,
            deadline: m.deadline ?? null,
            deadline_type: m.deadlineType ?? null,
            start_time: m.startTime ?? null,
            checkin_time: m.checkinTime ?? null,
            notif_reminder: m.notifReminderTime ?? null,
            notif_checkin: m.notifCheckinTime ?? null,
            status: m.status,
            activated_at: m.activatedAt ?? null,
            completed_at: m.completedAt ?? null,
            abandoned_at: m.abandonedAt ?? null,
          })),
          { onConflict: 'id' }
        )
    }

    // Daily logs (check_ins)
    // FIX: minutes_logged now reads actual daily commitment from the milestone
    if (state.logs.length > 0) {
      await supabase
        .from('check_ins')
        .upsert(
          state.logs.map((l: any) => {
            const milestone = state.milestones.find((m: any) => m.id === l.milestoneId)
            const minutesLogged = l.completed ? (milestone?.dailyMinutes ?? 0) : 0
            return {
              user_id: userId,
              milestone_id: l.milestoneId,
              date: l.date,
              completed: l.completed,
              minutes_logged: minutesLogged,
              fallback_triggered: l.fallbackTriggered ?? false,
              checkin_response_at: l.checkinResponseAt ?? null,
            }
          }),
          { onConflict: 'user_id,milestone_id,date' }
        )
    }

    // Pauses
    if (state.pauses.length > 0) {
      await supabase
        .from('pauses')
        .delete()
        .eq('user_id', userId)

      await supabase
        .from('pauses')
        .insert(
          state.pauses.map((p: any) => ({
            user_id: userId,
            milestone_id: p.milestoneId,
            paused_from: p.pausedFrom,
            paused_until: p.pausedUntil,
          }))
        )
    }

    // Commitments
    if (state.commitments.length > 0) {
      await supabase
        .from('commitments')
        .upsert(
          state.commitments.map((c: any) => ({
            id: c.id,
            user_id: userId,
            milestone_id: c.milestoneId,
            committed_for_date: c.committedForDate,
            committed_time: c.committedTime,
            minutes: c.minutes,
            flow_type: c.flowType,
            confirmed: c.confirmed,
            fulfilled: c.fulfilled,
          })),
          { onConflict: 'id' }
        )
    }

    // Pulse feedback
    if (state.feedback.length > 0) {
      await supabase
        .from('feedback')
        .upsert(
          state.feedback.map((f: any) => ({
            id: f.id,
            user_id: userId,
            milestone_id: f.milestoneId,
            rating: f.rating,
            day_number: f.dayNumber,
            recorded_at: f.recordedAt,
          })),
          { onConflict: 'id' }
        )
    }

    // Achievements
    if (state.achievements.length > 0) {
      await supabase
        .from('achievements')
        .upsert(
          state.achievements.map((a: any) => ({
            milestone_id: a.milestoneId,
            user_id: userId,
            total_sessions: a.totalSessions,
            total_minutes: a.totalMinutes,
            longest_streak: a.longestStreak,
            fastest_recovery: a.fastestRecovery ?? null,
            avg_recovery: a.avgRecovery ?? null,
            completed_on_time: a.completedOnTime,
          })),
          { onConflict: 'milestone_id' }
        )
    }

  } catch (err) {
    console.warn('Supabase sync failed silently:', err)
  }
}

// ─────────────────────────────────────────────────────────────
// Settings sync — secondary localStorage keys
// ─────────────────────────────────────────────────────────────

async function doSyncSettings(settings: SyncSettings) {
  try {
    const deviceId = getDeviceId()
    const userId = await getOrCreateUser(deviceId)

    await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          reminder_time: settings.reminderTime ?? null,
          checkin_time: settings.checkinTime ?? null,
          custom_journey: settings.customJourney ?? null,
          goal_edits: settings.goalEdits ?? null,
          lapse_feedback: settings.lapseFeedback ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
  } catch (err) {
    console.warn('Supabase settings sync failed silently:', err)
  }
}