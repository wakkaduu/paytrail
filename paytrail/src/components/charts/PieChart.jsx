import React from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

export default function PieChart({ labels = [], values = [], height = 200 }){
  const data = { labels, datasets: [{ data: values, backgroundColor: ['#60a5fa','#34d399','#f97316','#f43f5e','#a78bfa'] }] }
  const options = { responsive: true, maintainAspectRatio: false }
  return (
    <div style={{height}}>
      <Pie data={data} options={options} />
    </div>
  )
}
