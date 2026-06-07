import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCategories, createDefaultCategories } from '../services/categoriesService'
import Toast from '../components/Toast'

export default function Categories(){
  const { user } = useAuth()
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        if(!user) return
        const res = await getCategories(user.id)
        if(mounted) setCats(res)
      }catch(e){ console.error(e) }
      if(mounted) setLoading(false)
    }
    load()
    return ()=>{ mounted=false }
  },[user])

  const seed = async ()=>{
    if(!user) return
    try{
      await createDefaultCategories(user.id)
      const res = await getCategories(user.id)
      setCats(res)
      setToast({ message: 'Default categories created', type: 'success', visible: true })
    }catch(e){ console.error(e) }
  }

  const [toast, setToast] = React.useState({ message: '', visible: false, type: 'success' })

  if(!user) return <div>Please sign in to manage categories.</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <button onClick={seed} className="px-3 py-1 rounded mb-4" style={{background:'var(--accent)', color:'white'}}>Create Default Categories</button>
      {loading ? <div>Loading...</div> : (
        <ul>
          {cats.map(c=> <li key={c.id} className="p-2" style={{background:'var(--panel)', marginBottom:6}}>{c.name} — {c.type}</li>)}
          {cats.length===0 && <li className="text-muted">No categories yet.</li>}
        </ul>
      )}
      <Toast {...toast} onClose={()=>setToast({message:'',visible:false})} />
    </div>
  )
}
