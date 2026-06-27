import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './GreetingBanner.module.css';

export default function GreetingBanner() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const firstName = user?.username?.split(' ')[0] || 'there';
  const displayName = user?.nickname || firstName;
  const fullText = `Welcome back, ${displayName}! Here's your financial overview.`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50); 

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className={styles.banner}>
      <h1 className={styles.greeting}>
        {text}
        <span className={`${styles.cursor} ${isTyping ? styles.typing : ''}`}>|</span>
      </h1>
    </div>
  );
}
