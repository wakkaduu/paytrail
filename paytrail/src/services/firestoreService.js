import { ensureSupabase, supabase } from '../supabase'

function mapBorrower(row) {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact || '',
    createdAt: row.created_at ? new Date(row.created_at) : null,
  }
}

async function fetchBorrowers() {
  ensureSupabase()
  const { data, error } = await supabase
    .from('borrowers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapBorrower)
}

export async function addBorrower(data) {
  ensureSupabase()
  const { data: inserted, error } = await supabase
    .from('borrowers')
    .insert({
      name: data.name,
      contact: data.contact || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return inserted.id
}

export async function refreshBorrowers() {
  return fetchBorrowers()
}

export async function getBorrowers() {
  return fetchBorrowers()
}

export function subscribeBorrowers(cb, onError) {
  ensureSupabase()
  const channel = supabase
    .channel('borrowers-list')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowers' }, async () => {
      try {
        cb(await fetchBorrowers())
      } catch (error) {
        console.error('subscribeBorrowers refresh error', error)
        if (onError) onError(error)
      }
    })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      try {
        cb(await fetchBorrowers())
      } catch (error) {
        console.error('subscribeBorrowers initial fetch error', error)
        if (onError) onError(error)
      }
    }
  })

  return () => {
    supabase.removeChannel(channel)
  }
}
