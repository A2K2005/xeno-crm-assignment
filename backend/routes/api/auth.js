const express = require('express');
const router = express.Router();
const Login = require('../../models/Login');

// Minimal login audit endpoint to support existing frontend flow
// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ message: 'name and email are required' });
    await Login.create({ name, email });
    return res.status(201).json({ message: 'Login recorded' });
  } catch (e) {
    return res.status(500).json({ message: 'Error saving login' });
  }
});

module.exports = router;


