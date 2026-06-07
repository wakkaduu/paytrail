import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addIncome, getIncomes } from '../services/incomeService'
import Toast from '../components/Toast'

export default function Incomes(){
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('Salary')

  useEffect(()=>{ if(user){ getIncomes(user.id).then(setList).catch(console.error) } },[user])

  const submit = async e=>{
    e.preventDefault()
    if(!user) return
    try{
      await addIncome({ userId: user.id, amount: Number(amount), source })
      const res = await getIncomes(user.id)
      setList(res)
      setAmount('')
      setToast({ message: 'Income added', type: 'success', visible: true })
    }catch(e){ console.error(e) }
  }

  const [toast, setToast] = React.useState({ message:'', visible:false, type:'success' })

  if(!user) return <div>Please sign in to manage incomes.</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Incomes</h2>
      <form onSubmit={submit} className="mb-4">
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" className="p-2 mr-2" />
        <select value={source} onChange={e=>setSource(e.target.value)} className="p-2 mr-2">
          <option>Salary</option>
          <option>Bonus</option>
          <option>Freelance</option>
          <option>Other</option>
        </select>
        <button className="px-3 py-1" style={{background:'var(--accent)',color:'white'}}>Add</button>
      </form>
      <ul>
        {list.map(i=> <li key={i.id} className="p-2" style={{background:'var(--panel)', marginBottom:6}}>{i.date} — {i.amount} — {i.source}</li>)}
      </ul>
      <Toast {...toast} onClose={()=>setToast({message:'',visible:false})} />
    </div>
  )
}
