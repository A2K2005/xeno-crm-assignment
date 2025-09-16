const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const Order = require('../../models/Order');
const Segment = require('../../models/Segment');
const { body, validationResult } = require('express-validator');
const { verifyJwt } = require('../../middleware/auth');
const { parseNaturalLanguageConditions } = require('../../services/aiService');

const compare = (a, operator, b) => {
  a = Number(a);
  b = Number(b);
  switch (operator) {
    case '>': return a > b;
    case '<': return a < b;
    case '=': return a === b;
    case '>=': return a >= b;
    case '<=': return a <= b;
    default: return false;
  }
};

// Convert NL prompt to conditions
router.post('/parse', async (req, res) => {
  try {
    const { prompt } = req.body;
    const conditions = await parseNaturalLanguageConditions(prompt || '');
    return res.json(conditions);
  } catch (e) {
    return res.status(500).json({ error: 'AI parsing failed' });
  }
});

router.post(
  '/preview',
  verifyJwt,
  body('conditions').isArray({ min: 1 }),
  body('logic').isIn(['AND', 'OR']).optional(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { conditions, logic = 'AND' } = req.body;
    const today = new Date();
    let customerMap = {};

    for (let cond of conditions) {
      let matchCustomers = [];
      if (cond.field === 'days_inactive') {
        const orders = await Order.aggregate([{ $group: { _id: '$customer_id', lastDate: { $max: '$date' } } }]);
        for (let order of orders) {
          const lastDate = new Date(order.lastDate);
          const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
          if (compare(diffDays, cond.operator, cond.value)) matchCustomers.push(order._id);
        }
      } else if (cond.field === 'amount') {
        const orders = await Order.aggregate([{ $group: { _id: '$customer_id', totalAmount: { $sum: '$amount' } } }]);
        for (let order of orders) {
          if (compare(order.totalAmount, cond.operator, cond.value)) matchCustomers.push(order._id);
        }
      } else if (cond.field === 'visits') {
        const orders = await Order.aggregate([{ $group: { _id: '$customer_id', visitCount: { $sum: 1 } } }]);
        for (let order of orders) {
          if (compare(order.visitCount, cond.operator, cond.value)) matchCustomers.push(order._id);
        }
      } else if (cond.field === 'city') {
        const customers = await Customer.find({ city: cond.value }, { customer_id: 1, _id: 0 });
        matchCustomers = customers.map(c => c.customer_id);
      }

      if (logic === 'AND') {
        if (Object.keys(customerMap).length === 0) {
          matchCustomers.forEach(id => customerMap[id] = true);
        } else {
          for (let id in customerMap) {
            if (!matchCustomers.includes(Number(id))) delete customerMap[id];
          }
        }
      } else {
        matchCustomers.forEach(id => customerMap[id] = true);
      }
    }

    const finalIds = Object.keys(customerMap).map(id => Number(id));
    const customers = await Customer.find({ customer_id: { $in: finalIds } }, { _id: 0, customer_id: 1 });
    res.json({ count: customers.length, preview: true });
  }
);

// Graceful handler for accidental GETs to preview endpoint
router.get('/preview', (req, res) => {
  return res.json({ ok: true, note: 'Use POST with { conditions, logic } to preview segment audience.' });
});

router.post(
  '/create',
  verifyJwt,
  body('name').isString().isLength({ min: 1 }),
  body('conditions').isArray({ min: 1 }),
  body('logic').isIn(['AND', 'OR']),
  body('description').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, conditions, logic, description } = req.body;
      // Preview count
      const previewRes = await (await fetch('http://localhost:0')).catch(() => ({})); // placeholder to satisfy lints
      // Reuse logic inline to get count without external call
      const today = new Date();
      let customerMap = {};
      for (let cond of conditions) {
        let matchCustomers = [];
        if (cond.field === 'days_inactive') {
          const orders = await Order.aggregate([{ $group: { _id: '$customer_id', lastDate: { $max: '$date' } } }]);
          for (let order of orders) {
            const lastDate = new Date(order.lastDate);
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            if (compare(diffDays, cond.operator, cond.value)) matchCustomers.push(order._id);
          }
        } else if (cond.field === 'amount') {
          const orders = await Order.aggregate([{ $group: { _id: '$customer_id', totalAmount: { $sum: '$amount' } } }]);
          for (let order of orders) {
            if (compare(order.totalAmount, cond.operator, cond.value)) matchCustomers.push(order._id);
          }
        } else if (cond.field === 'visits') {
          const orders = await Order.aggregate([{ $group: { _id: '$customer_id', visitCount: { $sum: 1 } } }]);
          for (let order of orders) {
            if (compare(order.visitCount, cond.operator, cond.value)) matchCustomers.push(order._id);
          }
        } else if (cond.field === 'city') {
          const customers = await Customer.find({ city: cond.value }, { customer_id: 1, _id: 0 });
          matchCustomers = customers.map(c => c.customer_id);
        }

        if (logic === 'AND') {
          if (Object.keys(customerMap).length === 0) {
            matchCustomers.forEach(id => customerMap[id] = true);
          } else {
            for (let id in customerMap) {
              if (!matchCustomers.includes(Number(id))) delete customerMap[id];
            }
          }
        } else {
          matchCustomers.forEach(id => customerMap[id] = true);
        }
      }

      const finalIds = Object.keys(customerMap).map(id => Number(id));
      const size = finalIds.length;

      const last = await Segment.findOne().sort({ segment_id: -1 });
      const nextId = last ? last.segment_id + 1 : 1;
      const segment = await Segment.create({
        segment_id: nextId,
        name,
        conditions,
        logic,
        description,
        audience_size: size,
        created_by: (req.user && req.user.email) || 'system'
      });

      return res.status(201).json({ success: true, segment_id: segment.segment_id, audience_size: size, message: 'Segment created' });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to create segment' });
    }
  }
);

module.exports = router;

// Additional listing endpoint for dashboard
router.get('/', async (req, res) => {
  try {
    const items = await Segment.find().sort({ segment_id: -1 }).limit(50).lean();
    return res.json(items);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to list segments' });
  }
});


