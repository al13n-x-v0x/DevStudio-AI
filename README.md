# 🛡️ DevStudio AI

### The Low-Spec Developer's Security & Research Lab

A privacy-first, full-stack security assistant that runs entirely in your browser. Zero internet required. Built for the **Nebius × NVIDIA Global AI Hackathon 2026**.

---

## 📸 Screenshots

| Scan Page | Tools Page | Mobile View |
|:---------:|:----------:|:-----------:|
| ![Scan](screenshots/01-scan-page.png) | ![Tools](screenshots/04-tools-page.png) | ![Mobile](screenshots/08-mobile-view.png) |

| Chat (Voice AI) | Score Dashboard | Docs Indexer |
|:---------------:|:---------------:|:------------:|
| ![Chat](screenshots/05-chat-page.png) | ![Score](screenshots/06-score-page.png) | ![Docs](screenshots/07-docs-page.png) |

---

## 🎬 Demo Video

### Quick Demo (2 minutes)
```bash
# Start the app
cd frontend && npm run dev

# Open http://localhost:3333
# 1. Paste code in Scan tab → click Scan
# 2. View findings with expand/collapse
# 3. Click Tools tab → try any of 50+ tools
# 4. Click Chat tab → ask security questions
# 5. Click Score tab → view dashboard
# 6. Try the humanoid assistant (bottom-right)
```

### Record Full Demo
```bash
npm i puppeteer
node screenshots/record-demo.js
# Outputs: screenshots/*.png
```

### Demo Walkthrough
1. **Splash Screen** → Cinematic reveal with glitch text
2. **Security Scanner** → Paste code, hit scan, view findings
3. **50+ Dev Tools** → Hash, JWT, regex, AES, and more
4. **AI Chat** → Ask security questions (voice or text)
5. **Dot-Particle Avatar** → Animated humanoid that talks
6. **Score Dashboard** → Security metrics at a glance
7. **Mobile Responsive** → Works on phones

---

## 💡 Project Story

### Inspiration
Developers leak source code, API keys, and internal logs by pasting them into cloud-hosted LLMs. This exposes sensitive data and creates vendor lock-in. We asked: *Can we compress elite security auditing into a model that runs entirely in the browser?*

### What It Does
- **SecureAgent**: Scans code for 50+ vulnerability patterns (SQL injection, XSS, hardcoded secrets, weak crypto) with OWASP/CWE mapping
- **DocMind**: Indexes documentation and stack traces into searchable project memory
- **DevBuddy**: Natural language query over your entire research and security log
- **50+ Dev Tools**: Hash generators, JWT decoder, regex tester, AES encryption, port lookup, and more

### How We Built It
- **Frontend**: React 19 + Vite + Zustand + Framer Motion
- **Backend**: FastAPI + Python (Nemotron 3 Ultra via Nebius Token Factory)
- **AI**: Custom security knowledge base with 50+ vulnerability patterns
- **Avatar**: Canvas-based dot-particle humanoid with lip-sync and gesture states
- **Voice**: Web Speech API for TTS/STT — full speech interaction
- **Tools**: All 50+ tools run client-side using Web Crypto API

### Challenges
- Fitting 50+ features into a clean UI without overwhelming users
- Making the dot-particle avatar performant at 60fps
- Balancing offline capability with online AI enhancement

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Backend + AI (NVIDIA Nemotron + Tavily)

You need **2 free API keys** — both take 2 minutes to get:

