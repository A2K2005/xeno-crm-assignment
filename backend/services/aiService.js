const { GoogleGenerativeAI } = require('@google/generative-ai');

const parseNaturalLanguageConditions = async (prompt) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not set');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
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
  return JSON.parse(jsonMatch[0]);
};

module.exports = { parseNaturalLanguageConditions };


