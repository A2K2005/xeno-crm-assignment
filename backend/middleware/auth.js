const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client();

// Validate Google ID token (Authorization: Bearer <id_token>)
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { sub: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { requireAuth };

// JWT helpers
const generateTokens = (user) => {
  const accessToken = jwt.sign({ sub: user.sub, email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.sub }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const verifyJwt = (req, res, next) => {
  try {


    // const header = req.cookies.access_token || '';
    // next();
    // const [, token] = header.split(' ');
    // if (!token) return res.status(401).json({ error: 'Unauthorized' });
    // const payload = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Forbidden' });
};

module.exports.generateTokens = generateTokens;
module.exports.verifyJwt = verifyJwt;
module.exports.adminOnly = adminOnly;


