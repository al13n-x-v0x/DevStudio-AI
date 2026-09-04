/**
 * MeshBackground — Animated gradient mesh with floating orbs
 */
import React from 'react'

const orbStyle = (color, size, top, left, delay) => ({
  position: 'fixed',
  width: size,
  height: size,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color}, transparent 70%)`,
  top,
  left,
  filter: 'blur(120px)',
  willChange: 'transform',
  animation: `orbFloat ${20 + delay * 3}s ease-in-out infinite ${delay}s`,
  zIndex: 0,
  pointerEvents: 'none',
})

export default function MeshBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      <div style={orbStyle('rgba(99,102,241,0.15)', 600, '-200px', '-200px', 0)} />
      <div style={orbStyle('rgba(6,182,212,0.12)', 500, 'auto', 'auto', 5)} />
      <div style={orbStyle('rgba(236,72,153,0.08)', 400, '40%', '50%', 10)} />
    </div>
  )
}
