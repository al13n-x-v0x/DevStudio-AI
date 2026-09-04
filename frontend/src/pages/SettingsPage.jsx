/**
 * SettingsPage — Configuration, demo mode, and export
 */
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Download, Activity, Shield, Cpu, Zap } from 'lucide-react'
import { useStore } from '../lib/store'

function SettingCard({ icon: Icon, title, subtitle, onClick, rightElement }) {
  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      style={{
        background: 'var(--glass)',
        border: '0.5px solid var(--glass-border)',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 12,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(99,102,241,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color="var(--accent2)" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      {rightElement || <span style={{ color: 'var(--text3)', fontSize: 18 }}>→</span>}
    </motion.div>
  )
}

export default function SettingsPage() {
  const { setShowDemo, memoryStats, refreshMemory } = useStore()
  const [aiStatus, setAiStatus] = useState('Checking...')

  useEffect(() => {
    refreshMemory()
    fetch('/api/stats').then(r => r.json()).then(d => {
      setAiStatus(d.ai_connected ? 'Connected ✅' : 'Offline (set NEBIUS_API_KEY)')
    }).catch(() => setAiStatus('Offline'))
  }, [])

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
          <div style={{ fontSize: 17, fontWeight: 700 }}>⚙️ Settings</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>DevStudio AI v1.0</div>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
        {/* AI Status */}
        <SettingCard
          icon={Cpu}
          title="🤖 AI Backend"
          subtitle="NVIDIA Nemotron via Nebius Token Factory"
          rightElement={
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: aiStatus.includes('Connected') ? 'var(--green)' : 'var(--yellow)',
            }}>
              {aiStatus}
            </span>
          }
        />

        {/* Memory Stats */}
        <SettingCard
          icon={Activity}
          title="🧠 Memory Stats"
          subtitle={`${memoryStats?.total_entries || 0} entries · ${Object.keys(memoryStats?.by_type || {}).length} types`}
          rightElement={
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {memoryStats?.indexed_words || 0} words indexed
            </span>
          }
        />

        {/* Supported Vulns */}
        <SettingCard
          icon={Shield}
          title="🔍 Vulnerability Patterns"
          subtitle="50+ patterns across OWASP Top 10"
          rightElement={
            <span style={{ fontSize: 12, color: 'var(--accent2)', fontWeight: 600 }}>
              Active
            </span>
          }
        />

        {/* Demo Mode */}
        <SettingCard
          icon={Play}
          title="🎬 Demo Mode"
          subtitle="Walk through features for hackathon judges"
          onClick={() => setShowDemo(true)}
        />

        {/* Export */}
        <SettingCard
          icon={Download}
          title="📥 Export Memory"
          subtitle="Download your full research & security log"
          onClick={() => window.open('/api/export', '_blank')}
        />

        {/* Keyboard Shortcuts */}
        <div style={{
          background: 'var(--glass)',
          border: '0.5px solid var(--glass-border)',
          borderRadius: 16,
          padding: 20,
          marginTop: 12,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 12 }}>⌨️ Keyboard Shortcuts</div>
          {[
            { key: 'Ctrl + K', action: 'Quick scan' },
            { key: '1-5', action: 'Switch pages' },
            { key: 'Enter', action: 'Send chat message' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '0.5px solid rgba(255,255,255,0.03)' : 'none' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{s.action}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text2)',
              }}>
                {s.key}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)', fontSize: 12 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🛡️</div>
          DevStudio AI v1.0<br />
          <span style={{ color: 'var(--accent2)' }}>DocMind · SecureAgent · DevBuddy</span><br />
          <span style={{ marginTop: 8, display: 'inline-block' }}>Built for the Nebius x NVIDIA Global AI Hackathon</span>
        </div>
      </div>
    </div>
  )
}
