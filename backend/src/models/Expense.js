const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['daily', 'monthly'], required: true },
  itemName: { type: String, required: true, trim: true },
  category: { type: String, default: 'Other', trim: true },
  quantity: { type: Number, default: 1, min: 0 },
  price: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  expenseDate: { type: Date, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
