/**
 * RouteSaathi — Frontend Chatbot JS using Groq API
 */

(function () {
  const CHAT_ENDPOINT = '/api/chat';

  async function callGroqServerless(message, context, recentHistory) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const resp = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ message, context, history: recentHistory })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || `HTTP error! status: ${resp.status}`);
      }
      return data.reply;
    } finally {
      clearTimeout(timer);
    }
  }

  async function callGeminiDirect(message, context, recentHistory, apiKey) {
    const sysText = [
      'You are Saathi AI, the official multi-modal Indian travel assistant inside RouteSaathi.',
      'Give concise, practical advice about Indian trains, flights, buses, cabs, and seasonal delays.',
      'Active RouteSaathi App Context: ' + JSON.stringify(context)
    ].join('\n');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: sysText },
            ...recentHistory,
            { role: 'user', content: message }
          ],
          temperature: 0.6,
          max_tokens: 512
        })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error?.message || `HTTP ${resp.status}`);
      }
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error('Empty response received from AI model.');
      return reply;
    } finally {
      clearTimeout(timer);
    }
  }

  window.RouteSaathiAI = {
    sendMessage: async function (message, context, history, customKey) {
      if (customKey && customKey.trim()) {
        return await callGeminiDirect(message, context, history, customKey.trim());
      }
      return await callGroqServerless(message, context, history);
    }
  };
})();
