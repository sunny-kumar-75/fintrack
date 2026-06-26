import Transaction from '../models/Transaction.js';
import User from '../models/User.js';


export const getTransactions = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount, 
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (category) query['category.name'] = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    if (search) {
      query.note = { $regex: search, $options: 'i' };
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query)
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, currency, category, date, note, paymentMethod, receiptUrl } = req.body;

    const txnCurrency = 'INR';

    let convertedAmount = amount;
    let exchangeRate = 1;

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount,
      currency: txnCurrency,
      convertedAmount,
      exchangeRate,
      category,
      date: date || Date.now(),
      note,
      paymentMethod,
      receiptUrl
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await User.findById(req.user._id);
    let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    if (!lastActive || lastActive.getTime() < today.getTime()) {
      if (lastActive && (today.getTime() - lastActive.getTime() === 86400000)) {
        
        user.currentStreak += 1;
      } else if (!lastActive || (today.getTime() - lastActive.getTime() > 86400000)) {
        
        user.currentStreak = 1;
      }
      
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
      user.lastActiveDate = new Date();
      await user.save();
    }

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of transaction IDs' });
    }

    const result = await Transaction.deleteMany({
      _id: { $in: ids },
      userId: req.user._id
    });

    res.json({ success: true, message: `${result.deletedCount} transactions deleted successfully` });
  } catch (error) {
    next(error);
  }
};

export const uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }
    
    let fileUrl = req.file.path;
    if (!fileUrl.startsWith('http')) {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    next(error);
  }
};
