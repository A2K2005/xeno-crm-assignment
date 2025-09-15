const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../../middleware/auth');

router.post(
  '/',
  requireAuth,
  body('customer_id').isNumeric(),
  body('amount').isFloat({ gt: 0 }),
  body('date').isISO8601().toDate(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { customer_id, amount, date } = req.body;
      const Customer = require('../../models/Customer');
      const customer = await Customer.findOne({ customer_id });
      if (!customer) return res.status(400).json({ success: false, message: 'Invalid customer_id' });

      const last = await Order.findOne().sort({ order_id: -1 });
      const nextId = last ? last.order_id + 1 : 1;
      const doc = await Order.create({ order_id: nextId, customer_id, amount, date: new Date(date).toISOString().slice(0,10) });
      return res.status(201).json({ success: true, order_id: doc.order_id, message: 'Order created' });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// GET /api/orders (testing/list)
router.get('/', requireAuth, async (req, res) => {
  try {
    const list = await Order.find().sort({ order_id: 1 }).limit(100);
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to list orders' });
  }
});

module.exports = router;


