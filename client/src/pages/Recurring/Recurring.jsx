import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuPause, LuPlay } from 'react-icons/lu';
import { getRecurring, updateRecurring, deleteRecurring } from '../../services/recurringService';
import Button from '../../components/common/Button';
import IconMapper from '../../components/common/IconMapper';
import AddRecurring from './AddRecurring';
import styles from './Recurring.module.css';

export default function Recurring() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getRecurring();
      if (res.success) setItems(res.recurring);
    } catch (err) {
      toast.error('Failed to load recurring items');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await updateRecurring(id, { status: newStatus });
      if (res.success) {
        setItems(items.map(item => item._id === id ? { ...item, status: newStatus } : item));
        toast.success(`Subscription ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring transaction?')) return;
    try {
      const res = await deleteRecurring(id);
      if (res.success) {
        setItems(items.filter(item => item._id !== id));
        toast.success('Deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading-spinner" style={{ margin: '4rem auto' }} />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Recurring Transactions</h1>
          <p className={styles.subtitle}>Manage subscriptions and regular bills</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <LuPlus /> Add Recurring
        </Button>
      </div>

      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={`${styles.empty} glass`}>
            <div className={styles.emptyIcon}>🔄</div>
            <h3>No recurring transactions found</h3>
            <p>Set up automatic tracking for your subscriptions and bills.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} className={`${styles.card} glass ${item.status === 'paused' ? styles.paused : ''}`}>
              <div className={styles.iconWrapper}>
                <IconMapper name={item.category.icon} size={24} />
              </div>
              <div className={styles.details}>
                <h3>{item.name}</h3>
                <p>{item.frequency} • Next due: {new Date(item.nextDueDate).toLocaleDateString()}</p>
              </div>
              <div className={styles.amount}>
                {item.type === 'expense' ? '-' : '+'}₹{item.amount.toFixed(2)}
              </div>
              <div className={styles.actions}>
                <button 
                  className={styles.iconBtn} 
                  title={item.status === 'active' ? 'Pause' : 'Resume'}
                  onClick={() => toggleStatus(item._id, item.status)}
                >
                  {item.status === 'active' ? <LuPause /> : <LuPlay />}
                </button>
                <button 
                  className={`${styles.iconBtn} ${styles.deleteBtn}`} 
                  title="Delete"
                  onClick={() => handleDelete(item._id)}
                >
                  <LuTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddRecurring 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSave={fetchData} 
      />
    </div>
  );
}
