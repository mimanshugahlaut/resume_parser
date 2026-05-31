/**
 * EducationSection.jsx — Education timeline with letter avatars,
 * hover expand effect, and animated timeline dots.
 */

function getInitial(text = '') {
  return text.trim()[0]?.toUpperCase() || '?'
}

export default function EducationSection({ education = [] }) {
  if (!education.length) return null

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '28px 32px', animationDelay: '0.1s' }}>
      <div className="section-label">
        <span>🎓</span> Education
        <span style={{
          marginLeft: '8px',
          padding: '1px 8px',
          borderRadius: '999px',
          background: 'rgba(99,102,241,0.12)',
          fontSize: '0.7rem',
          color: 'var(--text-accent)',
          fontWeight: '700',
        }}>{education.length}</span>
      </div>

      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {education.map((edu, i) => (
          <EducationCard key={i} edu={edu} />
        ))}
      </div>
    </div>
  )
}

function EducationCard({ edu }) {
  return (
    <div
      className="timeline-item"
      style={{ paddingLeft: '32px', paddingBottom: '8px' }}
    >
      <div className="timeline-dot" />
      <div
        style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'rgba(99,102,241,0.04)',
          border: '1px solid rgba(99,102,241,0.1)',
          transition: 'all 0.25s ease',
          cursor: 'default',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(99,102,241,0.09)'
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.28)'
          e.currentTarget.style.transform = 'translateX(4px)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(99,102,241,0.04)'
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.1)'
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Letter avatar */}
        <div className="avatar-circle avatar-circle--sm avatar-circle--edu">
          {getInitial(edu.institution || edu.degree)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '0.92rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '3px',
            lineHeight: 1.35,
          }}>
            {edu.degree}
          </h3>
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-accent)',
            fontWeight: '500',
            marginBottom: '6px',
          }}>
            {edu.institution}
          </p>
          {edu.year && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              fontSize: '0.7rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              📅 {edu.year}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
