const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { verifyJwt } = require('../../middleware/auth');
const Campaign = require('../../models/Campaign');
const Order = require('../../models/Order');
const CommunicationLog = require('../../models/CommunicationLog');
const { fetchAudienceFromSegment, personalize, queueBatchSend } = require('../../services/campaignService');

// POST /api/campaigns/create
// { segment_id, message_template, campaign_name }
router.post(
  '/create',
  verifyJwt,
  body('segment_id').optional().isNumeric(),
  body('message_template').isString(),
  body('campaign_name').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { segment_id, message_template, campaign_name } = req.body;

      // Fallback to any existing segment if not provided by the client
      let segmentIdNumber;
      if (segment_id === undefined || segment_id === null || segment_id === '') {
        const Segment = require('../../models/Segment');
        const anySegment = await Segment.findOne().sort({ segment_id: 1 });
        if (!anySegment) return res.status(400).json({ error: 'No segments available to target' });
        segmentIdNumber = Number(anySegment.segment_id);
      } else {
        segmentIdNumber = Number(segment_id);
      }

      // Create campaign id
      const last = await Campaign.findOne().sort({ campaign_id: -1 });
      const campaign_id = last ? last.campaign_id + 1 : 1;

      const audience = await fetchAudienceFromSegment(segmentIdNumber);

      // Fetch last order amounts
      const orders = await Order.aggregate([
        { $match: { customer_id: { $in: audience.map(a => a.customer_id) } } },
        { $sort: { date: -1 } },
        { $group: { _id: '$customer_id', last_amount: { $first: '$amount' } } }
      ]);
      const lastAmountMap = new Map(orders.map(o => [o._id, o.last_amount]));

      // Generate messages
      const messages = audience.map(c => ({
        customer_id: c.customer_id,
        message: personalize(message_template, c, lastAmountMap.get(c.customer_id))
      }));

      await Campaign.create({ campaign_id, campaign_name, segment_id: segmentIdNumber, message_template, audience_size: messages.length, status: 'QUEUED' });

      // Queue messages
      await queueBatchSend({ campaignId: campaign_id, messages });

      return res.status(201).json({ campaign_id, audience_size: messages.length, messages_queued: messages.length });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create campaign' });
    }
  }
);

// GET /api/campaigns/:id/stats
router.get(
  '/:id/stats',

  param('id').isNumeric(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const id = Number(req.params.id);
      const [sent, failed, processing] = await Promise.all([
        CommunicationLog.countDocuments({ campaign_id: String(id), delivery_status: 'SENT' }),
        CommunicationLog.countDocuments({ campaign_id: String(id), delivery_status: 'FAILED' }),
        CommunicationLog.countDocuments({ campaign_id: String(id), delivery_status: 'PROCESSING' })
      ]);
      const total = sent + failed + processing || 1;
      const delivery_rate = sent / total;
      return res.json({ sent_count: sent, failed_count: failed, processing_count: processing, delivery_rate });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
);

// GET /api/campaigns
// Returns list with basic stats, most recent first (cached for 15s)
router.get(
  '/',
  
  async (req, res) => {
    try {
      // const LRU = require('lru-cache');
      // if (!global.__campaignCache) {
      //   global.__campaignCache = new LRU({ max: 100, ttl: 15 * 1000 });
      // }
      // const cacheKey = 'campaigns_list';
      // const cached = global.__campaignCache.get(cacheKey);
      // if (cached) return res.json(cached);

      const campaigns = await Campaign.find().sort({ campaign_id: -1 }).lean();
      console.log(campaigns);
      const ids = campaigns.map(c => String(c.campaign_id));
      const agg = await CommunicationLog.aggregate([
        { $match: { campaign_id: { $in: ids } } },
        { $group: { _id: '$campaign_id', sent: { $sum: { $cond: [{ $eq: ['$delivery_status', 'SENT'] }, 1, 0] } }, failed: { $sum: { $cond: [{ $eq: ['$delivery_status', 'FAILED'] }, 1, 0] } }, processing: { $sum: { $cond: [{ $eq: ['$delivery_status', 'PROCESSING'] }, 1, 0] } } } }
      ]);
      const statMap = new Map(agg.map(a => [a._id, a]));
      const result = campaigns.map(c => {
        const s = statMap.get(String(c.campaign_id)) || { sent: 0, failed: 0, processing: 0 };
        const total = s.sent + s.failed + s.processing || 1;
        return {
          campaign_id: c.campaign_id,
          campaign_name: c.campaign_name,
          created_at: c.created_at,
          audience_size: c.audience_size,
          sent: s.sent,
          failed: s.failed,
          processing: s.processing,
          delivery_rate: s.sent / total
        };
      });
      // global.__campaignCache.set(cacheKey, result);
      return res.json(result);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to list campaigns' });
    }
  }
);

// Overview metrics
router.get('/overview/metrics', async (req, res) => {
  try {
    // const LRU = require('lru-cache');
    // if (!global.__campaignCache) {
    //   global.__campaignCache = new LRU({ max: 100, ttl: 15 * 1000 });
    // }
    // const cacheKey = 'overview_metrics';
    // const cached = global.__campaignCache.get(cacheKey);
    // if (cached) return res.json(cached);

    const totalCampaigns = await Campaign.countDocuments();
    const CommunicationLog = require('../../models/CommunicationLog');
    const [sent, failed, processing, activeSegments] = await Promise.all([
      CommunicationLog.countDocuments({ delivery_status: 'SENT' }),
      CommunicationLog.countDocuments({ delivery_status: 'FAILED' }),
      CommunicationLog.countDocuments({ delivery_status: 'PROCESSING' }),
      require('../../models/Segment').countDocuments()
    ]);
    const total = sent + failed + processing || 1;
    const payload = { totalCampaigns, totalMessagesSent: sent, overallDeliveryRate: sent / total, activeSegments };
    // global.__campaignCache.set(cacheKey, payload);
    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch overview metrics' });
  }
});

module.exports = router;


