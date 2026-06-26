import cron from 'node-cron';
import RecurringTransaction from '../models/RecurringTransaction.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

export const startCronJobs = () => {
  
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job for recurring transactions...');
    
    try {
      const today = new Date();
      
      const dueTransactions = await RecurringTransaction.find({
        status: 'active',
        nextDueDate: { $lte: today }
      });

      for (let recurring of dueTransactions) {
        
        await Transaction.create({
          userId: recurring.userId,
          type: recurring.type,
          amount: recurring.amount,
          category: recurring.category,
          date: today,
          note: `Auto-logged: ${recurring.name}`,
          isRecurring: true,
          recurringId: recurring._id
        });

        await Notification.create({
          userId: recurring.userId,
          type: 'bill_reminder',
          title: 'Recurring Transaction Logged',
          message: `${recurring.name} of ₹${recurring.amount} has been automatically logged.`
        });

        let nextDate = new Date(recurring.nextDueDate);
        if (recurring.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        if (recurring.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        if (recurring.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        if (recurring.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

        recurring.nextDueDate = nextDate;
        recurring.lastProcessedDate = today;
        await recurring.save();
      }

      console.log(`Processed ${dueTransactions.length} recurring transactions.`);
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};
