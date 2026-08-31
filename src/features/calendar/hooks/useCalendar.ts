import { useState, useEffect, useCallback } from 'react'
import type { CalendarDisplayEvent, CalendarEvent, CalendarEventViewer } from '../types'
import type { Announcement } from '../../announcements/types'
import type { ChatRoom } from '../../chat/types'
import * as eventsApi from '../api/events'
import * as announcementsApi from '../../announcements/api/announcements'
import * as chatApi from '../../chat/api/chat'

export function useCalendarEvents(year: number, month: number) {
  const [events, setEvents] = useState<CalendarDisplayEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [eventsRes, announcementsRes, chatRes] = await Promise.all([
        eventsApi.listEvents(year, month),
        announcementsApi.listAnnouncements(1, 100, year, month),
        chatApi.listChatRooms(year, month),
      ])

      const mapped: CalendarDisplayEvent[] = [
        ...(eventsRes.events ?? []).map(e => ({
          id: e.id,
          title: e.title,
          start_time: e.start_time,
          end_time: e.end_time,
          type: 'event' as const,
          sourceId: e.id,
          status: e.status,
          creator_name: e.creator_name,
          description: e.description,
        })),
        ...(announcementsRes.announcements ?? []).map((a: Announcement) => {
          const d = new Date(a.created_at)
          const ds = d.toISOString()
          const de = new Date(d.getTime() + 3600000).toISOString()
          return {
            id: `ann-${a.id}`,
            title: a.title,
            start_time: ds,
            end_time: de,
            type: 'announcement' as const,
            sourceId: a.id,
            creator_name: a.publisher_name,
            description: a.content,
          }
        }),
        ...(chatRes.rooms ?? []).map((r: ChatRoom) => {
          const d = new Date(r.created_at)
          const ds = d.toISOString()
          const de = new Date(d.getTime() + 3600000).toISOString()
          return {
            id: `chat-${r.id}`,
            title: r.name,
            start_time: ds,
            end_time: de,
            type: 'chat' as const,
            sourceId: r.id,
            creator_name: '',
          }
        }),
      ]
      setEvents(mapped)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { fetchList() }, [fetchList])

  return { events, displayEvents: events, loading, error, refetch: fetchList }
}

export function useCalendarEvent(id: string) {
  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEvent = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const res = await eventsApi.getEvent(id)
      setEvent(res.event)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchEvent() }, [fetchEvent])

  return { event, loading, error, setEvent, refetch: fetchEvent }
}

export function useCreateCalendarEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = useCallback(async (data: { title: string; description: string; start_time: string; end_time: string; status: string }) => {
    setLoading(true)
    setError('')
    try {
      const res = await eventsApi.createEvent(data)
      return res.event
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create event')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}

export function useUpdateCalendarEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = useCallback(async (id: string, data: { title: string; description: string; start_time: string; end_time: string; status: string }) => {
    setLoading(true)
    setError('')
    try {
      const res = await eventsApi.updateEvent(id, data)
      return res.event
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update event')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading, error }
}

export function useDeleteCalendarEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError('')
    try {
      await eventsApi.deleteEvent(id)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete event')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { remove, loading, error }
}

export function useCalendarEventViewers(eventId: string) {
  const [viewers, setViewers] = useState<CalendarEventViewer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchList = useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setError('')
    try {
      const res = await eventsApi.listEventViewers(eventId)
      setViewers(res.viewers)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load viewers')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => { fetchList() }, [fetchList])

  return { viewers, loading, error, refetch: fetchList }
}
