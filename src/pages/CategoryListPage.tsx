import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as categoriesApi from '../api/categories'
import { useCategories } from '../hooks/useCategories'
import type { Category } from '../types'

export function CategoryListPage() {
  const { categories, loading, error, reload } = useCategories()
  const [nameInput, setNameInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const name = nameInput.trim()
    if (!name) {
      setFormError('請輸入類別名稱')
      return
    }
    setCreating(true)
    try {
      await categoriesApi.createCategory({ name })
      setNameInput('')
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '建立失敗')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (c: Category) => {
    setActionError('')
    setEditingId(c.id)
    setEditName(c.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const saveRename = async (id: string) => {
    setActionError('')
    const name = editName.trim()
    if (!name) {
      setActionError('請輸入類別名稱')
      return
    }
    setSaving(true)
    try {
      await categoriesApi.updateCategory(id, { name })
      setEditingId(null)
      setEditName('')
      await reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '更新失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c: Category) => {
    if (!window.confirm(`確定要刪除類別「${c.name}」嗎？`)) return
    setActionError('')
    try {
      await categoriesApi.deleteCategory(c.id)
      await reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <Link to="/home" className="back-link">← 返回首頁</Link>
          <h1>類別管理</h1>
          <p className="page-subtitle">共 {categories.length} 個類別</p>
        </div>
      </div>

      <form className="category-create-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="請輸入類別名稱"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={creating}>
          {creating ? '建立中...' : '建立類別'}
        </button>
      </form>
      {formError && <div className="error-banner">⚠️ {formError}</div>}
      {actionError && <div className="error-banner">⚠️ {actionError}</div>}

      {loading ? (
        <div className="page-loading">載入中...</div>
      ) : error ? (
        <div className="error-banner">⚠️ {error}</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <p>目前尚無類別，請先建立類別</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>類別名稱</th>
              <th>建立時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                {editingId === c.id ? (
                  <>
                    <td>
                      <input
                        className="category-rename-input"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td>{new Date(c.created_at).toLocaleString()}</td>
                    <td>
                      <button className="btn-primary btn-sm" onClick={() => saveRename(c.id)} disabled={saving}>
                        {saving ? '儲存中...' : '儲存'}
                      </button>
                      <button className="btn-secondary btn-sm" onClick={cancelEdit}>取消</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{c.name}</td>
                    <td>{new Date(c.created_at).toLocaleString()}</td>
                    <td>
                      <button className="btn-secondary btn-sm" onClick={() => startEdit(c)}>編輯</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(c)}>刪除</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}