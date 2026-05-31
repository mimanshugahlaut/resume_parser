/**
 * LoadingSpinner.jsx — Enhanced parsing progress overlay
 * Features: stage messages, fake progress bar, fun resume facts, skeleton preview
 */

import { useEffect, useRef, useState } from 'react'

const STAGES = [
  { icon: '📖', message: 'Reading your resume…',       pct: 15 },
  { icon: '🔍', message: 'Extracting contact info…',   pct: 32 },
  { icon: '🧠', message: 'Running NLP analysis…',      pct: 52 },
  { icon: '✨', message: 'AI identifying skills…',      pct: 70 },
  { icon: '📊', message: 'Building your profile…',     pct: 86 },
  { icon: '🎯', message: 'Finalising results…',        pct: 96 },
]

const FUN_FACTS = [
  'Recruiters spend an average of just 7 seconds scanning a resume.',
  'Over 75% of resumes are rejected by ATS before a human sees them.',
  'Tailoring your resume to each job can increase interview chances by 3×.',
  'The word "resume" comes from the French "résumé" meaning "summary".',
  'The first resumes were written by Leonardo da Vinci — in 1482!',
  'Keywords matter: AI can extract skills you didn\'t even know to list.',
]

function SkeletonPreview() {
  return (
    <div style={{ width: '100%', marginTop: '24px', opacity: 0.5 }}>
      <div style={{
        borderRadius: '12px',
        background: 'rgba(15,23,42,0.5)',
        border: '1px solid rgba(148,163,184,0.08)',
        padding: '16px',
      }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div className="skeleton skeleton-circle" style={{ width: 44, height: 44 }}/>
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-line" style={{ width: '55%', marginBottom: 8 }}/>
            <div className="skeleton skeleton-line" style={{ width: '38%', height: 10 }}/>
          </div>
        </div>
        {/* Rows */}
        {[80, 65, 72].map((w, i) => (
          <div key={i} className="skeleton skeleton-line" style={{ width: `${w}%`, marginBottom: 10 }}/>
        ))}
        {/* Chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {[60, 80, 55, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 26, borderRadius: 999 }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LoadingSpinner({ progress = 0 }) {
  const [stageIndex, setStageIndex] = useState(0)
  const [fakeProgress, setFakeProgress] = useState(8)
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * FUN_FACTS.length))
  const progRef = useRef(8)
  const stageRef = useRef(0)

  // Advance through stages
  useEffect(() => {
    const interval = setInterval(() => {
      stageRef.current = (stageRef.current + 1) % STAGES.length
      setStageIndex(stageRef.current)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  // Fake progress that smoothly advances to the stage target
  useEffect(() => {
    const target = STAGES[stageIndex].pct
    const step = () => {
      if (progRef.current < target) {
        progRef.current = Math.min(progRef.current + 1.5, target)
        setFakeProgress(Math.round(progRef.current))
        if (progRef.current < target) requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [stageIndex])

  // Rotate fun facts
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((i) => (i + 1) % FUN_FACTS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const displayProgress = progress > 0 ? Math.max(progress, fakeProgress) : fakeProgress
  const stage = STAGES[stageIndex]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 32px 40px',
      animation: 'fadeIn 0.4s ease',
    }}>
      {/* Animated ring + icon */}
      <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '28px' }}>
        {/* Outer glow */}
        <div style={{
          position: 'absolute',
          inset: '-10px',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, transparent, rgba(99,102,241,0.45), transparent)',
          animation: 'spin 2s linear infinite',
        }} />
        {/* SVG arc */}
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="5"/>
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="url(#spinnerGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${(displayProgress / 100) * 276.46} 276.46`}
            strokeDashoffset="0"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
          <defs>
            <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#6366F1"/>
              <stop offset="100%" stopColor="#A78BFA"/>
            </linearGradient>
          </defs>
        </svg>
        {/* Center icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '30px',
          animation: 'bounce 1.4s ease infinite',
        }}>
          {stage.icon}
        </div>
      </div>

      {/* Stage message */}
      <p key={stageIndex} style={{
        fontSize: '1.05rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '6px',
        animation: 'fadeInUp 0.35s ease',
        textAlign: 'center',
      }}>
        {stage.message}
      </p>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <div className="loading-progress-track">
          <div className="loading-progress-fill" style={{ width: `${displayProgress}%` }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>Parsing…</span>
          <span>{displayProgress}%</span>
        </div>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '6px', margin: '18px 0 0' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-indigo)',
            animation: 'bounce 1.2s ease infinite',
            animationDelay: `${i * 0.2}s`,
            opacity: 0.75,
          }} />
        ))}
      </div>

      {/* Fun fact */}
      <div className="fun-fact-card" style={{ maxWidth: '380px', width: '100%' }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-accent)',
          marginBottom: '6px',
        }}>
          💡 Did you know?
        </div>
        <p key={factIndex} style={{
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          animation: 'fadeIn 0.5s ease',
          margin: 0,
        }}>
          {FUN_FACTS[factIndex]}
        </p>
      </div>

      {/* Skeleton preview */}
      <SkeletonPreview />

      {/* Powered-by */}
      <p style={{
        marginTop: '18px',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{
          padding: '2px 9px',
          borderRadius: '999px',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.22)',
          color: 'var(--text-accent)',
          fontSize: '0.68rem',
          fontWeight: '700',
        }}>
          Gemini 2.5 Flash
        </span>
        is analyzing your resume
      </p>
    </div>
  )
}
