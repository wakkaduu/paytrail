import { ensureSupabase, supabase } from '../supabase'

export async function createGoal({ userId, name, targetAmount, targetDate, categoryId }){
  ensureSupabase()
  const { data, error } = await supabase.from('savings_goals').insert({ user_id: userId, name, target_amount: targetAmount, target_date: targetDate, category_id: categoryId }).select('*').single()
  if(error) throw error
  return data
}

export async function contributeToGoal(goalId, amount){
  ensureSupabase()
  const { data: existing, error: e } = await supabase.from('savings_goals').select('*').eq('id', goalId).single()
  if(e) throw e
  const newAmount = (existing.current_amount || 0) + Number(amount)
  const { data, error } = await supabase.from('savings_goals').update({ current_amount: newAmount }).eq('id', goalId).select('*').single()
  if(error) throw error
  return data
}

export async function getGoals(userId){
  ensureSupabase()
  const { data, error } = await supabase.from('savings_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if(error) throw error
  return data || []
}
