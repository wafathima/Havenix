const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  category: { 
    type: String, 
    required: true,
    enum: ['materials', 'labor', 'equipment', 'permit', 'utility', 'transport', 'other']
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'cheque', 'credit_card', 'other']
  },
  paymentReference: String,
  vendor: String,
  receipt: String,
  taxAmount: Number,
  taxRate: Number,
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue', 'cancelled'],
    default: 'paid'
  },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  recurringEndDate: Date,
  notes: String,
  tags: [String],
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Add indexes
expenseSchema.index({ builder: 1, date: -1 });
expenseSchema.index({ project: 1, date: -1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);