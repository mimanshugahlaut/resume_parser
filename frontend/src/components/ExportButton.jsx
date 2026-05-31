/**
 * ExportButton.jsx — JSON & CSV export + Copy JSON with toast notifications
 */

import { useToast } from './Toast'

export default function ExportButton({ data }) {
  const addToast = useToast()

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `${sanitiseName(data.name)}_resume.json`)
    addToast({ type: 'success', title: 'JSON Exported', message: `${sanitiseName(data.name)}_resume.json downloaded.`, duration: 2800 })
  }

  const handleExportCSV = () => {
    const rows = [
      ['Field', 'Value'],
      ['Name', data.name],
      ['Email', data.email || ''],
      ['Phone', data.phone || ''],
      ['LinkedIn', data.linkedin || ''],
      ['Summary', data.summary || ''],
      ['Skills', (data.skills || []).join('; ')],
      ...((data.education || []).map((e, i) => [
        `Education ${i + 1}`,
        `${e.degree} | ${e.institution} | ${e.year}`,
      ])),
      ...((data.experience || []).map((e, i) => [
        `Experience ${i + 1}`,
        `${e.title} | ${e.company} | ${e.duration}`,
      ])),
    ]

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `${sanitiseName(data.name)}_resume.csv`)
    addToast({ type: 'success', title: 'CSV Exported', message: `${sanitiseName(data.name)}_resume.csv downloaded.`, duration: 2800 })
  }

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      addToast({ type: 'success', title: 'Copied!', message: 'Full JSON copied to clipboard.', duration: 2200 })
    } catch {
      addToast({ type: 'error', title: 'Copy failed', message: 'Could not access clipboard.', duration: 2500 })
    }
  }

  const jsonSize = new Blob([JSON.stringify(data)]).size
  const formatSize = (b) => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`

  return (
    <div className="glass-card animate-fade-in-up" style={{
      padding: '22px 28px',
      animationDelay: '0.3s',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        {/* Label */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '16px' }}>📦</span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Export Parsed Data
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', paddingLeft: '24px' }}>
            JSON · CSV · Clipboard &nbsp;·&nbsp; ~{formatSize(jsonSize)}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            id="export-json-btn"
            className="btn-primary"
            onClick={handleExportJSON}
            style={{ padding: '10px 18px', fontSize: '0.82rem' }}
          >
            <DownloadIcon />
            Export JSON
          </button>

          <button
            id="export-csv-btn"
            className="btn-secondary"
            onClick={handleExportCSV}
            style={{ padding: '10px 18px', fontSize: '0.82rem' }}
          >
            <DownloadIcon />
            Export CSV
          </button>

          <button
            id="copy-json-btn"
            className="btn-secondary"
            onClick={handleCopyJSON}
            style={{ padding: '10px 18px', fontSize: '0.82rem' }}
            title="Copy full JSON to clipboard"
          >
            <CopyIcon />
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  )
}

function sanitiseName(name = 'candidate') {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
