const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  log_id: { type: Number, index: true, unique: true },
  campaign_id: { type: String },
  customer_id: { type: Number, index: true, required: true },
  message: { type: String, required: true },
  delivery_status: { type: String, enum: ['PROCESSING', 'SENT', 'FAILED'], required: true },
  failure_reason: { type: String },
  retry_count: { type: Number, default: 0 },
  next_retry_at: { type: Date },
  last_error: { type: String },
  sent_at: { type: Date },
  delivered_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);


