/**
 * ExperienceSection.jsx — Work experience timeline with company avatars,
 * hover effects, and gradient accents.
 */

function getInitial(text = '') {
  return text.trim()[0]?.toUpperCase() || '?'
}

export default function ExperienceSection({ experience = [] }) {
  if (!experience.length) return null

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '28px 32px', animationDelay: '0.15s' }}>
      <div className="section-label">
        <span>💼</span> Experience
        <span style={{
          marginLeft: '8px',
          padding: '1px 8px',
          borderRadius: '999px',
          background: 'rgba(6,182,212,0.12)',
          fontSize: '0.7rem',
          color: 'var(--accent-cyan)',
          fontWeight: '700',
        }}>{experience.length}</span>
      </div>

      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {experience.map((exp, i) => (
          <ExperienceCard key={i} exp={exp} />
        ))}
      </div>
    </div>
  )
}

function ExperienceCard({ exp }) {
  return (
    <div
      className="timeline-item"
      style={{ paddingLeft: '32px', paddingBottom: '8px' }}
    >
      <div className="timeline-dot" style={{ background: 'var(--gradient-accent)' }} />
      <div
        style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'rgba(6,182,212,0.04)',
          border: '1px solid rgba(6,182,212,0.1)',
          transition: 'all 0.25s ease',
          cursor: 'default',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(6,182,212,0.09)'
          e.currentTarget.style.borderColor = 'rgba(6,182,212,0.28)'
          e.currentTarget.style.transform = 'translateX(4px)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(6,182,212,0.04)'
          e.currentTarget.style.borderColor = 'rgba(6,182,212,0.1)'
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Company letter avatar */}
        <div className="avatar-circle avatar-circle--sm avatar-circle--exp">
          {getInitial(exp.company || exp.title)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '0.92rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '3px',
            lineHeight: 1.35,
          }}>
            {exp.title}
          </h3>
          <p style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '6px',
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {exp.company}
          </p>
          {exp.duration && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.2)',
              fontSize: '0.7rem',
              fontWeight: '600',
              color: 'var(--accent-cyan)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              📅 {exp.duration}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
