import { supabase } from './supabase'
import { getDeviceId } from './deviceId'

let syncTimer: ReturnType<typeof setTimeout> | null = null

export function syncToSupabase(state: any) {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => doSync(state), 2000)
}

async function doSync(state: any) {
  try {
    const deviceId = getDeviceId()

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single()

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({ device_id: deviceId })
        .select('id')
        .single()
      if (error) throw error
      userId = newUser.id
    }

    for (const milestone of state.milestones) {
      await supabase
        .from('milestones')
        .upsert({
          id: milestone.id,
          user_id: userId,
          title: milestone.goalTitle,
          daily_minutes: milestone.dailyMinutes ?? 0,
          deadline: milestone.deadline ?? null,
          status: milestone.status,
        }, { onConflict: 'id' })
    }

    for (const log of state.logs) {
      await supabase
        .from('check_ins')
        .upsert({
          user_id: userId,
          milestone_id: log.milestoneId,
          date: log.date,
          completed: log.completed,
          minutes_logged: 0,
        }, { onConflict: 'user_id,date' })
    }

    await supabase
      .from('users')
      .update({ full_state: state })
      .eq('id', userId)

  } catch (err) {
    console.warn('Supabase sync failed silently:', err)
  }
}