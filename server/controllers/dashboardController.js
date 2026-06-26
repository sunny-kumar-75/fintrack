import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import User from '../models/User.js';
import { getPeriodBoundaries } from '../utils/dateUtils.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { period, startDate, endDate } = req.query;
    
    const { currentStart, currentEnd, previousStart, previousEnd } = getPeriodBoundaries(period, startDate, endDate);

    const user = await User.findById(userId);

    const currentStats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: currentStart, $lte: currentEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const lastStats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: previousStart, $lte: previousEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const getVal = (arr, type) => arr.find(s => s._id === type)?.total || 0;
    
    const currIncome = getVal(currentStats, 'income');
    const currExpense = getVal(currentStats, 'expense');
    const currSavings = currIncome - currExpense;

    const calcChange = (curr, last) => {
      if (last === 0) {
        if (curr === 0) return 0;
        return curr > 0 ? 100 : -100;
      }
      return ((curr - last) / Math.abs(last)) * 100;
    };

    const lastIncome = getVal(lastStats, 'income');
    const lastExpense = getVal(lastStats, 'expense');
    const lastSavings = lastIncome - lastExpense;

    const incomeChange = calcChange(currIncome, lastIncome);
    const expenseChange = calcChange(currExpense, lastExpense);
    const savingsChange = calcChange(currSavings, lastSavings);

    res.json({
      success: true,
      stats: {
        income: currIncome,
        incomeChange,
        expense: currExpense,
        expenseChange,
        savings: currSavings,
        savingsChange,
        streak: user.currentStreak || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { period, startDate: sq, endDate: eq } = req.query;
    const now = new Date();
    
    let startDate;
    let endDate;
    let formatStr = "%Y-%m";
    
    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      formatStr = "%Y-%m-%d";
    } else if (period === 'weekly') {
      const daysSinceMonday = (now.getDay() + 6) % 7; 
      const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
      startDate = new Date(currentMonday);
      startDate.setDate(startDate.getDate() - 21); // 3 weeks before current Monday
      endDate = new Date(currentMonday);
      endDate.setDate(endDate.getDate() + 6); // End on Sunday of current week
      endDate.setHours(23, 59, 59, 999);
      formatStr = "%Y-%m-%d";
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      formatStr = "%Y-%m";
    }

    if (sq && eq) {
      startDate = new Date(sq);
      endDate = new Date(eq);
      endDate.setHours(23, 59, 59, 999);
      const diff = (endDate - startDate) / (1000 * 60 * 60 * 24);
      if (diff <= 31) formatStr = "%Y-%m-%d";
      else formatStr = "%Y-%m";
    }

    const trends = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { 
            // Always fetch daily granularity from DB to allow precise JS bucketing
            dateKey: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: '$type' 
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.dateKey': 1 } }
    ]);

    const formattedData = {};

    if (period === 'weekly') {
      // Create exactly 4 weekly buckets strictly Monday-Sunday
      const daysSinceMonday = (now.getDay() + 6) % 7; 
      const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
      currentMonday.setHours(0,0,0,0);
      
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(currentMonday);
        weekStart.setDate(weekStart.getDate() - ((3 - i) * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23,59,59,999);
        
        const m = String(weekEnd.getMonth() + 1).padStart(2, '0');
        const d = String(weekEnd.getDate()).padStart(2, '0');
        const displayKey = `${m}/${d}`; // Label by Sunday
        
        formattedData[i] = { name: displayKey, income: 0, expense: 0, rawDate: weekStart.toISOString(), start: weekStart, end: weekEnd };
      }
      
      trends.forEach(t => {
         const tDate = new Date(t._id.dateKey);
         for (let i = 3; i >= 0; i--) {
           if (tDate >= formattedData[i].start && tDate <= formattedData[i].end) {
             formattedData[i][t._id.type] += t.total;
             break;
           }
         }
      });
    } else {
      // Pre-fill dates with 0s to ensure continuous graphs for Daily, Monthly, and Custom Range
      let current = new Date(startDate);
      while (current <= endDate) {
        let key, displayKey;
        if (formatStr === '%Y-%m') {
          const y = current.getFullYear();
          const m = String(current.getMonth() + 1).padStart(2, '0');
          key = `${y}-${m}`;
          displayKey = current.toLocaleString('default', { month: 'long' });
          current.setMonth(current.getMonth() + 1);
        } else {
          const y = current.getFullYear();
          const m = String(current.getMonth() + 1).padStart(2, '0');
          const d = String(current.getDate()).padStart(2, '0');
          key = `${y}-${m}-${d}`;
          displayKey = `${m}/${d}`;
          current.setDate(current.getDate() + 1);
        }
        formattedData[key] = { name: displayKey, income: 0, expense: 0, rawDate: key };
      }

      trends.forEach(t => {
        const key = t._id.dateKey;
        // Map the daily DB string to monthly format if needed
        let matchKey = key;
        if (formatStr === '%Y-%m') {
           const [y, m] = key.split('-');
           matchKey = `${y}-${m}`;
        }
        if (formattedData[matchKey]) {
          formattedData[matchKey][t._id.type] += t.total;
        }
      });
    }

    res.json({
      success: true,
      trends: Object.values(formattedData).sort((a,b) => a.rawDate.localeCompare(b.rawDate))
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { period, startDate, endDate } = req.query;
    
    const { currentStart, currentEnd } = getPeriodBoundaries(period, startDate, endDate);

    const breakdown = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'expense', date: { $gte: currentStart, $lte: currentEnd } } },
      {
        $group: {
          _id: '$category.name',
          value: { $sum: '$amount' }
        }
      },
      { $sort: { value: -1 } }
    ]);

    const formatted = breakdown.map(b => ({ name: b._id, value: b.value }));

    res.json({ success: true, breakdown: formatted });
  } catch (error) {
    next(error);
  }
};

export const getRecentTransactions = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;
    const { currentStart, currentEnd } = getPeriodBoundaries(period, startDate, endDate);

    const transactions = await Transaction.find({ 
      userId: req.user._id,
      date: { $gte: currentStart, $lte: currentEnd }
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);
    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};

export const getHeatmapData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query; 

    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    
    const endDate = new Date(targetYear, targetMonth, 1);

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

    const heatmapData = await Transaction.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId), 
          date: { $gte: startDate, $lt: endDate } 
        } 
      },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    const heatmap = [];
    for (let i = 1; i <= daysInMonth; i++) {
       const d = new Date(targetYear, targetMonth - 1, i);
       const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
       const found = heatmapData.find(h => h._id === dateStr);
       heatmap.push({ date: dateStr, count: found ? found.count : 0 });
    }

    res.json({ success: true, heatmap });
  } catch (error) {
    next(error);
  }
};
