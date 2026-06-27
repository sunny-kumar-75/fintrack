import { useState, useEffect } from 'react';
import { LuTrendingUp, LuTrendingDown, LuChartPie } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { getStats, getTrends, getCategoryBreakdown } from '../../services/dashboardService';
import GreetingBanner from '../../components/widgets/GreetingBanner';
import StatCard from '../../components/widgets/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import DateRangePicker from '../../components/common/DateRangePicker';
import PeriodToggle from '../../components/common/PeriodToggle';
import RecentTransactions from '../../components/widgets/RecentTransactions';
import HealthScore from '../../components/widgets/HealthScore';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          getStats(period, startDate, endDate),
          getTrends(period, startDate, endDate),
          getCategoryBreakdown(period, startDate, endDate)
        ]);
        
        const [statsRes, trendsRes, breakdownRes] = results;

        if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
          setStats(statsRes.value.stats);
        } else {
          setStats({ income: 0, expense: 0, savings: 0, healthScore: 0 });
        }

        if (trendsRes.status === 'fulfilled' && trendsRes.value?.success) {
          setTrends(trendsRes.value.trends || []);
        }

        if (breakdownRes.status === 'fulfilled' && breakdownRes.value?.success) {
          setBreakdown(breakdownRes.value.breakdown || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    window.addEventListener('transaction-updated', fetchData);
    return () => window.removeEventListener('transaction-updated', fetchData);
  }, [period, startDate, endDate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <GreetingBanner />
        <div className={styles.controls}>
          <PeriodToggle period={period} setPeriod={setPeriod} />
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            setStartDate={setStartDate} 
            setEndDate={setEndDate} 
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <StatCard 
              title="Total Income" 
              amount={stats?.income || 0} 
              icon={<LuTrendingUp />} 
              color="#22c55e"
            />
            <StatCard 
              title="Total Expenses" 
              amount={stats?.expense || 0} 
              icon={<LuTrendingDown />} 
              color="#ef4444"
            />
            <StatCard 
              title="Net Savings" 
              amount={stats?.savings || 0} 
              icon={<LuTrendingUp />} 
              color="#6366f1"
            />
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Spending Trends</h3>
              </div>
              <AreaChart data={trends} />
            </div>
            
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Income vs Expense</h3>
              </div>
              <BarChart data={trends} />
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Top Categories</h3>
              </div>
              <DonutChart data={breakdown.slice(0, 5)} />
            </div>
          </div>

          <div className={styles.bottomGrid}>
            <RecentTransactions period={period} startDate={startDate} endDate={endDate} />
            <HealthScore streak={stats?.streak || 0} />
          </div>
        </>
      )}
    </div>
  );
}
