import { supabase } from './supabase'

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
export type WorkSession = {
  id: string
  user_id: string
  start_time: string
  end_time: string | null
  status: 'active' | 'completed'
  created_at: string
}

export type BreakLog = {
  id: string
  user_id: string
  session_id: string
  break_type: 'water' | 'stretch' | 'eye_rest' | 'breathe' | 'other'
  duration_seconds: number
  is_completed: boolean
  created_at: string
}

// ----------------------------------------------------------------------
// WORK SESSIONS
// ----------------------------------------------------------------------

export async function startWorkSession(userId: string) {
  const { data, error } = await supabase
    .from('work_sessions')
    .insert([{ user_id: userId, status: 'active' }])
    .select()
    .single()

  if (error) throw error
  return data as WorkSession
}

export async function endWorkSession(sessionId: string) {
  const { error } = await supabase
    .from('work_sessions')
    .update({ 
      status: 'completed', 
      end_time: new Date().toISOString() 
    })
    .eq('id', sessionId)

  if (error) throw error
}

export async function getActiveSession(userId: string) {
  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data as WorkSession | null
}

// ----------------------------------------------------------------------
// BREAK LOGS
// ----------------------------------------------------------------------

export async function logBreak(
  userId: string, 
  sessionId: string, 
  breakType: BreakLog['break_type'], 
  durationSeconds: number = 20
) {
  const { data, error } = await supabase
    .from('break_logs')
    .insert([{
      user_id: userId,
      session_id: sessionId,
      break_type: breakType,
      duration_seconds: durationSeconds,
      is_completed: true // Assuming they did the break if this is called
    }])
    .select()
    .single()

  if (error) throw error
  return data as BreakLog
}

export async function getRecentBreaks(userId: string, hoursBack: number = 4) {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('break_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BreakLog[];
}

// ----------------------------------------------------------------------
// DASHBOARD AGGREGATIONS
// ----------------------------------------------------------------------

export async function fetchDashboardData(userId: string) {
  // 1. Get user profile
  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('daily_health_score, full_name, avatar_url')
    .eq('id', userId)
    .single()

  if (profileErr) throw profileErr

  // 2. Count breaks taken today
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  const { count: breaksToday, error: breaksErr } = await supabase
    .from('break_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true)
    .gte('created_at', startOfDay.toISOString())

  if (breaksErr) throw breaksErr

  // 3. Get completed work sessions for the past 7 days for the chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: recentSessions, error: sessionsErr } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('created_at', sevenDaysAgo.toISOString())

  if (sessionsErr) throw sessionsErr

  // 4. Calculate today's work hours
  let todayWorkMs = 0;
  const todaySessions = (recentSessions || []).filter(s => new Date(s.created_at) >= startOfDay);
  todaySessions.forEach(s => {
    if (s.start_time && s.end_time) {
      todayWorkMs += new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
    }
  });
  
  const dailyWorkHours = Number((todayWorkMs / (1000 * 60 * 60)).toFixed(1));

  // 5. Generate Weekly Activity Chart Data (last 7 days including today)
  // Define days array
  const weeklyActivity: { day: string; hours: number }[] = [];
  const daysMap = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' }); 
    daysMap.set(dateStr, Math.random() * 0); // Initialize at 0, using short day later
    weeklyActivity.push({ day: shortDay, hours: 0 }); // Pre-fill array
  }

  // Populate data
  (recentSessions || []).forEach(s => {
    if (s.start_time && s.end_time) {
      const dateStr = s.created_at.split('T')[0];
      const sessionHours = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60);
      
      // Find the index in our pre-filled weekly array
      const sDate = new Date(s.created_at);
      const diffDays = Math.floor((new Date().getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
         const targetIndex = 6 - diffDays;
         weeklyActivity[targetIndex].hours += sessionHours;
      }
    }
  });

  // Round all hours to 1 decimal
  weeklyActivity.forEach(day => {
    day.hours = Number(day.hours.toFixed(1));
  });

  return {
    profile,
    breaksToday: breaksToday || 0,
    dailyWorkHours,
    weeklyActivity
  }
}
