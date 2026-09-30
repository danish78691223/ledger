const Payment = require('../models/Payment');
const Expense = require('../models/Expense');

async function updateStatus(expenseId, userId) {
  const expense = await Expense.findOne({ _id: expenseId, userId });
  if (!expense) return;
  const payments = await Payment.find({ expenseId, userId });
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  expense.status = paid >= expense.totalAmount ? 'paid' : paid > 0 ? 'partial' : 'pending';
  await expense.save();
}

exports.create = async (req, res) => {
  try {
    const { expenseId, amount, paymentDate, paymentMethod, notes } = req.body;
    const expense = await Expense.findOne({ _id: expenseId, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const existing = await Payment.find({ expenseId, userId: req.user.id });
    const paid = existing.reduce((sum, p) => sum + p.amount, 0);
    if (Number(amount) > expense.totalAmount - paid) return res.status(400).json({ message: `Maximum remaining amount is ₹${(expense.totalAmount - paid).toFixed(2)}` });
    const payment = await Payment.create({ userId: req.user.id, expenseId, amount, paymentDate, paymentMethod, notes });
    await updateStatus(expenseId, req.user.id);
    res.status(201).json({ payment });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.list = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).populate('expenseId', 'itemName type category').sort({ paymentDate: -1 });
    res.json({ payments });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await updateStatus(payment.expenseId, req.user.id);
    res.json({ message: 'Payment deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
