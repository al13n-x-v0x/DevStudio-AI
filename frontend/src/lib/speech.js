/**
 * DevStudio AI — Speech Service (TTS + STT)
 * Uses Web Speech API — works offline on most modern browsers.
 * No external dependencies required.
 */

// ─── Text-to-Speech ──────────────────────────────────────────────────

let ttsQueue = []
let isSpeaking = false
let currentUtterance = null

/**
 * Speak text aloud. Queues if already speaking.
 * @param {string} text - Text to speak
 * @param {object} opts - { rate, pitch, voice, onEnd }
 */
export function speak(text, opts = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('TTS not supported in this browser')
    opts.onEnd?.()
    return { stop: () => {}, pause: () => {}, resume: () => {} }
  }

  // Cancel any current speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = opts.rate || 1.0
  utterance.pitch = opts.pitch || 1.0
  utterance.volume = opts.volume || 1.0

  // Pick a good voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = ['Google UK English Male', 'Google US English', 'Microsoft Zira', 'Samantha', 'Alex']
  const voice = opts.voice || voices.find(v => preferred.some(p => v.name.includes(p))) || voices[0]
  if (voice) utterance.voice = voice

  utterance.onend = () => {
    isSpeaking = false
    currentUtterance = null
    opts.onEnd?.()
    // Process queue
    if (ttsQueue.length > 0) {
      const next = ttsQueue.shift()
      speak(next.text, next.opts)
    }
  }

  utterance.onerror = (e) => {
    if (e.error !== 'canceled') {
      console.warn('TTS error:', e.error)
    }
    isSpeaking = false
    currentUtterance = null
  }

  currentUtterance = utterance
  isSpeaking = true
  window.speechSynthesis.speak(utterance)

  return {
    stop: () => {
      window.speechSynthesis.cancel()
      ttsQueue = []
      isSpeaking = false
      currentUtterance = null
    },
    pause: () => window.speechSynthesis.pause(),
    resume: () => window.speechSynthesis.resume(),
    isSpeaking: () => isSpeaking,
  }
}

/**
 * Speak scan findings summary
 */
export function speakScanResults(results) {
  if (!results) return

  const { findings, score, summary } = results

  let text = `Security scan complete. `
  text += `Security score: ${score} out of 100. `

  if (findings.length === 0) {
    text += `No vulnerabilities detected. Your code looks secure!`
  } else {
    const crit = findings.filter(f => f.severity === 'CRITICAL').length
    const high = findings.filter(f => f.severity === 'HIGH').length
    const med = findings.filter(f => f.severity === 'MEDIUM').length
    const low = findings.filter(f => f.severity === 'LOW').length

    text += `Found ${findings.length} issues: `
    if (crit) text += `${crit} critical. `
    if (high) text += `${high} high. `
    if (med) text += `${med} medium. `
    if (low) text += `${low} low. `

    text += `Here are the top findings. `

    // Read top 3 findings
    findings.slice(0, 3).forEach((f, i) => {
      text += `Finding ${i + 1}: ${f.type}. Severity: ${f.severity}. `
      text += `${f.explanation} `
      text += `Suggested fix: ${f.fix}. `
    })
  }

  return speak(text, { rate: 0.95 })
}

/**
 * Speak a single vulnerability finding
 */
export function speakFinding(finding) {
  const text = `${finding.type}. Severity: ${finding.severity}. ${finding.explanation}. Line ${finding.line}. Suggested fix: ${finding.fix}`
  return speak(text, { rate: 0.95 })
}

/**
 * Speak AI chat response
 */
export function speakResponse(text) {
  // Clean markdown/code before speaking
  const clean = text
    .replace(/```[\s\S]*?```/g, ' (code block) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()

  return speak(clean, { rate: 1.0 })
}

/**
 * Stop all speech
 */
export function stopSpeaking() {
  window.speechSynthesis?.cancel()
  ttsQueue = []
  isSpeaking = false
  currentUtterance = null
}

/**
 * Check if currently speaking
 */
export function isCurrentlySpeaking() {
  return isSpeaking
}

/**
 * Get available voices
 */
export function getVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices() || []
    if (voices.length > 0) {
      resolve(voices)
      return
    }
    window.speechSynthesis?.addEventListener('voiceschanged', () => {
      resolve(window.speechSynthesis.getVoices())
    }, { once: true })
    // Fallback timeout
    setTimeout(() => resolve([]), 500)
  })
}


// ─── Speech-to-Text ──────────────────────────────────────────────────

let recognition = null
let isListening = false
let onResultCallback = null
let onEndCallback = null

/**
 * Start listening for voice input
 * @param {object} opts - { onResult, onEnd, onError, lang }
 */
export function startListening(opts = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    console.warn('STT not supported in this browser')
    opts.onError?.('Speech recognition not supported')
    return { stop: () => {} }
  }

  // Stop any existing recognition
  stopListening()

  recognition = new SpeechRecognition()
  recognition.lang = opts.lang || 'en-US'
  recognition.interimResults = opts.interimResults !== false
  recognition.continuous = opts.continuous || false
  recognition.maxAlternatives = 1

  onResultCallback = opts.onResult
  onEndCallback = opts.onEnd

  recognition.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    onResultCallback?.({
      interim: interimTranscript,
      final: finalTranscript,
      isFinal: finalTranscript.length > 0,
    })
  }

  recognition.onerror = (event) => {
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      console.warn('STT error:', event.error)
      opts.onError?.(event.error)
    }
    isListening = false
  }

  recognition.onend = () => {
    isListening = false
    onEndCallback?.()
  }

  try {
    recognition.start()
    isListening = true
  } catch (e) {
    console.warn('Failed to start recognition:', e)
    opts.onError?.(e.message)
  }

  return {
    stop: () => stopListening(),
    isListening: () => isListening,
  }
}

/**
 * Stop listening
 */
export function stopListening() {
  if (recognition) {
    try { recognition.stop() } catch (e) { /* ignore */ }
    recognition = null
  }
  isListening = false
}

/**
 * Check if STT is available
 */
export function isSTTSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Check if TTS is available
 */
export function isTTSSupported() {
  return !!(window.speechSynthesis)
}
