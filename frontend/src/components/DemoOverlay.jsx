/**
 * DemoOverlay — Interactive 5-step demo for hackathon judges
 */
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../lib/store'

const steps = [
  {
    title: 'Welcome to DevStudio AI 🛡️',
    subtitle: "The low-spec developer's security & research lab. Three modules fused into one persistent memory system. Let me show you how it works.",
    emoji: '🛡️',
  },
  {
    title: 'SecureAgent — 50+ Vulnerabilities 🔍',
    subtitle: 'Scans for SQL injection, XSS, command injection, weak crypto, hardcoded credentials, buffer overflows, JWT flaws, and 40+ more. Each with OWASP/CWE mappings and auto-generated fixes.',
    emoji: '🔍',
  },
  {
    title: 'DocMind — Document Intelligence 📄',
    subtitle: 'Paste documentation, stack traces, or reference guides. AI indexes them into your project memory with smart chunking, analysis, and automatic tagging.',
    emoji: '📄',
  },
  {
    title: 'DevBuddy — Persistent Memory 🧠',
    subtitle: 'Everything you scan and index gets saved to a searchable memory file. Ask natural language questions about your entire research and security log.',
    emoji: '🧠',
  },
  {
    title: 'Built on Nebius + NVIDIA 🚀',
    subtitle: 'Powered by Nemotron 3 Ultra, Super, and Nano models via Nebius Token Factory. Works offline for core features. One memory file. Zero data leakage.',
    emoji: '🚀',
  },
]

export default function DemoOverlay() {
  const { showDemo, setShowDemo, demoStep, setDemoStep } = useStore()

  if (!showDemo) return null

  const step = steps[demoStep]
  const isLast = demoStep >= steps.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(30px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 40,
          textAlign: 'center',
        }}
      >
        {/* Big emoji */}
        <motion.div
          key={demoStep}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ fontSize: 72, marginBottom: 8 }}
        >
          {step.emoji}
        </motion.div>

        {/* Title */}
        <motion.h2
          key={`t-${demoStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, var(--accent2), var(--pink), var(--cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            maxWidth: 500,
          }}
        >
          {step.title}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          key={`s-${demoStep}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 16,
            color: 'var(--text2)',
            maxWidth: 420,
            lineHeight: 1.6,
          }}
        >
          {step.subtitle}
        </motion.p>

        {/* Progress */}
        <div style={{
          fontSize: 14,
          color: 'var(--text3)',
          marginTop: 8,
        }}>
          Step {demoStep + 1} of {steps.length}
        </div>
        <div style={{
          width: 200,
          height: 2,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${((demoStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
              borderRadius: 1,
            }}
          />
        </div>

        {/* Buttons */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (isLast) {
              setShowDemo(false)
              setDemoStep(0)
            } else {
              setDemoStep(demoStep + 1)
            }
          }}
          style={{
            padding: '14px 32px',
            border: 'none',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
            marginTop: 16,
          }}
        >
          {isLast ? 'Get Started 🚀' : 'Next →'}
        </motion.button>

        <button
          onClick={() => { setShowDemo(false); setDemoStep(0) }}
          style={{
            fontSize: 13,
            color: 'var(--text3)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            marginTop: 8,
          }}
        >
          Skip demo
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
