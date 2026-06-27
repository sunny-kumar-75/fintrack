import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function CustomBarChart({ data }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'var(--color-text-tertiary)' }}>
        <p>No data available for this period.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="var(--color-text-tertiary)"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            stroke="var(--color-text-tertiary)"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `₹${value}`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(30, 30, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)', 
              backdropFilter: 'blur(12px)',
              borderColor: 'var(--color-border)',
              borderRadius: '12px',
              color: 'var(--color-text-primary)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'}`
            }} 
            itemStyle={{ color: 'var(--color-text-primary)', fontFamily: 'Inter', fontWeight: 500 }}
            cursor={{ fill: 'var(--color-primary-muted)', opacity: 0.2 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'Inter' }} iconType="circle" />
          <Bar dataKey="income" name="Income" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} barSize={24} />
          <Bar dataKey="expense" name="Expense" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
