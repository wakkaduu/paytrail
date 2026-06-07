import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmail, signUpWithEmail } from '../services/authService'

export default function Login(){
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [mode, setMode] = useState('sign-in')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const nav = useNavigate()

	async function submit(e){
		e.preventDefault(); setLoading(true); setError(null)
		try{
			if(mode === 'sign-in'){
				const res = await signInWithEmail(email, password)
				if(res.error) throw res.error
			} else {
				const res = await signUpWithEmail(email, password)
				if(res.error) throw res.error
			}
			nav('/')
		}catch(err){
			setError(err.message || String(err))
		}finally{setLoading(false)}
	}

	return (
		<div className="max-w-md mx-auto p-6" style={{background:'var(--panel)',borderRadius:8}}>
			<h2 className="text-xl font-bold mb-4">{mode === 'sign-in' ? 'Sign In' : 'Create account'}</h2>
			<div className="mb-4">
				<button onClick={()=>setMode('sign-in')} className={mode==='sign-in'? 'font-bold mr-2':''}>Sign in</button>
				<button onClick={()=>setMode('sign-up')} className={mode==='sign-up'? 'font-bold':''}>Sign up</button>
			</div>
			<form onSubmit={submit}>
				<label className="block mb-2">Email
					<input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 mt-1" type="email" required />
				</label>
				<label className="block mb-2">Password
					<input value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 mt-1" type="password" required />
				</label>
				{error && <div className="text-red-400 mb-2">{error}</div>}
				<div className="flex items-center justify-between">
					<button type="submit" disabled={loading} className="px-4 py-2 rounded" style={{background:'var(--accent)',color:'white'}}>{loading? 'Please wait...' : (mode==='sign-in'?'Sign in':'Create account')}</button>
				</div>
			</form>
		</div>
	)
}
