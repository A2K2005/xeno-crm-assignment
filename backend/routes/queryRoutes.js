const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Segment = require('../models/Segment');

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

router.post('/query', async (req, res) => {
  const { conditions, queryText } = req.body; 
  try {
    let customerMap = {};
    const today = new Date();

    for (let cond of conditions) {
      let matchCustomers = [];

      if (cond.field === 'days inactive') {
        const orders = await Order.aggregate([
          {
            $group: {
              _id: '$customerId',
              lastDate: { $max: '$date' }
            }
          }
        ]);

        for (let order of orders) {
          const lastDate = new Date(order.lastDate);
          const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
          if (compare(diffDays, cond.operator, cond.value)) {
            matchCustomers.push(order._id);
          }
        }
      }

      else if (cond.field === 'amount') {
        const orders = await Order.aggregate([
          {
            $group: {
              _id: '$customerId',
              totalAmount: { $sum: '$amount' }
            }
          }
        ]);

        for (let order of orders) {
          if (compare(order.totalAmount, cond.operator, cond.value)) {
            matchCustomers.push(order._id);
          }
        }
      }

      else if (cond.field === 'visits') {
        const orders = await Order.aggregate([
          {
            $group: {
              _id: '$customerId',
              visitCount: { $sum: 1 }
            }
          }
        ]);

        for (let order of orders) {
          if (compare(order.visitCount, cond.operator, cond.value)) {
            matchCustomers.push(order._id);
          }
        }
      }

      if (cond.connector === 'AND') {
        if (Object.keys(customerMap).length === 0) {
          matchCustomers.forEach(id => customerMap[id] = true);
        } else {
          for (let id in customerMap) {
            if (!matchCustomers.includes(Number(id))) delete customerMap[id];
          }
        }
      } else if (cond.connector === 'OR') {
        matchCustomers.forEach(id => customerMap[id] = true);
      } else {
        // For first condition
        matchCustomers.forEach(id => customerMap[id] = true);
      }
    }

    const finalIds = Object.keys(customerMap).map(id => Number(id));
    const customers = await Customer.find({ customerId: { $in: finalIds } });

    const now = new Date();
    const segment = new Segment({
      query: queryText,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0]
    });
    await segment.save();

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to query data' });
  }
});

module.exports = router;
