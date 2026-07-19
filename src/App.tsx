import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { ProductList } from './pages/ProductList'
import { ProductDetail } from './pages/ProductDetail'
import { ProductForm } from './pages/ProductForm'
import { ProfilePage } from './pages/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'
import { InventoryListPage } from './pages/InventoryListPage'
import { InventoryCreatePage } from './pages/InventoryCreatePage'
import { InventoryDetailPage } from './pages/InventoryDetailPage'
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
        <Route path="/inventory" element={<InventoryListPage />} />
        <Route path="/inventory/new/:priceId" element={
          <ProtectedRoute><InventoryCreatePage /></ProtectedRoute>
        } />
        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
