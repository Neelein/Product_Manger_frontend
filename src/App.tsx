import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { LoginPage } from './pages/LoginPage'
import { ProductList } from './pages/ProductList'
import { ProductDetail } from './pages/ProductDetail'
import { ProductForm } from './pages/ProductForm'
import { ProfilePage } from './pages/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'
import { MessagesPage } from './pages/MessagesPage'
import { AnnouncementListPage } from './pages/AnnouncementListPage'
import { AnnouncementDetailPage } from './pages/AnnouncementDetailPage'
import { AnnouncementCreatePage } from './pages/AnnouncementCreatePage'
import { ChatRoomListPage } from './pages/ChatRoomListPage'
import { ChatRoomDetailPage } from './pages/ChatRoomDetailPage'
import { ChatRoomCreatePage } from './pages/ChatRoomCreatePage'
import { AddRoomMembersPage } from './pages/AddRoomMembersPage'
import { EventManagementPage } from './pages/EventManagementPage'
import { CalendarPage } from './pages/CalendarPage'
import { CalendarEventCreatePage } from './pages/CalendarEventCreatePage'
import { CalendarEventDetailPage } from './pages/CalendarEventDetailPage'
import { InventoryListPage } from './pages/InventoryListPage'
import { InventoryCreatePage } from './pages/InventoryCreatePage'
import { InventoryDetailPage } from './pages/InventoryDetailPage'
import { RegistrationCodesPage } from './pages/RegistrationCodesPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/home" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={
          <ProtectedRoute><ProductForm /></ProtectedRoute>
        } />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute><ProductForm /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/events" element={<EventManagementPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/calendar/new" element={<ProtectedRoute><CalendarEventCreatePage /></ProtectedRoute>} />
        <Route path="/calendar/:id" element={<CalendarEventDetailPage />} />
        <Route path="/inventory" element={<InventoryListPage />} />
        <Route path="/inventory/new/:priceId" element={
          <ProtectedRoute><InventoryCreatePage /></ProtectedRoute>
        } />
        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
        <Route path="/announcements" element={<AnnouncementListPage />} />
        <Route path="/announcements/new" element={
          <ProtectedRoute><AnnouncementCreatePage /></ProtectedRoute>
        } />
        <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="/chat/rooms" element={
          <ProtectedRoute><ChatRoomListPage /></ProtectedRoute>
        } />
        <Route path="/chat/rooms/new" element={
          <ProtectedRoute><ChatRoomCreatePage /></ProtectedRoute>
        } />
        <Route path="/chat/rooms/:roomId" element={
          <ProtectedRoute><ChatRoomDetailPage /></ProtectedRoute>
        } />
        <Route path="/chat/rooms/:roomId/add-members" element={
          <ProtectedRoute><AddRoomMembersPage /></ProtectedRoute>
        } />
        <Route path="/admin/registration-codes" element={
          <AdminRoute><RegistrationCodesPage /></AdminRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
