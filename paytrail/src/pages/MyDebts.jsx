import React, { useEffect, useState } from 'react'
import { getMyLoans } from '../services/loansService'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function MyDebts(){
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        const rows = await getMyLoans()
        if(mounted) setLoans(rows)
      }catch(e){ console.error(e) }
      if(mounted) setLoading(false)
    }
    load()

    // single realtime channel listening to loans and payments; filter client-side
    const channel = supabase.channel('my-debts-realtime')

    const handleEvent = async (payload) => {
      try{
        const record = payload?.record ?? payload?.new ?? payload?.old
        if(!record) return
        // refresh user's loans since event might affect them
        const refreshed = await getMyLoans()
        if(mounted) setLoans(refreshed)
      }catch(e){ console.error('realtime event handler error', e) }
    }

    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, payload => { handleEvent(payload) })
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, payload => { handleEvent(payload) })

    channel.subscribe(status => {
      // initial subscription may trigger server-side snapshot; no action needed here
    })

    return ()=>{ mounted=false; supabase.removeChannel(channel) }
  },[])

  const total = loans.reduce((s,l)=>s + (l.amount||0),0)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Debts</h2>
      {loading ? <div>Loading...</div> : (
        <div>
          <div className="mb-4">Total borrowed: <strong>{total}</strong></div>
          <ul className="space-y-2">
            {loans.map(l=> (
              <li key={l.id} className="p-3 rounded" style={{background:'var(--panel)'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Loan {l.id}</div>
                    <div className="text-sm">Issued: {l.dateIssued ? l.dateIssued.toLocaleString() : ''}</div>
                  </div>
                  <div className="text-lg font-bold">{l.amount}</div>
                </div>
                <div className="mt-2">
                  <Link to={`/loan/${l.id}`} className="text-sm text-blue-400">View details</Link>
                </div>
              </li>
            ))}
            {loans.length === 0 && <li className="text-muted">No debt records found.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
