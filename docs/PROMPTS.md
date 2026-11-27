# Prompt Engineering Documentation — RouteSaathi

**Course:** Prompt Engineering — Final Project (Third Semester, Second-Year Engineering)  
**Institution:** Department of Computer Science & Engineering, JECRC University, Jaipur  
**Team Members:**
- **Arpit Ganeshaanand** (`25BCON2339`)
- **Madhur Kumar** (`25BCON2463`)
- **Sarthak Gupta** (`25BCON2424`)

This document records the complete prompt engineering workflow used to design, build, refine, and deploy **RouteSaathi**.

---

## 1. Initial Project-Building Prompt (Five Parts of a Good Prompt)

Before writing code, the project was initiated using the compulsory **Five Parts of a Good Prompt** framework:

### 1.1 Role
> Act as a Senior Full-Stack Web Developer, Geospatial UI Designer, and Indian Transport Domain Architect specializing in modular HTML5, CSS3, Vanilla JavaScript, Canvas mapping, and AI API integration.

### 1.2 Task
> Build **RouteSaathi**, a functional, AI-powered multi-modal travel planning web application for India that compares **Train, Flight, Bus, and Private Cab** journeys between any two places in India, synthesizes hub-based connecting routes when direct trains are sold out, scores seasonal delay risks, and integrates a working **AI Travel Assistant chatbot** connected to an LLM API.

### 1.3 Context
> - **Problem:** Across major Indian rail corridors (e.g., Patna–Delhi, Jaipur–Patna, Mumbai–Delhi), confirmed direct train tickets are frequently waitlisted or sold out. Travellers manually jump across IRCTC, flight portals, bus apps, and Google Maps while risking missed connections due to North India winter fog or monsoon delays.
> - **Target Audience:** Daily commuters, college students, families, and budget/time-conscious travellers across Tier-1, Tier-2, and rural India.
> - **Purpose:** Deliver a single interface that compares door-to-door time, cost, transfer risk, and live AI travel guidance in both English and Hindi.

### 1.4 Constraints
> - **Architecture:** Clean modular folder structure (`public/index.html`, `public/css/`, `public/js/`, and Vercel serverless backend `api/chat.js`) — no hardcoded API keys in client code or GitHub.
> - **Visual Design:** Distinct Indian heritage identity (Pearl Day & Royal Night themes, Cinzel & Alegreya typography, subtle SVG cultural doodles, responsive mobile layout, accessible contrast).
> - **Routing & Data:** Offline database of 300+ Indian cities with real IRCTC/IATA codes + live OpenStreetMap Photon geocoding & OSRM road geometry + verified Indian corridor timetables + pre-filled deep-links to IRCTC, ixigo, ConfirmTkt, Google Flights, MakeMyTrip, redBus, and Google Maps.
> - **AI Chatbot:** Must communicate with a real AI model (Google Gemini API) through a serverless API route, inject the user's active route context, validate inputs, and handle API/network errors gracefully without falling back to fake canned replies.

### 1.5 Output Format
> Deliver a deployment-ready Vercel repository containing:
> 1. Modular frontend files (`index.html`, `styles.css`, `chatbot.css`, `i18n.js`, `data.js`, `engine.js`, `map.js`, `app.js`, `chatbot.js`)
> 2. Serverless AI endpoint (`api/chat.js`) with `.env.example` and `.gitignore`
> 3. Complete `README.md` and prompt engineering documentation

### How Each of the Five Components Contributed
| Component | Direct Impact on Generated Website |
|---|---|
| **Role** | Produced clean modular engineering code, proper Web Mercator math, and realistic Indian station/train terminology instead of generic travel templates. |
| **Task** | Ensured all four travel modes, hub-transfer synthesis, delay scoring, and the AI chatbot were designed as one cohesive workflow. |
| **Context** | Shaped Indian-specific features: Sleeper/3AC/2AC/CC classes, winter fog & monsoon multipliers, INR (`₹`) formatting, and English/Hindi bilingual support. |
| **Constraints** | Prevented API key leaks by enforcing a Vercel serverless proxy (`/api/chat`), ensured responsive accessibility, and banned fake hardcoded chatbot answers. |
| **Output Format** | Prevented monolithic single-file sprawl and delivered a clean GitHub + Vercel deployment structure from the start. |

---

## 2. Multi-Tool AI Workflow (At Least 3 AI Tools)

