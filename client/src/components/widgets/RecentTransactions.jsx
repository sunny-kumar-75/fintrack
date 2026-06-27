import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { getRecentTransactions } from '../../services/dashboardService';
import IconMapper from '../common/IconMapper';
import styles from './RecentTransactions.module.css';

export default function RecentTransactions({ period, startDate, endDate }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      try {
        const data = await getRecentTransactions(period, startDate, endDate);
        if (data.success) {
          setTransactions(data.transactions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [period, startDate, endDate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Transactions</h3>
        <button className={styles.viewAllBtn} onClick={() => navigate('/transactions')}>
          View All <LuArrowRight />
        </button>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.empty}>No recent transactions</div>
      ) : (
        <div className={styles.list}>
          {transactions.map(t => (
            <div key={t._id} className={styles.item}>
              <div className={styles.iconWrapper}>
                <IconMapper name={t.category.icon} size={20} />
              </div>
              <div className={styles.details}>
                <div className={styles.note}>{t.note || t.category.name}</div>
                <div className={styles.date}>{new Date(t.date).toLocaleDateString()}</div>
              </div>
              <div className={`${styles.amount} ${t.type === 'expense' ? styles.expense : styles.income}`}>
                {t.type === 'expense' ? '-' : '+'}{t.currency} {t.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
