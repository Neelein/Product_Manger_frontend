export interface Member {
  id: string
  email: string
  name: string
  role?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  code: string
}

export interface LoginResponse {
  member: Member
}

export interface UpdateMemberRequest {
  email: string
  name: string
}

export interface Product {
  id: string
  name: string
  status: string
  category_id: string
  category: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateProductRequest {
  name: string
  status: string
  category_id: string
}

export type UpdateProductRequest = CreateProductRequest

export interface ProductResponse {
  product: Product
}

export interface ProductListResponse {
  products: Product[]
}

export interface ProductDetail {
  id: string
  product_id: string
  introduction: string
  usage_instructions: string
  return_policy: string
  created_at: string
  updated_at: string
}

export interface CreateDetailRequest {
  introduction: string
  usage_instructions: string
  return_policy: string
}

export interface DetailResponse {
  detail: ProductDetail
}

export interface ProductPrice {
  id: string
  product_detail_id: string
  label: string
  amount: number
  currency: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreatePriceRequest {
  label: string
  amount: number
  currency?: string
  sort_order?: number
}

export interface PriceResponse {
  price: ProductPrice
}

export interface PriceListResponse {
  prices: ProductPrice[]
}

export type UpdateDetailRequest = CreateDetailRequest

export type UpdatePriceRequest = CreatePriceRequest

export interface ErrorResponse {
  error: string
}

// ── Categories ──

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface CreateCategoryRequest {
  name: string
}

export interface CategoryResponse {
  category: Category
}

export interface CategoryListResponse {
  categories: Category[]
}

// ── Registration codes (admin) ──

export interface RegistrationCode {
  id: string
  code: string
  created_by: string
  created_by_email: string
  used_by: string
  used_by_email: string
  used_at: string | null
  created_at: string
  status: string
}

export interface CreateRegistrationCodeRequest {
  code?: string
}

export interface RegistrationCodeResponse {
  code: RegistrationCode
}

export interface RegistrationCodeListResponse {
  codes: RegistrationCode[]
}

// ── Inventory ──

export interface Inventory {
  id: string
  product_price_id: string
  product_detail_id: string
  product_id: string
  name: string
  total_quantity: number
  sold_quantity: number
  status: string
  created_at: string
  updated_at: string
}

export interface CreateInventoryRequest {
  product_price_id: string
  status?: string
}

export interface UpdateInventoryRequest {
  status?: string
}

export interface InventoryResponse {
  inventory: Inventory
}

export interface InventoryListResponse {
  inventories: Inventory[]
}

export interface InventoryItem {
  id: string
  inventory_id: string
  item_code: string
  status: string
  cost: number | null
  date_added: string
  status_updated_at: string
  created_at: string
  updated_at: string
}

export interface CreateInventoryItemRequest {
  item_code: string
  status?: string
  cost?: number
  date_added?: string
}

export interface UpdateInventoryItemRequest {
  item_code: string
  status?: string
  cost?: number
  date_added?: string
}

export interface InventoryItemResponse {
  item: InventoryItem
}

export interface InventoryItemListResponse {
  items: InventoryItem[]
}

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
