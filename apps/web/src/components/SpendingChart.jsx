import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1']

export default function SpendingChart({ data, title = 'Spending by Category' }) {
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
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="category" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            tick={{ fontSize: 12 }}
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
          <Bar dataKey="total" fill="#8884d8" name="Total Spent" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
