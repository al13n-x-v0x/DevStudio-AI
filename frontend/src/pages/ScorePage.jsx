/**
 * ScorePage — Apple Watch-style animated security score
 */
import React from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

export default function ScorePage() {
  const { scanResults } = useStore()
  const score = scanResults?.score ?? null
  const findings = scanResults?.findings || []

  const circumference = 408
  const offset = score !== null ? circumference - (score / 100) * circumference : circumference
  const color = score > 70 ? 'var(--green)' : score > 40 ? 'var(--yellow)' : 'var(--red)'
  const verdict = score > 80 ? '✅ Excellent — Your code is secure'
    : score > 60 ? '⚠️ Good — Some improvements needed'
    : score > 40 ? '🟠 Fair — Multiple vulnerabilities found'
    : score !== null ? '🔴 Poor — Critical issues detected'
    : 'Run a scan to see your score'

  return (
    <div>
      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: 'calc(var(--safe-top) + 12px) 20px 12px',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>⭐ Security Score</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Your code security rating</div>
        </div>
      </div>

      {/* Score Ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ position: 'relative', width: 180, height: 180, marginBottom: 20 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 160 160">
            <circle fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" cx="80" cy="80" r="65" />
            <motion.circle
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              cx="80" cy="80" r="65"
              stroke={color}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <motion.div
              key={score}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: 52, fontWeight: 900, color, letterSpacing: -2, fontVariantNumeric: 'tabular-nums' }}
            >
              {score !== null ? score : '--'}
            </motion.div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: -4 }}>
              Score
            </div>
          </div>
        </motion.div>

        {/* Verdict */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            fontSize: 15, fontWeight: 600,
            padding: '6px 16px', borderRadius: 20,
            background: score !== null ? `${color}15` : 'rgba(255,255,255,0.04)',
            color: score !== null ? color : 'var(--text3)',
          }}
        >
          {verdict}
        </motion.div>
      </div>

      {/* Findings Summary */}
      {findings.length > 0 && (
        <div style={{ padding: '0 20px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Findings Summary</div>
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
            const count = findings.filter(f => f.severity === sev).length
            if (!count) return null
            const colors = { CRITICAL: 'var(--red)', HIGH: 'var(--orange)', MEDIUM: 'var(--yellow)', LOW: 'var(--cyan)' }
            return (
              <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, width: 80, color: colors[sev] }}>{sev}</span>
                <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(8, (count / findings.length) * 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    style={{
                      height: '100%', borderRadius: 4,
                      background: `linear-gradient(90deg, ${colors[sev]}, ${colors[sev]}aa)`,
                      display: 'flex', alignItems: 'center', paddingLeft: 8,
                      fontSize: 10, fontWeight: 700, color: '#fff',
                    }}
                  >
                    {count}
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {score === null && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.6 }}>⭐</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Score Yet</div>
          <div style={{ fontSize: 14, color: 'var(--text3)' }}>Run a security scan to see your score</div>
        </div>
      )}
    </div>
  )
}
