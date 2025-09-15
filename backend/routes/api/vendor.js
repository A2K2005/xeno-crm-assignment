const express = require('express');
const router = express.Router();
const CommunicationLog = require('../../models/CommunicationLog');

// Internal dummy vendor under /api/vendor/send
router.post('/send', async (req, res) => {
  try {
    const { customer_id, message, campaign_id } = req.body || {};
    if (!customer_id || !message) return res.status(400).json({ error: 'customer_id and message are required' });

    const last = await CommunicationLog.findOne().sort({ log_id: -1 });
    const delivery_id = last ? last.log_id + 1 : 1;
    await CommunicationLog.create({
      log_id: delivery_id,
      campaign_id: campaign_id ? String(campaign_id) : null,
      customer_id,
      message,
      delivery_status: 'PROCESSING',
      sent_at: new Date()
    });

    // random vendor processing after up to 2s
    setTimeout(async () => {
      try {
        const success = Math.random() < 0.9;
        const status = success ? 'SENT' : 'FAILED';
        const reasons = ['invalid_email', 'user_blocked', 'network_error'];
        const failure_reason = success ? undefined : reasons[Math.floor(Math.random() * reasons.length)];
        const fetch = require('node-fetch');
        const base = process.env.INTERNAL_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        await fetch(`${base}/api/delivery/receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delivery_id, status, failure_reason, timestamp: new Date().toISOString() })
        });
      } catch (e) {
        // ignore background errors; retry system (if any) will handle later
      }
    }, Math.floor(Math.random() * 2000));

    return res.json({ delivery_id, status: 'processing' });
  } catch (e) {
    return res.status(500).json({ error: 'failed to enqueue delivery' });
  }
});

module.exports = router;


