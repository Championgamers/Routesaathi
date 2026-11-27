/**
 * RouteSaathi — Complete Chatbot Frontend (UI Toggle + Groq API Integration)
 */

document.addEventListener('DOMContentLoaded', function () {
  const CHAT_ENDPOINT = '/api/chat';

  // DOM Elements (Safely selected)
  const chatToggleBtn = document.getElementById('chat-toggle') || document.querySelector('.chat-toggle-btn') || document.querySelector('[data-chat-toggle]');
  const chatWindow = document.getElementById('chat-window') || document.getElementById('chatbot-container') || document.querySelector('.chatbot-box');
  const chatCloseBtn = document.getElementById('chat-close') || document.querySelector('.chat-close-btn');
  const chatForm = document.getElementById('chat-form') || document.querySelector('.chat-input-form');
  const chatInput = document.getElementById('chat-input') || document.querySelector('.chat-text-input');
  const chatMessages = document.getElementById('chat-messages') || document.querySelector('.chat-messages-area');

  // Toggle Chat Window Open/Close
  function toggleChat() {
    if (!chatWindow) return;
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '' || chatWindow.classList.contains('hidden')) {
      chatWindow.style.display = 'flex';
      chatWindow.classList.remove('hidden');
      if (chatInput) chatInput.focus();
    } else {
      chatWindow.style.display = 'none';
      chatWindow.classList.add('hidden');
    }
  }

  // Event Listeners for UI
  if (chatToggleBtn) {
    chatToggleBtn.addEventListener('click', toggleChat);
  }
  // Fallback global handler if button uses onclick
  window.toggleRouteSaathiChat = toggleChat;

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener('click', function () {
      if (chatWindow) {
        chatWindow.style.display = 'none';
        chatWindow.classList.add('hidden');
      }
    });
  }

  // API Call to Groq Serverless Function
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

  // Global export for any external scripts
  window.RouteSaathiAI = {
    sendMessage: async function (message, context, history) {
      return await callGroqServerless(message, context, history);
    }
  };
});
