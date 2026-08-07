import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import * as registrationCodesApi from '../api/registrationCodes'
import type { RegistrationCode } from '../types'

export function RegistrationCodesPage() {
  const [codes, setCodes] = useState<RegistrationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    registrationCodesApi
      .listRegistrationCodes()
      .then((res) => setCodes(res.codes))
      .catch((e) => setError(e instanceof Error ? e.message : '載入失敗'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      await registrationCodesApi.createRegistrationCode({ code: codeInput.trim() || undefined })
      setCodeInput('')
      load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '建立失敗')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定要刪除這個註冊代碼嗎？')) return
    try {
      await registrationCodesApi.deleteRegistrationCode(id)
      setCodes((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const available = codes.filter((c) => c.status === 'available').length
  const filtered = codes.filter((c) => c.code.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="registration-codes-page">
      <div className="page-header">
        <div>
          <Link to="/home" className="back-link">← 返回首頁</Link>
          <h1>註冊代碼管理</h1>
          <p className="page-subtitle">可用代碼 {available} 個 / 共 {codes.length} 個</p>
        </div>
      </div>

      <form className="code-create-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="留空將自動產生代碼"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={creating}>
          {creating ? '建立中...' : '建立代碼'}
        </button>
      </form>
      {createError && <div className="error-banner">⚠️ {createError}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="搜尋註冊代碼..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
          <p>{searchQuery ? '無符合條件的註冊代碼' : '目前尚無註冊代碼'}</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>代碼</th>
              <th>狀態</th>
              <th>建立者</th>
              <th>使用者</th>
              <th>建立時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="code-cell">{c.code}</td>
                <td>
                  <span className={`status-badge ${c.status === 'available' ? 'status-available' : 'status-used'}`}>
                    {c.status === 'available' ? '可用' : '已使用'}
                  </span>
                </td>
                <td>{c.created_by_email || '-'}</td>
                <td>{c.used_by_email || '-'}</td>
                <td>{new Date(c.created_at).toLocaleString()}</td>
                <td>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(c.id)}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}