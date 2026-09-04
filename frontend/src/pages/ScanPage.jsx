import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../lib/store'
import { showToast } from '../components/Toast'
import { speakScanResults, speakFinding } from '../lib/speech'

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'PHP']

const SEV = {
  critical: { color: '#ff1744', bg: 'rgba(255,23,68,0.08)', border: 'rgba(255,23,68,0.18)', icon: '✕' },
  high: { color: '#ff9100', bg: 'rgba(255,145,0,0.06)', border: 'rgba(255,145,0,0.14)', icon: '▲' },
  medium: { color: '#00e5ff', bg: 'rgba(0,229,255,0.05)', border: 'rgba(0,229,255,0.1)', icon: '●' },
  low: { color: '#69f0ae', bg: 'rgba(105,240,174,0.04)', border: 'rgba(105,240,174,0.08)', icon: '○' },
}

export default function ScanPage() {
  const { code, setCode, language, setLanguage, scanResults, scanning, runScan } = useStore()
  const [expanded, setExpanded] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const resultsRef = useRef(null)

  const findings = scanResults?.findings || []
  const score = scanResults?.score ?? null
  const counts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  }
  const total = findings.length

  useEffect(() => {
    if (scanResults) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [scanResults])

  const scoreColor = score >= 80 ? '#69f0ae' : score >= 50 ? '#ffab00' : '#ff1744'

  return (
    <div style={{ padding: '24px 16px 24px', maxWidth: 860, margin: '0 auto' }}>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Big, bold, asymmetric
          ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 20,
        alignItems: 'end',
        marginBottom: 32,
      }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            color: '#00e5ff', marginBottom: 8,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            // SECURITY AUDIT
          </div>
          <h1 style={{
            fontSize: 42, fontWeight: 900, letterSpacing: -1.5, lineHeight: 0.95,
            color: '#fff', marginBottom: 12,
          }}>
            Find the<br/>
            <span style={{
              background: 'linear-gradient(135deg, #00e5ff, #9d4edd)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>vulnerabilities</span>
          </h1>
          <p style={{ fontSize: 13, color: '#5c6bc0', maxWidth: 320, lineHeight: 1.5 }}>
            50+ patterns. OWASP Top 10. CWE mapped. One click.
          </p>
        </div>

        {/* Score badge — big number */}
        {score !== null && (
          <div style={{
            textAlign: 'right',
            animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{
              fontSize: 11, color: '#5c6bc0', marginBottom: 4,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase', letterSpacing: 1,
            }}>Score</div>
            <div style={{
              fontSize: 72, fontWeight: 900, lineHeight: 0.85,
              color: scoreColor,
              fontVariantNumeric: 'tabular-nums',
              textShadow: `0 0 40px ${scoreColor}30`,
              letterSpacing: -3,
            }}>
              {score}
            </div>
            <div style={{
              fontSize: 10, color: '#5c6bc0', marginTop: 4,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              /100
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          BENTO GRID — Stats + Actions
          ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'auto auto',
        gap: 8,
        marginBottom: 24,
      }}>
        {/* Stat cards — each with unique visual */}
        {[
          { label: 'CRIT', val: counts.critical, c: '#ff1744', accent: 'rgba(255,23,68,0.12)', col: 'span 1' },
          { label: 'HIGH', val: counts.high, c: '#ff9100', accent: 'rgba(255,145,0,0.1)', col: 'span 1' },
          { label: 'MED', val: counts.medium, c: '#00e5ff', accent: 'rgba(0,229,255,0.08)', col: 'span 1' },
          { label: 'LOW', val: counts.low, c: '#69f0ae', accent: 'rgba(105,240,174,0.06)', col: 'span 1' },
        ].map((s, i) => (
          <div key={s.label} style={{
            background: hoveredCard === `stat-${i}` ? s.accent : 'rgba(15,20,34,0.8)',
            border: `1px solid ${hoveredCard === `stat-${i}` ? s.c + '30' : 'rgba(255,255,255,0.04)'}`,
            borderRadius: 14,
            padding: '16px 14px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            cursor: 'default',
            animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
          }}
          onMouseEnter={() => setHoveredCard(`stat-${i}`)}
          onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Corner accent */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 40, height: 40,
              background: `radial-gradient(circle at top right, ${s.accent}, transparent 70%)`,
            }} />
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
              color: s.c, opacity: 0.7, marginBottom: 8,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{s.label}</div>
            <div style={{
              fontSize: 36, fontWeight: 900, color: s.c,
              fontFamily: "'JetBrains Mono', monospace",
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              textShadow: s.val > 0 ? `0 0 20px ${s.c}20` : 'none',
            }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CODE EDITOR — Full width, terminal feel
          ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: 'rgba(10,14,24,0.9)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840' }} />
            </div>
            {/* Language tabs */}
            <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => setLanguage(l)} style={{
                  padding: '3px 10px', borderRadius: 6, border: 'none',
                  fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  background: language === l ? 'rgba(0,229,255,0.1)' : 'transparent',
                  color: language === l ? '#00e5ff' : '#3949ab',
                  transition: 'all 0.2s',
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => { navigator.clipboard?.writeText(code); showToast('Copied', 'success') }}
              style={{
                padding: '3px 10px', borderRadius: 6, border: 'none',
                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', color: '#5c6bc0',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = '#00e5ff'}
              onMouseLeave={e => e.target.style.color = '#5c6bc0'}
            >cp</button>
            <button onClick={() => setCode('')}
              style={{
                padding: '3px 10px', borderRadius: 6, border: 'none',
                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', color: '#5c6bc0',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = '#ff1744'}
              onMouseLeave={e => e.target.style.color = '#5c6bc0'}
            >clr</button>
          </div>
        </div>

        {/* Code area */}
        <div style={{ display: 'flex' }}>
          {/* Line numbers */}
          <div style={{
            padding: '16px 0 16px 14px',
            minWidth: 36,
            color: '#283593',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.8,
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid rgba(255,255,255,0.03)',
          }}>
            {code.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="# Paste your code here..."
            spellCheck={false}
            style={{
              flex: 1, minHeight: 220, padding: '16px',
              background: 'transparent', border: 'none',
              color: '#c5cae9', fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1.8, resize: 'vertical', outline: 'none',
              tabSize: 4,
            }}
          />
        </div>

        {/* Scan line decoration */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.2), rgba(157,78,221,0.2), transparent)',
        }} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SCAN BUTTON — Big, confident
          ═══════════════════════════════════════════════════════════════════ */}
      <button
        onClick={() => { if (!code.trim()) { showToast('Paste code first', 'warning'); return }; showToast('Scanning...', 'scan'); runScan() }}
        disabled={scanning}
        style={{
          width: '100%', height: 52,
          border: 'none', borderRadius: 14,
          background: scanning
            ? 'rgba(0,229,255,0.08)'
            : 'linear-gradient(135deg, #00e5ff, #9d4edd)',
          color: scanning ? '#00e5ff' : '#000',
          fontSize: 15, fontWeight: 800,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: 0.3,
          cursor: scanning ? 'wait' : 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: scanning ? 'none' : '0 4px 24px rgba(0,229,255,0.25), 0 0 60px rgba(157,78,221,0.1)',
          marginBottom: 28,
          transform: scanning ? 'scale(0.98)' : 'scale(1)',
        }}
      >
        {scanning ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#00e5ff', borderRightColor: '#00e5ff',
              animation: 'spin 0.7s linear infinite',
              display: 'inline-block',
            }} />
            Analyzing 50+ patterns...
          </span>
        ) : 'SCAN FOR VULNERABILITIES'}
      </button>

      {/* ═══════════════════════════════════════════════════════════════════
          FINDINGS — Dense, asymmetric cards
          ═══════════════════════════════════════════════════════════════════ */}
      <div ref={resultsRef}>
        {scanResults && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#5c6bc0' }}>
              // {total} FINDING{total !== 1 ? 'S' : ''}
            </div>
            <button
              onClick={() => speakScanResults(scanResults)}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, padding: '4px 12px',
                fontSize: 10, color: '#5c6bc0', cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.borderColor = 'rgba(0,229,255,0.2)'}
              onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            >🔊 read aloud</button>
          </div>
        )}

        {findings.map((f, i) => {
          const s = SEV[f.severity] || SEV.low
          const isOpen = expanded === i
          return (
            <div
              key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                background: isOpen ? s.bg : 'rgba(15,20,34,0.7)',
                border: `1px solid ${isOpen ? s.border : 'rgba(255,255,255,0.03)'}`,
                borderRadius: 14,
                marginBottom: 6,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both`,
              }}
            >
              {/* Main row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr auto auto',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
              }}>
                {/* Severity icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900, color: s.c,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {s.icon}
                </div>

                {/* Type + explanation preview */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e8eaf6' }}>
                    {f.type}
                  </div>
                  {f.explanation && !isOpen && (
                    <div style={{
                      fontSize: 11, color: '#5c6bc0', marginTop: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxWidth: 300,
                    }}>
                      {f.explanation}
                    </div>
                  )}
                </div>

                {/* Line number */}
                {f.line && (
                  <span style={{
                    fontSize: 10, color: '#3949ab',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>L{f.line}</span>
                )}

                {/* Expand arrow */}
                <span style={{
                  fontSize: 10, color: '#3949ab',
                  transition: 'transform 0.3s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                }}>▾</span>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div style={{
                  padding: '0 14px 14px',
                  borderTop: `1px solid ${s.border}`,
                  animation: 'fadeUp 0.25s ease',
                }}>
                  {/* Explanation */}
                  {f.explanation && (
                    <p style={{
                      fontSize: 12, color: '#7986cb', lineHeight: 1.7,
                      marginTop: 12, marginBottom: 12,
                    }}>
                      {f.explanation}
                    </p>
                  )}

                  {/* Fix */}
                  {f.fix && (
                    <div style={{
                      background: 'rgba(105,240,174,0.04)',
                      border: '1px solid rgba(105,240,174,0.08)',
                      borderRadius: 10, padding: '10px 14px',
                      marginBottom: 10,
                    }}>
                      <div style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: 1,
                        textTransform: 'uppercase', color: '#69f0ae',
                        marginBottom: 6,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        → FIX
                      </div>
                      <code style={{
                        fontSize: 11, color: '#7986cb',
                        fontFamily: "'JetBrains Mono', monospace",
                        whiteSpace: 'pre-wrap', lineHeight: 1.6,
                      }}>{f.fix}</code>
                    </div>
                  )}

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      onClick={e => { e.stopPropagation(); speakFinding(f) }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 6, padding: '3px 10px',
                        fontSize: 10, color: '#5c6bc0', cursor: 'pointer',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >🔊 listen</button>
                    {f.owasp && (
                      <span style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 6,
                        background: 'rgba(0,229,255,0.06)', color: '#00e5ff',
                        border: '1px solid rgba(0,229,255,0.08)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{f.owasp}</span>
                    )}
                    {f.cwe && (
                      <span style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 6,
                        background: 'rgba(157,78,221,0.06)', color: '#9d4edd',
                        border: '1px solid rgba(157,78,221,0.08)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{f.cwe}</span>
                    )}
                    <span style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 6,
                      background: s.bg, color: s.c,
                      border: `1px solid ${s.border}`,
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: 'uppercase', fontWeight: 700,
                    }}>{f.severity}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ─── Empty state ──────────────────────────────────────────────── */}
      {!scanning && !scanResults && (
        <div style={{
          textAlign: 'center', padding: '64px 20px',
          animation: 'fadeUp 0.6s ease 0.3s both',
        }}>
          <div style={{
            width: 80, height: 80, margin: '0 auto 24px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(157,78,221,0.04))',
            border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'breathe 4s ease-in-out infinite',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3949ab" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p style={{ fontSize: 15, color: '#5c6bc0', fontWeight: 600 }}>
            Paste code → Scan → Find bugs
          </p>
          <p style={{
            fontSize: 11, color: '#283593', marginTop: 10,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            sql.injection · xss · hardcoded.secrets · owasp.top10
          </p>
        </div>
      )}
    </div>
  )
}
