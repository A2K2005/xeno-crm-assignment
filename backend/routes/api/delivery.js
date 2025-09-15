const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const CommunicationLog = require('../../models/CommunicationLog');

// Delivery receipt (single or batch)
router.post(
  '/receipt',
  body().custom(value => { if (Array.isArray(value) || typeof value === 'object') return true; throw new Error('Invalid payload'); }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      const ops = [];
      for (const item of items) {
        const { delivery_id, status, failure_reason, timestamp } = item;
        if (!delivery_id || !status) continue;
        ops.push({
          updateOne: {
            filter: { log_id: delivery_id },
            update: {
              $set: {
                delivery_status: status === 'SENT' ? 'SENT' : 'FAILED',
                failure_reason: status === 'FAILED' ? (failure_reason || 'unknown') : undefined,
                delivered_at: timestamp ? new Date(timestamp) : new Date()
              }
            }
          }
        });
      }
      if (ops.length) await CommunicationLog.bulkWrite(ops, { ordered: false });
      return res.json({ success: true, updated: ops.length });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'failed to update receipts' });
    }
  }
);

module.exports = router;

// Recent delivery updates for dashboard
router.get('/recent', async (req, res) => {
  try {
    const CommunicationLog = require('../../models/CommunicationLog');
    const items = await CommunicationLog.find().sort({ created_at: -1 }).limit(20).lean();
    return res.json(items);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch recent deliveries' });
  }
});


