import { ensureSupabase, supabase } from '../supabase'

export function previewAllocation(amount, profileItems){
  // profileItems: [{ category_id, percentage }]
  const allocations = profileItems.map(item => ({ category_id: item.category_id, percentage: Number(item.percentage), amount: Math.round(amount * Number(item.percentage) / 100) }))
  // adjust last to match total due to rounding
  const total = allocations.reduce((s,a)=>s+a.amount,0)
  if(total !== amount && allocations.length) allocations[allocations.length-1].amount += (amount - total)
  return allocations
}

export async function applyAllocation(incomeId, allocations){
  ensureSupabase()
  const rows = allocations.map(a=>({ income_id: incomeId, category_id: a.category_id, amount: a.amount, percentage: a.percentage }))
  const { data, error } = await supabase.from('allocations').insert(rows).select('*')
  if(error) throw error
  return data
}
