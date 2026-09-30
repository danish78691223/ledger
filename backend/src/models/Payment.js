const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'bank', 'card', 'other'], default: 'cash' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
