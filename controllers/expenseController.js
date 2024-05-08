const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  const { title, date, amount, categoryId } = req.body;

  try {
    // Create new expense
    const newExpense = new Expense({
      title,
      date,
      amount,
      category: categoryId,
    });

    // Save expense to database
    await newExpense.save();

    res.status(201).json({ message: 'Expense added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

exports.getExpenses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const totalCount = await Expense.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const expenses = await Expense.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'name');

    res.status(200).json({ expenses, totalPages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

exports.groupedExpenses = async (req, res) => {
  try {
    const groupedExpenses = await Expense.aggregate([
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { _id: 0, category: '$category.name', totalAmount: 1 } },
    ]);

    res.status(200).json({ groupedExpenses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to group expenses' });
  }
};

exports.monthlyExpensesByCategory = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const monthlyExpenses = await Expense.aggregate([
      { $match: { category: categoryId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("MOnthly Expenses", monthlyExpenses);

    res.status(200).json({ monthlyExpenses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly expenses' });
  }
};

