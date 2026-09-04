/**
 * ScannerOverlay — Animated scanning visualization
 */
import React from 'react'
import { motion } from 'framer-motion'

export default function ScannerOverlay({ progress }) {
  const pct = progress?.progress || 0
  const msg = progress?.message || 'Scanning...'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      {/* Spinning rings */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--accent)',
            borderRightColor: 'var(--cyan)',
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderBottomColor: 'var(--pink)',
            borderLeftColor: 'var(--green)',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--accent2)',
        }}>
          {pct}%
        </div>
      </div>

      {/* Message */}
      <motion.div
        key={msg}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)' }}
      >
        {msg}
      </motion.div>

      {/* Progress bar */}
      <div style={{
        width: 200,
        height: 3,
        borderRadius: 2,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 2,
            background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
          }}
        />
      </div>
    </motion.div>
  )
}
