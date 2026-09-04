/**
 * ParticleCanvas — Interactive particle system with mouse repulsion
 */
import React, { useRef, useEffect } from 'react'

class Particle {
  constructor(w, h) {
    this.w = w; this.h = h
    this.reset()
  }
  reset() {
    this.x = Math.random() * this.w
    this.y = Math.random() * this.h
    this.size = Math.random() * 1.5 + 0.5
    this.vx = (Math.random() - 0.5) * 0.3
    this.vy = (Math.random() - 0.5) * 0.3
    this.opacity = Math.random() * 0.4 + 0.1
    this.color = ['99,102,241', '6,182,212', '16,185,129', '236,72,153'][~~(Math.random() * 4)]
  }
  update(mx, my) {
    this.x += this.vx
    this.y += this.vy
    const dx = mx - this.x, dy = my - this.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < 150) { this.x -= dx * 0.002; this.y -= dy * 0.002 }
    if (this.x < 0 || this.x > this.w || this.y < 0 || this.y > this.h) this.reset()
  }
  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`
    ctx.fill()
  }
}

export default function ParticleCanvas() {
  const ref = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })
  const particles = useRef([])
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight

    // Create particles
    particles.current = Array.from({ length: 80 }, () => new Particle(w, h))

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      particles.current.forEach(p => { p.w = w; p.h = h })
    }
    const onMouse = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouse)

    function animate() {
      ctx.clearRect(0, 0, w, h)
      const pts = particles.current
      pts.forEach(p => { p.update(mouse.current.x, mouse.current.y); p.draw(ctx) })

      // Connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
