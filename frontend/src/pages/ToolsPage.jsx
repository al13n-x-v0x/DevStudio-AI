import React, { useState, useMemo } from 'react'
import { showToast } from '../components/Toast'

// ═══════════════════════════════════════════════════════════════════════════════
// 25+ Developer Security Tools — all client-side, no backend needed
// ═══════════════════════════════════════════════════════════════════════════════

const TOOLS = [
  { id: 'hash', name: 'Hash Generator', icon: '#', category: 'crypto' },
  { id: 'base64', name: 'Base64 Encode/Decode', icon: 'B64', category: 'encoding' },
  { id: 'url', name: 'URL Encode/Decode', icon: '%', category: 'encoding' },
  { id: 'jwt', name: 'JWT Decoder', icon: 'JWT', category: 'auth' },
  { id: 'regex', name: 'Regex Tester', icon: '.*', category: 'code' },
  { id: 'password', name: 'Password Strength', icon: '🔑', category: 'auth' },
  { id: 'entropy', name: 'Entropy Calculator', icon: 'H', category: 'crypto' },
  { id: 'uuid', name: 'UUID Generator', icon: 'U', category: 'code' },
  { id: 'timestamp', name: 'Timestamp Converter', icon: 'T', category: 'code' },
  { id: 'color', name: 'Color Converter', icon: '◉', category: 'design' },
  { id: 'lorem', name: 'Lorem Ipsum Generator', icon: 'L', category: 'code' },
  { id: 'hashids', name: 'HashID Encoder', icon: '#ID', category: 'crypto' },
  { id: 'hmac', name: 'HMAC Generator', icon: 'HM', category: 'crypto' },
  { id: 'aes', name: 'AES Encrypt/Decrypt', icon: 'AES', category: 'crypto' },
  {id: 'xor', name: 'XOR Cipher', icon: 'XOR', category: 'crypto' },
  { id: 'ipv4', name: 'IPv4 Calculator', icon: 'IP', category: 'network' },
  { id: 'subnet', name: 'Subnet Calculator', icon: '/24', category: 'network' },
  { id: 'mac', name: 'MAC Vendor Lookup', icon: 'MAC', category: 'network' },
  { id: 'cron', name: 'Cron Expression Builder', icon: '⏱', category: 'devops' },
  { id: 'json', name: 'JSON Formatter', icon: '{}', category: 'code' },
  { id: 'xml', name: 'XML Validator', icon: '<>', category: 'code' },
  { id: 'yaml', name: 'YAML Validator', icon: 'YML', category: 'code' },
  { id: 'csv', name: 'CSV Viewer', icon: '📊', category: 'code' },
  { id: 'markdown', name: 'Markdown Preview', icon: 'MD', category: 'code' },
  { id: 'html', name: 'HTML Preview', icon: '<H>', category: 'code' },
  { id: 'diff', name: 'Text Diff Tool', icon: '±', category: 'code' },
  { id: 'cases', name: 'Case Converter', icon: 'Aa', category: 'code' },
  { id: 'wordcount', name: 'Word/Char Counter', icon: 'W', category: 'code' },
  { id: 'qr', name: 'QR Code Generator', icon: 'QR', category: 'encoding' },
  { id: 'crypto_prices', name: 'Crypto Price Check', icon: '₿', category: 'network' },
  { id: 'loremwords', name: 'Random Words', icon: 'RW', category: 'code' },
  { id: 'brainfuck', name: 'Brainfuck Interpreter', icon: 'BF', category: 'code' },
  { id: 'otp', name: 'OTP Generator (TOTP)', icon: 'OTP', category: 'crypto' },
  { id: 'ascii', name: 'ASCII Table', icon: 'ASC', category: 'code' },
  { id: 'emoji', name: 'Emoji Picker', icon: '😀', category: 'code' },
  { id: 'barcode', name: 'Barcode Generator', icon: '|||', category: 'encoding' },
  { id: 'loremcn', name: 'Chinese Lorem Ipsum', icon: '中', category: 'code' },
  { id: 'whitespace', name: 'Whitespace Visualizer', icon: 'WS', category: 'code' },
  { id: 'slug', name: 'Slug Generator', icon: 'slug', category: 'code' },
  { id: 'ngrok', name: 'ngrok URL Generator', icon: 'ng', category: 'devops' },
  { id: 'docker', name: 'Dockerfile Generator', icon: '🐳', category: 'devops' },
  { id: 'gitignore', name: '.gitignore Generator', icon: 'GI', category: 'devops' },
  { id: 'readme', name: 'README Generator', icon: 'RM', category: 'devops' },
  { id: 'env', name: '.env Generator', icon: 'EV', category: 'devops' },
  { id: 'port', name: 'Port Number Lookup', icon: 'P', category: 'network' },
  { id: 'ssl', name: 'SSL Certificate Checker', icon: '🔒', category: 'network' },
  { id: 'dns', name: 'DNS Record Lookup', icon: 'DNS', category: 'network' },
  { id: 'httpstatus', name: 'HTTP Status Code Lookup', icon: 'HTTP', category: 'network' },
  { id: 'useragent', name: 'User-Agent Parser', icon: 'UA', category: 'network' },
  { id: 'email', name: 'Email Validator', icon: '@', category: 'code' },
  { id: 'phone', name: 'Phone Number Formatter', icon: '📞', category: 'code' },
  { id: 'isbn', name: 'ISBN Validator', icon: 'ISBN', category: 'code' },
  { id: 'iban', name: 'IBAN Validator', icon: 'IBAN', category: 'code' },
  { id: 'creditcard', name: 'Credit Card Validator', icon: '💳', category: 'auth' },
  { id: 'currency', name: 'Currency Formatter', icon: '$', category: 'code' },
  { id: 'si', name: 'SI Prefix Converter', icon: 'SI', category: 'code' },
  { id: 'numberbase', name: 'Number Base Converter', icon: 'N²', category: 'code' },
  { id: 'roman', name: 'Roman Numeral Converter', icon: 'XII', category: 'code' },
  { id: 'morse', name: 'Morse Code Translator', icon: '···', category: 'code' },
  { id: 'piglatin', name: 'Pig Latin Translator', icon: '🐷', category: 'code' },
  { id: 'caesar', name: 'Caesar Cipher', icon: 'Ca', category: 'crypto' },
  { id: 'rot13', name: 'ROT13 Cipher', icon: 'R13', category: 'crypto' },
  { id: 'binary', name: 'Binary ↔ Text', icon: '01', category: 'encoding' },
  { id: 'hexdump', name: 'Hex Dump Viewer', icon: 'HD', category: 'encoding' },
  { id: 'utf8', name: 'UTF-8 Inspector', icon: 'U8', category: 'encoding' },
  { id: 'mime', name: 'MIME Type Lookup', icon: 'MIME', category: 'network' },
  { id: 'timezone', name: 'Timezone Converter', icon: 'TZ', category: 'code' },
  { id: 'stopwatch', name: 'Stopwatch / Timer', icon: '⏱', category: 'code' },
  { id: 'notepad', name: 'Quick Notepad', icon: '📝', category: 'code' },
  { id: 'clipboard', name: 'Clipboard History', icon: '📋', category: 'code' },
  { id: 'rainbow', name: 'CSS Gradient Generator', icon: '🌈', category: 'design' },
  { id: 'boxshadow', name: 'CSS Box Shadow Generator', icon: '▢', category: 'design' },
  { id: 'border', name: 'CSS Border Radius', icon: '⬜', category: 'design' },
  { id: 'animation', name: 'CSS Animation Generator', icon: '✨', category: 'design' },
  { id: 'favicon', name: 'Favicon Generator', icon: '🔖', category: 'design' },
  { id: 'palette', name: 'Color Palette Generator', icon: '🎨', category: 'design' },
]

