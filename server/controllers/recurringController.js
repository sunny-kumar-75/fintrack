import RecurringTransaction from '../models/RecurringTransaction.js';

export const getRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringTransaction.find({ userId: req.user._id }).sort({ nextDueDate: 1 });
    res.json({ success: true, recurring });
  } catch (error) {
    next(error);
  }
};

export const createRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringTransaction.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json({ success: true, recurring });
  } catch (error) {
    next(error);
  }
};

export const updateRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, recurring });
  } catch (error) {
    next(error);
  }
};

export const deleteRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringTransaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};
