import { useState, useEffect, useCallback } from 'react'
import type { Announcement } from '../types'
import * as announcementsApi from '../api/announcements'

export function useAnnouncements(page = 1, limit = 20) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await announcementsApi.listAnnouncements(page, limit)
      setAnnouncements(res.announcements)
      setTotal(res.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => { fetchList() }, [fetchList])

  return { announcements, total, loading, error, refetch: fetchList }
}

export function useAnnouncement(id: string) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    announcementsApi.getAnnouncement(id)
      .then(res => setAnnouncement(res.announcement))
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load announcement'))
      .finally(() => setLoading(false))
  }, [id])

  return { announcement, loading, error }
}

export function useCreateAnnouncement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = useCallback(async (data: { title: string; content: string; image?: File }) => {
    setLoading(true)
    setError('')
    try {
      const res = await announcementsApi.createAnnouncement(data)
      return res.announcement
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create announcement')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}

export function useDeleteAnnouncement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError('')
    try {
      await announcementsApi.deleteAnnouncement(id)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete announcement')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { remove, loading, error }
}
