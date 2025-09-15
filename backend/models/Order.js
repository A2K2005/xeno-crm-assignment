const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: { type: Number, index: true, unique: true },
  customer_id: { type: Number, required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

orderSchema.index({ customer_id: 1, date: -1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
