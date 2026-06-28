import { useState, useEffect, useRef } from 'react';
import { LuPlus } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { createTransaction } from '../../services/transactionService';
import { getCategories } from '../../services/categoryService';
import Button from '../common/Button';
import IconMapper from '../common/IconMapper';
import styles from './QuickAdd.module.css';

export default function QuickAdd() {
  const [isOpen, setIsOpen] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && allCategories.length === 0) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      if (data.success) {
        setAllCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category) {
      toast.error('Amount and Category are required');
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        type,
        amount: Number(amount),
        category: { name: category.name, icon: category.icon },
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash'
      });
      toast.success('Added successfully');
      setIsOpen(false);
      setAmount('');
      setCategory(null);
      window.dispatchEvent(new Event('transaction-updated'));
    } catch (err) {
      toast.error('Failed to add');
    } finally {
      setLoading(false);
    }
  };

    const displayCategories = allCategories.filter(c => c.type === type || c.type === 'both');

  return (
    <div className={styles.container} ref={containerRef}>
      {isOpen && (
        <div className={styles.popup}>
          <div className={styles.header}>
            <div className={styles.title}>Quick Add</div>
          </div>

          <div className={styles.toggleGroup}>
            <button 
              type="button"
              className={`${styles.toggleBtn} ${type === 'expense' ? styles.toggleBtnActive : ''}`}
              onClick={() => { setType('expense'); setCategory(null); }}
            >
              Expense
            </button>
            <button 
              type="button"
              className={`${styles.toggleBtn} ${type === 'income' ? styles.toggleBtnActive : ''}`}
              onClick={() => { setType('income'); setCategory(null); }}
            >
              Income
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.amountInput}
              placeholder="0.00"
              step="0.01"
              min="0"
              autoFocus
            />

            <div className={styles.categories}>
              {loading && allCategories.length === 0 ? (
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', padding: '10px' }}>Loading...</div>
              ) : displayCategories.length === 0 ? (
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', padding: '10px' }}>No categories available</div>
              ) : (
                displayCategories.slice(0, 8).map(cat => (
                  <div 
                    key={cat._id}
                    className={`${styles.catBtn} ${category?.name === cat.name ? styles.catBtnSelected : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    <span className={styles.catIcon}><IconMapper name={cat.icon} size={16} /></span>
                    <span className={styles.catName}>{cat.name}</span>
                  </div>
                ))
              )}
            </div>

            <Button type="submit" variant="primary" isLoading={loading} fullWidth>
              Save
            </Button>
          </form>
        </div>
      )}

      <button 
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Add"
      >
        <LuPlus />
      </button>
    </div>
  );
}
