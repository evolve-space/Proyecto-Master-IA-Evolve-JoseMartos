import { useCallback, useEffect, useState } from 'react'

export function useEntityFicha(id, fetchFicha) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchFicha(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, tick])

  return {
    data,
    loading,
    error,
    entity: data?.entity,
    stats: data?.stats ?? {},
    items: data?.items ?? [],
    reload,
  }
}

export function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = String(d).split('-')
  return day && m && y ? `${day}/${m}/${y}` : d
}
