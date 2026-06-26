import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { getFinancialInsights, chatWithAI, scanReceipt, categorizeTransaction } from '../utils/geminiService.js';

export const getInsights = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(20)
      .select('amount category type date note');

    const currency = 'INR';

    const insights = await getFinancialInsights(transactions, currency);

    const insightsList = insights.split('\n')
      .map(line => line.replace(/^[\*\-]\s*/, '').replace(/\*\*/g, '').trim())
      .filter(line => line.length > 0);

    res.json({ success: true, insights: insightsList });
  } catch (error) {
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      res.json({ 
        success: true, 
        insights: ['You have reached the free tier limits for the AI assistant today.', 'Please try again tomorrow or upgrade your API key.'] 
      });
    } else {
      console.error('AI Insights Error:', error);
      res.json({ 
        success: true, 
        insights: ['Our AI assistant is temporarily unavailable.', 'Please check back later.'] 
      });
    }
  }
};

export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    const recentTxns = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(10)
      .select('amount category type date');

    const currency = 'INR';

    const reply = await chatWithAI(message, recentTxns, currency);
    res.json({ success: true, reply });
  } catch (error) {
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      res.json({ success: true, reply: "I'm currently resting because the free AI API quota has been reached! Please chat with me again tomorrow." });
    } else {
      console.error('AI Chat Error:', error);
      res.json({ success: true, reply: "I'm experiencing some technical difficulties connecting to my brain. Please try again later." });
    }
  }
};

export const processReceipt = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL required' });
    }
    
    const extractedData = await scanReceipt(imageUrl);
    res.json({ success: true, extractedData });
  } catch (error) {
    next(error);
  }
};

export const categorize = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ success: false, message: 'Note required' });

    const category = await categorizeTransaction(note);
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};
