'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from './Card'

export function TrendChartCard({ title, data, dataKey, xKey }) {
  return (
    <Card className="chart-card">
      <h3>{title}</h3>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <XAxis dataKey={xKey} stroke="#9aa2b1" />
            <YAxis stroke="#9aa2b1" domain={[50, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="#4cd4b0" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

