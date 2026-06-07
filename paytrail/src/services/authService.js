import { supabase, hasSupabaseConfig } from '../supabase'

export async function signUpWithEmail(email, password){
  if(!hasSupabaseConfig) throw new Error('Supabase not configured')
  const res = await supabase.auth.signUp({ email, password })
  return res
}

export async function signInWithEmail(email, password){
  if(!hasSupabaseConfig) throw new Error('Supabase not configured')
  const res = await supabase.auth.signInWithPassword({ email, password })
  return res
}

export async function signOut(){
  if(!hasSupabaseConfig) return
  await supabase.auth.signOut()
}

export function onAuthStateChange(cb){
  if(!hasSupabaseConfig) return () => {}
  const { data: sub } = supabase.auth.onAuthStateChange((event, session)=> cb(event, session))
  return () => sub?.subscription?.unsubscribe?.()
}

export async function getUser(){
  if(!hasSupabaseConfig) return null
  const { data } = await supabase.auth.getUser()
  return data?.user ?? null
}
