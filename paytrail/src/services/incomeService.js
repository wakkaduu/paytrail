import { ensureSupabase, supabase } from '../supabase'

export async function addIncome({ userId, amount, source, date, notes, allocationProfileId, allocated = false }){
  ensureSupabase()
  const { data, error } = await supabase.from('incomes').insert({ user_id: userId, amount, source, date, notes, allocation_profile_id: allocationProfileId, allocated }).select('*').single()
  if(error) throw error
  return data
}

export async function editIncome(id, patch){
  ensureSupabase()
  const { data, error } = await supabase.from('incomes').update(patch).eq('id', id).select('*').single()
  if(error) throw error
  return data
}

export async function deleteIncome(id){
  ensureSupabase()
  const { error } = await supabase.from('incomes').delete().eq('id', id)
  if(error) throw error
  return true
}

export async function getIncomes(userId, opts = {}){
  ensureSupabase()
  const q = supabase.from('incomes').select('*').eq('user_id', userId).order('date', { ascending: false })
  const { data, error } = await q
  if(error) throw error
  return data || []
}

export async function getMonthlyIncomeSummary(userId, months = 6){
  ensureSupabase()
  const start = new Date(); start.setMonth(start.getMonth() - (months - 1));
  const { data, error } = await supabase.from('incomes').select('amount, date').eq('user_id', userId).gte('date', start.toISOString())
  if(error) throw error
  return data || []
}
