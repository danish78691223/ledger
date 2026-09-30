const Expense = require('../models/Expense');
const Payment = require('../models/Payment');

async function refreshStatus(expenseId, userId) {
  const expense = await Expense.findOne({ _id: expenseId, userId });
  if (!expense) return null;
  const result = await Payment.aggregate([
    { $match: { expenseId: expense._id, userId: expense.userId } },
    { $group: { _id: null, paid: { $sum: '$amount' } } }
  ]);
  const paid = result[0]?.paid || 0;
  expense.status = paid >= expense.totalAmount ? 'paid' : paid > 0 ? 'partial' : 'pending';
  await expense.save();
  return expense;
}

exports.list = async (req, res) => {
  try {
    const { type, month, search } = req.query;
    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    if (search) filter.itemName = { $regex: search, $options: 'i' };
    if (month) {
      const [year, m] = month.split('-').map(Number);
      filter.expenseDate = { $gte: new Date(year, m - 1, 1), $lt: new Date(year, m, 1) };
    }
    const expenses = await Expense.find(filter).sort({ expenseDate: -1, createdAt: -1 });
    res.json({ expenses });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try {
    const { type, itemName, category, quantity = 1, price, expenseDate, dueDate, notes } = req.body;
    if (!type || !itemName || price === undefined || !expenseDate) return res.status(400).json({ message: 'Type, item, price and date are required' });
    const totalAmount = Number(quantity) * Number(price);
    const expense = await Expense.create({ userId: req.user.id, type, itemName, category, quantity, price, totalAmount, expenseDate, dueDate, notes });
    res.status(201).json({ expense });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const payments = await Payment.find({ expenseId: expense._id, userId: req.user.id }).sort({ paymentDate: -1 });
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ expense, payments, paid, remaining: Math.max(expense.totalAmount - paid, 0) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const total = Number(expense.quantity) * Number(expense.price);
    expense.totalAmount = total;
    await expense.save();
    await refreshStatus(expense._id, req.user.id);
    res.json({ expense });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await Payment.deleteMany({ expenseId: expense._id, userId: req.user.id });
    res.json({ message: 'Expense deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
