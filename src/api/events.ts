import { apiFetch } from './client'
import type {
  CalendarEventResponse,
  CalendarEventListResponse,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
  CalendarEventViewerListResponse,
  AddCalendarEventViewerRequest,
} from '../types'

export function listEvents(year: number, month: number): Promise<CalendarEventListResponse> {
  return apiFetch<CalendarEventListResponse>(`/api/events?year=${year}&month=${month}`)
}

export function getEvent(id: string): Promise<CalendarEventResponse> {
  return apiFetch<CalendarEventResponse>(`/api/events/${id}`)
}

export function createEvent(data: CreateCalendarEventRequest): Promise<CalendarEventResponse> {
  return apiFetch<CalendarEventResponse>('/api/events', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateEvent(id: string, data: UpdateCalendarEventRequest): Promise<CalendarEventResponse> {
  return apiFetch<CalendarEventResponse>(`/api/events/${id}/update`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteEvent(id: string): Promise<void> {
  return apiFetch<void>(`/api/events/${id}/delete`, { method: 'POST' })
}

export function addEventViewer(eventId: string, memberId: string): Promise<void> {
  return apiFetch<void>(`/api/events/${eventId}/viewers`, {
    method: 'POST',
    body: JSON.stringify({ member_id: memberId } as AddCalendarEventViewerRequest),
  })
}

export function removeEventViewer(eventId: string, memberId: string): Promise<void> {
  return apiFetch<void>(`/api/events/${eventId}/viewers/${memberId}/remove`, {
    method: 'POST',
  })
}

export function listEventViewers(eventId: string): Promise<CalendarEventViewerListResponse> {
  return apiFetch<CalendarEventViewerListResponse>(`/api/events/${eventId}/viewers`)
}
