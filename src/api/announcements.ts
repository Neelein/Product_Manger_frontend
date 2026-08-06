import { apiFetch, apiFetchFormData } from './client'
import type { AnnouncementListResponse, AnnouncementResponse } from '../types'

export function listAnnouncements(page = 1, limit = 20, year?: number, month?: number): Promise<AnnouncementListResponse> {
  let url = `/api/announcements?page=${page}&limit=${limit}`
  if (year !== undefined && month !== undefined) {
    url += `&year=${year}&month=${month}`
  }
  return apiFetch<AnnouncementListResponse>(url)
}

export function getAnnouncement(id: string): Promise<AnnouncementResponse> {
  return apiFetch<AnnouncementResponse>(`/api/announcements/${id}`)
}

export function createAnnouncement(data: { title: string; content: string; image?: File }): Promise<AnnouncementResponse> {
  const fd = new FormData()
  fd.append('title', data.title)
  fd.append('content', data.content)
  if (data.image) {
    fd.append('image', data.image)
  }
  return apiFetchFormData<AnnouncementResponse>('/api/announcements', fd)
}

export function updateAnnouncement(id: string, data: { title?: string; content?: string; image?: File; image_path?: string }): Promise<AnnouncementResponse> {
  const fd = new FormData()
  if (data.title) fd.append('title', data.title)
  if (data.content) fd.append('content', data.content)
  if (data.image) fd.append('image', data.image)
  if (data.image_path) fd.append('image_path', data.image_path)
  return apiFetchFormData<AnnouncementResponse>(`/api/announcements/${id}/update`, fd)
}

export function deleteAnnouncement(id: string): Promise<void> {
  return apiFetch<void>(`/api/announcements/${id}/delete`, { method: 'POST' })
}
