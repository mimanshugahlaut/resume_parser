/**
 * useParse.js — Custom hook for resume parsing state management
 */

import { useCallback, useState } from 'react'
import { parseResume } from '../services/api'

/**
 * Hook for managing the resume parsing flow.
 * @returns {{ parse, data, loading, progress, error, reset }}
 */
export function useParse() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const parse = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    setProgress(0)
    setData(null)

    try {
      const result = await parseResume(file, setProgress)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Failed to parse resume.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setProgress(0)
  }, [])

  return { parse, data, loading, progress, error, reset }
}
