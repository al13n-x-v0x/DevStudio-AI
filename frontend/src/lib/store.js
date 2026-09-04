/**
 * DevStudio AI — Global State Store (Zustand)
 */
import { create } from 'zustand'

const API = '/api'

export const useStore = create((set, get) => ({
  // ─── Current Page ───
  currentPage: 'scan',
  setPage: (page) => set({ currentPage: page }),

  // ─── Scan State ───
  code: `import sqlite3
conn = sqlite3.connect("users.db")
username = request.args.get("user")
query = "SELECT * FROM users WHERE name = '" + username + "'"
cursor.execute(query)

password = "admin123"
api_key = "sk-1234567890abcdef"

import hashlib
h = md5(password.encode()).hexdigest()

os.system("cat " + filename)`,
  setCode: (code) => set({ code }),
  language: 'Python',
  setLanguage: (lang) => set({ language: lang }),
  scanResults: null,
  scanning: false,
  scanProgress: null,

  runScan: async () => {
    const { code, language } = get()
    if (!code.trim()) return
    set({ scanning: true, scanProgress: { step: 'init', message: 'Starting scan...', progress: 5 } })

    // Simulate progress steps
    const steps = [
      { step: 'tokenize', message: 'Tokenizing code...', progress: 15 },
      { step: 'patterns', message: 'Scanning 50+ vulnerability patterns...', progress: 35 },
      { step: 'owasp', message: 'Checking OWASP/CWE mappings...', progress: 55 },
      { step: 'style', message: 'Running style checks...', progress: 75 },
      { step: 'memory', message: 'Indexing to memory...', progress: 90 },
    ]

    for (const s of steps) {
      set({ scanProgress: s })
      await new Promise(r => setTimeout(r, 250))
    }

    try {
      const res = await fetch(`${API}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      set({ scanResults: data, scanProgress: { step: 'done', message: 'Scan complete!', progress: 100 } })
      // Save to history
      get().addHistory({
        time: Date.now(),
        language,
        score: data.score,
        findings: data.findings?.length || 0,
        code: code.substring(0, 200),
      })
      get().refreshMemory()
    } catch (err) {
      console.error('Scan failed:', err)
      set({ scanProgress: { step: 'error', message: 'Scan failed', progress: 0 } })
    }

    setTimeout(() => set({ scanning: false, scanProgress: null }), 800)
  },

  // ─── DocMind State ───
  docContent: '',
  setDocContent: (c) => set({ docContent: c }),
  docType: 'auto',
  setDocType: (t) => set({ docType: t }),
  docResults: null,
  documents: [],
  indexing: false,

  runDocMind: async () => {
    const { docContent, docType } = get()
    if (!docContent.trim()) return
    set({ indexing: true })
    try {
      const res = await fetch(`${API}/docmind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: docContent, doc_type: docType }),
      })
      const data = await res.json()
      set({ docResults: data })
      get().refreshDocs()
      get().refreshMemory()
    } catch (err) {
      console.error('DocMind failed:', err)
    }
    set({ indexing: false })
  },

  refreshDocs: async () => {
    try {
      const res = await fetch(`${API}/docs`)
      const data = await res.json()
      set({ documents: data.documents || [] })
    } catch (err) { /* ignore */ }
  },

  // ─── Chat State ───
  messages: [
    { role: 'ai', text: "Hey! I'm DevBuddy — your AI research assistant. I can answer questions about your indexed documents, security findings, or any technical topic. Everything gets saved to your memory. What can I help with?" }
  ],
  chatInput: '',
  setChatInput: (v) => set({ chatInput: v }),
  chatLoading: false,

  sendChat: async () => {
    const { chatInput, messages } = get()
    if (!chatInput.trim()) return
    const q = chatInput.trim()
    set({ chatInput: '', messages: [...messages, { role: 'user', text: q }], chatLoading: true })
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      set({ messages: [...get().messages, { role: 'ai', text: data.answer }] })
      get().refreshMemory()
    } catch (err) {
      set({ messages: [...get().messages, { role: 'ai', text: 'Error: ' + err.message }] })
    }
    set({ chatLoading: false })
  },

  // ─── Memory State ───
  memoryStats: null,
  memoryEntries: [],

  refreshMemory: async () => {
    try {
      const res = await fetch(`${API}/memory`)
      const data = await res.json()
      set({ memoryStats: data.stats, memoryEntries: data.recent || [] })
    } catch (err) { /* ignore */ }
  },

  // ─── Speech State ───
  speaking: false,
  setSpeaking: (v) => set({ speaking: v }),
  listening: false,
  setListening: (v) => set({ listening: v }),

  // ─── Splash / Demo ───
  showSplash: true,
  setShowSplash: (v) => set({ showSplash: v }),
  showDemo: false,
  setShowDemo: (v) => set({ showDemo: v }),
  demoStep: 0,
  setDemoStep: (s) => set({ demoStep: s }),

  // ─── Scan History (localStorage) ───
  scanHistory: JSON.parse(localStorage.getItem('ds_history') || '[]'),
  addHistory: (entry) => {
    const history = [entry, ...get().scanHistory].slice(0, 50)
    localStorage.setItem('ds_history', JSON.stringify(history))
    set({ scanHistory: history })
  },
  clearHistory: () => {
    localStorage.removeItem('ds_history')
    set({ scanHistory: [] })
  },

  // ─── Keyboard Shortcuts ───
  shortcutsEnabled: localStorage.getItem('ds_shortcuts') !== 'false',
  toggleShortcuts: () => {
    const val = !get().shortcutsEnabled
    localStorage.setItem('ds_shortcuts', val)
    set({ shortcutsEnabled: val })
  },
}))
