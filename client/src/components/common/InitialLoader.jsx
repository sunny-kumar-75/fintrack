import React, { useState, useEffect } from 'react';
import styles from './InitialLoader.module.css';

export default function InitialLoader() {
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setShowLongWaitMessage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinnerWrapper}>
        <div className={styles.spinner}></div>
        <div className={styles.icon}>F</div>
      </div>
      
      <h2 className={styles.title}>FinTrack</h2>
      
      <div className={styles.messageContainer}>
        {showLongWaitMessage ? (
          <div className={styles.longWaitMessage}>
            <p className={styles.primaryText}>Setting up your workspace...</p>
            <p className={styles.secondaryText}>
              Loading your financial insights and preparing your dashboard. Just a moment...
            </p>
          </div>
        ) : (
          <p className={styles.primaryText}>Loading...</p>
        )}
      </div>
    </div>
  );
}
