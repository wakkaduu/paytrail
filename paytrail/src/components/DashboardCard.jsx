import React from 'react'

export default function DashboardCard({ title, value, subtitle }){
  return (
    <div className="p-4 rounded" style={{background:'var(--panel)'}}>
      <div className="text-sm text-muted" style={{color:'var(--muted)'}}>{title}</div>
      <div className="text-2xl font-bold mt-2" style={{color:'var(--text)'}}>{value}</div>
      {subtitle && <div className="text-sm mt-1" style={{color:'var(--muted)'}}>{subtitle}</div>}
    </div>
  )
}
