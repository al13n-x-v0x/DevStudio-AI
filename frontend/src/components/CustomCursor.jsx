import React, { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const trailRef = useRef([])
  const pos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const raf = useRef(null)

  useEffect(() => {
    // Only on desktop
    if ('ontouchstart' in window) return

    const onMouseMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }

      // Check if hovering interactive element
      const target = e.target.closest('button, a, input, textarea, [role="button"], .glass')
      setIsHovering(!!target)
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp = () => setIsClicking(false)
    const onMouseLeave = () => {
      pos.current = { x: -100, y: -100 }
      ringPos.current = { x: -100, y: -100 }
    }

    // Smooth ring follow with lerp
    const animate = () => {
      const lerp = 0.12
      ringPos.current.x += (pos.current.x - ringPos.current.x) * lerp
      ringPos.current.y += (pos.current.y - ringPos.current.y) * lerp

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px)`
      }

      raf.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onMouseLeave)
    raf.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null

  return (
    <>
      {/* Core dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#fff',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'width 0.2s, height 0.2s, background 0.2s',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />

      {/* Trailing ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          borderColor: isHovering ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.15)',
          background: isHovering ? 'rgba(0,229,255,0.04)' : 'transparent',
          opacity: 1,
          willChange: 'transform',
        }}
      />

      {/* Hide default cursor */}
      <style>{`
        @media (hover: hover) {
          * { cursor: none !important; }
        }
      `}</style>
    </>
  )
}
