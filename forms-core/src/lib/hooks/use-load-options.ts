'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SearchSelectOption } from '../form-types'

/**
 * Drives `loadOptions`-based async search selects (REST, tRPC, fetch — any
 * promise-returning source). Fetches with '' on mount, refetches per search
 * term, ignores stale responses, and exposes { options, loading,
 * handleSearchChange } in the same shape the Apollo fields use.
 *
 * `debounceMs` debounces the fetch inside the hook — pass 0 when the caller
 * already debounces (e.g. web's SearchSelectBase input).
 */
export function useLoadOptions(
  loadOptions: ((search: string) => Promise<SearchSelectOption[]>) | undefined,
  initialOptions: SearchSelectOption[] = [],
  debounceMs = 0,
) {
  const [options, setOptions] = useState<SearchSelectOption[]>(initialOptions)
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadOptionsRef = useRef(loadOptions)
  loadOptionsRef.current = loadOptions

  const runSearch = useCallback(async (searchTerm: string) => {
    const load = loadOptionsRef.current
    if (!load) return

    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const result = await load(searchTerm)
      // A newer request may have finished first — never let a stale
      // response overwrite it
      if (requestId === requestIdRef.current) {
        setOptions(result)
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.warn('loadOptions failed:', error)
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const handleSearchChange = useCallback(
    (searchTerm: string) => {
      if (!loadOptionsRef.current) return
      if (timerRef.current) clearTimeout(timerRef.current)
      if (debounceMs > 0) {
        timerRef.current = setTimeout(() => runSearch(searchTerm), debounceMs)
      } else {
        runSearch(searchTerm)
      }
    },
    [debounceMs, runSearch],
  )

  // Initial fetch (undebounced) and timer cleanup
  const hasLoadOptions = !!loadOptions
  useEffect(() => {
    if (hasLoadOptions) {
      runSearch('')
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hasLoadOptions, runSearch])

  return { options, loading, handleSearchChange }
}
