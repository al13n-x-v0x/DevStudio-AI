/**
 * DocsPage — DocMind document intelligence and indexing
 */
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Database, Search } from 'lucide-react'
import { useStore } from '../lib/store'
import { showToast as toast } from '../components/Toast'

export default function DocsPage() {
  const {
    docContent, setDocContent, docType, setDocType,
    runDocMind, docResults, documents, refreshDocs, indexing,
  } = useStore()

  useEffect(() => { refreshDocs() }, [])

  return (
    <div>
      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: 'calc(var(--safe-top) + 12px) 20px 12px',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 800, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>📄 DocMind</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Document Intelligence</div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            fontSize: 11, fontWeight: 600,
            background: 'rgba(99,102,241,0.12)', color: 'var(--accent2)',
            border: '0.5px solid rgba(99,102,241,0.2)',
          }}>
            <Database size={12} /> INDEXER
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: '16px 24px 4px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.5px' }}>Document Indexer</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 6, lineHeight: 1.4 }}>
          Paste documentation, stack traces, or reference guides. AI indexes them into your project memory.
        </p>
      </div>

      {/* Editor */}
      <div style={{ padding: '16px 20px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'var(--glass)', border: '0.5px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '0.5px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>📄 Document Content</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ id: 'auto', label: 'Auto' }, { id: 'docs', label: 'Docs' }, { id: 'stacktrace', label: 'Stack Trace' }, { id: 'config', label: 'Config' }, { id: 'log', label: 'Log' }].map(t => (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDocType(t.id)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: docType === t.id ? 'var(--cyan)' : 'rgba(255,255,255,0.04)',
                    color: docType === t.id ? '#fff' : 'var(--text3)',
                    border: docType === t.id ? '0.5px solid var(--cyan)' : '0.5px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </motion.button>
              ))}
            </div>
          </div>
          <textarea
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
            placeholder="Paste documentation, stack traces, logs, or reference material..."
            spellCheck={false}
            style={{
              width: '100%', minHeight: 250, background: 'transparent', border: 'none',
              color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
              lineHeight: 1.8, padding: '16px 20px', resize: 'vertical', outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Index Button */}
      <div style={{ padding: '0 20px', maxWidth: 800, margin: '0 auto' }}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={runDocMind}
          disabled={indexing}
          style={{
            width: '100%', padding: 16, border: 'none', borderRadius: 16,
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--cyan), #0891b2)',
            color: '#fff', boxShadow: '0 8px 32px rgba(6,182,212,0.3)',
            opacity: indexing ? 0.6 : 1,
          }}
        >
          {indexing ? '⏳ Indexing...' : '📄 Index Document'}
        </motion.button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {docResults && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 20px', maxWidth: 800, margin: '0 auto' }}
          >
            <div style={{ background: 'var(--glass)', border: '0.5px solid var(--glass-border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📄 {docResults.filename}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                  Type: {docResults.doc_type} · Chunks: {docResults.chunks} · Tags: {docResults.tags?.join(', ')}
                </div>
                {docResults.analysis?.summary && (
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    {docResults.analysis.summary}
                  </div>
                )}
                {docResults.analysis?.key_concepts?.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {docResults.analysis.key_concepts.map((c, i) => (
                      <span key={i} style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                        background: 'rgba(255,255,255,0.04)', color: 'var(--text3)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {c.concept}: {c.explanation?.substring(0, 60)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document List */}
      <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'var(--glass)', border: '0.5px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>📚 Indexed Documents</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{documents.length} docs</span>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {documents.length > 0 ? documents.map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.03)' }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4 }}>
                  <strong>{doc.title}</strong><br />
                  {doc.summary}
                </div>
              </motion.div>
            )) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
                No documents indexed yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
