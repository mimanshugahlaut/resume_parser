/**
 * BioSection.jsx — Candidate bio with avatar, copy-to-clipboard contacts,
 * and a styled AI-summary quote block.
 */

import { useCallback, useState } from 'react'
import { useToast } from './Toast'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  const addToast = useToast()

  const handleCopy = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        addToast({ type: 'success', title: 'Copied!', message: `${label} copied to clipboard.`, duration: 2200 })
        setTimeout(() => setCopied(false), 2000)
      } catch {
        addToast({ type: 'error', title: 'Copy failed', message: 'Could not access clipboard.', duration: 2500 })
      }
    },
    [value, label, addToast]
  )

  return (
    <div className={`copy-tooltip`} style={{ position: 'relative' }}>
      <button
        className="btn-icon"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        type="button"
        style={{
          background: copied ? 'rgba(52,211,153,0.15)' : undefined,
          borderColor: copied ? 'rgba(52,211,153,0.4)' : undefined,
          color: copied ? 'var(--success)' : undefined,
        }}
      >
        {copied ? (
          /* Checkmark */
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          /* Copy icon */
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        )}
      </button>
    </div>
  )
}

function ContactItem({ icon, label, value, href, external, id }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }}>
      <a
        id={id}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.14)',
          textDecoration: 'none',
          color: 'var(--text-primary)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          minWidth: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.13)'
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.38)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)'
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.14)'
          e.currentTarget.style.transform = 'none'
        }}
      >
        {/* SVG icon based on type */}
        <span style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(99,102,241,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          flexShrink: 0,
        }}>{icon}</span>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
            {label}
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-accent)' }}>
            {value}
          </div>
        </div>
        {external && (
          <svg style={{ opacity: 0.35, flexShrink: 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        )}
      </a>
      <CopyButton value={value} label={label} />
    </div>
  )
}

export default function BioSection({ data }) {
  const { name, email, phone, linkedin, github, summary } = data
  const initials = getInitials(name)

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '28px 32px' }}>
      {/* Header row: Avatar + Name + Summary */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '24px' }}>
        {/* Avatar circle with initials */}
        <div
          className="avatar-circle"
          aria-label={`Initials: ${initials}`}
          style={{ marginTop: '4px' }}
        >
          {initials || '?'}
        </div>

        {/* Name + Summary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            className="gradient-text"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: '800',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              marginBottom: summary ? '12px' : 0,
            }}
          >
            {name}
          </h1>

          {summary && (
            <div style={{
              position: 'relative',
              paddingLeft: '14px',
              borderLeft: '3px solid',
              borderImage: 'var(--gradient-primary) 1',
              borderImageSlice: 1,
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                fontStyle: 'italic',
              }}>
                "{summary}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact row */}
      <div className="section-label">Contact Info</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '10px',
      }}>
        {email && (
          <ContactItem
            icon="📧"
            label="Email"
            value={email}
            href={`mailto:${email}`}
            id="email-link"
          />
        )}
        {phone && (
          <ContactItem
            icon="📱"
            label="Phone"
            value={phone}
            href={`tel:${phone.replace(/\s/g, '')}`}
            id="phone-link"
          />
        )}
        {linkedin && (
          <ContactItem
            icon="🔗"
            label="LinkedIn"
            value={linkedin.replace(/^https?:\/\/(www\.)?/, '')}
            href={linkedin}
            external
            id="linkedin-link"
          />
        )}
        {github && (
          <ContactItem
            icon="🐱"
            label="GitHub"
            value={github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
            href={github.startsWith('http') ? github : `https://${github}`}
            external
            id="github-link"
          />
        )}
      </div>
    </div>
  )
}
