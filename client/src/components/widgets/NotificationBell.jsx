import { useState, useEffect } from 'react';
import { LuBell } from 'react-icons/lu';
import { getUnreadCount, getNotifications, markAllAsRead } from '../../../services/notificationService';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        if (res.success) setUnreadCount(res.count);
      } catch (err) {}
    };
    fetchCount();
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      try {
        const res = await getNotifications();
        if (res.success) setNotifications(res.notifications);
        if (unreadCount > 0) {
          await markAllAsRead();
          setUnreadCount(0);
        }
      } catch (err) {}
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.bellBtn} onClick={handleOpen}>
        <LuBell />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h4>Notifications</h4>
          </div>
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={`${styles.item} ${!n.isRead ? styles.unread : ''}`}>
                  <div className={styles.title}>{n.title}</div>
                  <div className={styles.message}>{n.message}</div>
                  <div className={styles.time}>{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
