import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const steps = [
  'Initializing security modules...',
  'Loading 50+ vulnerability patterns...',
  'Calibrating dot-particle avatar...',
  'Activating offline AI engine...',
  'Ready.',
]

export default function SplashScreen() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setStep(p => { if (p >= steps.length - 1) { clearInterval(t); return p }; return p + 1 })
    }, 450)
    return () => clearInterval(t)
  }, [])

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#05070d',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 28,
      }}
    >
      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', top: '25%', left: '15%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.06), transparent 70%)',
        filter: 'blur(60px)',
        animation: 'drift 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(157,78,221,0.04), transparent 70%)',
        filter: 'blur(60px)',
        animation: 'drift 15s ease-in-out infinite 4s',
      }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(157,78,221,0.08))',
          border: '1px solid rgba(0,229,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(0,229,255,0.15)',
          animation: 'breathe 3s ease-in-out infinite',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" stroke="#00e676" />
        </svg>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{
          fontSize: 30, fontWeight: 800, letterSpacing: -1, lineHeight: 1,
          background: 'linear-gradient(135deg, #fff, #7986cb)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>
          DevStudio AI
        </h1>
        <p style={{
          fontSize: 11, color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          Security · Research · Memory
        </p>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
      >
        {steps.map((s, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: i <= step ? 0.6 : 0.1 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 11, color: i <= step ? 'var(--text-dim)' : 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {i < step ? '✓' : i === step ? '›' : '·'} {s}
          </motion.p>
        ))}
      </motion.div>

      {/* Bottom */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 1.2 }}
        style={{
          position: 'absolute', bottom: 20,
          fontSize: 9, color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 1,
        }}
      >
        NEMOTRON · NEBIUS CLOUD
      </motion.p>
    </motion.div>
  )
}
