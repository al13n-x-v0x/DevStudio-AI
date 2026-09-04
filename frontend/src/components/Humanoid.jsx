import React, { useRef, useEffect, useState, useCallback } from 'react';

// ─── Humanoid Dot-Particle System ───────────────────────────────────────────────
// A humanoid figure constructed entirely from animated dots/particles.
// Supports: idle breathing, speaking lip-sync, thinking, scanning, alert, waving.

const STATES = {
  IDLE: 'idle',
  SPEAKING: 'speaking',
  THINKING: 'thinking',
  SCANNING: 'scanning',
  ALERT: 'alert',
  WAVING: 'waving',
  WELCOME: 'welcome',
};

// Color palette
const COLORS = {
  primary: '#00f0ff',    // cyan
  secondary: '#a855f7',  // purple
  accent: '#10b981',     // green
  alert: '#ef4444',      // red
  warm: '#f59e0b',       // amber
  white: '#e2e8f0',
  glow: 'rgba(0,240,255,0.3)',
};

// ─── Body Part Definitions (normalized -1..1 coordinates) ────────────────────────
function generateBodyParticles(density = 1.0) {
  const particles = [];
  const rng = (min, max) => Math.random() * (max - min) + min;

  // Head — sphere of dots
  const headCount = Math.floor(45 * density);
  for (let i = 0; i < headCount; i++) {
    const angle = rng(0, Math.PI * 2);
    const r = rng(0, 0.08);
    particles.push({
      x: Math.cos(angle) * r,
      y: -0.72 + Math.sin(angle) * r * 0.9,
      z: Math.cos(angle + 0.5) * r * 0.5,
      part: 'head',
      baseSize: rng(1.5, 3.5),
      phase: rng(0, Math.PI * 2),
      speed: rng(0.3, 0.8),
    });
  }

  // Eyes — 2 bright clusters
  [-0.03, 0.03].forEach((ex) => {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: ex + rng(-0.008, 0.008),
        y: -0.72 + rng(-0.01, 0.01),
        z: 0.06 + rng(-0.005, 0.005),
        part: 'eye',
        baseSize: rng(2, 4),
        phase: rng(0, Math.PI * 2),
        speed: 0.2,
      });
    }
  });

  // Mouth — line of dots (for lip-sync)
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: -0.025 + i * 0.007,
      y: -0.65,
      z: 0.07,
      part: 'mouth',
      baseSize: rng(1.5, 2.5),
      phase: rng(0, Math.PI * 2),
      speed: 1.0,
      mouthIndex: i,
    });
  }

  // Neck
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: rng(-0.02, 0.02),
      y: -0.6 + rng(-0.03, 0.03),
      z: rng(-0.01, 0.01),
      part: 'neck',
      baseSize: rng(1.5, 2.5),
      phase: rng(0, Math.PI * 2),
      speed: 0.4,
    });
  }

  // Torso — elliptical cloud
  const torsoCount = Math.floor(60 * density);
  for (let i = 0; i < torsoCount; i++) {
    const angle = rng(0, Math.PI * 2);
    const ry = rng(0, 0.15);
    const rx = rng(0, 0.08);
    particles.push({
      x: Math.cos(angle) * rx,
      y: -0.38 + Math.sin(angle) * ry,
      z: Math.cos(angle + 1) * rx * 0.4,
      part: 'torso',
      baseSize: rng(1.5, 3),
      phase: rng(0, Math.PI * 2),
      speed: rng(0.2, 0.6),
    });
  }

  // Shoulders
  [-0.1, 0.1].forEach((sx) => {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: sx + rng(-0.02, 0.02),
        y: -0.5 + rng(-0.01, 0.01),
        z: rng(-0.01, 0.01),
        part: 'shoulder',
        baseSize: rng(2, 3.5),
        phase: rng(0, Math.PI * 2),
        speed: 0.3,
      });
    }
  });

  // Arms — chains of dots
  [-1, 1].forEach((side) => {
    const armLen = 8;
    for (let i = 0; i < armLen; i++) {
      const t = i / (armLen - 1);
      const spreadX = 0.1 + t * 0.06;
      particles.push({
        x: side * spreadX,
        y: -0.48 + t * 0.28,
        z: Math.sin(t * Math.PI) * 0.02,
        part: 'arm',
        baseSize: rng(2, 3.5),
        phase: rng(0, Math.PI * 2),
        speed: rng(0.3, 0.7),
        armSide: side,
        armIndex: i,
      });
    }
    // Hand — cluster
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: side * 0.16 + rng(-0.015, 0.015),
        y: -0.2 + rng(-0.015, 0.015),
        z: rng(-0.01, 0.01),
        part: 'hand',
        baseSize: rng(2, 3),
        phase: rng(0, Math.PI * 2),
        speed: 0.5,
        armSide: side,
      });
    }
  });

  // Hips
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: rng(-0.07, 0.07),
      y: -0.22 + rng(-0.01, 0.01),
      z: rng(-0.01, 0.01),
      part: 'hip',
      baseSize: rng(2, 3),
      phase: rng(0, Math.PI * 2),
      speed: 0.3,
    });
  }

  // Legs — chains
  [-1, 1].forEach((side) => {
    const legLen = 10;
    for (let i = 0; i < legLen; i++) {
      const t = i / (legLen - 1);
      particles.push({
        x: side * 0.04,
        y: -0.2 + t * 0.28,
        z: Math.sin(t * Math.PI * 0.5) * 0.01,
        part: 'leg',
        baseSize: rng(2, 3.5),
        phase: rng(0, Math.PI * 2),
        speed: rng(0.2, 0.5),
        legSide: side,
        legIndex: i,
      });
    }
    // Foot
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: side * 0.04 + (side > 0 ? 1 : -1) * i * 0.006,
        y: 0.08 + rng(-0.005, 0.005),
        z: rng(0, 0.015),
        part: 'foot',
        baseSize: rng(2, 3),
        phase: rng(0, Math.PI * 2),
        speed: 0.3,
        legSide: side,
      });
    }
  });

  // Aura particles — floating around body
  const auraCount = Math.floor(30 * density);
  for (let i = 0; i < auraCount; i++) {
    particles.push({
      x: rng(-0.2, 0.2),
      y: rng(-0.8, 0.1),
      z: rng(-0.05, 0.05),
      part: 'aura',
      baseSize: rng(0.5, 2),
      phase: rng(0, Math.PI * 2),
      speed: rng(0.5, 1.5),
      orbitRadius: rng(0.05, 0.15),
      orbitSpeed: rng(0.3, 1.2),
    });
  }

  return particles;
}

