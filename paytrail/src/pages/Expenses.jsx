import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addExpense, getExpenses } from '../services/expenseService'
import Toast from '../components/Toast'
import { getCategories } from '../services/categoriesService'

export default function Expenses(){
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(()=>{ if(user){ getExpenses(user.id).then(setList).catch(console.error); getCategories(user.id).then(setCategories).catch(console.error)} },[user])

  const submit = async e=>{
    e.preventDefault()
    if(!user) return
    try{
      await addExpense({ userId: user.id, categoryId, amount: Number(amount) })
      const res = await getExpenses(user.id)
      setList(res)
      setAmount('')
      setToast({ message: 'Expense recorded', type: 'success', visible: true })
    }catch(e){ console.error(e) }
  }

  const [toast, setToast] = React.useState({ message:'', visible:false, type:'success' })

  if(!user) return <div>Please sign in to manage expenses.</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Expenses</h2>
      <form onSubmit={submit} className="mb-4">
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" className="p-2 mr-2" />
        <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="p-2 mr-2">
          <option value="">Select category</option>
          {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="px-3 py-1" style={{background:'var(--accent)',color:'white'}}>Add</button>
      </form>
      <ul>
        {list.map(i=> <li key={i.id} className="p-2" style={{background:'var(--panel)', marginBottom:6}}>{i.date} — {i.amount}</li>)}
      </ul>
      <Toast {...toast} onClose={()=>setToast({message:'',visible:false})} />
    </div>
  )
}
