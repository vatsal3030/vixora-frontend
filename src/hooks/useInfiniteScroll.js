import { useState, useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(fetchFunction, key = 0, initialLimit = 20) {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  
  const observerRef = useRef(null)

  const loadMore = useCallback(async (currentPage) => {
    setLoading(true)
    setError(null)
    
    try {
      const newItems = await fetchFunction(currentPage, initialLimit)
      
      if (Array.isArray(newItems) && newItems.length > 0) {
        setData(prev => currentPage === 1 ? newItems : [...prev, ...newItems])
        setHasMore(newItems.length === initialLimit)
        setPage(currentPage + 1)
      } else {
        if (currentPage === 1) setData([])
        setHasMore(false)
      }
    } catch (err) {
      console.error('Load error:', err)
      setError(err?.message || 'Failed to load data')
      if (currentPage === 1) setData([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, initialLimit])

  // Initial load and reset on key change
  useEffect(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
    loadMore(1)
  }, [key])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore(page)
        }
      },
      { threshold: 0.5 }
    )

    const currentTarget = observerRef.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, page, loadMore])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
    setLoading(true)
    // Trigger reload
    setTimeout(() => loadMore(1), 0)
  }, [loadMore])

  return {
    data,
    loading,
    hasMore,
    error,
    observerRef,
    reset
  }
}
