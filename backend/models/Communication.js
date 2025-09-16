const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Communication', communicationSchema);
