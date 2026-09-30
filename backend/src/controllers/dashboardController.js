const Expense = require('../models/Expense');
const Payment = require('../models/Payment');

exports.summary = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const [monthExpenses, todayExpenses, monthPayments] = await Promise.all([
      Expense.find({ userId: req.user.id, expenseDate: { $gte: start, $lt: end } }),
      Expense.find({ userId: req.user.id, expenseDate: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) } }),
      Payment.find({ userId: req.user.id, paymentDate: { $gte: start, $lt: end } })
    ]);
    const totalMonth = monthExpenses.reduce((s, e) => s + e.totalAmount, 0);
    const today = todayExpenses.reduce((s, e) => s + e.totalAmount, 0);
    const paid = monthPayments.reduce((s, p) => s + p.amount, 0);
    const pending = Math.max(totalMonth - paid, 0);
    const categories = {};
    monthExpenses.forEach(e => { categories[e.category] = (categories[e.category] || 0) + e.totalAmount; });
    res.json({ totalMonth, today, paid, pending, categories });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
