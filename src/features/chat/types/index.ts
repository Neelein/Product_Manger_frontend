// ── Chat / Private Message ──

export interface ChatRoom {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
  is_member: boolean
  last_message_content?: string
  last_message_at?: string
  last_message_sender_id?: string
  unread_count: number
}

export interface ChatRoomListResponse {
  rooms: ChatRoom[]
}

export interface CreateRoomRequest {
  name: string
}

export interface ChatRoomResponse {
  room: ChatRoom
}

export interface MembersListResponse {
  members: Member[]
  total: number
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  sender_name: string
  content: string
  image_path: string
  file_path: string
  created_at: string
}

export interface MessageListResponse {
  messages: ChatMessage[]
}

export interface MessageResponse {
  message: ChatMessage
}
import type { Member } from '../../auth/types'
