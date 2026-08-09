// ── Announcement ──

export interface Announcement {
  id: string
  title: string
  content: string
  image_path: string
  publisher_id: string
  publisher_name: string
  created_at: string
  updated_at: string
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
}

export interface AnnouncementResponse {
  announcement: Announcement
}

export interface AnnouncementListResponse {
  announcements: Announcement[]
  total: number
  page: number
  limit: number
}
