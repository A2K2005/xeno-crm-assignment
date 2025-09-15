const express = require('express');
const router = express.Router();
const CommunicationLog = require('../../models/CommunicationLog');
// fetch compatibility wrapper (works in CommonJS)
const fetch = globalThis.fetch || ((...args) => import('node-fetch').then(mod => mod.default(...args)));

const randomDelay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

// POST /api/vendor/send
// Accept: { customer_id, message, campaign_id, delivery_method: "email" }
// Return: { delivery_id, status: "processing" }
router.post('/send', async (req, res) => {
  try {
    const { customer_id, message, campaign_id, delivery_method } = req.body || {};
    if (!customer_id || !message) return res.status(400).json({ error: 'customer_id and message are required' });

    const last = await CommunicationLog.findOne().sort({ log_id: -1 });
    const delivery_id = last ? last.log_id + 1 : 1;
    await CommunicationLog.create({
      log_id: delivery_id,
      campaign_id: campaign_id || null,
      customer_id,
      message,
      delivery_status: 'PROCESSING',
      sent_at: new Date()
    });

    // Simulate async delivery result
    setTimeout(async () => {
      try {
        // 90% success, 10% failure
        const success = Math.random() < 0.9;
        const status = success ? 'SENT' : 'FAILED';
        const reasons = ['invalid_email', 'user_blocked', 'network_error'];
        const failure_reason = success ? undefined : reasons[Math.floor(Math.random() * reasons.length)];

        // Random 1-3s latency before sending receipt
        await randomDelay(1000, 3000);

        // safe callback POST with debug and error handling
        const messageId = delivery_id;
        const customerId = customer_id;
        const callbackUrl = `${process.env.INTERNAL_BASE_URL || 'http://localhost:' + (process.env.PORT || 5000)}/api/delivery/receipt`;
        const vendorInfo = { vendor: 'dummy' };
        console.log('CALLBACK DEBUG', { messageId, customerId, callbackUrl, message });

        if (!callbackUrl) {
          console.error('Missing callbackUrl for messageId', messageId);
        } else {
          ;(async () => {
            try {
              await fetch(callbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, status, vendorInfo })
              });
              console.log('Callback POST succeeded for messageId', messageId);
            } catch (err) {
              console.error('Callback POST failed for messageId', messageId, err && err.message ? err.message : err);
              // Fallback to direct DB update if internal call fails
              await CommunicationLog.updateOne(
                { log_id: delivery_id },
                { $set: { delivery_status: status, failure_reason, delivered_at: new Date() } }
              );
            }
          })();
        }
      } catch (e) {
        // swallow errors in background task
      }
    }, Math.floor(Math.random() * 400) + 100); // initial network delay 100-500ms

    return res.json({ delivery_id, status: 'processing' });
  } catch (e) {
    return res.status(500).json({ error: 'failed to enqueue delivery' });
  }
});

// Simple retry worker endpoint (can be scheduled via cron)
router.post('/retries/run-once', async (req, res) => {
  try {
    const now = new Date();
    const toRetry = await CommunicationLog.find({
      delivery_status: 'FAILED',
      retry_count: { $lt: 3 },
      $or: [ { next_retry_at: { $lte: now } }, { next_retry_at: { $exists: false } } ]
    }).limit(20);

    let scheduled = 0;
    for (const doc of toRetry) {
      const backoffMs = Math.pow(2, doc.retry_count) * 1000; // 1s, 2s, 4s
      const nextRetryAt = new Date(Date.now() + backoffMs);
      await CommunicationLog.updateOne({ _id: doc._id }, { $set: { next_retry_at: nextRetryAt } });

      setTimeout(async () => {
        const success = Math.random() < 0.85; // slightly lower on retries
        const status = success ? 'SENT' : 'FAILED';
        const reasons = ['invalid_email', 'user_blocked', 'network_error'];
        const failure_reason = success ? undefined : reasons[Math.floor(Math.random() * reasons.length)];
        const url = `${process.env.INTERNAL_BASE_URL || 'http://localhost:' + (process.env.PORT || 5000)}/api/delivery/receipt`;
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delivery_id: doc.log_id, status, failure_reason, timestamp: new Date().toISOString() })
          });
          if (!success) {
            await CommunicationLog.updateOne({ _id: doc._id }, { $inc: { retry_count: 1 }, $set: { last_error: failure_reason } });
          }
        } catch (e) {
          await CommunicationLog.updateOne({ _id: doc._id }, { $inc: { retry_count: 1 }, $set: { last_error: 'receipt_call_failed' } });
        }
      }, backoffMs);
      scheduled++;
    }

    return res.json({ scheduled });
  } catch (e) {
    return res.status(500).json({ error: 'retry scheduling failed' });
  }
});

module.exports = router;


