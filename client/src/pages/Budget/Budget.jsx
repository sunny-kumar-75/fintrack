import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LuPen, LuSave, LuX, LuPlus, LuTrash2 } from 'react-icons/lu';
import { getBudgetStatus, createOrUpdateBudget, getBudget } from '../../services/budgetService';
import { getCategories } from '../../services/categoryService';
import BudgetProgressBar from '../../components/charts/BudgetProgressBar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './Budget.module.css';

export default function Budget() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [overallLimit, setOverallLimit] = useState('');
  const [categoryLimits, setCategoryLimits] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, catRes, budgetRes] = await Promise.all([
        getBudgetStatus(),
        getCategories(),
        getBudget()
      ]);
      
      if (statusRes.success) setStatus(statusRes.status);
      if (catRes.success) setAllCategories(catRes.categories.filter(c => c.type !== 'income'));
      
      if (budgetRes.success && budgetRes.budget) {
        setOverallLimit(budgetRes.budget.overallLimit);
        setCategoryLimits(budgetRes.budget.categoryLimits);
      } else {
        setOverallLimit('');
        setCategoryLimits([]);
      }
    } catch (err) {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategoryLimit = () => {
    setCategoryLimits([...categoryLimits, { category: '', limit: '' }]);
  };

  const handleUpdateCategoryLimit = (index, field, value) => {
    const updated = [...categoryLimits];
    updated[index][field] = value;
    setCategoryLimits(updated);
  };

  const handleRemoveCategoryLimit = (index) => {
    const updated = [...categoryLimits];
    updated.splice(index, 1);
    setCategoryLimits(updated);
  };

  const handleSave = async () => {
    if (!overallLimit) return toast.error('Overall limit is required');

    const validCategoryLimits = categoryLimits
      .filter(c => c.category && c.limit)
      .map(c => ({ category: c.category, limit: Number(c.limit) }));

    try {
      const res = await createOrUpdateBudget({
        overallLimit: Number(overallLimit),
        categoryLimits: validCategoryLimits
      });
      if (res.success) {
        toast.success('Budget updated!');
        setIsEditing(false);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update budget');
    }
  };

  if (loading) {
    return <div className="loading-spinner" style={{ margin: '4rem auto' }} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Budget Management</h1>
          <p className={styles.subtitle}>Set limits and track your monthly spending</p>
        </div>
        {!isEditing ? (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            <LuPen /> Edit Budget
          </Button>
        ) : (
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              <LuX /> Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <LuSave /> Save Changes
            </Button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className={styles.content}>
          {!status ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎯</div>
              <h3>No budget set for this month</h3>
              <p>Start tracking your expenses by setting a monthly limit.</p>
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Create Budget
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Overall Monthly Budget</h3>
                <BudgetProgressBar 
                  label="Total Spending" 
                  limit={status.overall.limit} 
                  spent={status.overall.spent} 
                />
              </div>

              {status.categories && status.categories.length > 0 && (
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Category Budgets</h3>
                  <div className={styles.categoryList}>
                    {status.categories.map(cat => {
                      const categoryObj = allCategories.find(c => c.name === cat.category);
                      return (
                        <div key={cat.category} className={styles.categoryItem}>
                          <BudgetProgressBar 
                            label={cat.category} 
                            limit={cat.limit} 
                            spent={cat.spent}
                            showIcon={true}
                            icon={categoryObj?.icon || '🏷️'}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className={styles.editForm}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Overall Limit</h3>
            <Input
              label="How much do you want to spend in total this month?"
              type="number"
              placeholder="e.g. 50000"
              value={overallLimit}
              onChange={(e) => setOverallLimit(e.target.value)}
            />
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Category Limits (Optional)</h3>
              <button className={styles.addBtn} onClick={handleAddCategoryLimit}>
                <LuPlus /> Add Category
              </button>
            </div>
            
            <div className={styles.editCategoryList}>
              {categoryLimits.map((cat, idx) => (
                <div key={idx} className={styles.editCategoryRow}>
                  <Input 
                    as="select"
                    value={cat.category}
                    onChange={(e) => handleUpdateCategoryLimit(idx, 'category', e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {allCategories.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </Input>
                  <Input 
                    type="number" 
                    placeholder="Limit"
                    value={cat.limit}
                    onChange={(e) => handleUpdateCategoryLimit(idx, 'limit', e.target.value)}
                  />
                  <button className={styles.removeBtn} onClick={() => handleRemoveCategoryLimit(idx)} title="Remove Category Limit">
                    <LuTrash2 />
                  </button>
                </div>
              ))}
              {categoryLimits.length === 0 && (
                <p className={styles.helpText}>You haven't set any specific category limits yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
