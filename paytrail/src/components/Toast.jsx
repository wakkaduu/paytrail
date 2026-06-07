import React, { useEffect } from 'react'

export default function Toast({ message, type = 'success', visible, onClose }){
  useEffect(()=>{
    if(!visible) return
    const t = setTimeout(()=> onClose && onClose(), 3000)
    return ()=> clearTimeout(t)
  },[visible])

  if(!visible || !message) return null

  const bg = type === 'error' ? '#ef4444' : '#10b981'
  return (
    <div style={{position:'fixed', right:20, bottom:20, zIndex:60}}>
      <div style={{background:bg, color:'white', padding:'10px 14px', borderRadius:8, boxShadow:'0 6px 18px rgba(2,6,23,0.6)'}}>
        {message}
      </div>
    </div>
  )
}
