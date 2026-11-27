/**
 * RouteSaathi — Saathi AI Chatbot Frontend Controller
 */

(function () {
  const CHAT_ENDPOINT = '/api/chat';
  let chatHistory = [];

  document.addEventListener('DOMContentLoaded', function () {
    const chatFab = document.getElementById('chatFab');
    const chatWidget = document.getElementById('chatWidget');
    const chatClose = document.getElementById('chatClose');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMsgs = document.getElementById('chatMsgs');
    const chatClear = document.getElementById('chatClear');
    const chatKeyToggle = document.getElementById('chatKeyToggle');
    const chatSettings = document.getElementById('chatSettings');
    const chatLocalKey = document.getElementById('chatLocalKey');
    const chatSaveKey = document.getElementById('chatSaveKey');
    const chatClearKey = document.getElementById('chatClearKey');
    const chatQuick = document.getElementById('chatQuick');

    if (!chatFab || !chatWidget) return;

    function toggleChat() {
      const isHidden = chatWidget.hidden;
      chatWidget.hidden = !isHidden;
      chatFab.setAttribute('aria-expanded', String(isHidden));
      if (isHidden && chatInput) {
        chatInput.focus();
        if (chatMsgs && chatMsgs.children.length === 0) {
          appendMessage('assistant', 'Namaste! I am Saathi AI, RouteSaathi’s live AI travel assistant. Ask me about Indian multi-modal routes, train alternatives, fog delays, or your active search results.');
        }
      }
    }

    chatFab.addEventListener('click', toggleChat);
    if (chatClose) chatClose.addEventListener('click', toggleChat);

    if (chatKeyToggle && chatSettings) {
      chatKeyToggle.addEventListener('click', () => {
        chatSettings.hidden = !chatSettings.hidden;
      });
    }

    if (chatSaveKey && chatLocalKey) {
      chatSaveKey.addEventListener('click', () => {
        const val = chatLocalKey.value.trim();
        if (val) {
          localStorage.setItem('routesaathi_groq_key', val);
          alert('Local API key saved successfully!');
          chatSettings.hidden = true;
        }
      });
    }

    if (chatClearKey && chatLocalKey) {
      chatClearKey.addEventListener('click', () => {
        localStorage.removeItem('routesaathi_groq_key');
        chatLocalKey.value = '';
        alert('Local API key reset.');
      });
    }

    if (chatClear && chatMsgs) {
      chatClear.addEventListener('click', () => {
        chatMsgs.innerHTML = '';
        chatHistory = [];
        appendMessage('assistant', 'Conversation cleared. How can I help you today?');
      });
    }

    function appendMessage(role, text) {
      if (!chatMsgs) return;
      const div = document.createElement('div');
      div.className = role === 'user' ? 'chat-msg user' : 'chat-msg assistant';
      div.textContent = text;
      chatMsgs.appendChild(div);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    const samplePrompts = [
      'How do I pick a safe connection if direct trains are full?',
      'What are the best winter fog delay buffers for Delhi-Kanpur?',
      'How to book Volvo buses or check live seat status?'
    ];
    if (chatQuick) {
      chatQuick.innerHTML = '';
      samplePrompts.forEach(p => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chat-quick-btn';
        btn.textContent = p;
        btn.addEventListener('click', () => {
          if (chatInput) {
            chatInput.value = p;
            chatForm.requestSubmit();
          }
        });
        chatQuick.appendChild(btn);
      });
    }

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || text.length < 2) return;

        appendMessage('user', text);
        chatInput.value = '';

        let currentContext = {};
        try {
          if (window.RouteSaathiApp && typeof window.RouteSaathiApp.getState === 'function') {
            currentContext = window.RouteSaathiApp.getState();
          }
        } catch (err) {}

        const localKey = localStorage.getItem('routesaathi_groq_key') || '';

        const loadingId = 'load_' + Date.now();
        const loadDiv = document.createElement('div');
        loadDiv.id = loadingId;
        loadDiv.className = 'chat-msg assistant loading-msg';
        loadDiv.textContent = 'Saathi AI is thinking...';
        chatMsgs.appendChild(loadDiv);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;

        try {
          let reply = '';
          if (localKey) {
            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localKey}`
              },
              body: JSON.stringify({
                model: 'llama3-8b-8192', // UPDATED MODEL HERE
                messages: [
                  { role: 'system', content: 'You are Saathi AI, expert Indian travel assistant for RouteSaathi.' },
                  ...chatHistory,
                  { role: 'user', content: text }
                ],
                temperature: 0.6,
                max_tokens: 512
              })
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data?.error?.message || `HTTP ${resp.status}`);
            reply = data?.choices?.[0]?.message?.content?.trim();
          } else {
            const resp = await fetch(CHAT_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text, context: currentContext, history: chatHistory })
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data?.error || `HTTP error ${resp.status}`);
            reply = data.reply;
          }

          const el = document.getElementById(loadingId);
          if (el) el.remove();

          appendMessage('assistant', reply);
          chatHistory.push({ role: 'user', content: text });
          chatHistory.push({ role: 'assistant', content: reply });
          if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

        } catch (err) {
          const el = document.getElementById(loadingId);
          if (el) el.remove();
          appendMessage('assistant', '⚠️ Unable to reach AI model: ' + err.message);
        }
      });
    }
  });
})();
