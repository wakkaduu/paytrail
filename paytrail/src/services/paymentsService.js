import { ensureSupabase, supabase } from '../supabase'

function mapPayment(row) {
  return {
    id: row.id,
    loanId: row.loan_id,
    amountPaid: Number(row.amount_paid),
    datePaid: row.created_at ? new Date(row.created_at) : null,
  }
}

async function fetchPaymentsByLoan(loanId) {
  ensureSupabase()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('loan_id', loanId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map(mapPayment)
}

export async function addPayment(data) {
  ensureSupabase()
  const { data: inserted, error } = await supabase
    .from('payments')
    .insert({
      loan_id: data.loanId,
      amount_paid: data.amountPaid,
    })
    .select('*')
    .single()

  if (error) throw error
  return inserted.id
}

export async function getPaymentsByLoan(loanId) {
  return fetchPaymentsByLoan(loanId)
}

export function subscribePaymentsByLoan(loanId, cb) {
  ensureSupabase()
  const channel = supabase
    .channel(`payments-by-loan-${loanId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `loan_id=eq.${loanId}` }, async () => {
      cb(await fetchPaymentsByLoan(loanId))
    })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      cb(await fetchPaymentsByLoan(loanId))
    }
  })

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function sumPaymentsForLoan(loanId) {
  const payments = await getPaymentsByLoan(loanId)
  return payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0)
}
