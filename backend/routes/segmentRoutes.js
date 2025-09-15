const express = require('express');
const router = express.Router();
const Segment = require('../models/Segment');

router.get('/', async (req, res) => {
  try {
    const segments = await Segment.find().sort({ date: -1, time: -1 });
    res.json(segments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch segments history' });
  }
});

module.exports = router;
