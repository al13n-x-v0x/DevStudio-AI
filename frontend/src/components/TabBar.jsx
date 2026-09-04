import React from 'react'
import { useStore } from '../lib/store'

const tabs = [
  { id: 'scan', label: 'Scan', icon: ScanIcon },
  { id: 'docs', label: 'Docs', icon: DocsIcon },
  { id: 'chat', label: 'Chat', icon: ChatIcon },
  { id: 'score', label: 'Score', icon: ScoreIcon },
  { id: 'tools', label: 'Tools', icon: ToolsIcon },
  { id: 'settings', label: 'More', icon: SettingsIcon },
]

export default function TabBar() {
  const { currentPage, setPage } = useStore()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--tab-height)',
      background: 'rgba(6, 8, 15, 0.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(0, 240, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 8px',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 100,
    }}>
      {tabs.map((tab) => {
        const active = currentPage === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              minWidth: 52,
            }}
          >
            {/* Active indicator pill */}
            {active && (
              <div style={{
                position: 'absolute',
                top: -2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 20,
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #00f0ff, #a855f7)',
                boxShadow: '0 0 8px rgba(0,240,255,0.5)',
                animation: 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
            )}

            {/* Icon container */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              background: active
                ? 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(168,85,247,0.1))'
                : 'transparent',
              transform: active ? 'scale(1.1)' : 'scale(1)',
            }}>
              <Icon
                size={22}
                color={active ? '#00f0ff' : '#475569'}
                active={active}
              />
            </div>

            {/* Label */}
            <span style={{
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              color: active ? '#00f0ff' : '#475569',
              transition: 'all 0.3s',
              letterSpacing: active ? 0.5 : 0,
              textShadow: active ? '0 0 8px rgba(0,240,255,0.4)' : 'none',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

/* ─── SVG Icons (clean, not emoji) ─────────────────────────────────────────── */
function ScanIcon({ size = 24, color = '#475569', active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="3" fill={active ? color : 'none'} opacity={active ? 0.3 : 1} />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  )
}

function DocsIcon({ size = 24, color = '#475569', active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={active ? color : 'none'} opacity={active ? 0.15 : 1} />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function ChatIcon({ size = 24, color = '#475569', active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={active ? color : 'none'} opacity={active ? 0.15 : 1} />
      <circle cx="12" cy="10" r="0.5" fill={color} />
      <circle cx="8" cy="10" r="0.5" fill={color} />
      <circle cx="16" cy="10" r="0.5" fill={color} />
    </svg>
  )
}

function ScoreIcon({ size = 24, color = '#475569', active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
      {active && <>
        <rect x="10" y="10" width="4" height="10" fill={color} opacity="0.2" rx="1" />
        <rect x="16" y="4" width="4" height="16" fill={color} opacity="0.2" rx="1" />
        <rect x="4" y="16" width="4" height="4" fill={color} opacity="0.2" rx="1" />
      </>}
    </svg>
  )
}

function ToolsIcon({ size = 24, color = '#475569', active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill={active ? color : 'none'} opacity={active ? 0.15 : 1} />
    </svg>
  )
}

function SettingsIcon({ size = 24, color = '#475569', active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" fill={active ? color : 'none'} opacity={active ? 0.3 : 1} />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}
