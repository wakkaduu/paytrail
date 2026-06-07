import { ensureSupabase, supabase } from '../supabase'

export async function createCategory({ userId, name, type = 'expense', targetAmount = 0 }){
  ensureSupabase()
  const { data, error } = await supabase.from('categories').insert({ user_id: userId, name, type, target_amount: targetAmount }).select('*').single()
  if(error) throw error
  return data
}

export async function updateCategory(id, patch){
  ensureSupabase()
  const { data, error } = await supabase.from('categories').update(patch).eq('id', id).select('*').single()
  if(error) throw error
  return data
}

export async function deleteCategory(id){
  ensureSupabase()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if(error) throw error
  return true
}

export async function getCategories(userId){
  ensureSupabase()
  const { data, error } = await supabase.from('categories').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if(error) throw error
  return data || []
}

export async function getCategoryBalance(categoryId){
  ensureSupabase()
  const { data: incRes } = await supabase.from('allocations').select('sum(amount)').eq('category_id', categoryId)
  const { data: expRes } = await supabase.from('expenses').select('sum(amount)').eq('category_id', categoryId)
  const inc = incRes && incRes[0] ? Number(incRes[0].sum || 0) : 0
  const exp = expRes && expRes[0] ? Number(expRes[0].sum || 0) : 0
  return inc - exp
}

export async function createDefaultCategories(userId){
  ensureSupabase()
  const defaults = [
    { name: 'Savings', type: 'savings' },
    { name: 'Emergency Fund', type: 'savings' },
    { name: 'Loan Fund', type: 'savings' },
    { name: 'Daily Expenses', type: 'expense' },
    { name: 'Bills', type: 'expense' },
    { name: 'Investments', type: 'investment' },
    { name: 'Miscellaneous', type: 'expense' }
  ]
  const rows = defaults.map(d=>({ user_id: userId, name: d.name, type: d.type }))
  const { data, error } = await supabase.from('categories').insert(rows).select('*')
  if(error) throw error
  return data
}
