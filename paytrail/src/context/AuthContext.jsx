import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUser, onAuthStateChange, signOut } from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function init(){
      setLoading(true)
      try{
        const u = await getUser()
        if(mounted) setUser(u)
      }catch(e){ /* ignore */ }
      if(mounted) setLoading(false)
    }
    init()

    const unsub = onAuthStateChange((event, session)=>{
      const u = session?.user ?? null
      setUser(u)
    })

    return ()=>{ mounted=false; unsub && unsub() }
  },[])

  async function logout(){
    await signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
