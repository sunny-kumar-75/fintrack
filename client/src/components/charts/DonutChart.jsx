import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#0ea5e9', '#10b981', '#f43f5e'];

export default function DonutChart({ data }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
        No category data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ paddingTop: '20px', fontFamily: 'Inter', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
