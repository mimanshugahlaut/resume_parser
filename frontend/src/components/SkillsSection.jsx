/**
 * SkillsSection.jsx — Color-coded skill chips by category + search filter
 * Categories: tech (cyan), framework (purple), tool (green), soft (amber), default (indigo)
 */

import { useMemo, useState } from 'react'

/* ---- Keyword sets for auto-categorisation ---- */
const TECH_KEYWORDS = new Set([
  'python','javascript','typescript','java','c++','c#','c','go','rust','ruby','swift','kotlin',
  'php','scala','r','matlab','sql','html','css','bash','shell','assembly','perl','dart',
  'html5','css3','xml','json','yaml','graphql','sass','less',
])
const FRAMEWORK_KEYWORDS = new Set([
  'react','angular','vue','svelte','next.js','nextjs','nuxt','gatsby','express','fastapi',
  'django','flask','spring','rails','laravel','asp.net','.net','tensorflow','pytorch',
  'keras','scikit-learn','pandas','numpy','redux','tailwind','tailwindcss','bootstrap',
  'material ui','chakra','styled-components','jquery','backbone','ember','meteor',
  'nest.js','nestjs','strapi','prisma','sequelize','mongoose','graphql',
])
const TOOL_KEYWORDS = new Set([
  'git','github','gitlab','docker','kubernetes','k8s','aws','azure','gcp','google cloud',
  'terraform','ansible','jenkins','ci/cd','linux','unix','nginx','apache','redis','mongodb',
  'postgresql','mysql','sqlite','firebase','supabase','vercel','netlify','heroku',
  'figma','jira','confluence','notion','slack','vscode','intellij','postman','linux',
  'bash','zsh','webpack','vite','babel','eslint','jest','pytest','selenium','cypress',
])
const SOFT_KEYWORDS = new Set([
  'communication','leadership','teamwork','problem solving','critical thinking',
  'time management','adaptability','creativity','collaboration','presentation',
  'mentoring','agile','scrum','kanban','project management','analytical',
  'interpersonal','negotiation','strategic','planning','detail-oriented','organized',
])

function categorise(skill) {
  const s = skill.toLowerCase().trim()
  if (TECH_KEYWORDS.has(s))      return 'tech'
  if (FRAMEWORK_KEYWORDS.has(s)) return 'framework'
  if (TOOL_KEYWORDS.has(s))      return 'tool'
  if (SOFT_KEYWORDS.has(s))      return 'soft'
  // Partial match fallback
  for (const k of TECH_KEYWORDS)      if (s.includes(k) || k.includes(s)) return 'tech'
  for (const k of FRAMEWORK_KEYWORDS) if (s.includes(k) || k.includes(s)) return 'framework'
  for (const k of TOOL_KEYWORDS)      if (s.includes(k) || k.includes(s)) return 'tool'
  for (const k of SOFT_KEYWORDS)      if (s.includes(k) || k.includes(s)) return 'soft'
  return 'default'
}

const CATEGORY_LABELS = {
  tech:      { label: 'Languages',  color: '#67E8F9' },
  framework: { label: 'Frameworks', color: '#C4B5FD' },
  tool:      { label: 'Tools',      color: '#6EE7B7' },
  soft:      { label: 'Soft Skills', color: '#FDE68A' },
  default:   { label: 'Other',      color: '#A5B4FC' },
}

const FILTER_OPTIONS = ['All', 'Languages', 'Frameworks', 'Tools', 'Soft Skills', 'Other']
const LABEL_TO_CAT = {
  All: null,
  Languages: 'tech',
  Frameworks: 'framework',
  Tools: 'tool',
  'Soft Skills': 'soft',
  Other: 'default',
}

export default function SkillsSection({ skills = [] }) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const categorised = useMemo(() =>
    skills.map((skill) => ({ skill, category: categorise(skill) })),
    [skills]
  )

  const filtered = useMemo(() => {
    let result = categorised
    if (activeFilter !== 'All') {
      const cat = LABEL_TO_CAT[activeFilter]
      result = result.filter((s) => s.category === cat)
    }
    if (search.trim()) {
      result = result.filter((s) =>
        s.skill.toLowerCase().includes(search.toLowerCase())
      )
    }
    return result
  }, [categorised, search, activeFilter])

  if (!skills.length) return null

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '28px 32px', animationDelay: '0.2s' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div className="section-label" style={{ marginBottom: 0 }}>
          <span>🛠️</span> Skills
          <span style={{
            marginLeft: '8px',
            padding: '2px 9px',
            borderRadius: '999px',
            background: 'rgba(99, 102, 241, 0.15)',
            fontSize: '0.7rem',
            color: 'var(--text-accent)',
            fontWeight: '700',
          }}>
            {filtered.length}{search || activeFilter !== 'All' ? ` / ${skills.length}` : ''}
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="skill-search-wrapper">
        <svg className="skill-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          className="skill-search"
          placeholder="Search skills…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search skills"
        />
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt
          const cat = LABEL_TO_CAT[opt]
          const meta = cat ? CATEGORY_LABELS[cat] : null
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setActiveFilter(opt)}
              style={{
                padding: '4px 13px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: '600',
                cursor: 'pointer',
                border: `1px solid ${isActive
                  ? (meta ? meta.color + '66' : 'rgba(99,102,241,0.5)')
                  : 'rgba(148,163,184,0.14)'}`,
                background: isActive
                  ? (meta ? meta.color + '1A' : 'rgba(99,102,241,0.12)')
                  : 'transparent',
                color: isActive
                  ? (meta ? meta.color : 'var(--text-accent)')
                  : 'var(--text-muted)',
                transition: 'all 0.2s ease',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Skill chips */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {filtered.map(({ skill, category }, i) => (
            <span
              key={i}
              className={`skill-chip skill-chip--${category}`}
              style={{ animationDelay: `${Math.min(i * 0.025, 0.5)}s` }}
              title={`${skill} · ${CATEGORY_LABELS[category]?.label}`}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}>
          No skills match "{search || activeFilter}"
        </div>
      )}

      {/* Category legend */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        {Object.entries(CATEGORY_LABELS).map(([key, { label, color }]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: color,
              display: 'inline-block',
              boxShadow: `0 0 6px ${color}88`,
            }}/>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
