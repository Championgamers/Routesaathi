/**
 * RouteSaathi — Vercel Serverless Function (/api/chat) using Groq API
 * Securely proxies chat requests to Groq (Llama 3.3 70B) using
 * process.env.GROQ_API_KEY so credentials are never exposed in GitHub or client JS.
 */

const MAX_MESSAGE_CHARS = 800;
const MAX_HISTORY_ITEMS = 10;

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST /api/chat.' });
  }

  const apiKey = (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(503).json({
      error: 'GROQ_API_KEY is not configured on the server. Add GROQ_API_KEY in Vercel Project Settings -> Environment Variables and redeploy.'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch (e) { return res.status(400).json({ error: 'Invalid JSON request body.' }); }
  }

  const rawMessage = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!rawMessage || rawMessage.length < 2) {
    return res.status(400).json({ error: 'Message must be at least 2 characters long.' });
  }
  if (rawMessage.length > MAX_MESSAGE_CHARS) {
    return res.status(400).json({ error: `Message exceeds ${MAX_MESSAGE_CHARS} characters.` });
  }

  const context = (body && typeof body.context === 'object' && body.context !== null) ? body.context : {};
  const safeHistory = Array.isArray(body?.history)
    ? body.history
        .slice(-MAX_HISTORY_ITEMS)
        .filter(item => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
        .map(item => ({
          role: item.role,
          content: item.content.slice(0, MAX_MESSAGE_CHARS)
        }))
    : [];

  const systemPrompt = [
    'You are Saathi AI, an expert multi-modal Indian travel assistant integrated directly into the RouteSaathi web application.',
    'Core expertise: Indian Railways (train classes SL/3A/2A/CC, major hubs like NDLS, MMCT, HWH, JP, PNBE, DDU, BPL, Tatkal/waitlist backups), domestic Indian flights, intercity Volvo/AC sleeper buses, outstation cabs, transfer buffer safety, and seasonal Indian delays (North India winter fog Dec-Jan, monsoon Jul-Sep, festive rush Oct-Nov).',
    'Rules:',
    '1. Ground your recommendations in the active RouteSaathi route context when provided (origin, destination, top calculated routes, cost, duration, delay risk).',
    '2. Respond concisely (typically 80-180 words) using clear bullet points when comparing options.',
    '3. Match the user language (English or Hindi/Hinglish).',
    '4. Never invent real-time PNR or live seat counts; remind users to confirm live seats via the IRCTC, ixigo, redBus, or Google Flights links inside RouteSaathi.',
    '5. If a question is completely unrelated to travel, geography, or RouteSaathi, politely steer the user back to travel planning.',
    '',
    'Current RouteSaathi Session Context:',
    JSON.stringify(context).slice(0, 2500)
  ].join('\n');

  const model = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim();
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...safeHistory,
          { role: 'user', content: rawMessage }
        ],
        temperature: 0.6,
        max_tokens: 512
      })
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : 502;
      const reason = upstream.status === 429
        ? 'Groq API rate limit reached. Please wait a few seconds and try again.'
        : data?.error?.message || `Groq API error (${upstream.status}).`;
      return res.status(status).json({ error: reason });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'Groq returned an empty response. Please try rephrasing.' });
    }

    return res.status(200).json({ reply, model });
  } catch (err) {
    return res.status(504).json({
      error: 'Could not connect to the Groq API. Please try again in a moment.'
    });
  }
};
