const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

router.post('/parse-query', async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-exp' });

    const result = await model.generateContent(`
      Convert this user-friendly CRM filter request into structured conditions:
      "${prompt}".

      Output format (valid JSON array only):
      [
        { field: "days inactive" | "amount" | "visits", operator: ">", "<", "=", ">=", "<=", value: number, connector: "AND" | "OR" | "" }
      ]
    `);

    const response = await result.response;
    const text = await response.text();

    const jsonMatch = text.match(/\[.*\]/s); 
    if (!jsonMatch) throw new Error('No JSON array found in AI response');

    const parsed = JSON.parse(jsonMatch[0]);

    res.json(parsed);
  } catch (err) {
    console.error('AI parsing failed:', err);
    res.status(500).json({ error: 'Failed to parse query prompt' });
  }
});

module.exports = router;
