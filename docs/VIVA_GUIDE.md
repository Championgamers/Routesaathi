# Final Viva Preparation Guide — RouteSaathi

**Team Members & Suggested Viva Presentation Split:**
- **Arpit Ganeshaanand (`25BCON2339`)** — Overall architecture, multi-modal routing & Dijkstra fallback, Esri satellite Canvas map, and seasonal delay risk model
- **Madhur Kumar (`25BCON2463`)** — Five parts of the initial prompt, multi-tool AI workflow, prompt optimization log, and live Gemini Serverless Chatbot (`/api/chat` + `chatbot.js`)
- **Sarthak Gupta (`25BCON2424`)** — Live demo walkthrough, delay simulator & standalone connection checker, bilingual UI/accessibility, GitHub/Vercel deployment, and debugging challenges

Use this quick-reference guide to answer every evaluation criterion listed in **Section 3 (Project Understanding and Demonstration)** of the guidelines.

---

### 1. Complete Working of the Website (Guideline Item 6)
1. User enters **From**, **To**, **Date**, **Passengers (1–6)**, **Train Class (SL/3A/2A/CC)**, and **Weather Mode** in `public/index.html`.
2. `public/js/engine.js` resolves locations via the 300+ offline Indian cities DB (`public/js/data.js`) or live **OpenStreetMap Photon API**, and fetches real road geometry via **OSRM**.
3. The routing engine generates direct routes (Train, Flight, Bus, Car) plus 1-change and 2-change hub connections, using **Dijkstra's algorithm** as a fallback if direct options are unavailable.
4. `public/js/app.js` renders comparison tiles, a side-by-side table, budget/time sliders, and an interactive **Esri World Imagery satellite Canvas map** (`public/js/map.js`).
5. Users can inspect any route's **Full Plan Modal** (with live delay slider + pre-filled deep-links to IRCTC, ixigo, redBus, Google Flights) or open **Saathi AI** (`public/js/chatbot.js`) to ask live questions grounded in the currently searched route.

### 2. Purpose & Functionality of Major Features (Guideline Item 7)
- **Multi-Modal Comparison:** Compares Train, Flight, Bus, and Cab side by side on door-to-door time, total group cost, per-km cost, and delay risk.
- **Sold-Out Train Recovery:** Automatically synthesizes hub-based connecting alternatives (e.g., Patna → DDU/Kanpur → Delhi).
- **Seasonal Delay Risk & Live Simulator:** Uses an exponential delay model adjusted for Winter Fog / Monsoon, plus a standalone Connection Checker and 0–300 min interactive delay slider.
- **Working AI Travel Chatbot (`Saathi AI`):** Live Gemini-powered assistant that reads the current trip context and answers follow-up questions in English or Hindi.
- **Bilingual UI & Accessibility:** Full English/Hindi (`हिन्दी`) switching, Pearl Day / Royal Night theme, and reduced-motion support.

### 3. Three+ AI Tools Used & Individual Contributions (Guideline Item 8)
- **Google Gemini:** Modular refactoring, Vercel Serverless Gemini API chatbot (`api/chat.js`, `chatbot.js`), bilingual localization, and documentation.
- **Claude:** Multi-modal routing & Dijkstra fallback logic, exponential delay math, satellite Canvas map animation, and cultural SVG design system.
- **ChatGPT:** Verified Indian rail/air/bus corridor datasets, IRCTC/IATA codes, pre-filled booking deep-links, and QA edge-case checklists.

### 4. Five Parts of Our Initial Project-Building Prompt (Guideline Item 9)
Be ready to walk through **Role, Task, Context, Constraints, and Output Format** from `docs/PROMPTS.md` and explain *why* each part mattered (e.g., Constraints prevented exposed API keys and static chatbot replies; Context produced Indian rail classes and winter fog modeling).

### 5. Prompt Engineering Techniques Applied & Optimization (Guideline Items 10–11)
- **Role-based prompting** (transport architect & full-stack engineer persona)
- **Chain / Step-by-step prompting** (city graph → multi-leg synthesis → Dijkstra fallback → OSRM enrichment)
- **Context-based prompting** (injecting live route JSON into the chatbot system instruction)
- **Structured & constraint prompting** (strict folder architecture, XSS escaping, zero hardcoded keys)
- **Reverse prompting & evaluation** (having AI audit our chatbot for security/error-handling gaps)

### 6. How the AI Chatbot & API Integration Works (Guideline Item 12)
Trace the exact request lifecycle:
1. User submits a message in `public/js/chatbot.js`.
2. Client validates input (non-empty, 2–800 chars, not punctuation-only) and packages `{ message, context, history }`.
3. Browser sends `POST /api/chat` to the **Vercel Serverless Function** (`api/chat.js`).
4. `api/chat.js` reads `process.env.GEMINI_API_KEY` from Vercel Environment Variables (never exposed to browser or GitHub), builds a role-based system prompt with the route context, and sends a `POST` request to Google's Gemini REST API (`generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`).
5. The serverless function handles errors (`400`, `405`, `429`, `502`, `503`, `504`) and returns `{ reply, model }`.
6. `chatbot.js` escapes HTML to prevent XSS, renders Markdown formatting, updates conversation history, or shows a retryable error message on failure.

### 7. Technologies & Tools Used (Guideline Item 13)
HTML5, CSS3 (Custom Properties, Grid, Flexbox, Animations), Vanilla ES6 JavaScript, HTML5 2D Canvas (Web Mercator projection), Node.js Serverless Functions (Vercel), Google Gemini API, OpenStreetMap Photon API, OSRM Routing API, Esri World Imagery Tiles, Git & GitHub.

### 8. Errors & Challenges Encountered and How We Resolved Them (Guideline Item 14)
1. **Monolithic Single-File HTML:** Originally built everything in one large `RouteSaathi_v10.html`, which made collaboration, Git tracking, and secure API integration difficult. **Fix:** Refactored cleanly into `public/css/`, `public/js/`, and `api/chat.js`.
2. **Securing the AI API Key on Public GitHub:** Calling Gemini directly from frontend JS would expose our API key in the public repository. **Fix:** Moved the API call into a Vercel Serverless Function (`api/chat.js`) backed by `.env.local` (gitignored) and Vercel Environment Variables.
3. **XSS & API Error Handling in Chatbot:** Raw LLM Markdown or network timeouts could break the UI. **Fix:** Added HTML escaping before Markdown formatting, `AbortController` timeouts, input validation, and clear error banners with a Retry button.
4. **Village/Town Coverage Beyond Fixed City Lists:** Hardcoded lists miss smaller towns. **Fix:** Combined a 300+ city offline graph with live Photon geocoding and nearest-hub last-mile routing.
