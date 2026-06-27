import { LuSun, LuMoon } from 'react-icons/lu';
import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button 
      className={styles.toggle} 
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <LuMoon className={styles.icon} /> : <LuSun className={styles.icon} />}
    </button>
  );
}
