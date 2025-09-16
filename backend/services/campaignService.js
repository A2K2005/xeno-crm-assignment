const CommunicationLog = require('../models/CommunicationLog');
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const fetchDynamic = (url, opts) => import('node-fetch').then(m => m.default(url, opts));

const personalize = (template, customer, lastOrderAmount) => {
  return template
    .replaceAll('{name}', customer.name || '')
    .replaceAll('{city}', customer.city || '')
    .replaceAll('{last_order_amount}', String(lastOrderAmount || 0));
};

const fetchAudienceFromSegment = async (segmentId) => {
  const seg = await Segment.findOne({ segment_id: segmentId });
  if (!seg) throw new Error('Segment not found');

  // Build from conditions similar to preview logic
  const { conditions, logic } = seg;
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
  const audience = await Customer.find({ customer_id: { $in: finalIds } });
  return audience;
};

const compare = (a, operator, b) => {
  a = Number(a); b = Number(b);
  switch (operator) {
    case '>': return a > b;
    case '<': return a < b;
    case '=': return a === b;
    case '>=': return a >= b;
    case '<=': return a <= b;
    default: return false;
  }
};

const queueBatchSend = async ({ campaignId, messages }) => {
  const base = process.env.INTERNAL_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const url = `${base}/api/vendor/send`;

  // process in batches of 10
  for (let i = 0; i < messages.length; i += 10) {
    const batch = messages.slice(i, i + 10);
    await Promise.all(batch.map(async (m) => {
      try {
        await fetchDynamic(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_id: m.customer_id, message: m.message, campaign_id: String(campaignId), delivery_method: 'email' })
        });
      } catch (e) {
        // create failed log immediately if vendor call fails at enqueue time
        const last = await CommunicationLog.findOne().sort({ log_id: -1 });
        const delivery_id = last ? last.log_id + 1 : 1;
        await CommunicationLog.create({ log_id: delivery_id, campaign_id: String(campaignId), customer_id: m.customer_id, message: m.message, delivery_status: 'FAILED', failure_reason: 'enqueue_failed', created_at: new Date() });
      }
    }));
  }
};

module.exports = { personalize, fetchAudienceFromSegment, queueBatchSend };


