import { useState, useEffect, useCallback } from 'react'
import type { QueryConstraint } from 'firebase/firestore'

type FirestoreService<T> = {
  getAll: (constraints?: QueryConstraint[]) => Promise<T[]>
  getById: (id: string) => Promise<T | null>
  create: (data: any) => Promise<T>
  update: (id: string, data: any) => Promise<void>
  delete: (id: string) => Promise<void>
  where: (...args: any[]) => QueryConstraint
  orderBy: (...args: any[]) => QueryConstraint
  limit: (...args: any[]) => QueryConstraint
}

interface UseFirestoreListOptions {
  constraints?: QueryConstraint[]
  enabled?: boolean
}

export function useFirestoreList<T>(
  service: FirestoreService<T>,
  options: UseFirestoreListOptions = {}
) {
  const { constraints = [], enabled = true } = options
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const result = await service.getAll(constraints)
      setData(result)
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch, setData }
}

export function useFirestoreItem<T>(service: FirestoreService<T>, id?: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const result = await service.getById(id)
      setData(result)
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
