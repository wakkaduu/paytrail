import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function LineChart({ labels = [], datasets = [], height = 200 }){
  const data = useMemo(()=>({ labels, datasets }), [labels, datasets])
  const options = useMemo(()=>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  }), [])

  return (
    <div style={{height}}>
      <Line data={data} options={options} />
    </div>
  )
}
