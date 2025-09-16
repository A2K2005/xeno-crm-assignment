const express = require('express');
const router = express.Router();
const Communication = require('../models/Communication');

router.get('/', async (req, res) => {
  try {
    const logs = await Communication.find().sort({ date: -1 }); 
    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch communication logs', error);
    res.status(500).json({ message: 'Failed to fetch communication logs' });
  }
});

module.exports = router;