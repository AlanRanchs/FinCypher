import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TrendChart({ data, title = 'Spending Trend' }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h4>{title}</h4>
        <p className="subtitle">No data available</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${Math.abs(value).toFixed(0)}`}
          />
          <Tooltip 
            formatter={(value) => `$${Math.abs(value).toFixed(2)}`}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Daily Spending"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Cumulative"
            dot={{ r: 3 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
