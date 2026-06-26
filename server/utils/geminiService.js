import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const getFinancialInsights = async (transactions, currency = 'USD') => {
  if (!transactions || transactions.length === 0) return "Not enough data for insights.";
  
  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = `Analyze these financial transactions (currency: ${currency}). Today's date is ${currentDate}.
  Provide EXACTLY 3 highly specific, data-driven insights. 
  Rules:
  1. Focus ONLY on spending from the last 30 days. Ignore older transactions.
  2. Keep it EXTREMELY short and punchy (MAXIMUM 15 WORDS per bullet).
  3. No generic advice. Mention specific categories/amounts.
  4. DO NOT include any introductory or concluding sentences.
  Transactions: ${JSON.stringify(transactions)}`;
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.status === 503 || error.message?.includes('503')) {
      return `* Google's Gemini AI servers are currently overloaded.\n* Please try again in a few minutes.\n* This is a temporary server issue on Google's end.`;
    }
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      return `* You have reached the free tier limits for the AI assistant today.\n* Please try again tomorrow or upgrade your API key.\n* Taking a break to respect API rate limits.`;
    }
    
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    return `* You spent ${currency} ${expenses.toFixed(2)} and earned ${currency} ${income.toFixed(2)} recently.
* Try reducing non-essential expenses to increase your savings rate.
* Consider setting a strict budget for your top spending categories.`;
  }
};

export const chatWithAI = async (message, context, currency = 'USD') => {
  const prompt = `You are FinTrack AI, a helpful financial assistant. Keep answers brief (under 50 words). Context of user's recent transactions (amounts in ${currency}): ${JSON.stringify(context)}. User says: "${message}"`;
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.status === 503 || error.message?.includes('503')) {
      return "Google's Gemini AI servers are currently experiencing high demand. Please try asking me again in a few minutes!";
    }
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      return "I'm currently resting because the free AI API quota has been reached! Please chat with me again tomorrow.";
    }
    
    const totalSpent = context.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    if (message.toLowerCase().includes('spent') || message.toLowerCase().includes('how much')) {
      return `Based on your recent transactions, you have spent a total of ${currency} ${totalSpent.toFixed(2)}.`;
    }
    return `Hello! I am your AI financial assistant. Based on your data, you've spent ${currency} ${totalSpent.toFixed(2)} recently. How can I help you manage your budget today?`;
  }
};

export const scanReceipt = async (imagePathOrUrl) => {
  try {
    let base64Data;
    let mimeType = 'image/jpeg'; 

    if (imagePathOrUrl.startsWith('http')) {
      const response = await fetch(imagePathOrUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString('base64');
      mimeType = response.headers.get('content-type') || 'image/jpeg';
    } else {
      const fs = await import('fs');
      const buffer = fs.readFileSync(imagePathOrUrl);
      base64Data = buffer.toString('base64');
      if (imagePathOrUrl.endsWith('.png')) mimeType = 'image/png';
      else if (imagePathOrUrl.endsWith('.webp')) mimeType = 'image/webp';
      else if (imagePathOrUrl.endsWith('.pdf')) mimeType = 'application/pdf';
    }

    const prompt = `Analyze this image to determine if it is a valid receipt, bill, or invoice. 
    Respond ONLY with a valid JSON object using this exact structure:
    {
      "isValidReceipt": true or false,
      "merchant": "Name of the store or merchant",
      "amount": 123.45,
      "date": "YYYY-MM-DD",
      "category": "One of: Food & Dining, Transport, Rent & Housing, Subscriptions, Shopping, Health, Travel, Entertainment, Education, Salary, Freelance, Gifts, Other"
    }
    If the image is NOT a receipt or bill (e.g. it's a selfie, landscape, or random screenshot without billing info), set "isValidReceipt" to false and set the other fields to null.
    If you cannot find a specific value on a valid receipt, use null for that field. Do not include any markdown or text outside the JSON block.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ]);
    
    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini Vision API Error:', error);
    throw new Error('Failed to analyze receipt image');
  }
};

export const categorizeTransaction = async (note) => {
  const prompt = `Based on this transaction description: "${note}", suggest the most appropriate category from this list: Food & Dining, Transport, Rent & Housing, Subscriptions, Shopping, Health, Travel, Entertainment, Education, Salary, Freelance, Gifts, Other. Respond with exactly the category name, nothing else.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return 'Other';
  }
};
