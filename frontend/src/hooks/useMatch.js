/**
 * useMatch.js — Custom hook for JD match scoring state management
 */

import { useCallback, useState } from 'react'
import { matchResume } from '../services/api'

/**
 * Hook for managing the JD match scoring flow.
 * @returns {{ match, result, loading, error, reset }}
 */
export function useMatch() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const match = useCallback(async (resumeId, jobDescription) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await matchResume(resumeId, jobDescription)
      setResult(data)
      return data
    } catch (err) {
      setError(err.message || 'Failed to score match.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return { match, result, loading, error, reset }
}
