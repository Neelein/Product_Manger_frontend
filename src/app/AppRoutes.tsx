import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './layout/Layout'
import { ProtectedRoute } from './guards/ProtectedRoute'
import { AdminRoute } from './guards/AdminRoute'
import { LoginPage, ProfilePage } from '../features/auth'
import { ProductList, ProductDetail, ProductForm } from '../features/products'
import { InventoryListPage, InventoryCreatePage, InventoryDetailPage } from '../features/inventory'
import { CategoryListPage } from '../features/categories'
import { AnnouncementListPage, AnnouncementDetailPage, AnnouncementCreatePage } from '../features/announcements'
import { ChatRoomListPage, ChatRoomDetailPage, ChatRoomCreatePage, AddRoomMembersPage, MessagesPage } from '../features/chat'
import { CalendarPage, CalendarEventCreatePage, CalendarEventDetailPage, EventManagementPage } from '../features/calendar'
import { RegistrationCodesPage } from '../features/registration-codes'
import { DashboardPage } from '../features/dashboard'
import '../App.css'

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<LoginPage />} /><Route path="/login" element={<Navigate to="/" replace />} />
    <Route element={<Layout />}>
      <Route path="/home" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/messages" element={<MessagesPage />} /><Route path="/products" element={<ProductList />} />
      <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} /><Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/products/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} /><Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/events" element={<EventManagementPage />} /><Route path="/calendar" element={<CalendarPage />} />
      <Route path="/calendar/new" element={<ProtectedRoute><CalendarEventCreatePage /></ProtectedRoute>} /><Route path="/calendar/:id" element={<CalendarEventDetailPage />} />
      <Route path="/inventory" element={<InventoryListPage />} /><Route path="/categories" element={<ProtectedRoute><CategoryListPage /></ProtectedRoute>} />
      <Route path="/inventory/new/:variantId" element={<ProtectedRoute><InventoryCreatePage /></ProtectedRoute>} />
      <Route path="/inventory/:id" element={<InventoryDetailPage />} /><Route path="/announcements" element={<AnnouncementListPage />} />
      <Route path="/announcements/new" element={<ProtectedRoute><AnnouncementCreatePage /></ProtectedRoute>} /><Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
      <Route path="/chat/rooms" element={<ProtectedRoute><ChatRoomListPage /></ProtectedRoute>} /><Route path="/chat/rooms/new" element={<ProtectedRoute><ChatRoomCreatePage /></ProtectedRoute>} />
      <Route path="/chat/rooms/:roomId" element={<ProtectedRoute><ChatRoomDetailPage /></ProtectedRoute>} /><Route path="/chat/rooms/:roomId/add-members" element={<ProtectedRoute><AddRoomMembersPage /></ProtectedRoute>} />
      <Route path="/admin/registration-codes" element={<AdminRoute><RegistrationCodesPage /></AdminRoute>} />
    </Route><Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
}
