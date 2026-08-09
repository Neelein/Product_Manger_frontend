import { useCallback, useEffect, useState } from 'react'
import type { Category } from '../types'
import * as categoriesApi from '../api/categories'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await categoriesApi.listCategories()
      setCategories(res.categories)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  return { categories, loading, error, reload }
}