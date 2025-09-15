// models/Segment.js
const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  segment_id: { type: Number, index: true, unique: true },
  name: { type: String, required: true },
  conditions: { type: Array, required: true },
  logic: { type: String, enum: ['AND', 'OR'], required: true },
  audience_size: { type: Number, default: 0 },
  description: { type: String },
  created_by: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Segment', segmentSchema);