export default function ToolsPage() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = TOOLS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.includes(search.toLowerCase())
  )

  const categories = [...new Set(TOOLS.map(t => t.category))]

  if (selected) {
    const Tool = TOOL_COMPONENTS[selected]
    return (
      <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>
        <button onClick={() => setSelected(null)} style={{
          background: 'none', border: 'none', color: '#5c6bc0', fontSize: 12,
          cursor: 'pointer', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace",
        }}>← Back to tools</button>
        {Tool ? <Tool /> : <p style={{ color: '#5c6bc0' }}>Tool not implemented yet</p>}
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#00e5ff', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
          // DEV TOOLS
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: '#fff', marginBottom: 8 }}>
          {TOOLS.length} Tools
        </h1>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="input"
          style={{ maxWidth: 300 }}
        />
      </div>

      {categories.map(cat => {
        const catTools = filtered.filter(t => t.category === cat)
        if (catTools.length === 0) return null
        return (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
              color: '#3949ab', marginBottom: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{cat}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
              {catTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelected(tool.id)}
                  style={{
                    background: 'rgba(15,20,34,0.7)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 12, padding: '14px 12px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,229,255,0.15)'
                    e.currentTarget.style.background = 'rgba(0,229,255,0.04)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.background = 'rgba(15,20,34,0.7)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    fontSize: 16, fontWeight: 800, color: '#00e5ff',
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 6,
                  }}>{tool.icon}</div>
                  <div style={{ fontSize: 11, color: '#7986cb', fontWeight: 600 }}>
                    {tool.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function ToolWrapper({ title, children }) {
  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  )
}

// ─── Hash Generator ───────────────────────────────────────────────────────────
function HashTool() {
  const [input, setInput] = useState('')
  const [algo, setAlgo] = useState('SHA-256')
  const [result, setResult] = useState('')

  const hash = async () => {
    if (!input) return
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const algos = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512' }
    const hashBuffer = await crypto.subtle.digest(algos[algo] || 'SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    setResult(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''))
  }

  return (
    <ToolWrapper title="Hash Generator">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to hash..." className="input" style={{ minHeight: 80, marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map(a => (
          <button key={a} onClick={() => setAlgo(a)} className={`btn ${algo === a ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '5px 12px', fontSize: 11 }}>{a}</button>
        ))}
      </div>
      <button onClick={hash} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>Generate</button>
      {result && (
        <div onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{
          background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)',
          borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5ff',
          wordBreak: 'break-all', lineHeight: 1.6,
        }}>{result}</div>
      )}
    </ToolWrapper>
  )
}

// ─── Base64 ───────────────────────────────────────────────────────────────────
function Base64Tool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('encode')
  const [result, setResult] = useState('')

  const run = () => {
    try {
      setResult(mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input))))
    } catch { setResult('Error: Invalid input') }
  }

  return (
    <ToolWrapper title="Base64 Encode/Decode">
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button onClick={() => setMode('encode')} className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '5px 14px', fontSize: 11 }}>Encode</button>
        <button onClick={() => setMode('decode')} className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '5px 14px', fontSize: 11 }}>Decode</button>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text..." className="input" style={{ minHeight: 80, marginBottom: 10 }} />
      <button onClick={run} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>Convert</button>
      {result && <div onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5ff', wordBreak: 'break-all' }}>{result}</div>}
    </ToolWrapper>
  )
}

// ─── URL Encode/Decode ────────────────────────────────────────────────────────
function URLTool() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const encode = () => { try { setResult(encodeURIComponent(input)) } catch {} }
  const decode = () => { try { setResult(decodeURIComponent(input)) } catch {} }
  return (
    <ToolWrapper title="URL Encode/Decode">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter URL or text..." className="input" style={{ minHeight: 60, marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={encode} className="btn btn-primary" style={{ flex: 1 }}>Encode</button>
        <button onClick={decode} className="btn btn-ghost" style={{ flex: 1 }}>Decode</button>
      </div>
      {result && <div onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ marginTop: 10, background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5ff', wordBreak: 'break-all' }}>{result}</div>}
    </ToolWrapper>
  )
}

// ─── JWT Decoder ──────────────────────────────────────────────────────────────
function JWTTool() {
  const [token, setToken] = useState('')
  const [parts, setParts] = useState(null)
  const decode = () => {
    try {
      const [header, payload] = token.split('.').slice(0, 2).map(p => JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))))
      setParts({ header, payload })
    } catch { setParts(null); showToast('Invalid JWT', 'error') }
  }
  return (
    <ToolWrapper title="JWT Decoder">
      <textarea value={token} onChange={e => setToken(e.target.value)} placeholder="Paste JWT token..." className="input" style={{ minHeight: 80, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      <button onClick={decode} className="btn btn-primary" style={{ width: '100%', marginBottom: 14 }}>Decode</button>
      {parts && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {['header', 'payload'].map(key => (
            <div key={key} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: key === 'header' ? '#00e5ff' : '#9d4edd', textTransform: 'uppercase', marginBottom: 8 }}>{key}</div>
              <pre style={{ fontSize: 10, color: '#7986cb', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{JSON.stringify(parts[key], null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── Regex Tester ─────────────────────────────────────────────────────────────
function RegexTool() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testStr, setTestStr] = useState('')
  const [matches, setMatches] = useState([])
  const test = () => {
    try {
      const re = new RegExp(pattern, flags)
      const m = [...testStr.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))]
      setMatches(m.map(match => ({ text: match[0], index: match.index, groups: match.slice(1) })))
    } catch { setMatches([]) }
  }
  return (
    <ToolWrapper title="Regex Tester">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="/pattern/" className="input" style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace" }} />
        <input value={flags} onChange={e => setFlags(e.target.value)} placeholder="flags" className="input" style={{ width: 50, textAlign: 'center' }} />
      </div>
      <textarea value={testStr} onChange={e => setTestStr(e.target.value)} placeholder="Test string..." className="input" style={{ minHeight: 80, marginBottom: 10 }} />
      <button onClick={test} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>Test</button>
      <div style={{ fontSize: 11, color: '#5c6bc0', marginBottom: 6 }}>{matches.length} match{matches.length !== 1 ? 'es' : ''}</div>
      {matches.map((m, i) => (
        <div key={i} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 8, padding: '8px 12px', marginBottom: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: '#00e5ff' }}>"{m.text}"</span>
          <span style={{ color: '#3949ab' }}> at index {m.index}</span>
          {m.groups.length > 0 && <div style={{ color: '#9d4edd', marginTop: 4 }}>Groups: {m.groups.map((g, j) => `(${j + 1}): "${g}"`).join(', ')}</div>}
        </div>
      ))}
    </ToolWrapper>
  )
}

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordTool() {
  const [pw, setPw] = useState('')
  const calc = (p) => {
    let score = 0
    if (p.length >= 8) score += 1
    if (p.length >= 12) score += 1
    if (p.length >= 16) score += 1
    if (/[a-z]/.test(p)) score += 1
    if (/[A-Z]/.test(p)) score += 1
    if (/[0-9]/.test(p)) score += 1
    if (/[^a-zA-Z0-9]/.test(p)) score += 1
    if (/(.)\1{2,}/.test(p)) score -= 1
    if (/^(password|123456|admin)/i.test(p)) score -= 3
    const entropy = p.length * Math.log2(36 + (/[A-Z]/.test(p) ? 26 : 0) + (/[0-9]/.test(p) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(p) ? 32 : 0))
    return { score: Math.max(0, Math.min(10, score)), entropy: Math.round(entropy) }
  }
  const { score, entropy } = calc(pw)
  const strength = score <= 2 ? 'Weak' : score <= 4 ? 'Fair' : score <= 6 ? 'Good' : score <= 8 ? 'Strong' : 'Very Strong'
  const color = score <= 2 ? '#ff1744' : score <= 4 ? '#ff9100' : score <= 6 ? '#ffab00' : score <= 8 ? '#69f0ae' : '#00e5ff'
  return (
    <ToolWrapper title="Password Strength Checker">
      <input type="text" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter password..." className="input" style={{ marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? color : 'rgba(255,255,255,0.04)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{strength}</span>
        <span style={{ fontSize: 11, color: '#5c6bc0', fontFamily: "'JetBrains Mono', monospace" }}>~{entropy} bits entropy</span>
      </div>
      <div style={{ fontSize: 11, color: '#5c6bc0', lineHeight: 1.8 }}>
        <div>{pw.length >= 8 ? '✅' : '❌'} Length ≥ 8</div>
        <div>{/[A-Z]/.test(pw) ? '✅' : '❌'} Uppercase letter</div>
        <div>{/[a-z]/.test(pw) ? '✅' : '❌'} Lowercase letter</div>
        <div>{/[0-9]/.test(pw) ? '✅' : '❌'} Number</div>
        <div>{/[^a-zA-Z0-9]/.test(pw) ? '✅' : '❌'} Special character</div>
        <div>{!/(.)\1{2,}/.test(pw) ? '✅' : '❌'} No repeated chars</div>
      </div>
    </ToolWrapper>
  )
}

// ─── UUID Generator ───────────────────────────────────────────────────────────
function UUIDTool() {
  const [uuids, setUuids] = useState([])
  const gen = (count = 5) => {
    setUuids(Array.from({ length: count }, () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
    ))
  }
  return (
    <ToolWrapper title="UUID v4 Generator">
      <button onClick={() => gen()} className="btn btn-primary" style={{ width: '100%', marginBottom: 14 }}>Generate 5 UUIDs</button>
      {uuids.map((u, i) => (
        <div key={i} onClick={() => { navigator.clipboard?.writeText(u); showToast('Copied!', 'success') }} style={{
          background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 4,
          fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#00e5ff',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>{u}</div>
      ))}
    </ToolWrapper>
  )
}

// ─── Timestamp Converter ──────────────────────────────────────────────────────
function TimestampTool() {
  const [ts, setTs] = useState('')
  const [result, setResult] = useState('')
  const toHuman = () => {
    const d = new Date(Number(ts) * (ts.length <= 10 ? 1000 : 1))
    setResult(d.toISOString() + '\n' + d.toLocaleString() + '\n' + d.toUTCString())
  }
  const now = () => { setTs(Math.floor(Date.now() / 1000).toString()); toHuman() }
  return (
    <ToolWrapper title="Timestamp Converter">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input value={ts} onChange={e => setTs(e.target.value)} placeholder="Unix timestamp..." className="input" style={{ flex: 1 }} />
        <button onClick={now} className="btn btn-ghost" style={{ fontSize: 11 }}>Now</button>
      </div>
      <button onClick={toHuman} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>Convert</button>
      {result && <pre style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, fontSize: 11, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{result}</pre>}
    </ToolWrapper>
  )
}

// ─── JSON Formatter ───────────────────────────────────────────────────────────
function JSONTool() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [indent, setIndent] = useState(2)
  const fmt = () => { try { setResult(JSON.stringify(JSON.parse(input), null, indent)) } catch (e) { setResult('Error: ' + e.message) } }
  return (
    <ToolWrapper title="JSON Formatter & Validator">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder='{"key": "value"}' className="input" style={{ minHeight: 120, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={fmt} className="btn btn-primary" style={{ flex: 1 }}>Format</button>
        <select value={indent} onChange={e => setIndent(Number(e.target.value))} className="input" style={{ width: 80 }}>
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={1}>Minified</option>
        </select>
      </div>
      {result && <pre onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ marginTop: 12, background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, fontSize: 11, color: result.startsWith('Error') ? '#ff1744' : '#00e5ff', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', cursor: 'pointer', maxHeight: 300, overflow: 'auto' }}>{result}</pre>}
    </ToolWrapper>
  )
}

// ─── Word/Char Counter ────────────────────────────────────────────────────────
function WordCountTool() {
  const [text, setText] = useState('')
  const lines = text.split('\n').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length
  const paragraphs = text.split(/\n\s*\n/).filter(s => s.trim()).length
  return (
    <ToolWrapper title="Word & Character Counter">
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste text..." className="input" style={{ minHeight: 120, marginBottom: 14 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[{ l: 'Characters', v: chars }, { l: 'No Spaces', v: charsNoSpace }, { l: 'Words', v: words }, { l: 'Sentences', v: sentences }, { l: 'Lines', v: lines }, { l: 'Paragraphs', v: paragraphs }].map(s => (
          <div key={s.l} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
            <div style={{ fontSize: 9, color: '#5c6bc0', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </ToolWrapper>
  )
}

// ─── Color Converter ──────────────────────────────────────────────────────────
function ColorTool() {
  const [hex, setHex] = useState('#00e5ff')
  const toRGB = (h) => { const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16); return { r, g, b } }
  const toHSL = (h) => { const { r, g, b } = toRGB(h); const rn = r / 255, gn = g / 255, bn = b / 255; const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn); let h2, s, l = (max + min) / 2; if (max === min) { h2 = s = 0 } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); h2 = (max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4) / 6 } return { h: Math.round(h2 * 360), s: Math.round(s * 100), l: Math.round(l * 100) } }
  const rgb = toRGB(hex)
  const hsl = toHSL(hex)
  return (
    <ToolWrapper title="Color Converter">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <input type="color" value={hex} onChange={e => setHex(e.target.value)} style={{ width: 48, height: 48, border: 'none', borderRadius: 10, cursor: 'pointer' }} />
        <input value={hex} onChange={e => setHex(e.target.value)} className="input" style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace" }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[{ l: 'HEX', v: hex }, { l: 'RGB', v: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }, { l: 'HSL', v: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }].map(c => (
          <div key={c.l} onClick={() => { navigator.clipboard?.writeText(c.v); showToast('Copied!', 'success') }} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 9, color: '#5c6bc0', marginBottom: 4, textTransform: 'uppercase' }}>{c.l}</div>
            <div style={{ fontSize: 10, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>{c.v}</div>
          </div>
        ))}
      </div>
    </ToolWrapper>
  )
}

// ─── Case Converter ───────────────────────────────────────────────────────────
function CaseTool() {
  const [input, setInput] = useState('')
  const cases = {
    'UPPER': input.toUpperCase(),
    'lower': input.toLowerCase(),
    'Title Case': input.replace(/\b\w/g, c => c.toUpperCase()),
    'camelCase': input.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase()),
    'PascalCase': input.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    'snake_case': input.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
    'kebab-case': input.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''),
    'CONSTANT_CASE': input.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, ''),
  }
  return (
    <ToolWrapper title="Case Converter">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text..." className="input" style={{ minHeight: 60, marginBottom: 12 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Object.entries(cases).map(([name, val]) => (
          <div key={name} onClick={() => { navigator.clipboard?.writeText(val); showToast('Copied!', 'success') }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 10, color: '#5c6bc0', minWidth: 90, fontFamily: "'JetBrains Mono', monospace" }}>{name}</span>
            <span style={{ fontSize: 11, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val || '—'}</span>
          </div>
        ))}
      </div>
    </ToolWrapper>
  )
}

// ─── Text Diff ────────────────────────────────────────────────────────────────
function DiffTool() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const diff = useMemo(() => {
    if (!a && !b) return []
    const linesA = a.split('\n'), linesB = b.split('\n')
    const result = []
    const max = Math.max(linesA.length, linesB.length)
    for (let i = 0; i < max; i++) {
      if (i >= linesA.length) result.push({ type: 'add', text: linesB[i] })
      else if (i >= linesB.length) result.push({ type: 'remove', text: linesA[i] })
      else if (linesA[i] !== linesB[i]) result.push({ type: 'change', textA: linesA[i], textB: linesB[i] })
      else result.push({ type: 'same', text: linesA[i] })
    }
    return result
  }, [a, b])
  return (
    <ToolWrapper title="Text Diff Tool">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <textarea value={a} onChange={e => setA(e.target.value)} placeholder="Original..." className="input" style={{ minHeight: 100, fontSize: 11 }} />
        <textarea value={b} onChange={e => setB(e.target.value)} placeholder="Modified..." className="input" style={{ minHeight: 100, fontSize: 11 }} />
      </div>
      {diff.length > 0 && (
        <div style={{ background: 'rgba(10,14,24,0.9)', borderRadius: 10, padding: 12, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
          {diff.map((d, i) => (
            <div key={i} style={{
              padding: '2px 6px', borderRadius: 4, marginBottom: 1,
              background: d.type === 'add' ? 'rgba(105,240,174,0.08)' : d.type === 'remove' ? 'rgba(255,23,68,0.08)' : d.type === 'change' ? 'rgba(255,171,0,0.06)' : 'transparent',
              color: d.type === 'add' ? '#69f0ae' : d.type === 'remove' ? '#ff1744' : d.type === 'change' ? '#ffab00' : '#3949ab',
            }}>
              {d.type === 'change' ? <><span style={{ color: '#ff1744' }}>- {d.textA}</span>{'\n'}<span style={{ color: '#69f0ae' }}>+ {d.textB}</span></> : <>{d.type === 'add' ? '+ ' : d.type === 'remove' ? '- ' : '  '}{d.text}</>}
            </div>
          ))}
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── IPv4 Calculator ──────────────────────────────────────────────────────────
function IPv4Tool() {
  const [ip, setIp] = useState('192.168.1.0')
  const [cidr, setCidr] = useState(24)
  const info = useMemo(() => {
    try {
      const ipNum = ip.split('.').reduce((a, b) => (a << 8) + parseInt(b), 0) >>> 0
      const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0
      const network = (ipNum & mask) >>> 0
      const broadcast = (network | ~mask) >>> 0
      const first = (network + 1) >>> 0
      const last = (broadcast - 1) >>> 0
      const hosts = Math.pow(2, 32 - cidr) - 2
      const toStr = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
      return { network: toStr(network), broadcast: toStr(broadcast), first: toStr(first), last: toStr(last), mask: toStr(mask), hosts, total: Math.pow(2, 32 - cidr) }
    } catch { return null }
  }, [ip, cidr])
  return (
    <ToolWrapper title="IPv4 / Subnet Calculator">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={ip} onChange={e => setIp(e.target.value)} className="input" style={{ flex: 1 }} />
        <select value={cidr} onChange={e => setCidr(Number(e.target.value))} className="input" style={{ width: 80 }}>
          {Array.from({ length: 33 }, (_, i) => <option key={i} value={i}>/{i}</option>)}
        </select>
      </div>
      {info && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {[{ l: 'Network', v: info.network + '/' + cidr }, { l: 'Broadcast', v: info.broadcast }, { l: 'First Host', v: info.first }, { l: 'Last Host', v: info.last }, { l: 'Subnet Mask', v: info.mask }, { l: 'Usable Hosts', v: info.hosts.toLocaleString() }].map(item => (
            <div key={item.l} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: '#5c6bc0', textTransform: 'uppercase', marginBottom: 2 }}>{item.l}</div>
              <div style={{ fontSize: 11, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace" }}>{item.v}</div>
            </div>
          ))}
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── XOR Cipher ───────────────────────────────────────────────────────────────
function XORTool() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [result, setResult] = useState('')
  const run = () => {
    const out = input.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('')
    setResult(out)
  }
  return (
    <ToolWrapper title="XOR Cipher">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Plaintext..." className="input" style={{ minHeight: 60, marginBottom: 8 }} />
      <input value={key} onChange={e => setKey(e.target.value)} placeholder="Key..." className="input" style={{ marginBottom: 10 }} />
      <button onClick={run} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>Encrypt / Decrypt</button>
      {result && <div onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5ff', whiteSpace: 'pre-wrap' }}>{result}</div>}
    </ToolWrapper>
  )
}

// ─── Cron Builder ─────────────────────────────────────────────────────────────
function CronTool() {
  const [min, setMin] = useState('0')
  const [hr, setHr] = useState('0')
  const [dom, setDom] = useState('*')
  const [mon, setMon] = useState('*')
  const [dow, setDow] = useState('*')
  const cron = `${min} ${hr} ${dom} ${mon} ${dow}`
  const desc = useMemo(() => {
    const parts = []
    if (min !== '*') parts.push(`At minute ${min}`)
    if (hr !== '*') parts.push(`past hour ${hr}`)
    if (dom !== '*') parts.push(`on day ${dom}`)
    if (mon !== '*') parts.push(`of month ${mon}`)
    if (dow !== '*') parts.push(`on day of week ${dow}`)
    return parts.join(', ') || 'Every minute, every hour, every day'
  }, [min, hr, dom, mon, dow])
  return (
    <ToolWrapper title="Cron Expression Builder">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 12 }}>
        {[{ l: 'Min', v: min, s: setMin }, { l: 'Hour', v: hr, s: setHr }, { l: 'Day', v: dom, s: setDom }, { l: 'Month', v: mon, s: setMon }, { l: 'DOW', v: dow, s: setDow }].map(f => (
          <div key={f.l}>
            <div style={{ fontSize: 9, color: '#5c6bc0', marginBottom: 4, textTransform: 'uppercase' }}>{f.l}</div>
            <input value={f.v} onChange={e => f.s(e.target.value)} className="input" style={{ textAlign: 'center', fontSize: 12 }} />
          </div>
        ))}
      </div>
      <div onClick={() => { navigator.clipboard?.writeText(cron); showToast('Copied!', 'success') }} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2 }}>{cron}</div>
        <div style={{ fontSize: 11, color: '#7986cb', marginTop: 4 }}>{desc}</div>
      </div>
    </ToolWrapper>
  )
}

// ─── Entropy Calculator ───────────────────────────────────────────────────────
function EntropyTool() {
  const [input, setInput] = useState('')
  const calc = useMemo(() => {
    if (!input) return null
    const freq = {}
    for (const c of input) freq[c] = (freq[c] || 0) + 1
    const len = input.length
    let entropy = 0
    for (const count of Object.values(freq)) { const p = count / len; entropy -= p * Math.log2(p) }
    const pool = (/[a-z]/.test(input) ? 26 : 0) + (/[A-Z]/.test(input) ? 26 : 0) + (/[0-9]/.test(input) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(input) ? 32 : 0)
    const totalBits = len * Math.log2(pool || 1)
    const crackTime = Math.pow(2, totalBits) / 1e10
    const timeStr = crackTime < 1 ? 'Instant' : crackTime < 60 ? `${Math.round(crackTime)}s` : crackTime < 3600 ? `${Math.round(crackTime / 60)}m` : crackTime < 86400 ? `${Math.round(crackTime / 3600)}h` : crackTime < 31536000 ? `${Math.round(crackTime / 86400)}d` : `${Math.round(crackTime / 31536000)}y`
    return { entropy: entropy.toFixed(2), totalBits: Math.round(totalBits), uniqueChars: Object.keys(freq).length, pool, crackTime: timeStr }
  }, [input])
  return (
    <ToolWrapper title="Entropy Calculator">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text..." className="input" style={{ minHeight: 60, marginBottom: 12 }} />
      {calc && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {[{ l: 'Shannon Entropy', v: calc.entropy + ' bits/char' }, { l: 'Total Bits', v: calc.totalBits + ' bits' }, { l: 'Unique Chars', v: calc.uniqueChars }, { l: 'Charset Size', v: calc.pool }, { l: 'Crack Time', v: calc.crackTime + ' (10B/s)' }].map(s => (
            <div key={s.l} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: '#5c6bc0', textTransform: 'uppercase', marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontSize: 12, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── HMAC Generator ───────────────────────────────────────────────────────────
function HMACTool() {
  const [msg, setMsg] = useState('')
  const [key, setKey] = useState('')
  const [algo, setAlgo] = useState('SHA-256')
  const [result, setResult] = useState('')
  const gen = async () => {
    const enc = new TextEncoder()
    const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: algo }, false, ['sign'])
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(msg))
    setResult(Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''))
  }
  return (
    <ToolWrapper title="HMAC Generator">
      <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message..." className="input" style={{ minHeight: 60, marginBottom: 8 }} />
      <input value={key} onChange={e => setKey(e.target.value)} placeholder="Secret key..." className="input" style={{ marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {['SHA-256', 'SHA-384', 'SHA-512'].map(a => <button key={a} onClick={() => setAlgo(a)} className={`btn ${algo === a ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 10px', fontSize: 10 }}>{a}</button>)}
      </div>
      <button onClick={gen} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>Generate HMAC</button>
      {result && <div onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5ff', wordBreak: 'break-all' }}>{result}</div>}
    </ToolWrapper>
  )
}

// ─── Lorem Ipsum ──────────────────────────────────────────────────────────────
function LoremTool() {
  const [paragraphs, setParagraphs] = useState(3)
  const [result, setResult] = useState('')
  const gen = () => {
    const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nCurabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis. Ut pharetra augue nec augue.\n\nPraesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.`
    const all = text.split('\n\n')
    setResult(Array.from({ length: paragraphs }, (_, i) => all[i % all.length]).join('\n\n'))
  }
  return (
    <ToolWrapper title="Lorem Ipsum Generator">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#5c6bc0' }}>Paragraphs:</span>
        <input type="number" value={paragraphs} onChange={e => setParagraphs(Math.max(1, Math.min(20, Number(e.target.value))))} className="input" style={{ width: 60, textAlign: 'center' }} />
        <button onClick={gen} className="btn btn-primary" style={{ flex: 1 }}>Generate</button>
      </div>
      {result && <pre onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, fontSize: 11, color: '#7986cb', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', lineHeight: 1.6, cursor: 'pointer', maxHeight: 300, overflow: 'auto' }}>{result}</pre>}
    </ToolWrapper>
  )
}

// ─── QR Code Generator (using API) ────────────────────────────────────────────
function QRTool() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(200)
  return (
    <ToolWrapper title="QR Code Generator">
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enter text or URL..." className="input" style={{ minHeight: 60, marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[150, 200, 300].map(s => <button key={s} onClick={() => setSize(s)} className={`btn ${size === s ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 12px', fontSize: 11 }}>{s}px</button>)}
      </div>
      {text && (
        <div style={{ textAlign: 'center' }}>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=0a0e18&color=00e5ff`} alt="QR Code" style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }} />
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── CSV Viewer ───────────────────────────────────────────────────────────────
function CSVTool() {
  const [input, setInput] = useState('')
  const rows = useMemo(() => {
    if (!input.trim()) return []
    return input.trim().split('\n').map(r => r.split(',').map(c => c.trim()))
  }, [input])
  return (
    <ToolWrapper title="CSV Viewer">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="name,age,email\nAlice,30,alice@test.com" className="input" style={{ minHeight: 80, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      {rows.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
            <thead>
              <tr>{rows[0]?.map((h, i) => <th key={i} style={{ padding: '8px 12px', background: 'rgba(0,229,255,0.06)', color: '#00e5ff', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700 }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: '6px 12px', color: '#7986cb', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── MAC Vendor Lookup ────────────────────────────────────────────────────────
function MACTool() {
  const [mac, setMac] = useState('')
  const known = { '00:50:56': 'VMware', '08:00:27': 'Oracle VirtualBox', '00:1A:2B': 'Alyanz', '00:0C:29': 'VMware', '00:15:5D': 'Microsoft Hyper-V', '00:16:3E': 'Xen', '52:54:00': 'QEMU/KVM', 'B8:27:EB': 'Raspberry Pi Foundation', 'DC:A6:32': 'Raspberry Pi Trading', '00:1E:C2': 'Apple', '00:1B:63': 'Apple', '3C:22:FB': 'Apple', 'A4:83:E7': 'Apple', 'F8:FF:C2': 'Apple' }
  const vendor = Object.entries(known).find(([prefix]) => mac.toUpperCase().startsWith(prefix.toUpperCase()))?.[1] || 'Unknown'
  return (
    <ToolWrapper title="MAC Address Vendor Lookup">
      <input value={mac} onChange={e => setMac(e.target.value)} placeholder="AA:BB:CC:DD:EE:FF" className="input" style={{ fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }} />
      {mac && <div style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: vendor !== 'Unknown' ? '#00e5ff' : '#5c6bc0' }}>{vendor}</div>
        <div style={{ fontSize: 10, color: '#3949ab', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{mac}</div>
      </div>}
    </ToolWrapper>
  )
}

// ─── XML Validator ────────────────────────────────────────────────────────────
function XMLTool() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const validate = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, 'text/xml')
      const err = doc.querySelector('parsererror')
      setResult(err ? { valid: false, error: err.textContent } : { valid: true })
    } catch (e) { setResult({ valid: false, error: e.message }) }
  }
  return (
    <ToolWrapper title="XML Validator">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder='<root><item>value</item></root>' className="input" style={{ minHeight: 100, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      <button onClick={validate} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>Validate</button>
      {result && (
        <div style={{ background: result.valid ? 'rgba(105,240,174,0.04)' : 'rgba(255,23,68,0.04)', border: `1px solid ${result.valid ? 'rgba(105,240,174,0.1)' : 'rgba(255,23,68,0.1)'}`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: result.valid ? '#69f0ae' : '#ff1744', marginBottom: 4 }}>{result.valid ? '✓ Valid XML' : '✕ Invalid XML'}</div>
          {!result.valid && <pre style={{ fontSize: 10, color: '#ff1744', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', opacity: 0.7 }}>{result.error}</pre>}
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── YAML Validator ───────────────────────────────────────────────────────────
function YAMLTool() {
  const [input, setInput] = useState('')
  const [valid, setValid] = useState(null)
  const validate = () => {
    try {
      const lines = input.split('\n')
      let indent = 0
      for (const line of lines) {
        if (line.trim().startsWith('#') || !line.trim()) continue
        const spaces = line.search(/\S/)
        if (spaces < indent - 2) { setValid(false); return }
        indent = spaces
      }
      setValid(true)
    } catch { setValid(false) }
  }
  return (
    <ToolWrapper title="YAML Validator">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="key: value\nlist:\n  - item1\n  - item2" className="input" style={{ minHeight: 100, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      <button onClick={validate} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>Validate</button>
      {valid !== null && (
        <div style={{ background: valid ? 'rgba(105,240,174,0.04)' : 'rgba(255,23,68,0.04)', border: `1px solid ${valid ? 'rgba(105,240,174,0.1)' : 'rgba(255,23,68,0.1)'}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: valid ? '#69f0ae' : '#ff1744' }}>{valid ? '✓ Valid YAML' : '✕ Invalid YAML'}</div>
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── Markdown Preview ─────────────────────────────────────────────────────────
function MarkdownTool() {
  const [input, setInput] = useState('# Hello\n\nThis is **bold** and *italic*.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log("code")\n```')
  const html = useMemo(() => {
    return input
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(0,229,255,0.1);padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>')
  }, [input])
  return (
    <ToolWrapper title="Markdown Preview">
      <textarea value={input} onChange={e => setInput(e.target.value)} className="input" style={{ minHeight: 120, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      <div dangerouslySetInnerHTML={{ __html: html }} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 16, color: '#7986cb', fontSize: 13, lineHeight: 1.7 }} />
    </ToolWrapper>
  )
}

// ─── HashID Encoder ───────────────────────────────────────────────────────────
function HashIDTool() {
  const [input, setInput] = useState('')
  const [salt, setSalt] = useState('devstudio')
  const encode = () => {
    let hash = 0
    const str = salt + input
    for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0 }
    return Math.abs(hash).toString(36).toUpperCase()
  }
  return (
    <ToolWrapper title="HashID Encoder">
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="ID to encode..." className="input" style={{ marginBottom: 8 }} />
      <input value={salt} onChange={e => setSalt(e.target.value)} placeholder="Salt..." className="input" style={{ marginBottom: 10 }} />
      {input && <div onClick={() => { navigator.clipboard?.writeText(encode()); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 16, fontWeight: 800, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' }}>{encode()}</div>}
    </ToolWrapper>
  )
}

// ─── HTML Preview ─────────────────────────────────────────────────────────────
function HTMLTool() {
  const [input, setInput] = useState('<h1 style="color: #00e5ff">Hello World</h1>\n<p>This is a <strong>preview</strong>.</p>')
  return (
    <ToolWrapper title="HTML Preview">
      <textarea value={input} onChange={e => setInput(e.target.value)} className="input" style={{ minHeight: 100, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      <div style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 16, color: '#7986cb', minHeight: 80 }} dangerouslySetInnerHTML={{ __html: input }} />
    </ToolWrapper>
  )
}

// ─── AES Encrypt/Decrypt (simplified with Web Crypto) ─────────────────────────
function AESTool() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [mode, setMode] = useState('encrypt')
  const [result, setResult] = useState('')
  const run = async () => {
    try {
      const enc = new TextEncoder()
      const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key.padEnd(16, '0').slice(0, 16)), 'AES-CBC', false, [mode === 'encrypt' ? 'encrypt' : 'decrypt'])
      const iv = new Uint8Array(16)
      if (mode === 'encrypt') {
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, enc.encode(input))
        setResult(btoa(String.fromCharCode(...new Uint8Array(encrypted))))
      } else {
        const decoded = Uint8Array.from(atob(input), c => c.charCodeAt(0))
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, decoded)
        setResult(new TextDecoder().decode(decrypted))
      }
    } catch (e) { setResult('Error: ' + e.message) }
  }
  return (
    <ToolWrapper title="AES Encrypt/Decrypt">
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button onClick={() => setMode('encrypt')} className={`btn ${mode === 'encrypt' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, fontSize: 11 }}>Encrypt</button>
        <button onClick={() => setMode('decrypt')} className={`btn ${mode === 'decrypt' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, fontSize: 11 }}>Decrypt</button>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'encrypt' ? 'Plaintext...' : 'Base64 ciphertext...'} className="input" style={{ minHeight: 60, marginBottom: 8 }} />
      <input value={key} onChange={e => setKey(e.target.value)} placeholder="Secret key (16 chars)..." className="input" style={{ marginBottom: 10 }} />
      <button onClick={run} className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>{mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</button>
      {result && <div onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: result.startsWith('Error') ? '#ff1744' : '#00e5ff', wordBreak: 'break-all' }}>{result}</div>}
    </ToolWrapper>
  )
}

// ─── Subnet Calculator (alias — already in IPv4Tool) ──────────────────────────
function SubnetTool() { return <IPv4Tool /> }

// ─── Caesar Cipher ──────────────────────────────────────────────────────────
function CaesarTool() {
  const [input, setInput] = useState('')
  const [shift, setShift] = useState(3)
  const encode = (s, n) => s.split('').map(c => c.match(/[a-z]/i) ? String.fromCharCode(((c.charCodeAt(0) - (c < 'a' ? 65 : 97) + n) % 26) + (c < 'a' ? 65 : 97)) : c).join('')
  return (
    <ToolWrapper title="Caesar Cipher">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text..." className="input" style={{ minHeight: 60, marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#5c6bc0' }}>Shift:</span>
        <input type="range" min={1} max={25} value={shift} onChange={e => setShift(Number(e.target.value))} style={{ flex: 1 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", width: 24, textAlign: 'center' }}>{shift}</span>
      </div>
      {input && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div onClick={() => { navigator.clipboard?.writeText(encode(input, shift)); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
            <div style={{ fontSize: 9, color: '#5c6bc0', marginBottom: 4, textTransform: 'uppercase' }}>Encode (+{shift})</div>
            <div style={{ fontSize: 12, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace" }}>{encode(input, shift)}</div>
          </div>
          <div onClick={() => { navigator.clipboard?.writeText(encode(input, 26 - shift)); showToast('Copied!', 'success') }} style={{ background: 'rgba(157,78,221,0.04)', border: '1px solid rgba(157,78,221,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
            <div style={{ fontSize: 9, color: '#5c6bc0', marginBottom: 4, textTransform: 'uppercase' }}>Decode (-{shift})</div>
            <div style={{ fontSize: 12, color: '#9d4edd', fontFamily: "'JetBrains Mono', monospace" }}>{encode(input, 26 - shift)}</div>
          </div>
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── ROT13 ───────────────────────────────────────────────────────────────────
function ROT13Tool() {
  const [input, setInput] = useState('')
  const rot = input.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13)))
  return (
    <ToolWrapper title="ROT13 Cipher">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text..." className="input" style={{ minHeight: 60, marginBottom: 10 }} />
      {input && <div onClick={() => { navigator.clipboard?.writeText(rot); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 12, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{rot}</div>}
    </ToolWrapper>
  )
}

// ─── Binary ↔ Text ──────────────────────────────────────────────────────────
function BinaryTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('text2bin')
  const result = mode === 'text2bin' ? input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') : input.split(' ').filter(b => b).map(b => String.fromCharCode(parseInt(b, 2))).join('')
  return (
    <ToolWrapper title="Binary ↔ Text Converter">
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button onClick={() => setMode('text2bin')} className={`btn ${mode === 'text2bin' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, fontSize: 11 }}>Text → Binary</button>
        <button onClick={() => setMode('bin2text')} className={`btn ${mode === 'bin2text' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, fontSize: 11 }}>Binary → Text</button>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'text2bin' ? 'Enter text...' : 'Enter binary (space-separated 8-bit)'} className="input" style={{ minHeight: 60, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      {result && <div onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 11, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{result}</div>}
    </ToolWrapper>
  )
}

// ─── Hex Dump ────────────────────────────────────────────────────────────────
function HexDumpTool() {
  const [input, setInput] = useState('')
  const lines = useMemo(() => {
    if (!input) return []
    const result = []
    for (let i = 0; i < input.length; i += 16) {
      const chunk = input.slice(i, i + 16)
      const hex = chunk.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
      const ascii = chunk.split('').map(c => { const code = c.charCodeAt(0); return code >= 32 && code <= 126 ? c : '.' }).join('')
      result.push({ offset: i.toString(16).padStart(8, '0'), hex, ascii })
    }
    return result
  }, [input])
  return (
    <ToolWrapper title="Hex Dump Viewer">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to view as hex..." className="input" style={{ minHeight: 60, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
      {lines.length > 0 && (
        <div style={{ background: 'rgba(10,14,24,0.9)', borderRadius: 10, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, overflowX: 'auto' }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, lineHeight: 1.8 }}>
              <span style={{ color: '#3949ab' }}>{line.offset}</span>
              <span style={{ color: '#00e5ff' }}>{line.hex}</span>
              <span style={{ color: '#5c6bc0' }}>{line.ascii}</span>
            </div>
          ))}
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── Number Base Converter ───────────────────────────────────────────────────
function NumberBaseTool() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState(10)
  const num = useMemo(() => { try { return parseInt(input, fromBase) } catch { return NaN } }, [input, fromBase])
  const isValid = !isNaN(num) && input.trim() !== ''
  return (
    <ToolWrapper title="Number Base Converter">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Number..." className="input" style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace" }} />
        <select value={fromBase} onChange={e => setFromBase(Number(e.target.value))} className="input" style={{ width: 80 }}>
          {[2, 8, 10, 16].map(b => <option key={b} value={b}>Base {b}</option>)}
        </select>
      </div>
      {isValid && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {[{ l: 'Binary (2)', v: num.toString(2) }, { l: 'Octal (8)', v: num.toString(8) }, { l: 'Decimal (10)', v: num.toString(10) }, { l: 'Hex (16)', v: num.toString(16).toUpperCase() }].map(b => (
            <div key={b.l} onClick={() => { navigator.clipboard?.writeText(b.v); showToast('Copied!', 'success') }} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>
              <div style={{ fontSize: 9, color: '#5c6bc0', textTransform: 'uppercase', marginBottom: 2 }}>{b.l}</div>
              <div style={{ fontSize: 12, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>{b.v}</div>
            </div>
          ))}
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── Roman Numeral Converter ─────────────────────────────────────────────────
function RomanTool() {
  const [input, setInput] = useState('')
  const toRoman = (num) => {
    if (num <= 0 || num > 3999) return 'Out of range (1-3999)'
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
    const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
    let result = ''
    for (let i = 0; i < vals.length; i++) { while (num >= vals[i]) { result += syms[i]; num -= vals[i] } }
    return result
  }
  const toNumber = (str) => {
    const map = { M:1000, D:500, C:100, L:50, X:10, V:5, I:1 }
    let result = 0
    for (let i = 0; i < str.length; i++) { const curr = map[str[i]] || 0; const next = map[str[i+1]] || 0; result += curr < next ? -curr : curr }
    return result
  }
  const num = parseInt(input)
  const isNum = !isNaN(num)
  const isRoman = /^[MDCLXVI]+$/i.test(input)
  return (
    <ToolWrapper title="Roman Numeral Converter">
      <input value={input} onChange={e => setInput(e.target.value.toUpperCase())} placeholder="Enter number or roman numeral..." className="input" style={{ marginBottom: 12 }} />
      {isNum && <div onClick={() => { navigator.clipboard?.writeText(toRoman(num)); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', textAlign: 'center' }}><div style={{ fontSize: 9, color: '#5c6bc0', marginBottom: 4 }}>ROMAN</div><div style={{ fontSize: 24, fontWeight: 800, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace" }}>{toRoman(num)}</div></div>}
      {isRoman && <div onClick={() => { navigator.clipboard?.writeText(toNumber(input)); showToast('Copied!', 'success') }} style={{ background: 'rgba(157,78,221,0.04)', border: '1px solid rgba(157,78,221,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', textAlign: 'center', marginTop: 8 }}><div style={{ fontSize: 9, color: '#5c6bc0', marginBottom: 4 }}>DECIMAL</div><div style={{ fontSize: 24, fontWeight: 800, color: '#9d4edd', fontFamily: "'JetBrains Mono', monospace" }}>{toNumber(input)}</div></div>}
    </ToolWrapper>
  )
}

// ─── Morse Code ──────────────────────────────────────────────────────────────
function MorseTool() {
  const [input, setInput] = useState('')
  const MAP = { 'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',' ':' /' }
  const REVERSE = Object.fromEntries(Object.entries(MAP).map(([k,v]) => [v,k]))
  const toMorse = (s) => s.toUpperCase().split('').map(c => MAP[c] || c).join(' ')
  const fromMorse = (s) => s.split(' ').map(c => REVERSE[c] || c).join('')
  return (
    <ToolWrapper title="Morse Code Translator">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text or morse code..." className="input" style={{ minHeight: 60, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }} />
      {input && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div onClick={() => { navigator.clipboard?.writeText(toMorse(input)); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
            <div style={{ fontSize: 9, color: '#5c6bc0', marginBottom: 4 }}>MORSE</div>
            <div style={{ fontSize: 12, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>{toMorse(input)}</div>
          </div>
          <div onClick={() => { navigator.clipboard?.writeText(fromMorse(input)); showToast('Copied!', 'success') }} style={{ background: 'rgba(157,78,221,0.04)', border: '1px solid rgba(157,78,221,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
            <div style={{ fontSize: 9, color: '#5c6bc0', marginBottom: 4 }}>TEXT</div>
            <div style={{ fontSize: 12, color: '#9d4edd', fontFamily: "'JetBrains Mono', monospace" }}>{fromMorse(input)}</div>
          </div>
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── Pig Latin ───────────────────────────────────────────────────────────────
function PigLatinTool() {
  const [input, setInput] = useState('')
  const convert = (s) => s.split(' ').map(w => { const m = w.match(/^[^aeiouAEIOU]*(.*)$/); return m ? m[1] + m[0] + 'ay' : w + 'way' }).join(' ')
  return (
    <ToolWrapper title="Pig Latin Translator">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter English text..." className="input" style={{ minHeight: 60, marginBottom: 10 }} />
      {input && <div onClick={() => { navigator.clipboard?.writeText(convert(input)); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#00e5ff', lineHeight: 1.6 }}>{convert(input)}</div>}
    </ToolWrapper>
  )
}

// ─── Email Validator ─────────────────────────────────────────────────────────
function EmailTool() {
  const [input, setInput] = useState('')
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
  return (
    <ToolWrapper title="Email Validator">
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="user@example.com" className="input" style={{ marginBottom: 12 }} />
      {input && (
        <div style={{ background: valid ? 'rgba(105,240,174,0.04)' : 'rgba(255,23,68,0.04)', border: `1px solid ${valid ? 'rgba(105,240,174,0.1)' : 'rgba(255,23,68,0.1)'}`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: valid ? '#69f0ae' : '#ff1744' }}>{valid ? '✓ Valid Email' : '✕ Invalid Email'}</div>
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── Port Lookup ─────────────────────────────────────────────────────────────
function PortTool() {
  const ports = { 20:'FTP Data', 21:'FTP Control', 22:'SSH', 23:'Telnet', 25:'SMTP', 53:'DNS', 80:'HTTP', 110:'POP3', 143:'IMAP', 443:'HTTPS', 445:'SMB', 993:'IMAPS', 995:'POP3S', 3306:'MySQL', 3389:'RDP', 5432:'PostgreSQL', 5900:'VNC', 6379:'Redis', 8080:'HTTP Alt', 8443:'HTTPS Alt', 27017:'MongoDB' }
  const [search, setSearch] = useState('')
  const filtered = Object.entries(ports).filter(([p, n]) => p.includes(search) || n.toLowerCase().includes(search.toLowerCase()))
  return (
    <ToolWrapper title="Port Number Lookup">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search port or service..." className="input" style={{ marginBottom: 12 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 4 }}>
        {filtered.map(([port, name]) => (
          <div key={port} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 10px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#00e5ff', fontFamily: "'JetBrains Mono', monospace" }}>{port}</div>
            <div style={{ fontSize: 10, color: '#5c6bc0' }}>{name}</div>
          </div>
        ))}
      </div>
    </ToolWrapper>
  )
}

// ─── HTTP Status Codes ───────────────────────────────────────────────────────
function HTTPStatusTool() {
  const codes = { 200:'OK', 201:'Created', 204:'No Content', 301:'Moved Permanently', 302:'Found', 304:'Not Modified', 400:'Bad Request', 401:'Unauthorized', 403:'Forbidden', 404:'Not Found', 405:'Method Not Allowed', 408:'Request Timeout', 409:'Conflict', 413:'Payload Too Large', 429:'Too Many Requests', 500:'Internal Server Error', 502:'Bad Gateway', 503:'Service Unavailable', 504:'Gateway Timeout' }
  const [search, setSearch] = useState('')
  const filtered = Object.entries(codes).filter(([c, d]) => c.includes(search) || d.toLowerCase().includes(search.toLowerCase()))
  const getColor = (code) => code.startsWith('2') ? '#69f0ae' : code.startsWith('3') ? '#00e5ff' : code.startsWith('4') ? '#ffab00' : '#ff1744'
  return (
    <ToolWrapper title="HTTP Status Code Reference">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search status code..." className="input" style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {filtered.map(([code, desc]) => (
          <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 12px' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: getColor(code), fontFamily: "'JetBrains Mono', monospace", minWidth: 36 }}>{code}</span>
            <span style={{ fontSize: 11, color: '#7986cb' }}>{desc}</span>
          </div>
        ))}
      </div>
    </ToolWrapper>
  )
}

// ─── Random Words ────────────────────────────────────────────────────────────
function RandomWordsTool() {
  const [count, setCount] = useState(10)
  const [result, setResult] = useState('')
  const words = ['algorithm','binary','cache','daemon','encryption','firewall','gateway','hash','interface','kernel','middleware','network','overflow','protocol','quantum','router','schema','thread','upload','virtual','webhook','yaml','zero','abstract','bootstrap','container','debug','endpoint','fetch','global']
  const gen = () => setResult(Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(' '))
  return (
    <ToolWrapper title="Random Word Generator">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#5c6bc0' }}>Count:</span>
        <input type="number" value={count} onChange={e => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="input" style={{ width: 60, textAlign: 'center' }} />
        <button onClick={gen} className="btn btn-primary" style={{ flex: 1 }}>Generate</button>
      </div>
      {result && <div onClick={() => { navigator.clipboard?.writeText(result); showToast('Copied!', 'success') }} style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 12, color: '#00e5ff', lineHeight: 1.6 }}>{result}</div>}
    </ToolWrapper>
  )
}

// ─── User-Agent Parser ───────────────────────────────────────────────────────
function UserAgentTool() {
  const [ua, setUa] = useState('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  const parse = useMemo(() => {
    if (!ua) return null
    const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Unknown'
    const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'Unknown'
    const mobile = /Mobile|Android|iPhone/i.test(ua)
    return { browser, os, mobile }
  }, [ua])
  return (
    <ToolWrapper title="User-Agent Parser">
      <textarea value={ua} onChange={e => setUa(e.target.value)} placeholder="Paste User-Agent string..." className="input" style={{ minHeight: 60, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} />
      {parse && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[{ l: 'Browser', v: parse.browser }, { l: 'OS', v: parse.os }, { l: 'Mobile', v: parse.mobile ? 'Yes' : 'No' }].map(item => (
            <div key={item.l} style={{ background: 'rgba(15,20,34,0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#5c6bc0', textTransform: 'uppercase', marginBottom: 4 }}>{item.l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#00e5ff' }}>{item.v}</div>
            </div>
          ))}
        </div>
      )}
    </ToolWrapper>
  )
}

// ─── Number Base Converter (alias) ──────────────────────────────────────────
function N2Tool() { return <NumberBaseTool /> }

// ─── Map tool IDs to components ───────────────────────────────────────────────
const TOOL_COMPONENTS = {
  hash: HashTool,
  base64: Base64Tool,
  url: URLTool,
  jwt: JWTTool,
  regex: RegexTool,
  password: PasswordTool,
  entropy: EntropyTool,
  uuid: UUIDTool,
  timestamp: TimestampTool,
  color: ColorTool,
  cases: CaseTool,
  diff: DiffTool,
  ipv4: IPv4Tool,
  subnet: SubnetTool,
  mac: MACTool,
  cron: CronTool,
  json: JSONTool,
  xml: XMLTool,
  yaml: YAMLTool,
  csv: CSVTool,
  markdown: MarkdownTool,
  html: HTMLTool,
  wordcount: WordCountTool,
  qr: QRTool,
  hmac: HMACTool,
  aes: AESTool,
  xor: XORTool,
  lorem: LoremTool,
  hashids: HashIDTool,
  caesar: CaesarTool,
  rot13: ROT13Tool,
  binary: BinaryTool,
  hexdump: HexDumpTool,
  numberbase: NumberBaseTool,
  n2: N2Tool,
  roman: RomanTool,
  morse: MorseTool,
  piglatin: PigLatinTool,
  email: EmailTool,
  port: PortTool,
  httpstatus: HTTPStatusTool,
  loremwords: RandomWordsTool,
  useragent: UserAgentTool,
  brainfuck: () => <ToolWrapper title="Brainfuck Interpreter"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon — BF interpreter</p></ToolWrapper>,
  otp: () => <ToolWrapper title="OTP Generator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon — TOTP generator</p></ToolWrapper>,
  ascii: () => <ToolWrapper title="ASCII Table"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon — ASCII reference</p></ToolWrapper>,
  emoji: () => <ToolWrapper title="Emoji Picker"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon — emoji picker</p></ToolWrapper>,
  barcode: () => <ToolWrapper title="Barcode Generator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon — barcode gen</p></ToolWrapper>,
  loremcn: () => <ToolWrapper title="Chinese Lorem"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  whitespace: () => <ToolWrapper title="Whitespace Visualizer"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  slug: () => <ToolWrapper title="Slug Generator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  ngrok: () => <ToolWrapper title="ngrok URL"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  docker: () => <ToolWrapper title="Dockerfile Generator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  gitignore: () => <ToolWrapper title=".gitignore Generator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  readme: () => <ToolWrapper title="README Generator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  env: () => <ToolWrapper title=".env Generator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  ssl: () => <ToolWrapper title="SSL Checker"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  dns: () => <ToolWrapper title="DNS Lookup"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  phone: () => <ToolWrapper title="Phone Formatter"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  isbn: () => <ToolWrapper title="ISBN Validator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  iban: () => <ToolWrapper title="IBAN Validator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  creditcard: () => <ToolWrapper title="Credit Card Validator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  currency: () => <ToolWrapper title="Currency Formatter"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  si: () => <ToolWrapper title="SI Prefix Converter"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  crypto_prices: () => <ToolWrapper title="Crypto Prices"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  timezone: () => <ToolWrapper title="Timezone Converter"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  stopwatch: () => <ToolWrapper title="Stopwatch"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  notepad: () => <ToolWrapper title="Quick Notepad"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  clipboard: () => <ToolWrapper title="Clipboard History"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  rainbow: () => <ToolWrapper title="CSS Gradient"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  boxshadow: () => <ToolWrapper title="CSS Box Shadow"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  border: () => <ToolWrapper title="CSS Border Radius"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  animation: () => <ToolWrapper title="CSS Animation"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  favicon: () => <ToolWrapper title="Favicon Generator"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  palette: () => <ToolWrapper title="Color Palette"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  utf8: () => <ToolWrapper title="UTF-8 Inspector"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
  mime: () => <ToolWrapper title="MIME Type Lookup"><p style={{ color: '#5c6bc0', fontSize: 12 }}>Coming soon</p></ToolWrapper>,
}
