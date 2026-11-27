# RouteSaathi — AI-Powered Smart Multi-Modal Travel Across India

> **Prompt Engineering — Final Project (Third Semester, Second-Year Engineering)**  
> Department of Computer Science & Engineering, JECRC University, Jaipur  
> **Team:** Arpit Ganeshaanand (`25BCON2339`) · Madhur Kumar (`25BCON2463`) · Sarthak Gupta (`25BCON2424`)

**Live Website:** `https://your-routesaathi-app.vercel.app` *(replace with your Vercel URL after deployment)*  
**GitHub Repository:** `https://github.com/your-username/routesaathi` *(replace with your repo URL)*

---

## 1. Project Description & Problem Statement

Across major Indian travel corridors, direct train tickets frequently sell out or go into long waitlists weeks in advance. Travellers are forced to switch manually between IRCTC, flight aggregators, bus portals, and maps—often booking risky multi-leg connections without realizing how North India winter fog or monsoon delays affect transfer safety.

**RouteSaathi** solves this problem in one unified web application:
- Compares **Train, Flight, Bus, and Private Cab** side by side (door-to-door time, total group fare, per-km cost, and delay risk).
- Automatically synthesizes **smart hub-based connecting routes** (with Dijkstra shortest-path fallback) when direct trains are sold out.
- Models **seasonal delay risk** (Winter Fog, Monsoon, Festive Peak) and lets travellers drag a **Live Delay Simulator** to verify if they will still catch their connection.
- Integrates **Saathi AI**, a live AI-powered travel assistant connected to the **Google Gemini API** via a secure Vercel Serverless backend.

### Target Audience
Indian college students, daily/intercity commuters, families, and budget- or time-conscious travellers travelling between Tier-1 hubs, Tier-2 cities, and rural towns/villages.

### Project Objectives
1. Provide instant multi-modal route comparison across 300+ Indian cities offline and any Indian village/town online.
2. Eliminate missed transfers through probabilistic delay scoring and interactive connection checking.
3. Deliver real-time, route-aware AI travel guidance via a secure, production-ready LLM chatbot.
4. Demonstrate disciplined **Prompt Engineering** (5-part initial prompt, multi-tool AI development, iterative prompt refinement, and security auditing).

---

## 2. Key Features Implemented

- **4-Mode Route Comparison:** Train (SL / 3AC / 2AC / CC), Flight, Bus, and Private Cab scaled dynamically for 1–6 passengers.
- **Automatic Hub Connections & Dijkstra Fallback:** Builds 1-change and 2-change multi-modal routes via major Indian junctions when direct trains are full.
- **Working AI Chatbot (`Saathi AI`):**
  - Directly accessible from both the top navigation bar (`✦ Saathi AI`) and the floating chat button.
  - Communicates live with **Google Gemini API** through `/api/chat` (Vercel Serverless Function).
  - Automatically reads the user's active route, passengers, class, and weather mode for context-aware recommendations.
  - Includes input validation, multi-turn conversation memory, XSS-safe formatting, and graceful error/rate-limit handling with Retry.
- **Interactive Esri Satellite Canvas Map:** Web Mercator fly-through animation, hover-to-preview individual routes, and multi-mode comparison view.
- **Seasonal Delay Intelligence & Live Delay Simulator:** Winter Fog / Monsoon / Festive adjustments, interactive 0–300 min delay slider, and standalone Connection Checker.
- **Verified Indian Corridors & Pre-filled Deep-Links:** Real train numbers, IRCTC station codes, IATA codes, and one-click pre-filled booking handoffs to IRCTC, ixigo, ConfirmTkt Live Status, Google Flights, MakeMyTrip, redBus, AbhiBus, and Google Maps.
- **Bilingual & Theme-Adaptive UI:** Full English / Hindi (`हिन्दी`) toggle, Pearl Day & Royal Night themes, route-aware animated Indian heritage SVG backdrop, and WhatsApp/Clipboard itinerary sharing.

---

## 3. Project Folder Structure

```text
RouteSaathi/
├── api/
│   └── chat.js                 # Vercel Serverless Function -> Google Gemini API
├── public/
│   ├── index.html              # Semantic HTML5 application shell
│   ├── css/
│   │   ├── styles.css          # Core design system, themes, doodles & UI motion
│   │   └── chatbot.css         # Saathi AI floating chatbot styles
│   └── js/
│       ├── i18n.js             # English & Hindi (हिन्दी) localization
│       ├── data.js             # 300+ Indian cities DB, IRCTC/IATA codes, corridors
│       ├── engine.js           # Multi-modal router, Dijkstra, delay risk, Photon/OSRM
│       ├── map.js              # Vehicle sprites, India GeoJSON, Web Mercator Canvas map
│       ├── app.js              # UI rendering, modals, filters, autocomplete, motion
│       └── chatbot.js          # Working AI Chatbot UI, validation & API client
├── docs/
│   ├── PROMPTS.md              # 5-part initial prompt + prompt iteration documentation
│   ├── VIVA_GUIDE.md           # Evaluation & viva walkthrough guide
│   └── screenshots/            # Application screenshots
├── .env.example                # Environment variable template (NO real keys!)
├── .gitignore                  # Protects .env / .env.local from being committed
├── package.json                # Project scripts & Node engine metadata
├── vercel.json                 # Vercel deployment configuration
└── README.md                   # Project documentation
```

