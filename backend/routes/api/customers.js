const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../../middleware/auth');

// Ingest customer
router.post(
  '/',
  requireAuth,
  body('name').isString().isLength({ min: 1 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isString().matches(/^\+?[0-9\-\s]{7,20}$/).trim().escape(),
  body('city').optional().isString().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, email, phone, city } = req.body;
      const existing = await Customer.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ success: false, message: 'Email already exists' });

      const last = await Customer.findOne().sort({ customer_id: -1 });
      const nextId = last ? last.customer_id + 1 : 1;
      const doc = await Customer.create({ customer_id: nextId, name, email, phone, city });
      return res.status(201).json({ success: true, customer_id: doc.customer_id, message: 'Customer created' });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// GET /api/customers (testing/list)
router.get('/', requireAuth, async (req, res) => {
  try {
    const list = await Customer.find().sort({ customer_id: 1 }).limit(100);
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to list customers' });
  }
});

module.exports = router;


