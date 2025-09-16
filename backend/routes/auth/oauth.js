const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { generateTokens } = require('../../middleware/auth');

const client = new OAuth2Client();
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);

// Exchange Google ID token for our JWT tokens
router.post('/google', async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ error: 'id_token required' });
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(401).json({ error: 'Invalid Google token' });
    if (ALLOWED_EMAILS.length && !ALLOWED_EMAILS.includes(payload.email)) return res.status(403).json({ error: 'Email not allowed' });

    const { accessToken, refreshToken } = generateTokens({ sub: payload.sub, email: payload.email });
    return res.json({ access_token: accessToken, refresh_token: refreshToken, expires_in: 900 });
  } catch (e) {
    return res.status(401).json({ error: 'OAuth verification failed' });
  }
});

router.post('/refresh', async (req, res) => {
  const jwt = require('jsonwebtoken');
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });
    const data = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken } = generateTokens({ sub: data.sub, email: data.email });
    return res.json({ access_token: accessToken, refresh_token: refreshToken, expires_in: 900 });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;


