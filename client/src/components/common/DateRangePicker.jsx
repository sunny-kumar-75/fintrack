import styles from './DateRangePicker.module.css';

export default function DateRangePicker({ startDate, endDate, setStartDate, setEndDate }) {
  return (
    <div className={styles.container}>
      <input 
        type="date" 
        className={styles.input} 
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <span className={styles.separator}>to</span>
      <input 
        type="date" 
        className={styles.input} 
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </div>
  );
}
