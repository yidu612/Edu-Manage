import OpenAI from 'openai';

// In-memory rate limiter: max 10 calls per user per hour
const rateLimiter = new Map(); // userId -> { count, windowStart }

function checkRateLimit(userId) {
  const now = Date.now();
  const entry = rateLimiter.get(userId);
  if (!entry || now - entry.windowStart > 3_600_000) {
    rateLimiter.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

// POST /api/ai/check
export const aiCheck = async (req, res) => {
  const { text, mode = 'clarity' } = req.body;

  if (!text || text.trim().length < 20) {
    return res.status(400).json({ success: false, message: 'Text must be at least 20 characters.' });
  }

  if (!['grammar', 'summary', 'clarity'].includes(mode)) {
    return res.status(400).json({ success: false, message: 'mode must be grammar, summary, or clarity.' });
  }

  if (!checkRateLimit(req.user._id.toString())) {
    return res.status(429).json({ success: false, message: 'Rate limit reached. Maximum 10 AI checks per hour.' });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(503).json({ success: false, message: 'AI assistance service is unconfigured.' });
  }

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey:  process.env.DEEPSEEK_API_KEY,
  });

  const prompts = {
    grammar: `Correct grammar and spelling in the following academic text. Return only the corrected text:\n\n${text}`,
    summary: `Summarize this academic project abstract in 3 concise sentences:\n\n${text}`,
    clarity: `Rate the clarity of this academic text and suggest improvements. You MUST respond exclusively in JSON format matching this schema exactly: {"writingScore": number, "grammarScore": number, "clarityScore": number, "suggestions": "string with bullet-point improvements"}\n\nText: ${text}`,
  };

  try {
    const isClarity = mode === 'clarity';
    const response = await openai.chat.completions.create({
      model:           'deepseek-chat',
      messages:        [{ role: 'user', content: prompts[mode] }],
      max_tokens:      600,
      response_format: isClarity ? { type: 'json_object' } : undefined,
    });

    const resultText = response.choices[0].message.content ?? '';

    if (isClarity) {
      try {
        const parsed = JSON.parse(resultText);
        return res.json({
          success: true,
          mode,
          writingScore:  parsed.writingScore  ?? null,
          grammarScore:  parsed.grammarScore  ?? null,
          clarityScore:  parsed.clarityScore  ?? null,
          suggestions:   parsed.suggestions   ?? '',
          raw:           resultText,
        });
      } catch {
        // DeepSeek returned non-JSON — surface it anyway
        return res.json({ success: true, mode, raw: resultText });
      }
    }

    res.json({ success: true, mode, result: resultText });
  } catch (err) {
    console.error('AI check error:', err.message);
    const status = err.status ?? 502;
    res.status(status).json({ success: false, message: err.message ?? 'AI service error.' });
  }
};
