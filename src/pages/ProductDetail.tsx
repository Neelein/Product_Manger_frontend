import { useState, useEffect, type SubmitEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProduct, useDeleteProduct } from '../hooks/useProducts'
import { useAuth } from '../hooks/useAuth'
import { getDetail, createDetail, updateDetail, listPrices, createPrice, updatePrice, listInventories } from '../api/products'
import type { ProductDetail as DetailType, ProductPrice, Inventory } from '../types'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { product, loading, error } = useProduct(id!)
  const { remove } = useDeleteProduct()
  const { member } = useAuth()
  const navigate = useNavigate()

  const [detail, setDetail] = useState<DetailType | null>(null)
  const [prices, setPrices] = useState<ProductPrice[]>([])
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [inventoryMap, setInventoryMap] = useState<Record<string, Inventory>>({})
  const [loadingInventory, setLoadingInventory] = useState(false)

  // detail edit state
  const [editingDetail, setEditingDetail] = useState(false)
  const [dIntro, setDIntro] = useState('')
  const [dUsage, setDUsage] = useState('')
  const [dReturn, setDReturn] = useState('')
  const [detailSubmitting, setDetailSubmitting] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [detailSuccess, setDetailSuccess] = useState('')

  // price form state
  const [pLabel, setPLabel] = useState('')
  const [pAmount, setPAmount] = useState('')
  const [pCurrency, setPCurrency] = useState('TWD')
  const [pSortOrder, setPSortOrder] = useState('0')
  const [priceSubmitting, setPriceSubmitting] = useState(false)
  const [priceError, setPriceError] = useState('')
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoadingDetail(true)
    getDetail(id)
      .then(res => {
        setDetail(res.detail)
        return res.detail
      })
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false))
  }, [id])

  useEffect(() => {
    if (!detail) return
    setLoadingPrices(true)
    listPrices(id!)
      .then(res => setPrices(res.prices))
      .catch(() => setPrices([]))
      .finally(() => setLoadingPrices(false))
  }, [detail]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prices.length === 0) return
    setLoadingInventory(true)
    listInventories()
      .then(res => {
        const map: Record<string, Inventory> = {}
        for (const inv of res.inventories) {
          map[inv.product_price_id] = inv
        }
        setInventoryMap(map)
      })
      .catch(() => setInventoryMap({}))
      .finally(() => setLoadingInventory(false))
  }, [prices])

  if (loading) return <div className="page-loading">載入中...</div>
  if (error || !product) return <div className="error-banner">⚠️ {error || '產品不存在'}</div>

  const handleDelete = async () => {
    if (!confirm('確定刪除此產品？')) return
    const ok = await remove(product.id)
    if (ok) navigate('/products', { replace: true })
  }

  // ── Detail handlers ──

  const startEditDetail = () => {
    setDIntro(detail?.introduction || '')
    setDUsage(detail?.usage_instructions || '')
    setDReturn(detail?.return_policy || '')
    setEditingDetail(true)
    setDetailError('')
    setDetailSuccess('')
  }

  const handleSubmitDetail = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDetailError('')
    setDetailSuccess('')
    setDetailSubmitting(true)
    try {
      const data = { introduction: dIntro, usage_instructions: dUsage, return_policy: dReturn }
      if (detail) {
        const res = await updateDetail(product.id, data)
        setDetail(res.detail)
        setDetailSuccess('詳細資訊已更新')
      } else {
        const res = await createDetail(product.id, data)
        setDetail(res.detail)
        setDetailSuccess('詳細資訊已建立')
      }
      setEditingDetail(false)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : '操作失敗')
    } finally {
      setDetailSubmitting(false)
    }
  }

  // ── Price handlers ──

  const resetPriceForm = () => {
    setPLabel('')
    setPAmount('')
    setPCurrency('TWD')
    setPSortOrder('0')
    setEditingPriceId(null)
  }

  const startEditPrice = (p: ProductPrice) => {
    setPLabel(p.label)
    setPAmount(String(p.amount))
    setPCurrency(p.currency)
    setPSortOrder(String(p.sort_order))
    setEditingPriceId(p.id)
    setPriceError('')
  }

  const handleSubmitPrice = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!detail) return
    setPriceError('')
    const amount = Number(pAmount)
    if (!pLabel.trim() || isNaN(amount) || amount < 0) {
      setPriceError('請填寫有效標籤與金額')
      return
    }
    setPriceSubmitting(true)
    try {
      const data = { label: pLabel, amount, currency: pCurrency, sort_order: Number(pSortOrder) }
      if (editingPriceId) {
        const res = await updatePrice(product.id, editingPriceId, data)
        setPrices(prev => prev.map(p => p.id === editingPriceId ? res.price : p))
      } else {
        const res = await createPrice(product.id, detail.id, data)
        setPrices(prev => [...prev, res.price])
      }
      resetPriceForm()
    } catch (e) {
      setPriceError(e instanceof Error ? e.message : '操作失敗')
    } finally {
      setPriceSubmitting(false)
    }
  }

  return (
    <div className="product-detail-page">
      <div className="page-header">
        <Link to="/products" className="back-link">← 返回列表</Link>
        {member && (
          <div className="header-actions">
            <Link to={`/products/${product.id}/edit`} className="btn-secondary">編輯</Link>
            <button className="btn-danger" onClick={handleDelete}>刪除</button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1>{product.name}</h1>
            <span className={`status-badge status-${product.status}`} style={{ marginTop: 8 }}>
              {product.status === 'active' ? '上架' : product.status === 'inactive' ? '下架' : product.status === 'deprecated' ? '註銷' : product.status}
            </span>
          </div>
          <span className="detail-category">{product.category}</span>
        </div>
        <div className="detail-body">
          <div className="detail-section">
            <label>分類</label>
            <p>{product.category}</p>
          </div>
          <div className="detail-meta">
            <span>建立時間：{new Date(product.created_at).toLocaleDateString()}</span>
            <span>更新時間：{new Date(product.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-title">商品詳細資訊</h2>
          {member && detail && !editingDetail && (
            <button className="btn-secondary" onClick={startEditDetail}>編輯</button>
          )}
        </div>

        {loadingDetail ? (
          <div className="page-loading" style={{ padding: '20px 0' }}>載入中...</div>
        ) : editingDetail ? (
          <>
            {detailError && <div className="error-banner">⚠️ {detailError}</div>}
            <form onSubmit={handleSubmitDetail}>
              <div className="form-group">
                <label htmlFor="intro">介紹</label>
                <textarea id="intro" rows={3} placeholder="產品介紹內容"
                  value={dIntro} onChange={e => setDIntro(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="usage">使用說明</label>
                <textarea id="usage" rows={3} placeholder="使用方式與注意事項"
                  value={dUsage} onChange={e => setDUsage(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="return">退貨政策</label>
                <textarea id="return" rows={3} placeholder="退貨與退款相關說明"
                  value={dReturn} onChange={e => setDReturn(e.target.value)} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingDetail(false)}>取消</button>
                <button type="submit" className="btn-primary" disabled={detailSubmitting}>
                  {detailSubmitting ? '儲存中...' : (detail ? '更新' : '建立')}
                </button>
              </div>
            </form>
          </>
        ) : detail ? (
          <div className="detail-content">
            {detail.introduction && (
              <div className="detail-section">
                <label>介紹</label>
                <p>{detail.introduction}</p>
              </div>
            )}
            {detail.usage_instructions && (
              <div className="detail-section">
                <label>使用說明</label>
                <p>{detail.usage_instructions}</p>
              </div>
            )}
            {detail.return_policy && (
              <div className="detail-section">
                <label>退貨政策</label>
                <p>{detail.return_policy}</p>
              </div>
            )}
            {!detail.introduction && !detail.usage_instructions && !detail.return_policy && (
              <p className="empty-field">尚無詳細內容</p>
            )}
            {detailSuccess && <div className="success-banner" style={{ marginTop: 16 }}>✅ {detailSuccess}</div>}
          </div>
        ) : (
          <div>
            <p className="empty-field" style={{ marginBottom: 16 }}>尚無詳細資訊</p>
            {member && (
              <button className="btn-primary" onClick={startEditDetail}>建立詳細資訊</button>
            )}
          </div>
        )}
      </div>

      {/* Prices */}
      <div className="section-card">
        <h2 className="section-title">價格設定</h2>

        {loadingPrices ? (
          <div className="page-loading" style={{ padding: '20px 0' }}>載入中...</div>
        ) : prices.length > 0 ? (
          <div className="price-list">
            {prices.map(p => {
              const inv = inventoryMap[p.id]
              const invAvailable = inv ? inv.total_quantity - inv.sold_quantity : 0
              return (
                <div key={p.id} className="price-item">
                  <div className="price-item-top">
                    <div className="price-item-info">
                      <span className="price-item-label">{p.label}</span>
                      <span className="price-item-amount">{p.amount.toLocaleString()}</span>
                      <span className="price-item-currency">{p.currency}</span>
                    </div>
                    <div className="price-item-actions">
                      {member && (
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }}
                          onClick={() => startEditPrice(p)}>編輯</button>
                      )}
                      {member && inv ? (
                        <Link to={`/inventory/${inv.id}`} className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 13 }}>管理庫存</Link>
                      ) : member && !inv && !loadingInventory ? (
                        <Link to={`/inventory/new/${p.id}`}
                          className="btn-primary" style={{ padding: '6px 12px', fontSize: 13 }}>建立庫存</Link>
                      ) : null}
                    </div>
                  </div>
                  {inv && (
                    <div className="price-item-inventory">
                      庫存: {invAvailable.toLocaleString()} / {inv.total_quantity.toLocaleString()} | {inv.status}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="empty-field" style={{ marginBottom: 16 }}>尚無價格資料</p>
        )}

        {detail && member && (
          <>
            {priceError && <div className="error-banner">⚠️ {priceError}</div>}
            <form onSubmit={handleSubmitPrice} className="price-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priceLabel">{editingPriceId ? '標籤' : '新增 - 標籤'}</label>
                  <input id="priceLabel" type="text" placeholder="如：成人票"
                    value={pLabel} onChange={e => setPLabel(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="priceAmount">金額</label>
                  <input id="priceAmount" type="number" placeholder="0"
                    value={pAmount} onChange={e => setPAmount(e.target.value)} min="0" step="0.01" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priceCurrency">貨幣</label>
                  <input id="priceCurrency" type="text" placeholder="TWD"
                    value={pCurrency} onChange={e => setPCurrency(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="priceSort">排序</label>
                  <input id="priceSort" type="number" placeholder="0"
                    value={pSortOrder} onChange={e => setPSortOrder(e.target.value)} />
                </div>
              </div>
              <div className="form-actions">
                {editingPriceId && (
                  <button type="button" className="btn-secondary" onClick={resetPriceForm}>取消</button>
                )}
                <button type="submit" className="btn-primary" disabled={priceSubmitting}>
                  {priceSubmitting ? '儲存中...' : (editingPriceId ? '更新' : '新增')}
                </button>
              </div>
            </form>
          </>
        )}

        {!detail && member && (
          <p className="empty-field" style={{ marginTop: 8, fontSize: 14 }}>
            請先建立商品詳細資訊後再設定價格
          </p>
        )}
      </div>
    </div>
  )
}
