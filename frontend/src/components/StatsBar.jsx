/**
 * StatsBar.jsx — Animated metric tiles shown after a successful parse.
 * Displays skill count, education count, experience count, and a
 * "completeness" score.
 */

import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 1000, delay = 0) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay])

  return count
}

export default function StatsBar({ data }) {
  const skillsCount = data?.skills?.length ?? 0
  const eduCount    = data?.education?.length ?? 0
  const expCount    = data?.experience?.length ?? 0

  // Simple completeness: 25pts per populated section (name, email, edu, exp)
  const completeness = Math.min(
    100,
    (data?.name  ? 20 : 0) +
    (data?.email ? 20 : 0) +
    (eduCount > 0 ? 20 : 0) +
    (expCount > 0 ? 20 : 0) +
    (skillsCount > 0 ? 20 : 0)
  )

  const animSkills  = useCountUp(skillsCount, 900, 200)
  const animEdu     = useCountUp(eduCount, 700, 350)
  const animExp     = useCountUp(expCount, 700, 500)
  const animScore   = useCountUp(completeness, 1000, 650)

  const tiles = [
    {
      key: 'skills',
      icon: '🛠️',
      value: animSkills,
      label: 'Skills Found',
      variant: 'skills',
    },
    {
      key: 'edu',
      icon: '🎓',
      value: animEdu,
      label: 'Education',
      variant: 'edu',
    },
    {
      key: 'exp',
      icon: '💼',
      value: animExp,
      label: 'Experience',
      variant: 'exp',
    },
    {
      key: 'score',
      icon: '⭐',
      value: animScore + '%',
      label: 'Profile Score',
      variant: 'score',
    },
  ]

  return (
    <div className="stats-bar" role="region" aria-label="Resume stats summary">
      {tiles.map((tile, i) => (
        <div
          key={tile.key}
          className={`stat-tile stat-tile--${tile.variant}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <span className="stat-tile__icon">{tile.icon}</span>
          <div className={`stat-tile__value`}>{tile.value}</div>
          <div className="stat-tile__label">{tile.label}</div>
        </div>
      ))}
    </div>
  )
}