| AI Tool | Specific Tasks Performed | Concrete Contribution to RouteSaathi |
|---|---|---|
| **Google Gemini** | Core architecture refactoring, Vercel Serverless Gemini API chatbot (`/api/chat` + `chatbot.js`), prompt documentation, and multilingual Hindi (`हिन्दी`) localization verification | Converted monolithic prototype into modular Vercel-ready architecture, engineered context-aware AI chatbot with full input validation & error handling. |
| **Claude** | Algorithm design for multi-modal hub synthesis, Dijkstra shortest-path fallback, exponential delay risk modeling, and Indian cultural SVG doodle aesthetics | Built the seasonal delay probability math (`lateMore`, `missChance`), Esri satellite Canvas map fly-through, and Pearl Day / Royal Night design system. |
| **ChatGPT** | Verification of major Indian rail/flight corridors (train numbers, IRCTC station codes, IATA airport codes), pre-filled deep-link URL formats, and README/edge-case testing | Compiled verified timetables (e.g., 12951 Rajdhani, 12393 Sampoorna Kranti, 20977 Vande Bharat) and tested deep-links for ixigo, ConfirmTkt, redBus, and Google Flights. |
| **Cursor / GitHub Copilot** *(Optional 4th tool)* | Local code debugging, CSS responsive tweaks, and GitHub commit workflow | Speeded up minor CSS media-query fixes and local `vercel dev` testing. |

*(Update this table if your group used Bolt.new, Lovable, or Perplexity AI for specific subtasks so it matches your exact group workflow during viva.)*

---

## 3. Prompt Engineering Techniques & Iteration Log

### Iteration 1 — Naive Prompt vs. Structured Constraint Prompt (Routing Engine)
- **Initial Prompt (Weak):** *"Make a travel website for India that shows trains, flights, and buses between two cities."*
- **Observed Problem:** Generated a static mock table with only 5 cities, fake prices, and no connecting routes when direct trains were full.
- **Refined Prompt (Structured + Chain Prompting):**
  > *"Step 1: Create an offline graph of 300+ Indian cities with lat/lon, rail, airport, and hub flags. Step 2: Implement a direct + 1-change + 2-change hub route generator with a Dijkstra shortest-path fallback when direct rail is sold out. Step 3: Add OpenStreetMap Photon geocoding and OSRM driving fallback for villages not in the offline list."*
- **Measurable Improvement:** Coverage jumped from 5 static cities to any village/town in India, with automatic multi-leg hub connections (e.g., Patna → DDU Junction / Kanpur → Delhi).

### Iteration 2 — Context-Based Prompting (Seasonal Delay Risk & Live Simulator)
- **Initial Prompt:** *"Add a delay warning to connecting routes."*
- **Observed Problem:** Only showed a static "May be delayed" badge with no mathematical justification.
- **Refined Prompt:**
  > *"Model leg delays using an exponential distribution parameterized by mode and duration, multiplied by seasonal factors (North India Winter Fog +45–50% rail delay in Dec–Jan, Monsoon +35% road delay in Jul–Sep). Add an interactive 0–300 minute range slider inside the Journey Plan modal so users can drag and test whether they still catch their connecting train/flight."*
- **Measurable Improvement:** Turned a passive label into an interactive decision-making simulator with exact spare-minute calculations.

### Iteration 3 — Role-Based + Guardrailed Prompting (Working AI Chatbot)
- **Initial Prompt:** *"Add a chatbot widget to my travel website."*
- **Observed Problem:** Produced a static widget with hardcoded `if/else` replies and suggested placing the API key directly inside frontend JavaScript (security violation).
- **Refined Prompt:**
  > *"Refactor the monolithic HTML file into a Vercel-deployable project with a Node.js serverless function at `api/chat.js` reading `process.env.GEMINI_API_KEY`. Connect a floating bilingual `Saathi AI` chatbot (`public/js/chatbot.js`) that injects the active search context (origin, destination, top routes, weather, passengers), validates invalid/empty/oversized inputs, displays clear retryable error states for 429/500/offline failures, and uses zero hardcoded canned replies."*
- **Measurable Improvement:** Fully compliant with Guidelines 2.5, 2.6, and 2.7 — real live LLM responses, route-aware answers, and zero secrets in GitHub.

### Iteration 4 — Reverse Prompting & Response Evaluation
- **Technique Applied:** After generating `api/chat.js` and `public/js/chatbot.js`, we asked the AI to audit its own code against the Prompt Engineering rubric:
  > *"Review `api/chat.js` and `chatbot.js` as a strict university viva examiner. Identify any security flaws (XSS, exposed keys), missing error states (offline, timeout, 429 rate limit, empty input), or static fallback violations, and propose exact fixes."*
- **Outcome:** Added `escapeHtml()` before Markdown formatting to prevent XSS, added `AbortController` 22-second timeouts, added punctuation-only input validation, and added a one-click Retry button on API failure.
