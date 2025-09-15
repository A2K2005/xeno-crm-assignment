const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

router.get('/next-id', async (req, res) => {
  try {
    const lastCustomer = await Customer.findOne().sort({ customerId: -1 });
    const nextId = lastCustomer ? lastCustomer.customerId + 1 : 1;
    res.json({ nextId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch next ID' });
  }
});

router.post('/add', async (req, res) => {
  const { customerId, name, city, mobile, email } = req.body;
  try {
    const newCustomer = new Customer({ customerId, name, city, mobile, email });
    await newCustomer.save();
    res.json({ message: 'Customer saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save customer' });
  }
});

module.exports = router;