import React from 'react'

export default function ChartCard({ title, children }){
  return (
    <div className="p-4 rounded" style={{background:'var(--panel)'}}>
      <div className="text-sm mb-2" style={{color:'var(--muted)'}}>{title}</div>
      <div style={{minHeight:120}}>
        {children || <div style={{color:'var(--muted)'}}>Chart placeholder</div>}
      </div>
    </div>
  )
}
