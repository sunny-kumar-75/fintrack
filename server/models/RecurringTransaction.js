import mongoose from 'mongoose';

const recurringSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['expense', 'income'], required: true },
    category: {
      name: { type: String, required: true },
      icon: { type: String, required: true }
    },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    nextDueDate: { type: Date, required: true },
    lastProcessedDate: { type: Date },
    status: { type: String, enum: ['active', 'paused'], default: 'active' }
  },
  { timestamps: true }
);

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringSchema);
export default RecurringTransaction;