---

## 4. Technologies & AI Tools Used

### Technologies
- **Frontend:** HTML5, CSS3 (Custom Properties, Grid, Animations), Vanilla JavaScript (ES6+), HTML5 2D Canvas
- **AI Backend:** Node.js Vercel Serverless Function (`api/chat.js`) + Google Gemini REST API (`gemini-2.5-flash`)
- **Geospatial APIs:** OpenStreetMap Photon Geocoder, OSRM Driving Router, Esri World Imagery Satellite Tiles
- **Deployment & Version Control:** Git, GitHub, Vercel

### AI Tools Used (3+ Tools Requirement)
1. **Google Gemini:** Refactored single-file HTML into modular Vercel architecture, built the live Gemini Serverless AI Chatbot (`api/chat.js` + `chatbot.js`), refined Hindi translations, and audited security/error handling.
2. **Claude:** Engineered the multi-modal hub routing & Dijkstra fallback engine, seasonal exponential delay risk model, interactive Canvas satellite map, and Indian cultural SVG theme.
3. **ChatGPT:** Verified major Indian corridor schedules (train numbers, airline/bus operators, station & IATA codes), pre-filled deep-link formats, and QA test scenarios.
4. **Cursor / GitHub Copilot:** Assisted with local testing, responsive layout adjustments, and repository cleanup.

---

## 5. Prompt Engineering Documentation

Full documentation of our **Five Parts of a Good Prompt** (Role, Task, Context, Constraints, Output Format), prompt evolution from initial prototypes to the final deployed app, and prompt engineering techniques (role-based, chain prompting, context-based, structured constraints, and reverse-prompt auditing) is maintained in:

👉 **[`docs/PROMPTS.md`](docs/PROMPTS.md)**  
👉 **[`docs/VIVA_GUIDE.md`](docs/VIVA_GUIDE.md)**

---

## 6. Screenshots

*(Add your captured screenshots to `docs/screenshots/` before final submission)*

| Home & Search (Pearl Day) | Multi-Modal Results & Satellite Map |
|---|---|
| ![Home](docs/screenshots/home-day.png) | ![Results](docs/screenshots/results-map.png) |

| Live Delay Simulator & Booking Links | Working Saathi AI Chatbot |
|---|---|
| ![Simulator](docs/screenshots/plan-simulator.png) | ![Chatbot](docs/screenshots/ai-chatbot.png) |

---

## 7. Instructions for Running Locally & Deploying to Vercel

### Prerequisites
- Node.js 18+ installed
- A free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Option A: Run Locally with Full Serverless AI Chatbot (`vercel dev`)
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/routesaathi.git
   cd routesaathi
   ```
2. Install Vercel CLI (if not installed):
   ```bash
   npm install -g vercel
   ```
3. Create your local environment file (gitignored — **never commit this file**):
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and set:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
4. Start the local dev server:
   ```bash
   vercel dev
   ```
5. Open `http://localhost:3000` in your browser and test both route search and **✦ Saathi AI**.

### Option B: Quick Static Preview (Without Vercel CLI)
```bash
npx serve public
```
Then click **✦ Saathi AI → ⚙ Key** inside the chatbot widget to paste a temporary session-only Gemini API key for local testing.

### Deploying Live on Vercel (Recommended for Submission)
1. Push this repository to GitHub (**verify `.env.local` is NOT uploaded**).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repository.
3. Under **Environment Variables**, add:
   - Name: `GEMINI_API_KEY`
   - Value: *(your Google Gemini API key)*
4. Click **Deploy**. Vercel automatically serves `public/` as your website and deploys `api/chat.js` at `/api/chat`.
5. Test your live URL, capture screenshots for `docs/screenshots/`, and submit both your **GitHub Repo URL** and **Live Vercel URL**.

---

## 8. Team Members

| # | Name | Enrollment No. | Key Responsibilities |
|---|---|---|---|
| 1 | **Arpit Ganeshaanand** | `25BCON2339` | Lead Developer, Multi-Modal Routing Engine & Satellite Map Architecture |
| 2 | **Madhur Kumar** | `25BCON2463` | Prompt Engineering, Saathi AI Chatbot Integration & Serverless API (`/api/chat`) |
| 3 | **Sarthak Gupta** | `25BCON2424` | UI/UX Testing, Delay Risk Verification, Bilingual QA, Documentation & Vercel Deployment |
