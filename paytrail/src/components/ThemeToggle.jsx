import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle(){
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} className="px-3 py-1 rounded border" style={{borderColor: 'var(--panel)', background:'transparent', color:'var(--text)'}} aria-label="Toggle theme">
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