#### Key 1: Nebius (NVIDIA Nemotron AI) — FREE
1. Go to [nebius.ai](https://nebius.ai) → Sign up
2. Go to Token Factory → Enter code: **`NEBIUS-DEVPOST-GLOBAL26`**
3. Copy your API key

#### Key 2: Tavily (Web Search) — FREE
1. Go to [tavily.com](https://tavily.com) → Sign up (no credit card)
2. Copy your API key (starts with `tvly-`)
3. You get **1,000 free searches/month**

#### Set both keys:

**Option A: Environment variables**
```powershell
# Windows PowerShell (run in terminal)
$env:NEBIUS_API_KEY = "your-nebius-key"
$env:TAVILY_API_KEY = "tvly-your-tavily-key"
```

**Option B: .env file** (create `backend/.env`)
```
NEBIUS_API_KEY=your-nebius-key-here
NEBIUS_API_BASE=https://staging.api.nebius.ai/v1
NEBIUS_REASONING_MODEL=nvidia/nemotron-3-ultra
NEBIUS_FAST_MODEL=nvidia/nemotron-nano-12b-2-v1
NEBIUS_CODE_MODEL=nvidia/nemotron-super-49b-v1
TAVILY_API_KEY=tvly-your-tavily-key-here
```

#### Start the backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
# API running at http://localhost:8000
```

4. **Start the frontend** (in a separate terminal):
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

> **Without the API key**, the app still works! It uses local pattern-based scanning and built-in security knowledge. The Nemotron integration adds deep AI reasoning for complex analysis.

---

## 📁 Project Structure

```
devstudio/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── App.jsx             # Main app + routing
│   │   ├── components/
│   │   │   ├── Humanoid.jsx    # 200+ dot-particle avatar
│   │   │   ├── HumanoidDock.jsx # Floating AI assistant
│   │   │   ├── CustomCursor.jsx # Trailing cursor with lerp
│   │   │   ├── AmbientBg.jsx   # Living gradient background
│   │   │   ├── ScrollReveal.jsx # Scroll entrance animations
│   │   │   ├── TabBar.jsx      # iOS-style bottom nav
│   │   │   ├── SplashScreen.jsx # Cinematic reveal
│   │   │   ├── Toast.jsx       # Neon notifications
│   │   │   ├── ScannerOverlay.jsx # Scan animation
│   │   │   └── DemoOverlay.jsx # Judge demo mode
│   │   ├── pages/
│   │   │   ├── ScanPage.jsx    # Security scanner (bento grid)
│   │   │   ├── ToolsPage.jsx   # 50+ developer tools
│   │   │   ├── ChatPage.jsx    # AI chat with voice
│   │   │   ├── DocsPage.jsx    # Document indexer
│   │   │   ├── ScorePage.jsx   # Security dashboard
│   │   │   └── SettingsPage.jsx # Settings + demo
│   │   ├── lib/
│   │   │   ├── store.js        # Zustand state + localStorage
│   │   │   └── speech.js       # TTS/STT engine
│   │   └── styles/
│   │       └── global.css      # Design system + 50+ animations
│   └── package.json
├── backend/                     # FastAPI + Python
│   ├── main.py                 # API routes
│   ├── core/
│   │   ├── ai_engine.py        # Nemotron integration
│   │   └── memory.py           # DevBuddy persistent memory
│   └── modules/
│       ├── docmind.py          # Document indexing
│       └── secure_agent.py     # 50+ vulnerability patterns
├── screenshots/                 # Demo screenshots
├── config/
├── requirements.txt
├── setup.sh                    # One-click installer
└── README.md
```

---

## 🛠️ 50+ Developer Tools

| Category | Tools |
|----------|-------|
| **Crypto** | Hash (SHA-1/256/384/512), HMAC, AES, XOR, Caesar, ROT13, Entropy, HashID |
| **Encoding** | Base64, URL, Binary↔Text, Hex Dump, UTF-8, MIME |
| **Auth** | JWT Decoder, Password Strength, OTP |
| **Code** | Regex, JSON/XML/YAML Format, CSV, Markdown, HTML Preview, Diff, Case Converter, Word Counter, UUID, Timestamp, Slug, Lorem |
| **Network** | IPv4/Subnet Calculator, MAC Lookup, Port Lookup, HTTP Status, DNS, SSL, User-Agent |
| **DevOps** | Cron Builder, Dockerfile, .gitignore, README, .env Generator |
| **Design** | Color Converter, CSS Gradient, Box Shadow, Border Radius, Animation |
| **Fun** | Morse Code, Pig Latin, Roman Numerals, Number Base, Emoji, QR Code |

---

## 🏆 Accomplishments

- ✅ Full-stack app (React + FastAPI + Python AI)
- ✅ 50+ vulnerability patterns with OWASP/CWE mapping
- ✅ 50+ client-side developer tools
- ✅ Dot-particle humanoid avatar with lip-sync
- ✅ Voice I/O (TTS + STT)
- ✅ AI chat with Nemotron integration
- ✅ Persistent memory with localStorage
- ✅ Cinematic UI with custom cursor and ambient lighting
- ✅ Mobile responsive
- ✅ Works 100% offline for scanning and tools

---

## 🔮 What's Next

- ONNX/mobile export for true on-device AI
- VS Code extension for live scanning
- Smart contract vulnerability detection
- Team collaboration features
- Plugin system for custom rules

---

## 📜 License

MIT

---

*Built for the Nebius × NVIDIA Global AI Hackathon 2026*
