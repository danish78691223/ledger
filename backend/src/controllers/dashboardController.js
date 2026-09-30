const Expense = require('../models/Expense');
const Payment = require('../models/Payment');

exports.summary = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [monthExpenses, todayExpenses] = await Promise.all([
      Expense.find({ userId: req.user.id, expenseDate: { $gte: start, $lt: end } }),
      Expense.find({ userId: req.user.id, expenseDate: { $gte: todayStart, $lt: todayEnd } })
    ]);

    const expenseIds = monthExpenses.map((expense) => expense._id);
    const monthPayments = expenseIds.length
      ? await Payment.find({ userId: req.user.id, expenseId: { $in: expenseIds } })
      : [];

    const totalMonth = monthExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
    const today = todayExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
    const paid = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pending = Math.max(totalMonth - paid, 0);

    const categories = {};
    monthExpenses.forEach((expense) => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.totalAmount;
    });

    res.json({ totalMonth, today, paid, pending, categories });
  } catch (error) { res.status(500).json({ message: error.message }); }
};