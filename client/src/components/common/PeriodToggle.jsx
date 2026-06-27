import styles from './PeriodToggle.module.css';

export default function PeriodToggle({ period, setPeriod }) {
  const options = ['Daily', 'Weekly', 'Monthly'];
  
  return (
    <div className={styles.container}>
      {options.map(opt => (
        <button
          key={opt}
          className={`${styles.button} ${period === opt.toLowerCase() ? styles.active : ''}`}
          onClick={() => setPeriod(opt.toLowerCase())}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
