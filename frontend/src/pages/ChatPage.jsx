/**
 * ChatPage — DevBuddy AI chat with typing animation + memory timeline
 */
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Brain, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { useStore } from '../lib/store'
import { speakResponse, stopSpeaking, startListening, stopListening, isSTTSupported } from '../lib/speech'

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}
        />
      ))}
    </div>
  )
}

function Message({ msg, index }) {
  const isUser = msg.role === 'user'
  const [displayed, setDisplayed] = useState(isUser ? msg.text : '')
  const [done, setDone] = useState(isUser)
  const [speaking, setSpeaking] = useState(false)
  const speakRef = useRef(null)

  useEffect(() => {
    if (isUser || done) return
    let i = 0
    const text = msg.text
    const timer = setInterval(() => {
      i += 2
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(timer); setDone(true) }
    }, 10)
    return () => clearInterval(timer)
  }, [msg.text, isUser])

  const renderText = (t) => {
    return t.replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.3);border-radius:8px;padding:10px 12px;font-family:JetBrains Mono,monospace;font-size:12px;overflow-x:auto;margin:8px 0">$1</pre>').split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      style={{
        padding: '14px 18px',
        borderRadius: 16,
        margin: '6px 0',
        fontSize: 14,
        lineHeight: 1.6,
        maxWidth: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        background: isUser ? 'var(--accent)' : 'var(--surface)',
        color: isUser ? '#fff' : 'var(--text)',
        border: isUser ? 'none' : '0.5px solid var(--border)',
        borderBottomRightRadius: isUser ? 4 : 16,
        borderBottomLeftRadius: isUser ? 16 : 4,
      }}
    >
      {isUser ? msg.text : (
        <>
          <span dangerouslySetInnerHTML={{ __html: renderText(displayed) }} />
          {!done && <TypingIndicator />}
          {done && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (speaking) { stopSpeaking(); setSpeaking(false); return }
                  speakRef.current = speakResponse(msg.text)
                  setSpeaking(true)
                }}
                style={{
                  width: 28, height: 28, borderRadius: 8, border: 'none',
                  background: speaking ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                  color: speaking ? 'var(--accent)' : 'var(--text3)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </motion.button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

export default function ChatPage() {
  const { messages, chatInput, setChatInput, sendChat, chatLoading, memoryEntries, refreshMemory, memoryStats } = useStore()
  const scrollRef = useRef(null)
  const [micActive, setMicActive] = useState(false)
  const micRef = useRef(null)

  const toggleMic = () => {
    if (micActive) {
      stopListening()
      setMicActive(false)
      return
    }
    micRef.current = startListening({
      onResult: ({ interim, final: finalText, isFinal }) => {
        if (isFinal) {
          setChatInput(chatInput + finalText)
          setMicActive(false)
          stopListening()
        } else {
          setChatInput(interim)
        }
      },
      onError: (err) => { setMicActive(false) },
      onEnd: () => { setMicActive(false) },
    })
    setMicActive(true)
  }

  useEffect(() => { refreshMemory() }, [])
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, chatLoading])

  return (
    <div>
      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: 'calc(var(--safe-top) + 12px) 20px 12px',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 800, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>💬 DevBuddy</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>AI Research Assistant</div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            fontSize: 11, fontWeight: 600,
            background: 'rgba(16,185,129,0.12)', color: 'var(--green)',
            border: '0.5px solid rgba(16,185,129,0.2)',
          }}>
            <Brain size={12} /> MEMORY
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: '16px 24px 4px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.5px' }}>Research Assistant</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 6, lineHeight: 1.4 }}>
          Ask questions about your indexed documents, security findings, or anything technical.
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ padding: '16px 20px', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', maxHeight: '45vh', overflowY: 'auto' }}>
        <AnimatePresence>
          {messages.map((msg, i) => <Message key={i} msg={msg} index={i} />)}
        </AnimatePresence>
        {chatLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', padding: '14px 18px', borderRadius: 16, background: 'var(--surface)', border: '0.5px solid var(--border)' }}>
            <TypingIndicator />
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
            placeholder="Ask anything..."
            style={{
              flex: 1, padding: '14px 18px', borderRadius: 14,
              border: '0.5px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
          {isSTTSupported() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMic}
              style={{
                width: 48, height: 48, borderRadius: 14, border: 'none',
                background: micActive ? 'var(--red)' : 'rgba(255,255,255,0.06)',
                color: micActive ? '#fff' : 'var(--text2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: micActive ? 'pulse 1.5s infinite' : 'none',
              }}
              title={micActive ? 'Stop listening' : 'Start voice input'}
            >
              {micActive ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendChat}
            style={{
              padding: '14px 20px', border: 'none', borderRadius: 14,
              background: 'var(--green)', color: '#fff', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Send size={16} /> Send
          </motion.button>
        </div>
      </div>

      {/* Memory Timeline */}
      <div style={{ padding: '8px 20px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'var(--glass)', border: '0.5px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>🧠 Memory Timeline</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{memoryStats?.total_entries || 0} entries</span>
          </div>
          <div style={{ maxHeight: 250, overflowY: 'auto' }}>
            {memoryEntries.length > 0 ? memoryEntries.slice(0, 15).map((e, i) => {
              const dotColor = e.type === 'document' ? 'var(--accent)' : e.type === 'security_finding' ? 'var(--red)' : e.type === 'conversation' ? 'var(--green)' : 'var(--yellow)'
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4 }}>
                    <strong>{e.title}</strong><br />
                    {e.summary}
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{e.created_at?.split('T')[0]}</div>
                  </div>
                </div>
              )
            }) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
                Memory will populate as you use DocMind & SecureAgent
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
