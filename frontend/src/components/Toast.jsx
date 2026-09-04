import React, { useEffect, useState } from 'react'

// Simple toast system — shows notifications at top
let toastQueue = []
let listeners = []

export function showToast(message, type = 'info', duration = 4000) {
  const toast = { id: Date.now(), message, type, duration }
  toastQueue.push(toast)
  listeners.forEach(fn => fn([...toastQueue]))
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== toast.id)
    listeners.forEach(fn => fn([...toastQueue]))
  }, duration)
}

const typeStyles = {
  info: { bg: 'rgba(0,240,255,0.1)', border: 'rgba(0,240,255,0.2)', color: '#00f0ff', icon: 'ℹ️' },
  success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', color: '#10b981', icon: '✅' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b', icon: '⚠️' },
  error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#ef4444', icon: '❌' },
  scan: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', color: '#a855f7', icon: '🔍' },
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    listeners.push(setToasts)
    return () => { listeners = listeners.filter(l => l !== setToasts) }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
      maxWidth: 380,
      width: '90%',
    }}>
      {toasts.map((toast, i) => {
        const style = typeStyles[toast.type] || typeStyles.info
        return (
          <div
            key={toast.id}
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: 12,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 10px ${style.border}`,
              animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{style.icon}</span>
            <span style={{
              color: style.color,
              fontSize: 13,
              fontWeight: 500,
              flex: 1,
              lineHeight: 1.4,
            }}>
              {toast.message}
            </span>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 12,
              right: 12,
              height: 2,
              borderRadius: 1,
              background: style.color,
              opacity: 0.3,
              animation: `toastTimer ${toast.duration}ms linear forwards`,
            }} />
          </div>
        )
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastTimer {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
