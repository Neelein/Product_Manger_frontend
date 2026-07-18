import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../hooks/useAuth'

export function ProductList() {
  const { products, loading, error } = useProducts()
  const { member } = useAuth()

  if (loading) return <div className="page-loading">載入中...</div>
  if (error) return <div className="error-banner">⚠️ {error}</div>

  return (
    <div className="product-list-page">
      <div className="page-header">
        <div>
          <h1>產品列表</h1>
          <p className="page-subtitle">共 {products.length} 項產品</p>
        </div>
        {member && (
          <Link to="/products/new" className="btn-primary">新增產品</Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>目前尚無產品</p>
          {member && <Link to="/products/new" className="btn-primary">新增第一項產品</Link>}
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
