import { ensureSupabase, supabase } from '../supabase'

export async function addExpense({ userId, categoryId, amount, date, notes }){
  ensureSupabase()
  const { data, error } = await supabase.from('expenses').insert({ user_id: userId, category_id: categoryId, amount, date, notes }).select('*').single()
  if(error) throw error
  return data
}

export async function editExpense(id, patch){
  ensureSupabase()
  const { data, error } = await supabase.from('expenses').update(patch).eq('id', id).select('*').single()
  if(error) throw error
  return data
}

export async function deleteExpense(id){
  ensureSupabase()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if(error) throw error
  return true
}

export async function getExpenses(userId, opts = {}){
  ensureSupabase()
  const { data, error } = await supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false })
  if(error) throw error
  return data || []
}
