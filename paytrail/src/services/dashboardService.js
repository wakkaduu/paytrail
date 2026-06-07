import { supabase, hasSupabaseConfig } from '../supabase'

function safeNumber(v){ return v == null ? 0 : Number(v) }

export async function getTotals() {
  if(!hasSupabaseConfig) {
    // fallback zeros when no DB configured
    return {
      totalCashAvailable: 0,
      totalSavings: 0,
      emergencyFundBalance: 0,
      totalActiveLoansGiven: 0,
      totalRepaymentsReceived: 0,
      outstandingLoanBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netWorth: 0,
    }
  }

  // Loans
  const { data: loansData, error: loansErr } = await supabase.rpc('sum_loans_amount')
  // payments
  const { data: paymentsData, error: paymentsErr } = await supabase.rpc('sum_payments_amount')

  let totalLoans = 0
  let totalPayments = 0
  if(!loansErr && loansData && loansData.length){ totalLoans = safeNumber(loansData[0].sum) }
  if(!paymentsErr && paymentsData && paymentsData.length){ totalPayments = safeNumber(paymentsData[0].sum) }

  const outstanding = totalLoans - totalPayments

  // Income/expense placeholders (tables may not exist yet)
  let monthlyIncome = 0, monthlyExpenses = 0
  try{
    const { data: inc } = await supabase.rpc('sum_monthly_income')
    if(inc && inc.length) monthlyIncome = safeNumber(inc[0].sum)
  }catch(e){}
  try{
    const { data: exp } = await supabase.rpc('sum_monthly_expense')
    if(exp && exp.length) monthlyExpenses = safeNumber(exp[0].sum)
  }catch(e){}

  return {
    totalCashAvailable: 0,
    totalSavings: 0,
    emergencyFundBalance: 0,
    totalActiveLoansGiven: totalLoans,
    totalRepaymentsReceived: totalPayments,
    outstandingLoanBalance: outstanding,
    monthlyIncome,
    monthlyExpenses,
    netWorth: 0,
  }
}

export async function getLoanDistribution(){
  if(!hasSupabaseConfig) return []
  // sample aggregation: group loans by status
  try{
    const { data } = await supabase
      .from('loans')
      .select('status, amount')
    if(!data) return []
    const map = {}
    data.forEach(r=>{ const k = r.status || 'unknown'; map[k]= (map[k]||0)+Number(r.amount||0) })
    return Object.entries(map).map(([k,v])=>({ label:k, value:v }))
  }catch(e){ return [] }
}

export async function getMonthlyCashFlow(lastMonths = 6){
  // Returns array [{month: '2026-06', income: n, expense: n}] for the last N months
  const months = []
  const now = new Date()
  for(let i = lastMonths - 1; i >= 0; i--){
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0,7)
    months.push({ key, income: 0, expense: 0 })
  }

  if(!hasSupabaseConfig) return months.map(m=>({ month: m.key, income:0, expense:0 }))

  const start = new Date(now.getFullYear(), now.getMonth() - (lastMonths - 1), 1)
  try{
    const { data: incomes, error: incErr } = await supabase
      .from('incomes')
      .select('amount, date')
      .gte('date', start.toISOString())
    const { data: expenses, error: expErr } = await supabase
      .from('expenses')
      .select('amount, date')
      .gte('date', start.toISOString())

    if(!incErr && incomes){
      incomes.forEach(r=>{
        const k = (new Date(r.date)).toISOString().slice(0,7)
        const slot = months.find(m=>m.key === k)
        if(slot) slot.income += Number(r.amount || 0)
      })
    }
    if(!expErr && expenses){
      expenses.forEach(r=>{
        const k = (new Date(r.date)).toISOString().slice(0,7)
        const slot = months.find(m=>m.key === k)
        if(slot) slot.expense += Number(r.amount || 0)
      })
    }
  }catch(e){ /* ignore and return zeros */ }

  return months.map(m=>({ month: m.key, income: m.income, expense: m.expense }))
}

export function subscribeDashboard(cb){
  if(!hasSupabaseConfig) return () => {}
  const channel = supabase.channel('dashboard-realtime')
  const tables = ['loans','payments','incomes','expenses']
  tables.forEach(table => {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      try{ cb() }catch(e){ console.error(e) }
    })
  })

  channel.subscribe(status => {
    if(status === 'SUBSCRIBED'){
      try{ cb() }catch(e){ console.error(e) }
    }
  })

  return () => { supabase.removeChannel(channel) }
}
