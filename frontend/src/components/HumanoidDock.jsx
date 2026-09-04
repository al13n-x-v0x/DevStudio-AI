import React, { useState, useEffect, useCallback, useRef } from 'react'
import Humanoid, { STATES } from './Humanoid'
import { speak, startListening, stopListening } from '../lib/speech'
import { getLocalReply, JOKES, QUIPS } from '../lib/security-kb'

const WITTY = {
  greet: [
    "Hey. I see code. I see vulnerabilities. I see everything.",
    "Welcome. I've been scanning the void, waiting for code to judge.",
    "Ah, a developer! Let me put on my security hat. 🎩",
    "Ready. I know 50+ ways your code can betray you.",
  ],
  scan: [
    "Scanning... the vibes are... concerning.",
    "Analyzing... I've seen worse. I've seen better. You're somewhere in between.",
    "Running patterns... whoever wrote this needs a code review and a nap.",
  ],
  alert: [
    "Found vulnerabilities. Your code has trust issues.",
    "Security holes detected. Don't deploy this. Seriously.",
    "I found bugs. Not the cute kind.",
  ],
  safe: [
    "Clean. Suspiciously clean. But clean.",
    "No issues. Either you're good or I need better patterns.",
    "Passed. Ship it.",
  ],
  idle: [
    "Waiting for code...",
    "I don't sleep. I just... process.",
    "Fun fact: I'm made of animated dots. Look closely.",
    "I'm basically a security consultant who works for free.",
  ],
}

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export default function HumanoidDock({ scanState, findings }) {
  const [minimized, setMinimized] = useState(false)
  const [hState, setHState] = useState(STATES.WELCOME)
  const [message, setMessage] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMsgs, setChatMsgs] = useState([])
  const [listening, setListening] = useState(false)
  const [voice, setVoice] = useState(true)
  const chatEnd = useRef(null)
  const greeted = useRef(false)

  useEffect(() => {
    if (greeted.current) return
    greeted.current = true
    const g = randomFrom(QUIPS.greeting)
    setMessage(g)
    setHState(STATES.WAVING)
    if (voice) setTimeout(() => speak(g, { rate: 0.95 }), 500)
    setTimeout(() => setHState(STATES.IDLE), 3500)
  }, [])

  useEffect(() => {
    if (hState !== STATES.IDLE) return
    const idlePhrases = [
      'Waiting for code...',
      "I don't sleep. I just... process.",
      "Fun fact: I'm made of animated dots. Look closely.",
      "I'm basically a security consultant who works for free.",
      randomFrom(JOKES),
    ]
    const t = setInterval(() => setMessage(randomFrom(idlePhrases)), 12000)
    return () => clearInterval(t)
  }, [hState])

  useEffect(() => {
    if (scanState === 'scanning') {
      setHState(STATES.SCANNING)
      setMessage(randomFrom(QUIPS.thinking))
    } else if (scanState === 'complete' && findings) {
      const v = findings.filter(f => ['critical','high','medium'].includes(f.severity)).length
      if (v > 0) {
        setHState(STATES.ALERT)
        setMessage(`Found ${v} issue${v > 1 ? 's' : ''}. Let me explain what I found.`)
        if (voice) speak(`Found ${v} security issues.`, { rate: 0.95 })
      } else {
        setHState(STATES.IDLE)
        setMessage('Clean. Suspiciously clean. But clean.')
        if (voice) speak('No vulnerabilities found.', { rate: 0.95 })
      }        setTimeout(() => { setHState(STATES.IDLE); setMessage(randomFrom(idlePhrases)) }, 7000)
    }
  }, [scanState, findings])

  const send = useCallback(async () => {
    if (!chatInput.trim()) return
    const u = { role: 'user', text: chatInput, t: Date.now() }
    const input = chatInput
    setChatInput('')
    setChatMsgs(p => [...p, u])
    setHState(STATES.THINKING)
    setMessage('Thinking...')

    let reply
    // Try backend AI (Nemotron + Tavily)
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: input }) })
      if (r.ok) { const d = await r.json(); reply = d.answer || d.reply || d.response }
    } catch {}
    // Try web search if backend unavailable
    if (!reply) {
      try {
        const r = await fetch('/api/search-and-answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: input }) })
        if (r.ok) { const d = await r.json(); reply = d.answer }
      } catch {}
    }
    // Fallback to local knowledge
    if (!reply) reply = getLocalReply(input)

    setChatMsgs(p => [...p, { role: 'ai', text: reply, t: Date.now() }])
    setHState(STATES.SPEAKING)
    setMessage(reply.substring(0, 100))
    if (voice) speak(reply.replace(/```[\s\S]*?```/g, 'code block').replace(/[#*`]/g, ''), { rate: 0.95 })
  }, [chatInput, voice])

  const toggleMic = useCallback(() => {
    if (listening) { stopListening(); setListening(false); return }
    setListening(true)
    setHState(STATES.THINKING)
    setMessage('Listening...')
    startListening({
      onResult: (r) => {
        if (r.isFinal && r.final) {
          setChatInput(p => p + r.final)
          setListening(false)
          setHState(STATES.IDLE)
          setMessage('Got it.')
        }
      },
      onError: () => { setListening(false); setHState(STATES.IDLE); setMessage("Couldn't hear that.") },
    })
  }, [listening, voice])

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs])

  // ─── Minimized orb ──────────────────────────────────────────────────────
  if (minimized) return (
    <div
      onClick={() => setMinimized(false)}
      style={{
        position: 'fixed', bottom: 80, right: 16,
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(157,78,221,0.15))',
        border: '1px solid rgba(0,229,255,0.15)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 9990,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(0,229,255,0.1)',
        animation: 'float 3s ease-in-out infinite',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span style={{ fontSize: 18 }}>🤖</span>
    </div>
  )

  // ─── Full panel ─────────────────────────────────────────────────────────
  return (
    <>
      <div style={{
        position: 'fixed', bottom: 80, right: 16, width: 320,
        maxHeight: 'calc(100vh - 100px)',
        background: 'var(--bg-overlay)',
        border: '1px solid var(--glass-border)',
        borderRadius: 20,
        backdropFilter: 'blur(40px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.3)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.05) inset',
        zIndex: 9990,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'revealUp 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#00e676',
              boxShadow: '0 0 8px #00e676',
              animation: 'breathe 3s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>DevStudio AI</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[
              { icon: voice ? '🔊' : '🔇', action: () => setVoice(v => !v) },
              { icon: '💬', action: () => setChatOpen(c => !c) },
              { icon: '—', action: () => setMinimized(true) },
            ].map((b, i) => (
              <button key={i} onClick={b.action} style={{
                width: 26, height: 26, borderRadius: 7, border: 'none',
                background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: 12, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.04)'}
              >{b.icon}</button>
            ))}
          </div>
        </div>

        {/* Humanoid */}
        <div style={{
          display: 'flex', justifyContent: 'center', padding: '4px 0',
          background: 'radial-gradient(ellipse at 50% 90%, rgba(0,229,255,0.03), transparent 70%)',
        }}>
          <Humanoid state={hState} message={message} size={220} onSpeechEnd={() => setHState(STATES.IDLE)} />
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 5, padding: '4px 12px 10px', justifyContent: 'center' }}>
          {[
            { label: 'Scan', action: () => { setHState(STATES.SCANNING); setMessage('Go to the Scan tab!') } },
            { label: 'Docs', action: () => setMessage('Check the Docs tab!') },
            { label: 'Learn', action: () => setMessage("Ask me about SQL injection, XSS, passwords, or API security!") },
          ].map(b => (
            <button key={b.label} onClick={b.action} className="btn btn-ghost" style={{
              padding: '4px 12px', fontSize: 10, borderRadius: 8,
            }}>{b.label}</button>
          ))}
        </div>

        {/* Chat */}
        {chatOpen && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column', maxHeight: 240,
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{
              flex: 1, overflowY: 'auto', padding: '8px 12px',
              display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 170,
            }}>
              {chatMsgs.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', padding: 16 }}>
                  Ask about security topics
                </p>
              )}
              {chatMsgs.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeUp 0.3s ease',
                }}>
                  <div style={{
                    maxWidth: '82%', padding: '8px 12px', fontSize: 12, lineHeight: 1.6,
                    fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.role === 'user' ? 'rgba(0,229,255,0.08)' : 'var(--bg-surface)',
                    border: `1px solid ${m.role === 'user' ? 'rgba(0,229,255,0.1)' : 'var(--glass-border)'}`,
                    color: m.role === 'user' ? '#00e5ff' : 'var(--text)',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>

            <div style={{ display: 'flex', gap: 6, padding: '8px 12px 12px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
              <button onClick={toggleMic} style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: listening ? 'rgba(255,23,68,0.1)' : 'rgba(255,255,255,0.04)',
                color: listening ? '#ff1744' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 14, flexShrink: 0,
                animation: listening ? 'pulseGlow 1.5s infinite' : 'none',
              }}>{listening ? '⏹' : '🎤'}</button>
              <input
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about security..."
                className="input"
                style={{ flex: 1, padding: '7px 12px', fontSize: 12 }}
              />
              <button onClick={send} disabled={!chatInput.trim()} style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: chatInput.trim() ? 'linear-gradient(135deg, var(--cyan), var(--purple))' : 'rgba(255,255,255,0.04)',
                color: chatInput.trim() ? '#000' : 'var(--text-muted)',
                cursor: chatInput.trim() ? 'pointer' : 'default',
                fontSize: 14, flexShrink: 0, fontWeight: 700,
                transition: 'all 0.2s',
              }}>↑</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
