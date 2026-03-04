import { supabase } from './supabase'
import { getDeviceId } from './deviceId'

// Get or create user record for this device
export async function getOrCreateUser() {
  const deviceId = getDeviceId()

  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('device_id', deviceId)
    .single()

  if (existing) return existing

  // Create new user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ device_id: deviceId })
    .select()
    .single()

  if (error) throw error
  return newUser
}

// Save milestone
export async function saveMilestone(milestone: {
  title: string
  daily_minutes: number
  deadline: string
}) {
  const user = await getOrCreateUser()
  const { data, error } = await supabase
    .from('milestones')
    .insert({ ...milestone, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

// Get active milestone
export async function getActiveMilestone() {
  const user = await getOrCreateUser()
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Save check-in
export async function saveCheckIn(checkIn: {
  milestone_id: string
  date: string
  completed: boolean
  minutes_logged: number
  notes?: string
}) {
  const user = await getOrCreateUser()
  const { data, error } = await supabase
    .from('check_ins')
    .upsert({ ...checkIn, user_id: user.id }, { onConflict: 'user_id,date' })
    .select()
    .single()
  if (error) throw error
  return data
}

// Get all check-ins for active milestone
export async function getCheckIns(milestoneId: string) {
  const user = await getOrCreateUser()
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .eq('milestone_id', milestoneId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

// Queue a nudge
export async function queueNudge(type: string, scheduledFor: Date) {
  const user = await getOrCreateUser()
  const { error } = await supabase
    .from('nudges')
    .insert({ user_id: user.id, type, scheduled_for: scheduledFor.toISOString() })
  if (error) throw error
}