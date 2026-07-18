import { useState, type SubmitEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCreateInventory } from '../hooks/useInventory'

const INVENTORY_STATUS_OPTIONS = ['銷售中', '完售', '註銷']

export function InventoryCreatePage() {
  const { priceId } = useParams<{ priceId: string }>()
  const navigate = useNavigate()
  const { create, loading, error: createError } = useCreateInventory()

  const [status, setStatus] = useState('銷售中')
  const [error, setError] = useState('')

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const created = await create({
      product_price_id: priceId!,
      status,
    })

    if (created) {
      navigate(`/inventory/${created.id}`)
    }
  }

  return (
    <div className="inventory-form-page">
      <div className="page-header">
        <Link to="/products" className="back-link">← 返回產品列表</Link>
      </div>

      <div className="form-card">
        <h1>建立庫存</h1>

        {(error || createError) && <div className="error-banner">⚠️ {error || createError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="status">狀態</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value)}>
              {INVENTORY_STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <Link to="/products" className="btn-secondary">取消</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '建立中...' : '建立庫存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
