import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ userId: req.user._id }).sort({ isDefault: -1, name: 1 });
    
    if (categories.length === 0) {
      await seedDefaultCategories(req.user._id);
      categories = await Category.find({ userId: req.user._id }).sort({ isDefault: -1, name: 1 });
    } else {
      // Self-healing: Ensure legacy users get the new 'Other' category
      const hasOther = categories.some(cat => cat.name === 'Other');
      if (!hasOther) {
        const otherCat = await Category.create({
          userId: req.user._id,
          name: 'Other',
          icon: 'LuMoreHorizontal',
          color: '#64748b',
          type: 'both',
          isDefault: true
        });
        categories.push(otherCat);
      }
    }

    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color, type } = req.body;

    const existing = await Category.findOne({ userId: req.user._id, name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
      icon,
      color,
      type,
      isDefault: false,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, color, type } = req.body;
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.name = name || category.name;
    category.icon = icon || category.icon;
    category.color = color || category.color;
    category.type = type || category.type;

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot delete default categories' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const seedDefaultCategories = async (userId) => {
  const defaultCategories = [
    { name: 'Food & Dining', icon: 'LuUtensils', color: '#f59e0b', type: 'expense' },
    { name: 'Transport', icon: 'LuCar', color: '#3b82f6', type: 'expense' },
    { name: 'Rent & Housing', icon: 'LuHome', color: '#6366f1', type: 'expense' },
    { name: 'Subscriptions', icon: 'LuCreditCard', color: '#8b5cf6', type: 'expense' },
    { name: 'Shopping', icon: 'LuShoppingCart', color: '#ec4899', type: 'expense' },
    { name: 'Health', icon: 'LuHeart', color: '#10b981', type: 'expense' },
    { name: 'Travel', icon: 'LuPlane', color: '#0ea5e9', type: 'expense' },
    { name: 'Entertainment', icon: 'LuGamepad2', color: '#a855f7', type: 'expense' },
    { name: 'Education', icon: 'LuBook', color: '#f43f5e', type: 'expense' },
    { name: 'Salary', icon: 'LuDollarSign', color: '#22c55e', type: 'income' },
    { name: 'Freelance', icon: 'LuBriefcase', color: '#14b8a6', type: 'income' },
    { name: 'Gifts', icon: 'LuGift', color: '#f59e0b', type: 'both' },
    { name: 'Other', icon: 'LuMoreHorizontal', color: '#64748b', type: 'both' },
  ];

  const categoriesToInsert = defaultCategories.map(cat => ({
    ...cat,
    userId,
    isDefault: true,
  }));

  await Category.insertMany(categoriesToInsert);
};
