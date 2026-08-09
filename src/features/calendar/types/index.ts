// ── Calendar Event ──

export interface CalendarEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  status: string
  created_by: string
  creator_name: string
  created_at: string
  updated_at: string
}

export interface CreateCalendarEventRequest {
  title: string
  description: string
  start_time: string
  end_time: string
  status: string
}

export type UpdateCalendarEventRequest = CreateCalendarEventRequest

export interface CalendarEventResponse {
  event: CalendarEvent
}

export interface CalendarEventListResponse {
  events: CalendarEvent[]
}

export interface CalendarEventViewer {
  member_id: string
  member_name: string
  created_at: string
}

export interface CalendarEventViewerListResponse {
  viewers: CalendarEventViewer[]
}

export interface AddCalendarEventViewerRequest {
  member_id: string
}

export interface CalendarDisplayEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  type: 'event' | 'announcement' | 'chat'
  sourceId: string
  status?: string
  creator_name?: string
  description?: string
}
