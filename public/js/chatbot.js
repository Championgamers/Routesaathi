(function () {
  const CHAT_ENDPOINT = "/api/chat";
  const $ = (id) => document.getElementById(id);

  let history = [];
  let isSending = false;

  const chatWidget = $("chatWidget");
  const chatFab = $("chatFab");
  const chatNavBtn = $("chatNavBtn");
  const chatClose = $("chatClose");
  const chatClear = $("chatClear");
  const chatForm = $("chatForm");
  const chatInput = $("chatInput");
  const chatMsgs = $("chatMsgs");
  const chatQuick = $("chatQuick");
  const chatSend = $("chatSend");
  const chatValid = $("chatValid");

  // Stop if the required HTML elements are missing.
  if (
    !chatWidget || !chatFab || !chatNavBtn ||
    !chatClose || !chatForm || !chatInput || !chatMsgs
  ) {
    console.error("Saathi AI: Required chatbot HTML elements not found.");
    return;
  }

  // Open chatbot
  function openChat() {
    chatWidget.hidden = false;
    chatFab.setAttribute("aria-expanded", "true");
    chatInput.focus();

    if (chatMsgs.children.length === 0) {
      addMessage(
        "bot",
        "Hello! I am Saathi AI. Ask me about Indian trains, flights, buses, routes, delays or alternative travel options."
      );
    }
  }

  // Close chatbot
  function closeChat() {
    chatWidget.hidden = true;
    chatFab.setAttribute("aria-expanded", "false");
  }

  chatFab.addEventListener("click", openChat);
  chatNavBtn.addEventListener("click", openChat);
  chatClose.addEventListener("click", closeChat);

  // Hide the old local API key option.
  const keyToggle = $("chatKeyToggle");
  if (keyToggle) keyToggle.hidden = true;

  // Display a message safely.
  function addMessage(type, message) {
    const bubble = document.createElement("div");
    bubble.className = `c-msg ${type}`;
    bubble.textContent = message;

    chatMsgs.appendChild(bubble);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    return bubble;
  }

  // Loading animation
  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "c-msg bot";
    typing.innerHTML =
      '<span class="c-typing"><i></i><i></i><i></i></span>';

    chatMsgs.appendChild(typing);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    return typing;
  }

  // Read current travel details from the website.
  function getTravelContext() {
    return {
      from: $("from")?.value || "",
      to: $("to")?.value || "",
      date: $("date")?.value || "",
      passengers: $("paxVal")?.textContent || "1",
      trainClass: $("clsSel")?.value || "",
      weather: $("weatherSel")?.value || ""
    };
  }

  // Send request to the backend.
  async function callServer(message, context, recentHistory) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          context,
          history: recentHistory
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed: ${response.status}`
        );
      }

      if (!data.reply || typeof data.reply !== "string") {
        throw new Error("The AI returned an empty response.");
      }

      return data.reply;

    } finally {
      clearTimeout(timer);
    }
  }

  // Main message sending function.
  async function sendMessage(message) {
    message = message.trim();

    if (!message || isSending) return;

    if (message.length > 800) {
      chatValid.textContent = "Message must be under 800 characters.";
      return;
    }

    isSending = true;
    chatValid.textContent = "";
    chatInput.value = "";
    chatSend.disabled = true;
    chatInput.disabled = true;

    addMessage("user", message);

    const typing = showTyping();

    try {
      const context = getTravelContext();

      const reply = await callServer(
        message,
        context,
        history
      );

      typing.remove();
      addMessage("bot", reply);

      history.push(
        { role: "user", content: message },
        { role: "assistant", content: reply }
      );

      // Keep only the latest 10 conversation messages.
      history = history.slice(-10);

    } catch (error) {
      typing.remove();

      let errorMessage = "Unable to connect to Saathi AI.";

      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      addMessage("err", errorMessage);
      console.error("Saathi AI error:", error);

    } finally {
      isSending = false;
      chatSend.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  // Submit message using Send button or Enter.
  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage(chatInput.value);
  });

  // Quick suggestion buttons.
  if (chatQuick) {
    const suggestions = [
      "Suggest an alternative route",
      "How can I avoid train delays?",
      "Best way to travel from Jaipur to Delhi?",
      "What if my train is cancelled?"
    ];

    suggestions.forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = suggestion;

      button.addEventListener("click", () => {
        sendMessage(suggestion);
      });

      chatQuick.appendChild(button);
    });
  }

  // Clear conversation.
  if (chatClear) {
    chatClear.addEventListener("click", function () {
      history = [];
      chatMsgs.innerHTML = "";
      chatValid.textContent = "";

      addMessage(
        "bot",
        "Conversation cleared. How can I help you with your journey?"
      );
    });
  }

  // Close chatbot using Escape.
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !chatWidget.hidden) {
      closeChat();
    }
  });

  // Public API
  window.RouteSaathiAI = {
    sendMessage: function (message, context = {}, recentHistory = []) {
      return callServer(message, context, recentHistory);
    }
  };

  console.log("Saathi AI chatbot initialized successfully.");

})();