import { useState, useEffect, useCallback } from 'react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { LuPlus, LuSearch, LuFilter, LuPen, LuTrash2, LuEllipsisVertical, LuFileText, LuArrowUp, LuArrowDown } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { getTransactions, deleteTransaction, bulkDeleteTransactions } from '../../services/transactionService';
import { getCategories } from '../../services/categoryService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import IconMapper from '../../components/common/IconMapper';
import AddTransaction from './AddTransaction';
import { generateTransactionPDF } from '../../utils/pdfGenerator';
import styles from './TransactionList.module.css';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [selectedIds, setSelectedIds] = useState([]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactions({
        page,
        limit: 20,
        ...filters
      });
      if (data.success) {
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
    
    const handleUpdate = () => {
      fetchTransactions();
    };
    
    window.addEventListener('transaction-updated', handleUpdate);
    return () => window.removeEventListener('transaction-updated', handleUpdate);
  }, [fetchTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await deleteTransaction(id);
      if (res.success) {
        toast.success('Transaction deleted');
        fetchTransactions();
      }
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} transactions?`)) return;
    try {
      const res = await bulkDeleteTransactions(selectedIds);
      if (res.success) {
        toast.success(res.message);
        setSelectedIds([]);
        fetchTransactions();
      }
    } catch (err) {
      toast.error('Failed to delete transactions');
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t._id));
    }
  };

  const handleExportPDF = async () => {
    try {
      const toastId = toast.loading('Generating PDF...');
      const data = await getTransactions({
        ...filters,
        page: 1,
        limit: 1000 
      });
      if (data.success) {
        generateTransactionPDF(data.transactions, filters);
        toast.success('PDF Exported Successfully!', { id: toastId });
      } else {
        toast.error('Failed to fetch data for PDF', { id: toastId });
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  const groupedTransactions = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    let key = format(date, 'MMM dd, yyyy');
    if (isToday(date)) key = 'Today';
    else if (isYesterday(date)) key = 'Yesterday';
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="md" onClick={handleExportPDF}>
            <LuFileText /> Export PDF
          </Button>
          <Button variant="primary" size="md" onClick={() => { setEditingTransaction(null); setIsAddOpen(true); }}>
            <LuPlus /> Add Transaction
          </Button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <Input 
            name="search" 
            placeholder="Search notes..." 
            value={filters.search} 
            onChange={handleFilterChange}
            icon={<LuSearch />}
            className={styles.searchInput}
          />
          <select name="type" value={filters.type} onChange={handleFilterChange} className={styles.select}>
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select name="category" value={filters.category} onChange={handleFilterChange} className={styles.select}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <div className={styles.dateRange}>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={styles.dateInput} />
            <span style={{color: 'var(--color-text-tertiary)'}}>to</span>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={styles.dateInput} />
          </div>
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className={styles.select}>
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
          <button 
            type="button"
            className={styles.sortBtn}
            onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' }))}
            title={`Sort ${filters.sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
          >
            {filters.sortOrder === 'desc' ? <LuArrowDown size={18} /> : <LuArrowUp size={18} />}
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className={styles.bulkActions}>
          <span className={styles.bulkText}>{selectedIds.length} selected</span>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <LuTrash2 /> Delete Selected
          </Button>
        </div>
      )}

      {loading ? (
        <div className={styles.list}>
          {[...Array(5)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h3 className={styles.emptyTitle}>No transactions found</h3>
          <p>Try adjusting your filters or add a new transaction.</p>
        </div>
      ) : (
        <div className={styles.list}>
          <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" className={styles.rowCheckbox} checked={selectedIds.length === transactions.length} onChange={toggleAll} />
              Select All
            </label>
          </div>
          
          {Object.entries(groupedTransactions).map(([dateLabel, items]) => (
            <div key={dateLabel} className={styles.section}>
              <div className={styles.sectionHeader}>{dateLabel}</div>
              {items.map(t => {
                const categoryColor = categories.find(c => c.name === t.category.name)?.color || '#6366f1';
                
                return (
                  <div key={t._id} className={styles.row}>
                    <input 
                      type="checkbox" 
                      className={styles.rowCheckbox} 
                      checked={selectedIds.includes(t._id)}
                      onChange={() => toggleSelection(t._id)}
                    />
                    <div className={styles.iconWrapper} style={{ backgroundColor: `${categoryColor}20` }}>
                      <IconMapper name={t.category.icon} size={24} />
                    </div>
                    <div className={styles.details}>
                      <div className={styles.note}>
                        <span className="truncate" style={{ flex: 1, minWidth: 0 }}>
                          {t.note || t.category.name}
                        </span>
                        {t.receiptUrl && (
                          <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" className={styles.receiptLink} title="View Receipt" onClick={e => e.stopPropagation()}>
                            <LuFileText size={14} />
                          </a>
                        )}
                      </div>
                      {t.note && <div className={styles.categoryName}>{t.category.name}</div>}
                    </div>
                    <div className={styles.meta}>
                      <div className={`${styles.amount} ${t.type === 'expense' ? styles.amountExpense : styles.amountIncome}`}>
                        {t.type === 'expense' ? '-' : '+'}{t.currency} {t.amount.toFixed(2)}
                      </div>
                      <div className={styles.paymentMethod}>{t.paymentMethod.replace('_', ' ')}</div>
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} aria-label="Edit" onClick={() => { setEditingTransaction(t); setIsAddOpen(true); }}><LuPen /></button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(t._id)} aria-label="Delete"><LuTrash2 /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn} 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              className={`${styles.pageBtn} ${page === i + 1 ? styles.pageActive : ''}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button 
            className={styles.pageBtn} 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      <AddTransaction 
        isOpen={isAddOpen} 
        onClose={() => { setIsAddOpen(false); setEditingTransaction(null); }} 
        onSave={fetchTransactions} 
        transaction={editingTransaction}
      />
    </div>
  );
}
