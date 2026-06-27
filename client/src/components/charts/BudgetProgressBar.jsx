import styles from './BudgetProgressBar.module.css';

export default function BudgetProgressBar({ label, limit, spent, currency = '₹', showIcon = false, icon }) {
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const remaining = limit - spent;
  
  let statusColor = 'var(--color-primary)';
  if (percentage >= 90) {
    statusColor = 'var(--color-danger)';
  } else if (percentage >= 75) {
    statusColor = 'var(--color-warning)';
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.labelWrapper}>
          {showIcon && icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.label}>{label}</span>
        </div>
        <div className={styles.amounts}>
          <span className={styles.spent}>{currency}{spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span className={styles.limit}> / {currency}{limit.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
        </div>
      </div>
      
      <div className={styles.track}>
        <div 
          className={styles.fill} 
          style={{ width: `${percentage}%`, backgroundColor: statusColor }}
        />
      </div>
      
      <div className={styles.footer}>
        {remaining >= 0 ? (
          <span className={styles.remaining}>{currency}{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} left</span>
        ) : (
          <span className={styles.overspent}>{currency}{Math.abs(remaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })} over budget</span>
        )}
        <span className={styles.percentage}>{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}
