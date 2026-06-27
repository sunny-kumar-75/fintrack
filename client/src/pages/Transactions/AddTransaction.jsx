import { useState, useEffect, useRef } from 'react';
import { LuX, LuCamera, LuFileText } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { createTransaction, updateTransaction, uploadReceipt } from '../../services/transactionService';
import { getCategories } from '../../services/categoryService';
import { scanReceipt } from '../../services/aiService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import IconMapper from '../../components/common/IconMapper';
import { useAuth } from '../../context/AuthContext';
import styles from './AddTransaction.module.css';

export default function AddTransaction({ isOpen, onClose, onSave, transaction = null, initialData = null }) {
  const { user } = useAuth();
  const isEditing = !!transaction;
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: null,
    date: new Date().toISOString().split('T')[0],
    note: '',
    paymentMethod: 'cash',
    receiptUrl: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && transaction) {
        setFormData({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          date: new Date(transaction.date).toISOString().split('T')[0],
          note: transaction.note || '',
          paymentMethod: transaction.paymentMethod,
          receiptUrl: transaction.receiptUrl || ''
        });
      } else if (initialData) {
        setFormData({
          type: 'expense',
          amount: initialData.amount || '',
          category: initialData.category ? { name: initialData.category } : null,
          date: initialData.date || new Date().toISOString().split('T')[0],
          note: initialData.merchant || '',
          paymentMethod: 'cash',
          receiptUrl: initialData.receiptUrl || ''
        });
      } else {
        setFormData({
          type: 'expense',
          amount: '',
          category: null,
          date: new Date().toISOString().split('T')[0],
          note: '',
          paymentMethod: 'cash',
          receiptUrl: ''
        });
      }
    }
  }, [isOpen, isEditing, transaction, initialData]);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('receipt', file);

    setUploading(true);
    try {
      const res = await uploadReceipt(fd);
      if (res.success) {
        setFormData(prev => ({ ...prev, receiptUrl: res.url }));
        toast.success('Receipt uploaded. Scanning with AI...');
        
        try {
          const scanRes = await scanReceipt(res.url);
          if (scanRes.success && scanRes.extractedData) {
            const data = scanRes.extractedData;
            
            if (data.isValidReceipt === false) {
              toast.error('The uploaded image does not appear to be a valid receipt or bill.', { duration: 4000 });
              return; 
            }
            
            setFormData(prev => {
              const newData = { ...prev };
              if (data.amount) newData.amount = data.amount;
              if (data.date) newData.date = data.date;
              if (data.merchant) newData.note = data.merchant;
              
              if (data.category && categories.length > 0) {
                const foundCat = categories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
                if (foundCat) newData.category = { name: foundCat.name, icon: foundCat.icon };
              }
              
              return newData;
            });
            toast.success('Receipt details extracted! Please review and click Save.');
          }
        } catch (scanErr) {
          toast.error('AI scan failed, but image uploaded.');
        }
      }
    } catch (err) {
      toast.error('Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/) != null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      toast.error('Amount and Category are required');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateTransaction(transaction._id, formData);
        toast.success('Transaction updated');
      } else {
        await createTransaction(formData);
        toast.success('Transaction added');
      }
      window.dispatchEvent(new Event('transaction-updated'));
      onSave();
      onClose();
    } catch (err) {
      toast.error(isEditing ? 'Failed to update transaction' : 'Failed to add transaction');
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
          <h2 className={styles.title}>{isEditing ? 'Edit Transaction' : 'New Transaction'}</h2>
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
                autoFocus
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
              label="Date" 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Payment Method" 
              name="paymentMethod" 
              value={formData.paymentMethod} 
              onChange={handleChange} 
              as="select"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </Input>
          </div>

          <Input 
            label="Note (Optional)" 
            name="note" 
            value={formData.note} 
            onChange={handleChange} 
            placeholder="What was this for?" 
          />

          <div 
            className={styles.uploadArea} 
            onClick={() => !formData.receiptUrl && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
            />
            
            {formData.receiptUrl ? (
              <div 
                className={styles.previewContainer} 
                onClick={(e) => { e.stopPropagation(); window.open(formData.receiptUrl, '_blank'); }}
                title="Click to view full receipt"
              >
                {isImageUrl(formData.receiptUrl) ? (
                  <img src={formData.receiptUrl} alt="Receipt" className={styles.previewImg} />
                ) : (
                  <div className={styles.docPreview}>
                    <LuFileText className={styles.docIcon} />
                    <span>View Document</span>
                  </div>
                )}
                <button 
                  type="button" 
                  className={styles.removeReceiptBtn} 
                  onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, receiptUrl: ''}))}}
                >
                  <LuX />
                </button>
              </div>
            ) : uploading ? (
              <div className={styles.uploadText}>Uploading...</div>
            ) : (
              <>
                <LuCamera className={styles.uploadIcon} />
                <div className={styles.uploadText}>Add Receipt / Scan with AI</div>
              </>
            )}
          </div>
        </form>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
