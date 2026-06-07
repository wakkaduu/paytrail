import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createGoal, getGoals, contributeToGoal } from '../services/goalsService'

export default function Goals(){
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')

  useEffect(()=>{ if(user) getGoals(user.id).then(setGoals).catch(console.error) },[user])

  const submit = async e=>{
    e.preventDefault()
    if(!user) return
    try{
      await createGoal({ userId: user.id, name, targetAmount: Number(target) })
      const res = await getGoals(user.id)
      setGoals(res)
      setName(''); setTarget('')
      setToast({ message: 'Goal created', type: 'success', visible: true })
    }catch(e){ console.error(e) }
  }

  const [toast, setToast] = React.useState({ message:'', visible:false, type:'success' })

  if(!user) return <div>Please sign in to manage goals.</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Savings Goals</h2>
      <form onSubmit={submit} className="mb-4">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Goal name" className="p-2 mr-2" />
        <input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Target amount" className="p-2 mr-2" />
        <button className="px-3 py-1" style={{background:'var(--accent)',color:'white'}}>Create</button>
      </form>
      <ul>
        {goals.map(g=> <li key={g.id} className="p-2" style={{background:'var(--panel)', marginBottom:6}}>{g.name} — {g.current_amount}/{g.target_amount}</li>)}
      </ul>
    </div>
  )
}
