import { useState, useEffect } from 'react';
import { LuTarget } from 'react-icons/lu';
import { getHeatmap } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import styles from './HealthScore.module.css';

export default function HealthScore({ streak }) {
  const { user } = useAuth();
  
  const [heatmap, setHeatmap] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const createdYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : currentYear;
  const years = [];
  for (let i = currentYear; i >= createdYear; i--) {
    years.push(i);
  }

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        const res = await getHeatmap(selectedYear, selectedMonth);
        if (res.success) {
          setHeatmap(res.heatmap || []);
        }
      } catch (err) {
        console.error('Failed to fetch heatmap', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, [selectedYear, selectedMonth]);

  const startDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  
  let calendarGrid = Array(startDay).fill(null).concat(heatmap);

  const remainder = calendarGrid.length % 7;
  if (remainder !== 0) {
    calendarGrid = calendarGrid.concat(Array(7 - remainder).fill(null));
  }

  return (
    <div className={styles.container}>

      <div className={styles.streakSection}>
        <div className={styles.header}>
          <LuTarget className={styles.flameIcon} />
          <h4>Tracking Streak</h4>
        </div>

        <div className={styles.streakValue}>
          {streak} <span>days</span>
        </div>
        <p className={styles.streakSub}>Keep logging your expenses!</p>
        
        <div className={styles.filters}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className={styles.select}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={styles.select}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className={styles.heatmapWrapper} style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s ease' }}>
          <div className={styles.weekdays}>
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div className={styles.heatmap}>
            {calendarGrid.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className={styles.emptyDay} />;
              }
              let activeClass = '';
              if (day.count > 0) activeClass = styles.dayActive1;
              if (day.count > 2) activeClass = styles.dayActive2;
              if (day.count > 5) activeClass = styles.dayActive3;
              return (
                <div 
                  key={i} 
                  className={`${styles.day} ${activeClass}`} 
                  title={`${day.date}: ${day.count} transactions`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
