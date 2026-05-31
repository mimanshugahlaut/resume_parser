/**
 * App.jsx — ResumeIQ Main Application
 * Integrates: ParticleBackground, ToastProvider, StatsBar, scroll-reveal,
 * polished transitions between upload → loading → results.
 */

import { useEffect, useRef, useState } from 'react'
import BioSection from './components/BioSection'
import EducationSection from './components/EducationSection'
import ExperienceSection from './components/ExperienceSection'
import ExportButton from './components/ExportButton'
import LoadingSpinner from './components/LoadingSpinner'
import MatchScore from './components/MatchScore'
import Navbar from './components/Navbar'
import ParticleBackground from './components/ParticleBackground'
import SkillsSection from './components/SkillsSection'
import StatsBar from './components/StatsBar'
import { ToastProvider, useToast } from './components/Toast'
import UploadZone from './components/UploadZone'
import { useParse } from './hooks/useParse'

/* ---- Inner app that can use the toast context ---- */
function AppInner() {
  const { parse, data, loading, progress, error, reset } = useParse()
  const [selectedFile, setSelectedFile] = useState(null)
  const resultsRef = useRef(null)
  const addToast = useToast()

  // Auto-scroll to results when parsing completes
  useEffect(() => {
    if (data && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
      addToast({
        type: 'success',
        title: 'Resume parsed!',
        message: `${data.filename} processed successfully.`,
        duration: 3500,
      })
    }
  }, [data])

  // Scroll-reveal for results sections
  useEffect(() => {
    if (!data) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    const targets = document.querySelectorAll('.reveal')
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [data])

  const handleFile = async (file) => {
    setSelectedFile(file)
    await parse(file)
  }

  const handleReset = () => {
    reset()
    setSelectedFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const FEATURE_PILLS = [
    '📧 Contact Extraction',
    '🎓 Education',
    '💼 Experience',
    '🛠️ Skills AI',
    '📊 JD Matching',
    '⬇️ JSON & CSV Export',
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Animated background orbs */}
      <ParticleBackground />

      {/* Everything else sits above the orbs */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        <main style={{ flex: 1 }}>
          {/* ============================================================
              Hero / Upload Section
          ============================================================ */}
          <section style={{
            padding: 'clamp(48px, 8vw, 96px) 0 clamp(40px, 6vw, 64px)',
            textAlign: 'center',
          }}>
            <div className="container">
              {/* Headline — only when no data */}
              {!data && (
                <div style={{ marginBottom: '48px', animation: 'fadeInUp 0.6s ease' }}>
                  {/* Top badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 18px',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
                    border: '1px solid rgba(99, 102, 241, 0.28)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: 'var(--text-accent)',
                    marginBottom: '24px',
                    backdropFilter: 'blur(8px)',
                    letterSpacing: '0.01em',
                  }}>
                    ✨ Powered by Gemini 2.5 Flash &amp; spaCy NLP
                  </div>

                  <h1 style={{
                    fontSize: 'clamp(2rem, 6vw, 3.75rem)',
                    fontWeight: '900',
                    letterSpacing: '-0.035em',
                    lineHeight: 1.08,
                    marginBottom: '18px',
                  }}>
                    <span className="gradient-text">Parse Any Resume</span>
                    <br />
                    <span style={{ color: 'var(--text-primary)' }}>in Seconds</span>
                  </h1>

                  <p style={{
                    fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                    color: 'var(--text-secondary)',
                    maxWidth: '540px',
                    margin: '0 auto 24px',
                    lineHeight: 1.75,
                  }}>
                    Upload a PDF or DOCX resume and instantly extract name, contact info, skills, education, and experience — structured and ready to use.
                  </p>

                  {/* Feature pills */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    {FEATURE_PILLS.map((f) => (
                      <span key={f} style={{
                        padding: '5px 14px',
                        borderRadius: '999px',
                        background: 'rgba(148, 163, 184, 0.06)',
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload / Loading / Reset */}
              {loading ? (
                <div className="glass-card" style={{
                  maxWidth: '640px',
                  margin: '0 auto',
                  background: 'rgba(10, 15, 30, 0.7)',
                  animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                }}>
                  <LoadingSpinner progress={progress} />
                </div>
              ) : !data ? (
                <UploadZone onFile={handleFile} disabled={loading} />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <button
                    id="parse-another-btn"
                    className="btn-secondary"
                    onClick={handleReset}
                  >
                    ← Parse Another Resume
                  </button>
                </div>
              )}

              {/* Error banner */}
              {error && !loading && (
                <div style={{
                  maxWidth: '620px',
                  margin: '16px auto 0',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'rgba(248, 113, 113, 0.07)',
                  border: '1px solid rgba(248, 113, 113, 0.22)',
                  color: 'var(--error)',
                  animation: 'fadeInUp 0.3s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '5px', fontSize: '0.9rem' }}>
                      Parsing Failed
                    </div>
                    <div style={{ fontSize: '0.82rem', opacity: 0.85, lineHeight: 1.5 }}>{error}</div>
                    <button
                      id="retry-btn"
                      onClick={() => parse(selectedFile)}
                      className="btn-primary"
                      style={{ marginTop: '12px', padding: '8px 18px', fontSize: '0.8rem' }}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ============================================================
              Results Section
          ============================================================ */}
          {data && (
            <section ref={resultsRef} style={{ paddingBottom: '80px' }}>
              <div className="container">
                {/* Success badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  background: 'rgba(52, 211, 153, 0.05)',
                  border: '1px solid rgba(52, 211, 153, 0.18)',
                  animation: 'fadeIn 0.4s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '9px', height: '9px', borderRadius: '50%',
                      background: 'var(--success)', display: 'inline-block',
                      boxShadow: '0 0 10px var(--success)',
                      animation: 'pulseGlow 2s ease-in-out infinite',
                    }} />
                    <span style={{ fontSize: '0.84rem', color: 'var(--success)', fontWeight: '700' }}>
                      Successfully parsed
                    </span>
                    <span style={{
                      padding: '2px 10px', borderRadius: '999px',
                      background: 'rgba(52, 211, 153, 0.1)',
                      border: '1px solid rgba(52, 211, 153, 0.2)',
                      fontSize: '0.74rem', color: 'var(--text-secondary)',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {data.filename}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    ID: {data.id?.slice(0, 8)}…
                  </span>
                </div>

                {/* Stats bar */}
                <StatsBar data={data} />

                {/* Bio — full width */}
                <div className="reveal" style={{ marginBottom: '20px' }}>
                  <BioSection data={data} />
                </div>

                {/* Education + Experience — 2 columns */}
                <div
                  className="reveal"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px',
                  }}
                >
                  <EducationSection education={data.education} />
                  <ExperienceSection experience={data.experience} />
                </div>

                {/* Skills — full width */}
                {data.skills?.length > 0 && (
                  <div className="reveal" style={{ marginBottom: '20px' }}>
                    <SkillsSection skills={data.skills} />
                  </div>
                )}

                {/* JD Match */}
                <div className="reveal" style={{ marginBottom: '20px' }}>
                  <MatchScore resumeId={data.id} />
                </div>

                {/* Export */}
                <div className="reveal">
                  <ExportButton data={data} />
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          background: 'rgba(10, 15, 30, 0.55)',
          backdropFilter: 'blur(12px)',
        }}>
          <div className="container">
            <div style={{ marginBottom: '6px' }}>
              Built with ❤️ using{' '}
              <span style={{ color: 'var(--text-accent)' }}>Gemini 2.5 Flash</span> ·{' '}
              <span style={{ color: 'var(--text-accent)' }}>FastAPI</span> ·{' '}
              <span style={{ color: 'var(--text-accent)' }}>React</span> ·{' '}
              <span style={{ color: 'var(--text-accent)' }}>spaCy</span>
            </div>
            <span style={{ opacity: 0.5 }}>ResumeIQ — AI-Powered Resume Parser</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

/* ---- Root export wraps with ToastProvider ---- */
export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}
