import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true }, 
    year: { type: Number, required: true },
    overallLimit: { type: Number, required: true, min: 0 },
    categoryLimits: [
      {
        category: { type: String, required: true },
        limit: { type: Number, required: true, min: 0 }
      }
    ]
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
