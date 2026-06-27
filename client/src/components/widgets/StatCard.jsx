import styles from './StatCard.module.css';

export default function StatCard({ title, amount, currency = '₹', icon, color }) {
  return (
    <div 
      className={styles.card}
      style={{
        '--card-glow': `${color}40`,
        '--card-glow-hover': `${color}60`,
        '--card-text-color': color
      }}
    >
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
      
      <div className={styles.body}>
        <div className={styles.amount}>
          <span className={styles.currency}>{currency}</span>
          {amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
