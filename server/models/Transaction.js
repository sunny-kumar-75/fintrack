import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['expense', 'income'], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    convertedAmount: { type: Number }, 
    exchangeRate: { type: Number },
    category: {
      name: { type: String, required: true },
      icon: { type: String, required: true },
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 500 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'], default: 'cash' },
    receiptUrl: { type: String }, 
    isRecurring: { type: Boolean, default: false },
    recurringId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecurringTransaction' },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, 'category.name': 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
