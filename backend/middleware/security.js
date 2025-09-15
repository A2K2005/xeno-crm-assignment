const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getCorsOptions } = require('../config/environment');

const applySecurity = (app) => {
  app.use(helmet());
  app.use(cors(getCorsOptions()));
  app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
};

module.exports = { applySecurity };


