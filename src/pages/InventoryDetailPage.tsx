import { useState, type SubmitEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useInventory,
  useUpdateInventory,
  useDeleteInventory,
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from '../hooks/useInventory'
import { useAuth } from '../hooks/useAuth'
import type { InventoryItem } from '../types'

const INVENTORY_STATUS_OPTIONS = ['銷售中', '完售', '註銷']

const INVENTORY_STATUS_CLASSES: Record<string, string> = {
  '銷售中': 'status-selling',
  '完售': 'status-sold-out',
  '註銷': 'status-deprecated',
}

const ITEM_STATUS_OPTIONS = ['可用', '出售', '註銷']

function getItemStatusStyle(status: string) {
  if (status === '可用') return { color: '#16a34a', background: '#f0fdf4' }
  if (status === '出售') return { color: '#ea580c', background: '#fff7ed' }
  return { color: '#64748b', background: '#f1f5f9' }
}

export function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { member } = useAuth()

  const { inventory, loading, error, setInventory } = useInventory(id!)
  const { update } = useUpdateInventory()
  const { remove } = useDeleteInventory()
  const { items, loading: loadingItems, setItems } = useItems(id!)
  const { create: createItem } = useCreateItem()
  const { update: updateItem } = useUpdateItem()
  const { remove: deleteItem } = useDeleteItem()

  const [editingInventory, setEditingInventory] = useState(false)
  const [invStatus, setInvStatus] = useState('')
  const [invSubmitting, setInvSubmitting] = useState(false)
  const [invError, setInvError] = useState('')

  const [itemCode, setItemCode] = useState('')
  const [itemStatus, setItemStatus] = useState('可用')
  const [itemCost, setItemCost] = useState('')
  const [itemDateAdded, setItemDateAdded] = useState(() => new Date().toISOString().slice(0, 10))
  const [itemSubmitting, setItemSubmitting] = useState(false)
  const [itemError, setItemError] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const [editItemCode, setEditItemCode] = useState('')
  const [editItemStatus, setEditItemStatus] = useState('可用')
  const [editItemCost, setEditItemCost] = useState('')
  const [editItemDateAdded, setEditItemDateAdded] = useState('')

  if (loading) return <div className="page-loading">載入中...</div>
  if (error || !inventory) return <div className="error-banner">⚠️ {error || '庫存不存在'}</div>

  const available = inventory.total_quantity - inventory.sold_quantity

  const handleDeleteInventory = async () => {
    if (!confirm('確定刪除此庫存？')) return
    const ok = await remove(inventory.id)
    if (ok) navigate('/inventory', { replace: true })
  }

  const startEditInventory = () => {
    setInvStatus(inventory.status)
    setEditingInventory(true)
    setInvError('')
  }

  const handleSubmitInventory = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInvError('')
    setInvSubmitting(true)
    try {
      const data = { status: invStatus }
      const res = await update(inventory.id, data)
      if (res) setInventory(res)
      setEditingInventory(false)
    } catch (e) {
      setInvError(e instanceof Error ? e.message : '更新失敗')
    } finally {
      setInvSubmitting(false)
    }
  }

  const resetItemForm = () => {
    setItemCode('')
    setItemStatus('可用')
    setItemCost('')
    setItemDateAdded(new Date().toISOString().slice(0, 10))
  }

  const handleCreateItem = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setItemError('')
    if (!itemCode.trim()) {
      setItemError('請填寫項目編號')
      return
    }
    setItemSubmitting(true)
    try {
      const data = {
        item_code: itemCode,
        status: itemStatus,
        cost: itemCost ? Number(itemCost) : undefined,
        date_added: itemDateAdded,
      }
      const created = await createItem(inventory.id, data)
      if (created) setItems(prev => [...prev, created])
      resetItemForm()
    } catch (e) {
      setItemError(e instanceof Error ? e.message : '新增失敗')
    } finally {
      setItemSubmitting(false)
    }
  }

  const startEditItem = (item: InventoryItem) => {
    setEditItemCode(item.item_code)
    setEditItemStatus(item.status)
    setEditItemCost(item.cost !== null ? String(item.cost) : '')
    setEditItemDateAdded(item.date_added ? item.date_added.slice(0, 10) : '')
    setEditingItemId(item.id)
    setItemError('')
  }

  const handleUpdateItem = async (e: SubmitEvent<HTMLFormElement>, itemId: string) => {
    e.preventDefault()
    setItemError('')
    if (!editItemCode.trim()) {
      setItemError('請填寫項目編號')
      return
    }
    setItemSubmitting(true)
    try {
      const data = {
        item_code: editItemCode,
        status: editItemStatus,
        cost: editItemCost ? Number(editItemCost) : undefined,
        date_added: editItemDateAdded,
      }
      const updated = await updateItem(inventory.id, itemId, data)
      if (updated) setItems(prev => prev.map(i => i.id === itemId ? updated : i))
      setEditingItemId(null)
    } catch (e) {
      setItemError(e instanceof Error ? e.message : '更新失敗')
    } finally {
      setItemSubmitting(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('確定刪除此項目？')) return
    const ok = await deleteItem(inventory.id, itemId)
    if (ok) setItems(prev => prev.filter(i => i.id !== itemId))
  }

  return (
    <div className="inventory-detail-page">
      <div className="page-header">
        <Link to="/inventory" className="back-link">← 返回庫存列表</Link>
        {member && (
          <div className="header-actions">
            <button className="btn-secondary" onClick={startEditInventory}>編輯</button>
            <button className="btn-danger" onClick={handleDeleteInventory}>刪除</button>
          </div>
        )}
      </div>

      {editingInventory ? (
        <div className="section-card">
          <h2 className="section-title">編輯庫存</h2>
          {invError && <div className="error-banner">⚠️ {invError}</div>}
          <form onSubmit={handleSubmitInventory}>
            <div className="form-group">
              <label htmlFor="invStatus">狀態</label>
              <select id="invStatus" value={invStatus} onChange={e => setInvStatus(e.target.value)}>
                {INVENTORY_STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setEditingInventory(false)}>取消</button>
              <button type="submit" className="btn-primary" disabled={invSubmitting}>
                {invSubmitting ? '儲存中...' : '更新'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="detail-card">
          <div className="detail-header">
            <div>
              <h1>{inventory.name}</h1>
              <span className={`status-badge ${INVENTORY_STATUS_CLASSES[inventory.status] || ''}`} style={{ marginTop: 8 }}>
                {inventory.status}
              </span>
            </div>
            <button className="btn-secondary" onClick={() => navigate(`/products/${inventory.product_id}`)}>返回產品</button>
          </div>
          <div className="detail-body">
            <div className="detail-section">
              <label>總數量</label>
              <p>{inventory.total_quantity.toLocaleString()}</p>
            </div>
            <div className="detail-section">
              <label>已售數量</label>
              <p>{inventory.sold_quantity.toLocaleString()}</p>
            </div>
            <div className="detail-section">
              <label>可用數量</label>
              <p>{available.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="section-card">
        <h2 className="section-title">庫存項目</h2>

        {itemError && !editingItemId && <div className="error-banner">⚠️ {itemError}</div>}

        {member && !editingItemId && (
          <form onSubmit={handleCreateItem} style={{ marginBottom: 24 }}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemCode">項目編號</label>
                <input id="itemCode" type="text" value={itemCode} onChange={e => setItemCode(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="itemStatus">狀態</label>
                <select id="itemStatus" value={itemStatus} onChange={e => setItemStatus(e.target.value)}>
                  {ITEM_STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemCost">成本</label>
                <input id="itemCost" type="number" value={itemCost} onChange={e => setItemCost(e.target.value)} min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="itemDateAdded">新增日期</label>
                <input id="itemDateAdded" type="date" value={itemDateAdded} onChange={e => setItemDateAdded(e.target.value)} />
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: 0 }}>
              <button type="submit" className="btn-primary" disabled={itemSubmitting}>
                {itemSubmitting ? '新增中...' : '新增'}
              </button>
            </div>
          </form>
        )}

        {loadingItems ? (
          <div className="page-loading" style={{ padding: '20px 0' }}>載入中...</div>
        ) : items.length === 0 ? (
          <p className="empty-field">尚無庫存項目</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#64748b' }}>項目編號</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#64748b' }}>狀態</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#64748b' }}>成本</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#64748b' }}>新增日期</th>
                {member && <th style={{ padding: '8px 12px', borderBottom: '2px solid #e2e8f0' }}></th>}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  {editingItemId === item.id ? (
                    <td colSpan={member ? 5 : 4} style={{ padding: '12px' }}>
                      {itemError && <div className="error-banner">⚠️ {itemError}</div>}
                      <form onSubmit={e => handleUpdateItem(e, item.id)}>
                        <div className="form-row">
                          <div className="form-group">
                            <label>項目編號</label>
                            <input type="text" value={editItemCode} onChange={e => setEditItemCode(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>狀態</label>
                            <select value={editItemStatus} onChange={e => setEditItemStatus(e.target.value)}>
                              {ITEM_STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>成本</label>
                            <input type="number" value={editItemCost} onChange={e => setEditItemCost(e.target.value)} min="0" step="0.01" />
                          </div>
                          <div className="form-group">
                            <label>新增日期</label>
                            <input type="date" value={editItemDateAdded} onChange={e => setEditItemDateAdded(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-actions" style={{ marginTop: 12 }}>
                          <button type="button" className="btn-secondary" onClick={() => setEditingItemId(null)}>取消</button>
                          <button type="submit" className="btn-primary" disabled={itemSubmitting}>
                            {itemSubmitting ? '儲存中...' : '更新'}
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 14 }}>{item.item_code}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <span className="status-badge" style={getItemStatusStyle(item.status)}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 14 }}>{item.cost !== null ? item.cost.toLocaleString() : '-'}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 14 }}>{item.date_added ? new Date(item.date_added).toLocaleDateString() : '-'}</td>
                      {member && (
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                          <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 13, marginRight: 8 }}
                            onClick={() => startEditItem(item)}>編輯</button>
                          <button className="btn-danger" style={{ padding: '4px 12px', fontSize: 13 }}
                            onClick={() => handleDeleteItem(item.id)}>刪除</button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
