const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { connectDatabase } = require('./config/database');

// Models
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Segment = require('./models/Segment');
const Campaign = require('./models/Campaign');
const Communication = require('./models/Communication');
const CommunicationLog = require('./models/CommunicationLog');
const Login = require('./models/Login');

async function clearCollections() {
  await Promise.all([
    Customer.deleteMany({}),
    Order.deleteMany({}),
    Segment.deleteMany({}),
    Campaign.deleteMany({}),
    Communication.deleteMany({}),
    CommunicationLog.deleteMany({}),
    Login.deleteMany({})
  ]);
}

async function seed() {
  await connectDatabase();

  console.log('Connected to MongoDB');

  await clearCollections();
  console.log('Cleared collections');

  // Customers
  const customers = await Customer.insertMany([
    { customer_id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-202-555-0101', city: 'New York' },
    { customer_id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1-202-555-0102', city: 'Chicago' },
    { customer_id: 3, name: 'Charlie Lee', email: 'charlie@example.com', phone: '+1-202-555-0103', city: 'San Francisco' },
    { customer_id: 4, name: 'Diana Prince', email: 'diana@example.com', phone: '+1-202-555-0104', city: 'New York' },
    { customer_id: 5, name: 'Ethan Clark', email: 'ethan@example.com', phone: '+1-202-555-0105', city: 'Austin' },
    { customer_id: 6, name: 'Fatima Khan', email: 'fatima@example.com', phone: '+1-202-555-0106', city: 'Chicago' },
    { customer_id: 7, name: 'George Brooks', email: 'george@example.com', phone: '+1-202-555-0107', city: 'Seattle' },
    { customer_id: 8, name: 'Hina Patel', email: 'hina@example.com', phone: '+1-202-555-0108', city: 'San Francisco' },
    { customer_id: 9, name: 'Ivan Petrov', email: 'ivan@example.com', phone: '+1-202-555-0109', city: 'Austin' },
    { customer_id: 10, name: 'Julia Chen', email: 'julia@example.com', phone: '+1-202-555-0110', city: 'New York' }
  ]);

  // Extra randomized customers for variety
  const cities = ['New York', 'Chicago', 'San Francisco', 'Austin', 'Seattle', 'Boston', 'Denver', 'Miami', 'Los Angeles', 'Atlanta'];
  const extraCustomers = [];
  for (let id = 11; id <= 40; id++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    extraCustomers.push({
      customer_id: id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      phone: `+1-202-555-${(1000 + id).toString().padStart(4, '0')}`,
      city
    });
  }
  await Customer.insertMany(extraCustomers);

  // Orders
  const orders = await Order.insertMany([
    { order_id: 1001, customer_id: 1, amount: 1209.99, date: '2025-09-01' },
    { order_id: 1002, customer_id: 1, amount: 5009.49, date: '2025-09-07' },
    { order_id: 1003, customer_id: 2, amount: 300049.0, date: '2025-09-02' },
    { order_id: 1004, customer_id: 3, amount: 1900.99, date: '2025-09-10' },
    { order_id: 1005, customer_id: 4, amount: 22000.0, date: '2025-08-22' },
    { order_id: 1006, customer_id: 4, amount: 45000.5, date: '2025-09-11' },
    { order_id: 1007, customer_id: 5, amount: 9800.0, date: '2025-07-14' },
    { order_id: 1008, customer_id: 6, amount: 750.0, date: '2025-09-06' },
    { order_id: 1009, customer_id: 7, amount: 1500.0, date: '2025-09-04' },
    { order_id: 1010, customer_id: 7, amount: 30093.0, date: '2025-09-09' },
    { order_id: 1011, customer_id: 8, amount: 42000.0, date: '2025-08-30' },
    { order_id: 1012, customer_id: 9, amount: 1100.0, date: '2025-09-03' },
    { order_id: 1013, customer_id: 10, amount: 5600.0, date: '2025-09-05' }
  ]);

  // Extra randomized orders across customers with varied amounts/dates
  const extraOrders = [];
  let nextOrderId = 1014;
  const start = new Date('2025-06-01').getTime();
  const end = new Date('2025-09-15').getTime();
  const allCustomerIds = [...customers.map(c => c.customer_id), ...extraCustomers.map(c => c.customer_id)];
  for (const cid of allCustomerIds) {
    const numOrders = 1 + Math.floor(Math.random() * 4); // 1-4 orders each
    for (let i = 0; i < numOrders; i++) {
      const amount = Math.round((10 + Math.random() * 50000) * 100) / 100; // spread up to 50k
      const dateTs = Math.floor(start + Math.random() * (end - start));
      const date = new Date(dateTs).toISOString().slice(0, 10);
      extraOrders.push({ order_id: nextOrderId++, customer_id: cid, amount, date });
    }
  }
  await Order.insertMany(extraOrders);

  // Add at least 15 explicit high-value orders for analytics variety
  const highValueOrders = [];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const highAmounts = [75000, 82000.5, 91000, 102500.25, 118000, 125500, 139999.99, 150000, 175250.75, 189000, 200000, 225000, 250000, 300000, 350000];
  for (let amt of highAmounts) {
    const cid = pick(allCustomerIds);
    const when = new Date(start + Math.random() * (end - start)).toISOString().slice(0, 10);
    highValueOrders.push({ order_id: nextOrderId++, customer_id: cid, amount: amt, date: when });
  }
  await Order.insertMany(highValueOrders);

  // Segments
  const segments = await Segment.insertMany([
    {
      segment_id: 10,
      name: 'NYC Customers',
      conditions: [{ field: 'city', op: 'eq', value: 'New York' }],
      logic: 'AND',
      audience_size: 1,
      description: 'Customers located in New York',
      created_by: 'admin@xeno-crm.local'
    },
    {
      segment_id: 11,
      name: 'High Value (>$100)',
      conditions: [{ field: 'order.amount', op: 'gt', value: 100 }],
      logic: 'AND',
      audience_size: 2,
      description: 'Customers with orders above $100',
      created_by: 'admin@xeno-crm.local'
    },
    {
      segment_id: 12,
      name: 'Chicago Buyers',
      conditions: [{ field: 'city', op: 'eq', value: 'Chicago' }],
      logic: 'AND',
      audience_size: 2,
      description: 'Based in Chicago',
      created_by: 'admin@xeno-crm.local'
    },
    {
      segment_id: 13,
      name: 'Frequent Visitors (>=2 orders)',
      conditions: [{ field: 'visits', op: 'gte', value: 2 }],
      logic: 'AND',
      audience_size: 2,
      description: 'Placed 2+ orders',
      created_by: 'admin@xeno-crm.local'
    },
    {
      segment_id: 14,
      name: 'West Coast',
      conditions: [
        { field: 'city', op: 'eq', value: 'San Francisco' },
        { field: 'city', op: 'eq', value: 'Seattle' }
      ],
      logic: 'OR',
      audience_size: 2,
      description: 'SF or Seattle audience',
      created_by: 'ops@xeno-crm.local'
    },
    {
      segment_id: 15,
      name: 'Dormant 30+ days',
      conditions: [{ field: 'days_inactive', op: 'gt', value: 30 }],
      logic: 'AND',
      audience_size: 5,
      description: 'Haven’t purchased in over a month',
      created_by: 'ops@xeno-crm.local'
    },
    {
      segment_id: 16,
      name: 'Big Spenders (>= 50k)',
      conditions: [{ field: 'amount', op: 'gte', value: 50000 }],
      logic: 'AND',
      audience_size: 6,
      description: 'Total spend at least 50,000',
      created_by: 'ops@xeno-crm.local'
    }
  ]);

  // Campaigns
  const campaigns = await Campaign.insertMany([
    {
      campaign_id: 2001,
      campaign_name: 'Welcome NYC',
      segment_id: 10,
      message_template: 'Hello {{name}}, welcome from NYC team!',
      audience_size: 1,
      status: 'CREATED'
    },
    {
      campaign_id: 2002,
      campaign_name: 'VIP Offer',
      segment_id: 11,
      message_template: 'Hi {{name}}, enjoy 15% off on your next purchase!',
      audience_size: 2,
      status: 'QUEUED'
    },
    {
      campaign_id: 2003,
      campaign_name: 'Windy City Hello',
      segment_id: 12,
      message_template: 'Hi {{name}} from Chicago! Free shipping on next order.',
      audience_size: 2,
      status: 'QUEUED'
    },
    {
      campaign_id: 2004,
      campaign_name: 'Loyalty Thanks',
      segment_id: 13,
      message_template: 'Thanks {{name}}! Loyalty perk unlocked for your {{last_order_amount}} spend.',
      audience_size: 2,
      status: 'SENDING'
    },
    {
      campaign_id: 2005,
      campaign_name: 'West Coast Love',
      segment_id: 14,
      message_template: 'Hey {{name}} on the West Coast! 2‑day shipping on us.',
      audience_size: 2,
      status: 'CREATED'
    },
    {
      campaign_id: 2006,
      campaign_name: 'We miss you',
      segment_id: 15,
      message_template: 'Hi {{name}}, it’s been a while! Here’s 20% to come back.',
      audience_size: 5,
      status: 'QUEUED'
    },
    {
      campaign_id: 2007,
      campaign_name: 'High Roller Rewards',
      segment_id: 16,
      message_template: 'Hey {{name}}, VIP reward unlocked. Your last was ₹{{last_order_amount}}.',
      audience_size: 6,
      status: 'QUEUED'
    }
  ]);

  // Communications
  const communications = await Communication.insertMany([
    {
      customerId: String(customers[0].customer_id),
      name: customers[0].name,
      email: customers[0].email,
      message: 'Hello Alice! Thanks for joining us.',
      subject: 'Welcome!',
      status: 'sent'
    },
    {
      customerId: String(customers[1].customer_id),
      name: customers[1].name,
      email: customers[1].email,
      message: 'Hi Bob, here is your VIP offer code VIP-BOB-2025',
      subject: 'Exclusive Offer',
      status: 'sent'
    },
    {
      customerId: String(customers[2].customer_id),
      name: customers[2].name,
      email: customers[2].email,
      message: 'Loyalty benefit unlocked for you',
      subject: 'Loyalty',
      status: 'sent'
    }
  ]);

  // Communication Logs
  const logs = await CommunicationLog.insertMany([
    {
      log_id: 5001,
      campaign_id: String(campaigns[0].campaign_id),
      customer_id: customers[0].customer_id,
      message: 'Welcome NYC message sent to Alice',
      delivery_status: 'SENT',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5002,
      campaign_id: String(campaigns[1].campaign_id),
      customer_id: customers[1].customer_id,
      message: 'VIP offer sent to Bob',
      delivery_status: 'SENT',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5003,
      campaign_id: String(campaigns[1].campaign_id),
      customer_id: customers[2].customer_id,
      message: 'VIP offer sent to Charlie',
      delivery_status: 'FAILED',
      failure_reason: 'invalid_email',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5004,
      campaign_id: String(campaigns[2].campaign_id),
      customer_id: customers[5].customer_id,
      message: 'Chicago ship free – Hina',
      delivery_status: 'SENT',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5005,
      campaign_id: String(campaigns[3].campaign_id),
      customer_id: customers[3].customer_id,
      message: 'Loyalty perk for Diana',
      delivery_status: 'PROCESSING',
      sent_at: new Date()
    },
    {
      log_id: 5006,
      campaign_id: String(campaigns[4].campaign_id),
      customer_id: customers[7].customer_id,
      message: 'West Coast shipping for Hina',
      delivery_status: 'SENT',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5007,
      campaign_id: String(campaigns[4].campaign_id),
      customer_id: customers[6].customer_id,
      message: 'West Coast shipping for George',
      delivery_status: 'FAILED',
      failure_reason: 'user_blocked',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5008,
      campaign_id: String(2006),
      customer_id: customers[8].customer_id,
      message: 'We miss you – 20% off',
      delivery_status: 'SENT',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5009,
      campaign_id: String(2006),
      customer_id: customers[9].customer_id,
      message: 'Come back bonus',
      delivery_status: 'FAILED',
      failure_reason: 'network_error',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5010,
      campaign_id: String(2007),
      customer_id: customers[4].customer_id,
      message: 'VIP reward unlocked',
      delivery_status: 'PROCESSING',
      sent_at: new Date()
    },
    {
      log_id: 5011,
      campaign_id: String(2007),
      customer_id: customers[5].customer_id,
      message: 'VIP reward unlocked',
      delivery_status: 'SENT',
      sent_at: new Date(),
      delivered_at: new Date()
    },
    {
      log_id: 5012,
      campaign_id: String(2007),
      customer_id: customers[2].customer_id,
      message: 'VIP reward unlocked',
      delivery_status: 'FAILED',
      failure_reason: 'invalid_email',
      sent_at: new Date(),
      delivered_at: new Date()
    }
  ]);

  // Logins
  const logins = await Login.insertMany([
    { name: 'Admin', email: 'admin@xeno-crm.local' },
    { name: 'Marketing Ops', email: 'ops@xeno-crm.local' }
  ]);

  const [customersCount, ordersCount, segmentsCount, campaignsCount, communicationsCount, logsCount, loginsCount] = await Promise.all([
    Customer.countDocuments(),
    Order.countDocuments(),
    Segment.countDocuments(),
    Campaign.countDocuments(),
    Communication.countDocuments(),
    CommunicationLog.countDocuments(),
    Login.countDocuments()
  ]);

  console.log('Seeded:', {
    customers: customersCount,
    orders: ordersCount,
    segments: segmentsCount,
    campaigns: campaignsCount,
    communications: communicationsCount,
    logs: logsCount,
    logins: loginsCount
  });

  await mongoose.connection.close();
  console.log('Disconnected');
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err);
  try { await mongoose.connection.close(); } catch (_) {}
  process.exit(1);
});


