/**
 * MatchScore.jsx — JD matching UI with animated score display
 * Enhanced: char counter, improved loading state, polished result layout
 */

import { useRef, useState } from 'react'
import { useMatch } from '../hooks/useMatch'
import { useToast } from './Toast'

export default function MatchScore({ resumeId }) {
  const [jobDescription, setJobDescription] = useState('')
  const { match, result, loading, error, reset } = useMatch()
  const textareaRef = useRef(null)
  const addToast = useToast()

  const handleMatch = async () => {
    if (!jobDescription.trim()) return
    const res = await match(resumeId, jobDescription)
    if (res) {
      addToast({
        type: res.match_score >= 60 ? 'success' : 'info',
        title: `Match Score: ${res.match_score}%`,
        message: getScoreLabel(res.match_score),
        duration: 3000,
      })
    }
  }

  const handleReset = () => {
    setJobDescription('')
    reset()
  }

  const score = result?.match_score ?? 0

  const getScoreColor = (s) => {
    if (s >= 71) return '#34D399'
    if (s >= 41) return '#FBBF24'
    return '#F87171'
  }

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Excellent Match 🎉'
    if (s >= 60) return 'Good Match ✅'
    if (s >= 40) return 'Moderate Match ⚡'
    return 'Low Match ❌'
  }

  const getScoreGradient = (s) => {
    if (s >= 71) return 'var(--gradient-success)'
    if (s >= 41) return 'linear-gradient(135deg, #F59E0B, #FBBF24)'
    return 'linear-gradient(135deg, #EF4444, #F87171)'
  }

  // SVG circle math
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (score / 100) * circumference
  const scoreColor = getScoreColor(score)

  const charCount = jobDescription.length
  const charLimit = 4000

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '28px 32px', animationDelay: '0.25s' }}>
      <div className="section-label">
        <span>📊</span> JD Match Score
      </div>

      {!result ? (
        /* ---- Input state ---- */
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.6 }}>
            Paste a job description below to see how well this resume matches. Our AI will score skills and give a recommendation.
          </p>

          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              id="job-description-input"
              className="glass-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value.slice(0, charLimit))}
              placeholder="We are looking for a Python developer with experience in Machine Learning, FastAPI, Docker…"
              rows={5}
              disabled={loading}
              style={{ paddingBottom: '32px' }}
            />
            {/* Char counter */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '14px',
              fontSize: '0.68rem',
              color: charCount > charLimit * 0.9 ? 'var(--warning)' : 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
              pointerEvents: 'none',
            }}>
              {charCount}/{charLimit}
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.82rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ {error}
            </p>
          )}

          <div style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              id="match-now-btn"
              className="btn-primary"
              onClick={handleMatch}
              disabled={loading || !jobDescription.trim()}
            >
              {loading ? (
                <>
                  <span style={{ animation: 'spin 0.9s linear infinite', display: 'inline-block', fontSize: '14px' }}>⚙️</span>
                  Analyzing…
                </>
              ) : (
                <>🎯 Match Now</>
              )}
            </button>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Powered by Gemini 2.5 Flash
            </span>
          </div>
        </div>
      ) : (
        /* ---- Result state ---- */
        <div style={{ animation: 'fadeInUp 0.5s ease' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '28px',
            alignItems: 'start',
            marginBottom: '24px',
          }}>
            {/* Circular score gauge */}
            <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
              <svg width="110" height="110" viewBox="0 0 100 100">
                {/* Track */}
                <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                {/* Arc */}
                <circle
                  cx="50" cy="50" r={radius}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  transform="rotate(-90 50 50)"
                  style={{
                    transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
                    filter: `drop-shadow(0 0 8px ${scoreColor}88)`,
                  }}
                />
                {/* Score label */}
                <text
                  x="50" y="46"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="20"
                  fontWeight="800"
                  fill={scoreColor}
                  fontFamily="Inter, sans-serif"
                >
                  {score}%
                </text>
                <text
                  x="50" y="62"
                  textAnchor="middle"
                  fontSize="7"
                  fill="rgba(148,163,184,0.7)"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  textTransform="uppercase"
                >
                  MATCH
                </text>
              </svg>
            </div>

            {/* Right details */}
            <div>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '8px',
                letterSpacing: '-0.01em',
              }}>
                {getScoreLabel(score)}
              </h3>

              {result.recommendation && (
                <p style={{
                  fontSize: '0.83rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '16px',
                  fontStyle: 'italic',
                }}>
                  "{result.recommendation}"
                </p>
              )}

              {/* Matched skills */}
              {result.matched_skills?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '0.68rem', fontWeight: '800', color: 'var(--success)',
                    textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '7px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    ✅ Matched ({result.matched_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.matched_skills.map((s, i) => (
                      <span key={i} style={{
                        padding: '3px 11px', borderRadius: '999px',
                        background: 'rgba(52,211,153,0.1)',
                        border: '1px solid rgba(52,211,153,0.28)',
                        fontSize: '0.75rem', fontWeight: '500', color: 'var(--success)',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {result.missing_skills?.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '0.68rem', fontWeight: '800', color: 'var(--error)',
                    textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '7px',
                  }}>
                    ❌ Missing ({result.missing_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.missing_skills.map((s, i) => (
                      <span key={i} style={{
                        padding: '3px 11px', borderRadius: '999px',
                        background: 'rgba(248,113,113,0.09)',
                        border: '1px solid rgba(248,113,113,0.26)',
                        fontSize: '0.75rem', fontWeight: '500', color: 'var(--error)',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            id="match-reset-btn"
            className="btn-secondary"
            onClick={handleReset}
            style={{ fontSize: '0.82rem' }}
          >
            🔄 Try Another JD
          </button>
        </div>
      )}
    </div>
  )
}
