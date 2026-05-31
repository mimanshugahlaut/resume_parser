/**
 * UploadZone.jsx — Enhanced drag-and-drop file upload zone
 * Features: animated SVG illustration, idle glow ring, file preview badge,
 * smooth drag-over transitions, scale on hover.
 */

import { useRef, useState } from 'react'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadIllustration({ isDragOver }) {
  return (
    <svg
      width="80" height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        marginBottom: '18px',
        filter: isDragOver
          ? 'drop-shadow(0 0 16px rgba(99,102,241,0.7))'
          : 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
        transition: 'filter 0.3s ease',
        transform: isDragOver ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s ease',
      }}
    >
      {/* Document base */}
      <rect x="12" y="8" width="44" height="56" rx="6" fill="url(#docGrad)" opacity="0.9"/>
      {/* Fold corner */}
      <path d="M44 8 L56 20 L44 20 Z" fill="rgba(0,0,0,0.25)"/>
      <path d="M44 8 L56 20 L44 20 Z" fill="url(#foldGrad)" opacity="0.5"/>
      {/* Lines on doc */}
      <rect x="20" y="30" width="24" height="2.5" rx="1.25" fill="rgba(255,255,255,0.35)"/>
      <rect x="20" y="37" width="18" height="2.5" rx="1.25" fill="rgba(255,255,255,0.25)"/>
      <rect x="20" y="44" width="20" height="2.5" rx="1.25" fill="rgba(255,255,255,0.2)"/>
      {/* Upload arrow circle */}
      <circle cx="58" cy="58" r="16" fill="url(#arrowGrad)" />
      <circle cx="58" cy="58" r="16" fill="rgba(0,0,0,0.1)" />
      {/* Up arrow */}
      <path d="M58 52 L58 65" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M53 57 L58 52 L63 57" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Defs */}
      <defs>
        <linearGradient id="docGrad" x1="12" y1="8" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8"/>
          <stop offset="100%" stopColor="#6366F1"/>
        </linearGradient>
        <linearGradient id="foldGrad" x1="44" y1="8" x2="56" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
        <linearGradient id="arrowGrad" x1="42" y1="42" x2="74" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function UploadZone({ onFile, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef(null)

  const validateFile = (file) => {
    if (!file) return 'No file selected.'
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type. Please upload a PDF or DOCX file.`
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is ${MAX_SIZE_MB} MB.`
    }
    return null
  }

  const handleFile = (file) => {
    const err = validateFile(file)
    if (err) {
      setValidationError(err)
      setSelectedFile(null)
      return
    }
    setValidationError(null)
    setSelectedFile(file)
    onFile(file)
  }

  const onDragOver = (e) => { e.preventDefault(); if (!disabled) setIsDragOver(true) }
  const onDragLeave = (e) => { e.preventDefault(); setIsDragOver(false) }
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const getFileIcon = (name) => {
    if (!name) return '📄'
    if (name.endsWith('.pdf')) return '📕'
    if (name.endsWith('.docx')) return '📘'
    return '📄'
  }

  return (
    <div style={{ width: '100%', maxWidth: '620px', margin: '0 auto' }}>
      {/* Wrapper with idle glow ring */}
      <div style={{ position: 'relative' }}>
        {/* Spinning idle ring */}
        {!isDragOver && !disabled && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '-3px',
              borderRadius: '23px',
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(99,102,241,0.3) 25%, rgba(139,92,246,0.3) 50%, rgba(34,211,238,0.2) 75%, transparent 100%)',
              animation: 'spin 5s linear infinite',
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          />
        )}
        {/* Inner mask to hide the ring under the card */}
        {!isDragOver && !disabled && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '1px',
              borderRadius: '21px',
              background: 'var(--bg-primary)',
              pointerEvents: 'none',
            }}
          />
        )}

        <div
          id="upload-zone"
          role="button"
          tabIndex={0}
          aria-label="Upload resume — click or drag and drop a PDF or DOCX file"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
          style={{
            position: 'relative',
            borderRadius: '20px',
            padding: '52px 36px',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            background: isDragOver
              ? 'rgba(99, 102, 241, 0.14)'
              : 'rgba(15, 23, 42, 0.65)',
            border: `2px dashed ${isDragOver ? 'var(--accent-indigo)' : 'rgba(148, 163, 184, 0.18)'}`,
            boxShadow: isDragOver
              ? '0 0 40px rgba(99, 102, 241, 0.3), inset 0 0 40px rgba(99, 102, 241, 0.06)'
              : '0 4px 24px rgba(0,0,0,0.2)',
            opacity: disabled ? 0.55 : 1,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onInputChange}
            disabled={disabled}
            style={{ display: 'none' }}
            id="file-input"
            aria-label="File input"
          />

          {/* SVG illustration */}
          <UploadIllustration isDragOver={isDragOver} />

          {/* Main text */}
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            color: isDragOver ? 'var(--text-accent)' : 'var(--text-primary)',
            marginBottom: '8px',
            transition: 'color 0.25s',
          }}>
            {isDragOver ? '🎯 Drop it to parse!' : 'Drop your resume here'}
          </h2>

          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
          }}>
            {isDragOver
              ? 'Release to start parsing instantly'
              : 'Drag & drop, or click to browse your files'}
          </p>

          {/* Browse button */}
          <button
            type="button"
            className="btn-primary"
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
            style={{ pointerEvents: disabled ? 'none' : 'auto' }}
            id="browse-files-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Browse Files
          </button>

          {/* Format badges */}
          <div style={{
            marginTop: '22px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
          }}>
            {['PDF', 'DOCX'].map(fmt => (
              <span key={fmt} style={{
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(148, 163, 184, 0.07)',
                border: '1px solid rgba(148, 163, 184, 0.14)',
                fontSize: '0.7rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
              }}>
                {fmt}
              </span>
            ))}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>·</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Max 5 MB</span>
          </div>
        </div>
      </div>

      {/* File preview badge */}
      {selectedFile && !validationError && (
        <div className="file-preview-badge">
          <span style={{ fontSize: '22px' }}>{getFileIcon(selectedFile.name)}</span>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: '600',
              color: 'var(--success)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {formatBytes(selectedFile.size)} · Uploading…
            </div>
          </div>
          <div style={{
            width: '18px', height: '18px',
            border: '2px solid var(--success)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0,
          }} />
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(248, 113, 113, 0.08)',
          border: '1px solid rgba(248, 113, 113, 0.25)',
          color: 'var(--error)',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeInUp 0.3s ease',
        }}>
          ⚠️ {validationError}
        </div>
      )}
    </div>
  )
}
