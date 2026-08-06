import { apiFetch, apiFetchFormData } from './client'
import type { ChatRoomListResponse, ChatRoomResponse, CreateRoomRequest, MembersListResponse, MessageListResponse, MessageResponse } from '../types'

export function addRoomMembers(roomId: string, memberIds: string[]): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/chat/rooms/${roomId}/members`, {
    method: 'POST',
    body: JSON.stringify({ member_ids: memberIds }),
  })
}

export function listChatRooms(year?: number, month?: number): Promise<ChatRoomListResponse> {
  let url = '/api/chat/rooms'
  if (year !== undefined && month !== undefined) {
    url += `?year=${year}&month=${month}`
  }
  return apiFetch<ChatRoomListResponse>(url)
}

export function createChatRoom(data: CreateRoomRequest): Promise<ChatRoomResponse> {
  return apiFetch<ChatRoomResponse>('/api/chat/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function listMessages(roomId: string, beforeId?: string, limit = 20): Promise<MessageListResponse> {
  const params = new URLSearchParams()
  if (beforeId) params.set('before_id', beforeId)
  params.set('limit', String(limit))
  return apiFetch<MessageListResponse>(`/api/chat/rooms/${roomId}/messages?${params}`)
}

export function listAvailableMembers(roomId: string, page = 1, limit = 100): Promise<MembersListResponse> {
  return apiFetch<MembersListResponse>(`/api/chat/rooms/${roomId}/available-members`, {
    method: 'POST',
    body: JSON.stringify({ page, limit }),
  })
}

export function sendMessage(
  roomId: string,
  content: string,
  image?: File,
  file?: File,
): Promise<MessageResponse> {
  const fd = new FormData()
  fd.set('content', content)
  if (image) fd.set('image', image)
  if (file) fd.set('file', file)
  return apiFetchFormData<MessageResponse>(`/api/chat/rooms/${roomId}/messages`, fd, 'POST')
}
