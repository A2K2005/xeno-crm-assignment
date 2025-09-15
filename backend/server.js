const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
// NOTE: express-mongo-sanitize currently conflicts with Express 5 (req.query is read-only).
// Temporarily disabling. Consider re-adding with a compatible version or a custom sanitizer.
const morgan = require('morgan');
const compression = require('compression');
const slowDown = require('express-slow-down');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDatabase } = require('./config/database');

// Routers
const oauthRouter = require('./routes/auth/oauth');
const queryAiRoute = require('./routes/queryAiRoute');
const customersRouter = require('./routes/api/customers');
const ordersRouter = require('./routes/api/orders');
const segmentsRouter = require('./routes/api/segments');
const campaignsRouter = require('./routes/api/campaigns');
const deliveryRouter = require('./routes/api/delivery');
const vendorApiRouter = require('./routes/api/vendor');
const authApiRouter = require('./routes/api/auth');
const dummyVendorRouter = require('./routes/vendor/dummyVendor');

const app = express();
const corsOptions = (() => {
  const allowed = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim());
  return {
    origin: function(origin, callback) {
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  };
})();

// Security & parsing
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
// app.use(mongoSanitize());
app.use(morgan('combined'));
app.use(compression());
app.use(cors(corsOptions));
app.disable('x-powered-by');

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// Slow down abusive clients per-route
const speedLimiter = slowDown({ windowMs: 60 * 1000, delayAfter: 60, delayMs: 250 });
app.use('/api/', speedLimiter);

// API routes
app.use('/auth', oauthRouter);
app.use('/api/customers', customersRouter);
app.use('/api/ai', queryAiRoute);
app.use('/api/orders', ordersRouter);
app.use('/api/segments', segmentsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/vendor', vendorApiRouter);
app.use('/api', authApiRouter);
app.use('/vendor/dummy', dummyVendorRouter);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/status', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const uptime = process.uptime();
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'up' : 'down', uptime });
  } catch (e) {
    res.status(500).json({ status: 'degraded' });
  }
});

// Start
const PORT = process.env.PORT || 5000;
connectDatabase().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to connect database', err);
  process.exit(1);
});

module.exports = app;


