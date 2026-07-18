import { useState, useEffect, type SubmitEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useProducts'

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { product, loading: loadingProduct } = useProduct(id || '')
  const { create, loading: creating } = useCreateProduct()
  const { update, loading: updating } = useUpdateProduct()

  const [name, setName] = useState('')
  const [status, setStatus] = useState('active')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit && product) {
      setName(product.name)
      setStatus(product.status || 'active')
      setCategory(product.category)
    }
  }, [isEdit, product])

  if (isEdit && loadingProduct) return <div className="page-loading">載入中...</div>

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !category.trim()) {
      setError('請填寫所有必填欄位')
      return
    }

    const data = { name, status, category }

    if (isEdit) {
      const updated = await update(id!, data)
      if (updated) navigate(`/products/${id}`)
    } else {
      const created = await create(data)
      if (created) navigate(`/products/${created.id}`)
    }
  }

  return (
    <div className="product-form-page">
      <div className="page-header">
        <Link to={isEdit ? `/products/${id}` : '/products'} className="back-link">
          ← {isEdit ? '返回產品' : '返回列表'}
        </Link>
      </div>

      <div className="form-card">
        <h1>{isEdit ? '編輯產品' : '新增產品'}</h1>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">產品名稱 *</label>
            <input id="name" type="text" placeholder="請輸入產品名稱"
              value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="status">狀態</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="active">上架</option>
              <option value="inactive">下架</option>
              <option value="deprecated">註銷</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">分類 *</label>
            <input id="category" type="text" placeholder="例如：電子產品"
              value={category} onChange={e => setCategory(e.target.value)} />
          </div>

          <div className="form-actions">
            <Link to={isEdit ? `/products/${id}` : '/products'} className="btn-secondary">取消</Link>
            <button type="submit" className="btn-primary" disabled={creating || updating}>
              {creating || updating ? '儲存中...' : (isEdit ? '更新產品' : '建立產品')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
