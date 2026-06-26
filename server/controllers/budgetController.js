import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const getBudget = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    
    const d = new Date();
    const queryMonth = month ? Number(month) : d.getMonth() + 1;
    const queryYear = year ? Number(year) : d.getFullYear();

    let budget = await Budget.findOne({ userId: req.user._id, month: queryMonth, year: queryYear });

    if (!budget) {
      return res.json({ success: true, budget: null });
    }

    res.json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { month, year, overallLimit, categoryLimits } = req.body;

    const d = new Date();
    const queryMonth = month ? Number(month) : d.getMonth() + 1;
    const queryYear = year ? Number(year) : d.getFullYear();

    let budget = await Budget.findOne({ userId: req.user._id, month: queryMonth, year: queryYear });

    if (budget) {
      budget.overallLimit = overallLimit;
      budget.categoryLimits = categoryLimits || [];
      await budget.save();
    } else {
      budget = await Budget.create({
        userId: req.user._id,
        month: queryMonth,
        year: queryYear,
        overallLimit,
        categoryLimits: categoryLimits || []
      });
    }

    res.json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

export const getBudgetStatus = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    
    const d = new Date();
    const queryMonth = month ? Number(month) : d.getMonth() + 1;
    const queryYear = year ? Number(year) : d.getFullYear();

    const budget = await Budget.findOne({ userId: req.user._id, month: queryMonth, year: queryYear });
    if (!budget) {
      return res.json({ success: true, status: null });
    }

    const startDate = new Date(queryYear, queryMonth - 1, 1);
    const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59, 999);

    const expenses = await Transaction.aggregate([
      { 
        $match: { 
          userId: budget.userId, 
          type: 'expense', 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: '$category.name',
          spent: { $sum: '$amount' }
        }
      }
    ]);

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.spent, 0);

    const categoryStatus = budget.categoryLimits.map(cat => {
      const spent = expenses.find(e => e._id === cat.category)?.spent || 0;
      return {
        category: cat.category,
        limit: cat.limit,
        spent,
        remaining: cat.limit - spent,
        percentage: Math.min((spent / cat.limit) * 100, 100)
      };
    });

    res.json({
      success: true,
      status: {
        overall: {
          limit: budget.overallLimit,
          spent: totalSpent,
          remaining: budget.overallLimit - totalSpent,
          percentage: Math.min((totalSpent / budget.overallLimit) * 100, 100)
        },
        categories: categoryStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
