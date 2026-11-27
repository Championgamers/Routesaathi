/**
 * RouteSaathi — Universal Robust Chatbot Controller
 */

(function () {
  const CHAT_ENDPOINT = '/api/chat';

  // Universal click listener: catches clicks on ANY chat toggle button or icon across the page
  document.addEventListener('click', function (e) {
    const toggleBtn = e.target.closest('#chat-toggle, .chat-toggle-btn, [data-chat-toggle], .chatbot-float-btn, #chatbot-icon, button[onclick*="Chat"]');
    const closeBtn = e.target.closest('#chat-close, .chat-close-btn, [data-chat-close]');
    const chatWindow = document.getElementById('chat-window') || document.getElementById('chatbot-container') || document.querySelector('.chatbot-box') || document.querySelector('.chat-popup');

    if (toggleBtn && chatWindow) {
      e.preventDefault();
      const currentDisplay = window.getComputedStyle(chatWindow).display;
      if (currentDisplay === 'none' || chatWindow.classList.contains('hidden')) {
        chatWindow.style.display = 'flex';
        chatWindow.classList.remove('hidden');
        const input = chatWindow.querySelector('input, textarea');
        if (input) input.focus();
      } else {
        chatWindow.style.display = 'none';
        chatWindow.classList.add('hidden');
      }
    }

    if (closeBtn && chatWindow) {
      e.preventDefault();
      chatWindow.style.display = 'none';
      chatWindow.classList.add('hidden');
    }
  });

  // Serverless API Communication
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

  // Global export
  window.RouteSaathiAI = {
    sendMessage: async function (message, context, history) {
      return await callGroqServerless(message, context, history);
    }
  };
})();
