const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaign_id: { type: Number, index: true, unique: true },
  campaign_name: { type: String, required: true },
  segment_id: { type: Number, required: true },
  message_template: { type: String, required: true },
  audience_size: { type: Number, default: 0 },
  status: { type: String, enum: ['CREATED', 'QUEUED', 'SENDING', 'COMPLETED'], default: 'CREATED' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);


