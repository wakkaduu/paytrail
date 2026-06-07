import { ensureSupabase, supabase } from '../supabase'
import { getUser } from './authService'

function mapLoan(row) {
  return {
    id: row.id,
    borrowerId: row.borrower_id,
    amount: Number(row.amount),
    dateIssued: row.created_at ? new Date(row.created_at) : null,
  }
}

async function fetchLoansByBorrower(borrowerId) {
  ensureSupabase()
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('borrower_id', borrowerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapLoan)
}

export async function addLoan(data) {
  ensureSupabase()
  const { data: inserted, error } = await supabase
    .from('loans')
    .insert({
      borrower_id: data.borrowerId,
      amount: data.amount,
    })
    .select('*')
    .single()

  if (error) throw error
  return inserted.id
}

export async function getLoansByBorrower(borrowerId) {
  return fetchLoansByBorrower(borrowerId)
}

export function subscribeLoansByBorrower(borrowerId, cb) {
  ensureSupabase()
  const channel = supabase
    .channel(`loans-by-borrower-${borrowerId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'loans', filter: `borrower_id=eq.${borrowerId}` }, async () => {
      cb(await fetchLoansByBorrower(borrowerId))
    })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      cb(await fetchLoansByBorrower(borrowerId))
    }
  })

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function getLoan(loanId) {
  ensureSupabase()
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .maybeSingle()

  if (error) throw error
  return data ? mapLoan(data) : null
}

export async function getMyLoans(){
  ensureSupabase()
  const user = await getUser()
  if(!user || !user.id) return []

  // find borrower records linked to the auth user
  const { data: borrowers, error: bErr } = await supabase
    .from('borrowers')
    .select('id')
    .eq('user_id', user.id)

  if(bErr || !borrowers || borrowers.length === 0) return []
  const ids = borrowers.map(b=>b.id)

  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .in('borrower_id', ids)
    .order('created_at', { ascending: false })

  if(error) throw error
  return (data || []).map(mapLoan)
}
