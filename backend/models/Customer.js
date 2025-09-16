const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customer_id: { type: Number, index: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  city: { type: String, trim: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

customerSchema.index({ email: 1 });
customerSchema.index({ city: 1 });

module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
