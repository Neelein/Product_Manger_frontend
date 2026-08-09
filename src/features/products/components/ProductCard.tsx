import { Link } from 'react-router-dom'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

const STATUS_LABELS: Record<string, string> = {
  active: '上架',
  inactive: '下架',
  deprecated: '註銷',
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-header">
        <h3 className="product-card-name">{product.name}</h3>
        <span className={`status-badge status-${product.status}`}>
          {STATUS_LABELS[product.status] || product.status}
        </span>
      </div>
      <div className="product-card-footer">
        <span>{product.category}</span>
      </div>
    </Link>
  )
}
