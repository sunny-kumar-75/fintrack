import Transaction from '../models/Transaction.js';

export const exportCSV = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    
    let csv = 'Date,Type,Category,Amount,Currency,Note\n';
    transactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      const note = t.note ? `"${t.note.replace(/"/g, '""')}"` : '';
      csv += `${date},${t.type},${t.category.name},${t.amount},${t.currency},${note}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
