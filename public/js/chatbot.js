/* =========================================================
   Saathi AI Travel Assistant — Live AI Chatbot Integration
   - Connects to Google Gemini via Vercel Serverless (/api/chat)
   - Supports optional session-only local key fallback for local testing
   - Injects real-time RouteSaathi route/weather/passenger context
   - Validates user input & handles all network/API errors cleanly
   ========================================================= */
(function () {
  const MAX_LEN = 800;
  const MIN_LEN = 2;
  const STORAGE_KEY = 'rs_gemini_session_key';

  const fab = $('#chatFab');
  const navBtn = $('#chatNavBtn');
  const widget = $('#chatWidget');
  const closeBtn = $('#chatClose');
  const clearBtn = $('#chatClear');
  const keyToggle = $('#chatKeyToggle');
  const settingsBox = $('#chatSettings');
  const localKeyInput = $('#chatLocalKey');
  const saveKeyBtn = $('#chatSaveKey');
  const clearKeyBtn = $('#chatClearKey');
  const msgsEl = $('#chatMsgs');
  const quickEl = $('#chatQuick');
  const form = $('#chatForm');
  const input = $('#chatInput');
  const sendBtn = $('#chatSend');
  const validEl = $('#chatValid');
  const ctxTxt = $('#chatCtxTxt');
  const modeTag = $('#chatModeTag');

  if (!fab || !widget) return;

  let history = [];
  let inFlight = false;
  let lastFailedPrompt = '';

  const getLocalKey = () => {
    try { return (sessionStorage.getItem(STORAGE_KEY) || '').trim(); }
    catch (e) { return ''; }
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Safe Markdown-lite renderer (bold, inline code, bullet lists, paragraphs) */
  function formatReply(text) {
    const safe = escapeHtml(text).replace(/\r\n/g, '\n').trim();
    const lines = safe.split('\n');
    let html = '';
    let inList = false;

    const inline = s => s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }
      if (/^[-*•]\s+/.test(line)) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${inline(line.replace(/^[-*•]\s+/, ''))}</li>`;
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p>${inline(line)}</p>`;
      }
    }
    if (inList) html += '</ul>';
    return html || '<p>No response generated.</p>';
  }

  /* Build live travel context from RouteSaathi's active search state */
  function buildRouteContext() {
    const se = (typeof activeSeason === 'function') ? activeSeason(S.a, S.b) : { label: WEATHER };
    const ctx = {
      language: LANG === 'hi' ? 'Hindi (Devanagari or Hinglish)' : 'English',
      passengers: PAX,
      trainClass: CLASS_NAME[TCLASS] || TCLASS,
      weatherMode: se.label,
      travelDate: day || $('#date')?.value || ''
    };

    if (S.a && S.b && Array.isArray(S.all) && S.all.length) {
      ctx.origin = S.a.n;
      ctx.destination = S.b.n;
      ctx.approxDistanceKm = Math.round(S.road ? S.road.km : km(S.a, S.b) * 1.3);
      const top = order(S.all.filter(t => t.open)).slice(0, 4);
      ctx.topRoutes = top.map(t => ({
        title: title(t),
        totalCostINR: t.cost,
        totalDuration: dur(t.time),
        delayRiskPercent: tripRisk(t),
        changes: t.legs.length - 1,
        legs: t.legs.map(l => `${mName(l.m)}: ${l.a.n} -> ${l.b.n} (${l.svc}, ${dur(l.mins)}, Rs ${l.fare})`)
      }));
      const directTrain = S.all.find(t => t.legs.length === 1 && t.kind === 'train');
      if (directTrain) {
        ctx.directTrainSoldOut = !directTrain.open;
      }
    }
    return ctx;
  }

  function updateContextUI() {
    const hasRoute = !!(S.a && S.b);
    const localKey = getLocalKey();
    modeTag.textContent = localKey ? 'Mode: Local Key' : 'API: /api/chat';

    if (hasRoute) {
      ctxTxt.textContent = LANG === 'hi'
        ? `सक्रिय रूट: ${S.a.n} → ${S.b.n} (${PAX} यात्री, ${TCLASS})`
        : `Active route: ${S.a.n} → ${S.b.n} (${PAX} pax, ${TCLASS})`;
    } else {
      ctxTxt.textContent = LANG === 'hi'
        ? 'संदर्भ: भारत मल्टी-मोडल यात्रा सहायक'
        : 'Context: India Multi-Modal Travel Assistant';
    }

    $('#chatFabTxt').textContent = LANG === 'hi' ? '✦ साथी AI से पूछें' : '✦ Ask Saathi AI';
    $('#chatTitle').textContent = LANG === 'hi' ? 'साथी AI सहायक' : 'Saathi AI Assistant';
    $('#chatSubtitle').textContent = LANG === 'hi'
      ? 'लाइव Gemini AI · भारतीय यात्रा विशेषज्ञ'
      : 'Live Gemini AI · Indian Travel Expert';
    input.placeholder = LANG === 'hi'
      ? 'रूट, ट्रेन, कोहरा देरी या बैकअप प्लान पूछें…'
      : 'Ask about routes, trains, fog delays, or backups…';
    sendBtn.textContent = LANG === 'hi' ? 'भेजें' : 'Send';

    const prompts = hasRoute
      ? (LANG === 'hi'
        ? [
            `${S.a.n} से ${S.b.n} के लिए सबसे सुरक्षित रूट कौन सा है?`,
            'अगर ट्रेन 2 घंटे लेट हो तो बैकअप प्लान बताएं',
            'बजट बनाम समय की तुलना समझाएं',
            'मौसम और देरी के जोखिम पर सलाह दें'
          ]
        : [
            `Which route is safest for ${S.a.n} to ${S.b.n}?`,
            'Suggest a Plan B if my train is 2 hours late',
            'Compare fastest vs cheapest option here',
            'Any seasonal fog or monsoon tips for this trip?'
          ])
      : (LANG === 'hi'
        ? [
            'ट्रेन फुल होने पर स्मार्ट कनेक्शन कैसे चुनें?',
            'सर्दियों के कोहरे में कितना बफर टाइम रखें?',
            'जयपुर से पटना जाने के सबसे अच्छे तरीके बताएं',
            'Tatkal बनाम Connecting Train में क्या बेहतर है?'
          ]
        : [
            'How do I pick a safe connection if direct trains are full?',
            'How much buffer time is safe during North India winter fog?',
            'Best ways to travel from Jaipur to Patna?',
            'Tips for mixing train + flight or bus across India'
          ]);

    quickEl.innerHTML = prompts
      .map(p => `<button type="button" data-q="${escapeHtml(p)}">${escapeHtml(p)}</button>`)
      .join('');
  }

  function appendMessage(role, htmlOrText, isRawHtml = false) {
    const div = document.createElement('div');
    div.className = `c-msg ${role}`;
    if (isRawHtml) div.innerHTML = htmlOrText;
    else div.textContent = htmlOrText;
    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return div;
  }

  function appendError(message, canRetry = true) {
    const div = document.createElement('div');
    div.className = 'c-msg err';
    div.innerHTML = `<p><strong>⚠ Unable to reach AI model:</strong> ${escapeHtml(message)}</p>` +
      (canRetry ? `<button type="button" class="c-retry">↻ Retry last message</button>` : '');
    const retryBtn = div.querySelector('.c-retry');
    if (retryBtn) {
      retryBtn.onclick = () => {
        div.remove();
        if (lastFailedPrompt) sendMessage(lastFailedPrompt, true);
      };
    }
    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function renderWelcome() {
    msgsEl.innerHTML = '';
    const intro = LANG === 'hi'
      ? 'नमस्ते! मैं **साथी AI** हूँ — RouteSaathi का लाइव AI यात्रा सहायक। मुझसे ट्रेन, फ्लाइट, बस, कनेक्शन बफर, कोहरे/मानसून देरी या किसी भी भारतीय रूट के बैकअप प्लान के बारे में पूछें।'
      : 'Namaste! I am **Saathi AI**, RouteSaathi’s live AI travel assistant. Ask me about Indian multi-modal routes, sold-out train alternatives, seasonal fog/monsoon delay buffers, or your active search results.';
    appendMessage('bot', formatReply(intro), true);
  }

  /* Direct browser call ONLY when user explicitly configures a session key for local testing */
  async function callGeminiDirect(message, context, recentHistory, apiKey) {
    const sysText = [
      'You are Saathi AI, the official multi-modal Indian travel assistant inside the RouteSaathi web application.',
      'Give concise, practical, accurate advice about Indian trains (IRCTC classes, junctions, Tatkal/WL), domestic flights, intercity Volvo buses, outstation cabs, connection buffer safety, and seasonal delays (winter fog, monsoon).',
      'Always respond in the user language (English or Hindi). Keep answers crisp (under 180 words) with bullet points when comparing options.',
      'Do not fabricate live seat numbers; clearly mention that live availability should be confirmed on IRCTC/ixigo/redBus/Google Flights.',
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
          model: 'llama-3.3-70b-versatile',
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
      if (!reply) throw new Error('The AI model returned an empty response. Please rephrase your question.');
      return reply;
    } finally {
      clearTimeout(timer);
    }
  }
  /* Primary production path: Vercel Serverless Function (/api/chat) */
  async function callServerlessApi(message, context, recentHistory) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 22000);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          context,
          history: recentHistory
        })
      });

      const contentType = resp.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await resp.json().catch(() => ({}))
        : {};

      if (!resp.ok) {
        if (resp.status === 404 || resp.status === 405) {
          throw new Error('Serverless endpoint /api/chat is not running in static local mode. Run "vercel dev", deploy to Vercel, or click "⚙ Key" above to test locally with your Gemini API key.');
        }
        throw new Error(data.error || `Server returned HTTP ${resp.status}`);
      }
      if (!data.reply) throw new Error('Empty response from /api/chat.');
      return data.reply;
    } finally {
      clearTimeout(timer);
    }
  }

  function validateMessage(raw) {
    const text = raw.trim();
    if (!text) return LANG === 'hi' ? 'कृपया कोई प्रश्न लिखें।' : 'Please enter a travel question first.';
    if (text.length < MIN_LEN) return LANG === 'hi' ? 'कृपया कम से कम 2 अक्षर लिखें।' : 'Please type at least 2 characters.';
    if (text.length > MAX_LEN) return LANG === 'hi' ? `संदेश ${MAX_LEN} अक्षरों से कम रखें।` : `Please keep your message under ${MAX_LEN} characters.`;
    if (/^[^a-zA-Z0-9\u0900-\u097F]+$/.test(text)) {
      return LANG === 'hi' ? 'कृपया वैध शब्दों में प्रश्न पूछें।' : 'Please enter a valid question using words or numbers.';
    }
    return '';
  }

  async function sendMessage(rawText, isRetry = false) {
    if (inFlight) return;
    const errMsg = validateMessage(rawText);
    validEl.textContent = errMsg;
    if (errMsg) {
      if (typeof pulseClass === 'function') pulseClass(validEl, 'anim-shake', 420);
      return;
    }

    const clean = rawText.trim();
    if (!isRetry) {
      appendMessage('user', clean, false);
      input.value = '';
    }

    inFlight = true;
    sendBtn.disabled = true;
    input.disabled = true;
    lastFailedPrompt = clean;

    const typingBubble = appendMessage(
      'bot',
      '<span class="c-typing" aria-label="AI is typing"><i></i><i></i><i></i></span>',
      true
    );

    const context = buildRouteContext();
    const recentHistory = history.slice(-8);

    try {
      const localKey = getLocalKey();
      const reply = localKey
        ? await callGeminiDirect(clean, context, recentHistory, localKey)
        : await callServerlessApi(clean, context, recentHistory);

      typingBubble.remove();
      appendMessage('bot', formatReply(reply), true);
      history.push({ role: 'user', content: clean }, { role: 'assistant', content: reply });
      if (history.length > 16) history = history.slice(-16);
      lastFailedPrompt = '';
    } catch (err) {
      typingBubble.remove();
      let friendly = err?.message || 'Unexpected network error.';
      if (err?.name === 'AbortError') {
        friendly = 'Request timed out. Please check your internet connection and retry.';
      } else if (!navigator.onLine) {
        friendly = 'You appear to be offline. Reconnect to the internet to use Saathi AI.';
      }
      appendError(friendly, true);
    } finally {
      inFlight = false;
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  function openChat() {
    widget.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    updateContextUI();
    if (!msgsEl.children.length) renderWelcome();
    setTimeout(() => input.focus(), 60);
  }

  function closeChat() {
    widget.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', () => (widget.hidden ? openChat() : closeChat()));
  if (navBtn) navBtn.addEventListener('click', () => (widget.hidden ? openChat() : closeChat()));
  closeBtn.addEventListener('click', closeChat);

  clearBtn.addEventListener('click', () => {
    history = [];
    validEl.textContent = '';
    renderWelcome();
  });

  keyToggle.addEventListener('click', () => {
    settingsBox.hidden = !settingsBox.hidden;
    if (!settingsBox.hidden) localKeyInput.value = getLocalKey();
  });

  saveKeyBtn.addEventListener('click', () => {
    const val = localKeyInput.value.trim();
    if (val && val.length < 20) {
      validEl.textContent = 'That does not look like a valid Gemini API key.';
      return;
    }
    try {
      if (val) sessionStorage.setItem(STORAGE_KEY, val);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    validEl.textContent = '';
    settingsBox.hidden = true;
    updateContextUI();
    appendMessage('bot', formatReply(val
      ? '✓ Local session Gemini API key saved. You can now chat directly from local mode.'
      : '✓ Cleared local key. Chatbot is now using the `/api/chat` serverless endpoint.'), true);
  });

  clearKeyBtn.addEventListener('click', () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
    localKeyInput.value = '';
    settingsBox.hidden = true;
    updateContextUI();
  });

  quickEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-q]');
    if (!b || inFlight) return;
    sendMessage(b.dataset.q);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener('input', () => {
    if (validEl.textContent) validEl.textContent = '';
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !widget.hidden) closeChat();
  });

  window.addEventListener('rs:context-change', updateContextUI);

  updateContextUI();
  renderWelcome();
})();
