const { OpenAI } = require('openai');

const generateProductContent = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({ message: 'Title or description is required.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        message: 'Missing OpenAI API Key. Please add OPENAI_API_KEY to your backend/.env file.',
        error: 'Missing API Key'
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert SEO copywriter and e-commerce merchandiser. 
Given the following input, generate comprehensive product details in strict JSON format.
Do not wrap the JSON in markdown blocks like \`\`\`json. Return ONLY valid JSON.

Input Title: ${title || 'N/A'}
Input Description: ${description || 'N/A'}

The JSON object must contain EXACTLY these keys:
- title (string, SEO-optimized, max 60 chars)
- slug (string, URL-safe)
- metaTitle (string, max 60 chars)
- metaDescription (string, max 155 chars)
- shortDescription (string, 2-3 sentences)
- longDescription (string, rich HTML paragraph, 150-200 words)
- tags (array of strings, 5-8 relevant tags)
- category (string, suggested category)
- attributes (array of objects with "name" and "value" keys, e.g. [{"name": "Color", "value": "Red"}])
- seoKeywords (array of strings, 6-10 keywords)
- price (string, suggested price range, e.g. "1200-1800")
- status (string, hardcoded to "draft")`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = response.choices[0].message.content.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const jsonResult = JSON.parse(jsonText);
    res.json(jsonResult);
  } catch (err) {
    console.error('OpenAI API Error:', err);
    res.status(500).json({ message: 'Failed to generate AI content.', error: err.message });
  }
};

module.exports = { generateProductContent };
