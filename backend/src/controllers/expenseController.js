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
    if (search?.trim()) filter.itemName = { $regex: search.trim(), $options: 'i' };
    if (month) {
      const [year, m] = month.split('-').map(Number);
      if (!year || !m || m < 1 || m > 12) return res.status(400).json({ message: 'Invalid month filter' });
      filter.expenseDate = { $gte: new Date(year, m - 1, 1), $lt: new Date(year, m, 1) };
    }
    const expenses = await Expense.find(filter).sort({ expenseDate: -1, createdAt: -1 });
    res.json({ expenses });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try {
    const { type, itemName, category = 'Other', quantity = 1, price, expenseDate, dueDate, notes = '' } = req.body;
    const qty = Number(quantity);
    const amount = Number(price);
    if (!['daily', 'monthly'].includes(type)) return res.status(400).json({ message: 'Expense type must be daily or monthly' });
    if (!itemName?.trim()) return res.status(400).json({ message: 'Item name is required' });
    if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: 'Quantity must be greater than 0' });
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
    if (!expenseDate) return res.status(400).json({ message: 'Expense date is required' });

    const expense = await Expense.create({
      userId: req.user.id, type, itemName: itemName.trim(),
      category: category?.trim() || 'Other', quantity: qty, price: amount,
      totalAmount: qty * amount, expenseDate, dueDate: dueDate || undefined,
      notes: notes?.trim() || ''
    });
    res.status(201).json({ expense });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const payments = await Payment.find({ expenseId: expense._id, userId: req.user.id }).sort({ paymentDate: -1, createdAt: -1 });
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    res.json({ expense, payments, paid, remaining: Math.max(expense.totalAmount - paid, 0) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const allowed = ['type', 'itemName', 'category', 'quantity', 'price', 'expenseDate', 'dueDate', 'notes'];
    for (const key of allowed) if (req.body[key] !== undefined) expense[key] = req.body[key];

    if (!['daily', 'monthly'].includes(expense.type)) return res.status(400).json({ message: 'Invalid expense type' });
    expense.itemName = expense.itemName.trim();
    expense.category = expense.category?.trim() || 'Other';
    expense.quantity = Number(expense.quantity);
    expense.price = Number(expense.price);

    if (!Number.isFinite(expense.quantity) || expense.quantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than 0' });
    if (!Number.isFinite(expense.price) || expense.price <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });

    expense.totalAmount = expense.quantity * expense.price;
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