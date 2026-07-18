import { useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { useInventories } from '../hooks/useInventory'

const INVENTORY_STATUS_LABELS: Record<string, string> = {
  '銷售中': '銷售中',
  '完售': '完售',
  '註銷': '註銷',
}

const INVENTORY_STATUS_CLASSES: Record<string, string> = {
  '銷售中': 'status-selling',
  '完售': 'status-sold-out',
  '註銷': 'status-deprecated',
}

export function InventoryListPage() {
  const { inventories, loading, error } = useInventories()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const filtered = inventories.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="inventory-list-page">
      <div className="page-header">
        <div>
          <Link to="/products" className="back-link">← 返回產品列表</Link>
          <h1>庫存管理</h1>
          <p className="page-subtitle">共 {inventories.length} 項庫存</p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="搜尋庫存名稱..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-primary" onClick={handleSearch}>搜尋</button>
      </div>

      {loading ? (
        <div className="page-loading">載入中...</div>
      ) : error ? (
        <div className="error-banner">⚠️ {error}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>{searchQuery ? '無符合條件的庫存' : '目前尚無庫存'}</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>名稱</th>
              <th>狀態</th>
              <th>總數量</th>
              <th>已售</th>
              <th>可用</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td>
                  <Link to={`/inventory/${i.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {i.name}
                  </Link>
                </td>
                <td>
                  <span className={`status-badge ${INVENTORY_STATUS_CLASSES[i.status] || ''}`}>
                    {INVENTORY_STATUS_LABELS[i.status] || i.status}
                  </span>
                </td>
                <td>{i.total_quantity.toLocaleString()}</td>
                <td>{i.sold_quantity.toLocaleString()}</td>
                <td>{(i.total_quantity - i.sold_quantity).toLocaleString()}</td>
                <td>
                  <Link to={`/inventory/${i.id}`} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 13 }}>
                    管理
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
