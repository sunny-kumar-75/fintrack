import { useState, useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { createRecurring } from '../../services/recurringService';
import { getCategories } from '../../services/categoryService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import IconMapper from '../../components/common/IconMapper';
import styles from '../Transactions/AddTransaction.module.css';

export default function AddRecurring({ isOpen, onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    amount: '',
    category: null,
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        type: 'expense',
        amount: '',
        category: null,
        frequency: 'monthly',
        nextDueDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (cat) => {
    setFormData(prev => ({ 
      ...prev, 
      category: { name: cat.name, icon: cat.icon } 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.category) {
      toast.error('Name, Amount, and Category are required');
      return;
    }

    setLoading(true);
    try {
      await createRecurring(formData);
      toast.success('Recurring transaction added');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Failed to add recurring transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === formData.type || c.type === 'both');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>New Recurring</h2>
          <button className={styles.closeBtn} onClick={onClose}><LuX /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.typeToggle}>
            <button 
              type="button" 
              className={`${styles.toggleBtn} ${styles.toggleExpense} ${formData.type === 'expense' ? styles.active : ''}`}
              onClick={() => { setFormData(prev => ({...prev, type: 'expense', category: null})); }}
            >
              Expense
            </button>
            <button 
              type="button" 
              className={`${styles.toggleBtn} ${styles.toggleIncome} ${formData.type === 'income' ? styles.active : ''}`}
              onClick={() => { setFormData(prev => ({...prev, type: 'income', category: null})); }}
            >
              Income
            </button>
          </div>

          <Input 
            label="Name / Title" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Netflix Subscription" 
            required
            autoFocus
          />

          <div className={styles.amountSection}>
            <div className={styles.amountLabel}>Amount</div>
            <div className={styles.amountInputWrapper}>
              <span className={styles.currency}>₹</span>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                className={styles.amountInput} 
                placeholder="0.00" 
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <div className={styles.sectionLabel}>Category</div>
            <div className={styles.categoryGrid}>
              {filteredCategories.map(cat => {
                const isSelected = formData.category?.name === cat.name;
                return (
                  <div 
                    key={cat._id} 
                    className={`${styles.categoryCard} ${isSelected ? styles.categorySelected : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span className={styles.categoryIcon}>
                      <IconMapper name={cat.icon} size={24} />
                    </span>
                    <span className={styles.categoryName}>{cat.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.row}>
            <Input 
              label="Frequency" 
              name="frequency" 
              value={formData.frequency} 
              onChange={handleChange} 
              as="select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Input>
            <Input 
              label="Next Due Date" 
              type="date" 
              name="nextDueDate" 
              value={formData.nextDueDate} 
              onChange={handleChange} 
              required 
            />
          </div>
        </form>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
