import React, { useEffect, useState } from 'react'
import { getTotals, getLoanDistribution, getMonthlyCashFlow, subscribeDashboard } from '../services/dashboardService'
import DashboardCard from '../components/DashboardCard'
import ChartCard from '../components/ChartCard'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'

export default function Dashboard(){
  const [totals, setTotals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [distribution, setDistribution] = useState([])
  const [monthly, setMonthly] = useState([])

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      const t = await getTotals()
      const d = await getLoanDistribution()
      const m = await getMonthlyCashFlow(6)
      if(!mounted) return
      setTotals(t)
      setDistribution(d)
      setMonthly(m)
      setLoading(false)
    }
    load()
    // subscribe to realtime updates
    const unsub = subscribeDashboard(async ()=>{
      if(!mounted) return
      const t = await getTotals()
      const d = await getLoanDistribution()
      const m = await getMonthlyCashFlow(6)
      setTotals(t); setDistribution(d); setMonthly(m)
    })

    return ()=>{ mounted = false; unsub && unsub() }
  },[])

  if(loading) return <div>Loading dashboard...</div>

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-4">
        <DashboardCard title="Total Cash Available" value={totals.totalCashAvailable || 0} />
        <DashboardCard title="Total Savings" value={totals.totalSavings || 0} />
        <DashboardCard title="Emergency Fund" value={totals.emergencyFundBalance || 0} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <DashboardCard title="Total Active Loans Given" value={totals.totalActiveLoansGiven || 0} />
        <DashboardCard title="Total Repayments Received" value={totals.totalRepaymentsReceived || 0} />
        <DashboardCard title="Outstanding Loan Balance" value={totals.outstandingLoanBalance || 0} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Income vs Expenses">
          <LineChart
            labels={monthly.map(m=>m.month)}
            datasets={[
              { label: 'Income', data: monthly.map(m=>m.income), borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.1)', tension:0.2, fill:true },
              { label: 'Expenses', data: monthly.map(m=>m.expense), borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', tension:0.2, fill:true }
            ]}
          />
        </ChartCard>
        <ChartCard title="Savings Growth">
          <LineChart
            labels={monthly.map(m=>m.month)}
            datasets={[{ label: 'Savings Growth', data: monthly.reduce((acc,m,i)=>{ const prev = acc[i-1]||0; acc.push(prev + (m.income - m.expense)); return acc },[]), borderColor:'#60a5fa', backgroundColor:'rgba(96,165,250,0.08)', tension:0.2, fill:true }]}
          />
        </ChartCard>
      </div>
    </div>
  )
}