// ─── Connection Lines (skeleton edges) ──────────────────────────────────────────
function getConnections() {
  return [
    // spine
    { from: 'neck', to: 'torso' },
    // shoulders to arms
    { from: 'shoulder', to: 'arm' },
    // arms to hands
    { from: 'arm', to: 'hand' },
    // hips to legs
    { from: 'hip', to: 'leg' },
    // legs to feet
    { from: 'leg', to: 'foot' },
  ];
}

// ─── The Component ──────────────────────────────────────────────────────────────
export default function Humanoid({
  state = STATES.IDLE,
  message = '',
  size = 280,
  autoSpeak = false,
  onSpeechEnd,
  className = '',
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const mouthOpenRef = useRef(0);
  const speechBubbleRef = useRef({ text: '', displayed: 0, timer: 0 });
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // Generate particles once
  useEffect(() => {
    particlesRef.current = generateBodyParticles(1.0);
  }, []);

  // ─── Speech Bubble Typing ──────────────────────────────────────────────────
  useEffect(() => {
    if (message) {
      speechBubbleRef.current = { text: message, displayed: 0, timer: 0 };
    } else {
      speechBubbleRef.current = { text: '', displayed: 0, timer: 0 };
    }
  }, [message]);

  // ─── TTS Integration ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoSpeak || !message || !('speechSynthesis' in window)) {
      setIsSpeechSupported(false);
      return;
    }
    setIsSpeechSupported(true);

    const speak = () => {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(message);
      utter.rate = 0.95;
      utter.pitch = 0.9;
      utter.volume = 1;

      // Try to pick a nice voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'));
      if (preferred) utter.voice = preferred;

      utter.onend = () => onSpeechEnd?.();
      window.speechSynthesis.speak(utter);
    };

    // Small delay so animation starts first
    const t = setTimeout(speak, 400);
    return () => {
      clearTimeout(t);
      window.speechSynthesis.cancel();
    };
  }, [message, autoSpeak, onSpeechEnd]);

  // ─── Lip Sync Simulation ──────────────────────────────────────────────────
  useEffect(() => {
    if (state !== STATES.SPEAKING) {
      mouthOpenRef.current = 0;
      return;
    }
    let active = true;
    const animateMouth = () => {
      if (!active) return;
      // Random mouth openness to simulate speech
      mouthOpenRef.current = 0.3 + Math.random() * 0.7;
      setTimeout(animateMouth, 80 + Math.random() * 60);
    };
    animateMouth();
    return () => { active = false; };
  }, [state]);

  // ─── Main Render Loop ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let running = true;

    const getParticleColor = (p) => {
      switch (state) {
        case STATES.ALERT:
          if (p.part === 'eye') return COLORS.alert;
          return Math.random() > 0.7 ? COLORS.alert : COLORS.warm;
        case STATES.SCANNING:
          return p.part === 'eye' ? '#00ff88' : COLORS.accent;
        case STATES.THINKING:
          return p.part === 'aura' ? COLORS.secondary : COLORS.primary;
        case STATES.SPEAKING:
          if (p.part === 'mouth') return COLORS.warm;
          if (p.part === 'eye') return '#00ff88';
          return COLORS.primary;
        case STATES.WAVING:
        case STATES.WELCOME:
          if (p.part === 'hand') return COLORS.accent;
          return COLORS.primary;
        default:
          if (p.part === 'eye') return '#00ff88';
          if (p.part === 'mouth') return COLORS.warm;
          if (p.part === 'aura') return COLORS.secondary;
          return COLORS.primary;
      }
    };

    const getStateModifiers = (p, time) => {
      let dx = 0, dy = 0, sizeMod = 1, alpha = 0.85;

      // Breathing — all particles
      const breathe = Math.sin(time * 0.8 + p.phase) * 0.003;
      dy += breathe;

      // Idle float
      if (state === STATES.IDLE || state === STATES.WELCOME) {
        dx += Math.sin(time * p.speed + p.phase) * 0.002;
        dy += Math.cos(time * p.speed * 0.7 + p.phase) * 0.001;
      }

      // Speaking — mouth moves, body pulses
      if (state === STATES.SPEAKING) {
        if (p.part === 'mouth') {
          const mouthOpen = mouthOpenRef.current;
          const mouthY = Math.sin(time * 8 + p.mouthIndex * 0.5) * mouthOpen * 0.02;
          dy += mouthY;
          sizeMod = 1 + mouthOpen * 0.5;
        }
        if (p.part === 'head') {
          dy += Math.sin(time * 2) * 0.002;
        }
        // Subtle body pulse
        sizeMod *= 1 + Math.sin(time * 3) * 0.05;
      }

      // Thinking — particles orbit head
      if (state === STATES.THINKING) {
        if (p.part === 'aura') {
          const orbAngle = time * p.orbitSpeed + p.phase;
          dx += Math.cos(orbAngle) * p.orbitRadius;
          dy += Math.sin(orbAngle) * p.orbitRadius * 0.5 - 0.1;
          sizeMod = 1.5;
          alpha = 0.6 + Math.sin(time * 2 + p.phase) * 0.3;
        }
        if (p.part === 'head') {
          sizeMod = 1 + Math.sin(time * 4 + p.phase) * 0.2;
        }
      }

      // Scanning — sweep effect
      if (state === STATES.SCANNING) {
        const sweepY = -0.8 + (time * 0.15 % 1.0) * 1.0;
        const distToSweep = Math.abs(p.y - sweepY);
        if (distToSweep < 0.05) {
          sizeMod = 2.5;
          alpha = 1.0;
        }
        // Eyes glow
        if (p.part === 'eye') {
          sizeMod = 2 + Math.sin(time * 6) * 0.5;
        }
      }

      // Alert — shake + flash
      if (state === STATES.ALERT) {
        dx += Math.sin(time * 15 + p.phase) * 0.005;
        dy += Math.cos(time * 12 + p.phase) * 0.003;
        sizeMod = 1 + Math.sin(time * 8) * 0.3;
        if (p.part === 'eye') {
          sizeMod = 2.5;
          alpha = 0.8 + Math.sin(time * 10) * 0.2;
        }
      }

      // Waving — right arm oscillates
      if (state === STATES.WAVING) {
        if (p.part === 'arm' && p.armSide === 1) {
          const wave = Math.sin(time * 4) * 0.03;
          dx += wave * (1 - p.armIndex * 0.1);
          dy -= 0.03 * (1 - p.armIndex * 0.1);
        }
        if (p.part === 'hand' && p.armSide === 1) {
          dx += Math.sin(time * 4) * 0.05;
          dy -= 0.05;
          sizeMod = 1.5;
        }
      }

      // Welcome — combine wave + slight bounce
      if (state === STATES.WELCOME) {
        if (p.part === 'hand' && p.armSide === 1) {
          dx += Math.sin(time * 3) * 0.04;
          dy -= 0.04;
        }
        // Gentle bounce
        dy += Math.abs(Math.sin(time * 2)) * 0.005;
      }

      return { dx, dy, sizeMod, alpha };
    };

    const render = (timestamp) => {
      if (!running) return;
      timeRef.current = timestamp / 1000;
      const time = timeRef.current;
      frameRef.current++;

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2 + 10;
      const scale = size * 0.85;

      // ─── Draw connection lines (skeleton) ──────────────────────────────
      ctx.strokeStyle = 'rgba(0,240,255,0.08)';
      ctx.lineWidth = 0.5;
      const particles = particlesRef.current;
      const headParticles = particles.filter(p => p.part === 'head');
      const torsoParticles = particles.filter(p => p.part === 'torso');

      if (headParticles.length > 0 && torsoParticles.length > 0) {
        const hp = headParticles[Math.floor(headParticles.length / 2)];
        const tp = torsoParticles[Math.floor(torsoParticles.length / 2)];
        const hMod = getStateModifiers(hp, time);
        const tMod = getStateModifiers(tp, time);
        ctx.beginPath();
        ctx.moveTo(centerX + (hp.x + hMod.dx) * scale, centerY + (hp.y + hMod.dy) * scale);
        ctx.lineTo(centerX + (tp.x + tMod.dx) * scale, centerY + (tp.y + tMod.dy) * scale);
        ctx.stroke();
      }

      // ─── Draw particles ────────────────────────────────────────────────
      // Sort by z for depth
      const sorted = [...particles].sort((a, b) => a.z - b.z);

      for (const p of sorted) {
        const mod = getStateModifiers(p, time);
        const px = centerX + (p.x + mod.dx) * scale;
        const py = centerY + (p.y + mod.dy) * scale;
        const sz = p.baseSize * mod.sizeMod;
        const color = getParticleColor(p);

        // Glow effect
        const glowSize = sz * 3;
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
        gradient.addColorStop(0, color.replace(')', `,${mod.alpha * 0.4})`).replace('rgb', 'rgba').replace('#', ''));

        // Parse hex to rgba for glow
        const r = parseInt(color.slice(1, 3), 16) || 0;
        const g = parseInt(color.slice(3, 5), 16) || 0;
        const b = parseInt(color.slice(5, 7), 16) || 0;
        const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
        glowGrad.addColorStop(0, `rgba(${r},${g},${b},${mod.alpha * 0.35})`);
        glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.arc(px, py, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${mod.alpha})`;
        ctx.fill();

        // Bright center
        ctx.beginPath();
        ctx.arc(px, py, sz * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${mod.alpha * 0.6})`;
        ctx.fill();
      }

      // ─── Scan line (when scanning) ─────────────────────────────────────
      if (state === STATES.SCANNING) {
        const sweepY = -0.8 + (time * 0.15 % 1.0) * 1.0;
        const lineY = centerY + sweepY * scale;
        const lineGrad = ctx.createLinearGradient(centerX - 50, lineY, centerX + 50, lineY);
        lineGrad.addColorStop(0, 'rgba(16,185,129,0)');
        lineGrad.addColorStop(0.5, 'rgba(16,185,129,0.6)');
        lineGrad.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = lineGrad;
        ctx.fillRect(centerX - 60, lineY - 1, 120, 2);
      }

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(animId);
    };
  }, [size, state]);

  // ─── State Label ─────────────────────────────────────────────────────────
  const stateLabel = {
    [STATES.IDLE]: '● Ready',
    [STATES.SPEAKING]: '◉ Speaking...',
    [STATES.THINKING]: '◎ Analyzing...',
    [STATES.SCANNING]: '◉ Scanning...',
    [STATES.ALERT]: '⚠ Vulnerability Found',
    [STATES.WAVING]: '👋 Hello!',
    [STATES.WELCOME]: '👋 Welcome to DevStudio',
  }[state] || '● Ready';

  const stateColor = {
    [STATES.IDLE]: COLORS.primary,
    [STATES.SPEAKING]: COLORS.warm,
    [STATES.THINKING]: COLORS.secondary,
    [STATES.SCANNING]: COLORS.accent,
    [STATES.ALERT]: COLORS.alert,
    [STATES.WAVING]: COLORS.accent,
    [STATES.WELCOME]: COLORS.accent,
  }[state] || COLORS.primary;

  return (
    <div className={`humanoid-container ${className}`} style={{
      position: 'relative',
      width: size,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      userSelect: 'none',
    }}>
      {/* ─── Speech Bubble ─────────────────────────────────────────────── */}
      {message && (
        <div style={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.9)',
          border: `1px solid ${stateColor}40`,
          borderRadius: 16,
          padding: '10px 16px',
          maxWidth: size * 0.9,
          minWidth: 120,
          color: '#e2e8f0',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.5,
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 0 20px ${stateColor}20`,
          animation: 'bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          zIndex: 10,
        }}>
          <span style={{ color: stateColor, marginRight: 4 }}>●</span>
          {message}
          {/* Bubble tail */}
          <div style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 14,
            height: 14,
            background: 'rgba(15,23,42,0.9)',
            borderRight: `1px solid ${stateColor}40`,
            borderBottom: `1px solid ${stateColor}40`,
          }} />
        </div>
      )}

      {/* ─── Canvas ────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          cursor: 'pointer',
        }}
        onClick={() => {
          // Click to toggle wave
          if (state === STATES.IDLE) {
            // handled by parent
          }
        }}
      />

      {/* ─── State Indicator ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: -8,
        padding: '4px 14px',
        background: 'rgba(15,23,42,0.8)',
        border: `1px solid ${stateColor}30`,
        borderRadius: 20,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        color: stateColor,
        letterSpacing: 0.5,
        animation: 'fadeIn 0.3s ease',
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: stateColor,
          display: 'inline-block',
          animation: state === STATES.SCANNING ? 'pulse 1s infinite' : 'none',
          boxShadow: `0 0 8px ${stateColor}`,
        }} />
        {stateLabel}
      </div>

      {/* ─── Inline Styles for Animations ──────────────────────────────── */}
      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.9); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export { STATES };
