import React from 'react'

export default function AmbientBg() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {/* Top-left orb — cyan */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        maxWidth: 600,
        maxHeight: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.06), transparent 70%)',
        filter: 'blur(80px)',
        animation: 'drift 20s ease-in-out infinite',
      }} />

      {/* Center-right orb — purple */}
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '-15%',
        width: '45vw',
        height: '45vw',
        maxWidth: 550,
        maxHeight: 550,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(157,78,221,0.05), transparent 70%)',
        filter: 'blur(80px)',
        animation: 'drift 25s ease-in-out infinite 5s',
      }} />

      {/* Bottom orb — green */}
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '20%',
        width: '40vw',
        height: '40vw',
        maxWidth: 500,
        maxHeight: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,230,118,0.04), transparent 70%)',
        filter: 'blur(80px)',
        animation: 'drift 22s ease-in-out infinite 10s',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        opacity: 0.5,
      }} />

      {/* Top vignette */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30vh',
        background: 'linear-gradient(180deg, rgba(5,7,13,0.8), transparent)',
      }} />

      {/* Bottom vignette */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '20vh',
        background: 'linear-gradient(0deg, rgba(5,7,13,0.9), transparent)',
      }} />
    </div>
  )
}
