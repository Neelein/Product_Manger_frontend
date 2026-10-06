import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as departmentsApi from '../api'
import type { Department, Employee } from '../types'

export function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingCode, setEditingCode] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [departmentResponse, employeeResponse] = await Promise.all([departmentsApi.listDepartments(), departmentsApi.listEmployees(query, page)])
      setDepartments(departmentResponse.departments)
      setEmployees(employeeResponse.members)
      setTotal(employeeResponse.total)
      setError('')
    } catch (err) { setError(err instanceof Error ? err.message : '載入失敗') } finally { setLoading(false) }
  }, [page, query])
  useEffect(() => { void load() }, [load])

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')
    const departmentName = name.trim()
    if (!departmentName) { setFormError('請輸入部門名稱'); return }
    setCreating(true)
    try { await departmentsApi.createDepartment({ name: departmentName }); setName(''); await load() } catch (err) { setFormError(err instanceof Error ? err.message : '建立失敗') } finally { setCreating(false) }
  }
  const assign = async (employee: Employee, code: number) => {
    try { await departmentsApi.updateMemberDepartment(employee.id, code); setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, department_code: code } : item)) } catch (err) { setError(err instanceof Error ? err.message : '指派失敗') }
  }
  const remove = async (code: number) => {
    if (!window.confirm('確定刪除此部門？')) return
    setActionError('')
    try { await departmentsApi.deleteDepartment(code); await load() } catch (err) { setActionError(err instanceof Error ? err.message : '刪除失敗') }
  }
  const startEdit = (department: Department) => { setActionError(''); setEditingCode(department.code); setEditName(department.name) }
  const cancelEdit = () => { setEditingCode(null); setEditName('') }
  const update = async (code: number) => {
    setActionError('')
    const nextName = editName.trim()
    if (!nextName) { setActionError('請輸入部門名稱'); return }
    setSaving(true)
    try { await departmentsApi.updateDepartment(code, { name: nextName }); cancelEdit(); await load() } catch (err) { setActionError(err instanceof Error ? err.message : '更新失敗') } finally { setSaving(false) }
  }

  return <div className="departments-page">
    <div className="page-header"><div><Link to="/home" className="back-link">← 返回首頁</Link><h1>部門管理</h1><p className="page-subtitle">共 {departments.length} 個部門</p></div></div>
    {error && <div className="error-banner">⚠️ {error}</div>}
    <form className="search-bar" onSubmit={(event) => { event.preventDefault(); setPage(1); void load() }}><input aria-label="搜尋員工" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋 email、姓名或會員 ID" /><button className="btn-primary">搜尋</button></form>
    <form className="department-create-form" onSubmit={create}><input aria-label="部門名稱" value={name} onChange={(event) => setName(event.target.value)} placeholder="請輸入部門名稱" /><button className="btn-primary" disabled={creating}>{creating ? '建立中...' : '建立部門'}</button></form>
    {formError && <div className="error-banner">⚠️ {formError}</div>}
    {actionError && <div className="error-banner">⚠️ {actionError}</div>}
    {loading ? <div className="page-loading">載入中...</div> : <>
      <section className="department-section">
        <h2>部門</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>代碼</th><th>名稱</th><th>操作</th></tr></thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.code}>
                  {editingCode === department.code ? (
                    <>
                      <td>{department.code}</td>
                      <td><input className="department-rename-input" type="text" value={editName} onChange={(event) => setEditName(event.target.value)} /></td>
                      <td>
                        <button className="btn-primary btn-sm" onClick={() => void update(department.code)} disabled={saving}>{saving ? '儲存中...' : '儲存'}</button>
                        <button className="btn-secondary btn-sm" onClick={cancelEdit} disabled={saving}>取消</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{department.code}</td><td>{department.name}</td>
                      <td><button className="btn-secondary btn-sm" onClick={() => startEdit(department)}>編輯</button><button className="btn-danger btn-sm" onClick={() => void remove(department.code)}>刪除</button></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="department-section">
        <h2>員工（共 {total} 人）</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>ID</th><th>姓名</th><th>Email</th><th>部門</th></tr></thead>
            <tbody>
              {employees.map((employee) => <tr key={employee.id}><td>{employee.id}</td><td>{employee.name}</td><td>{employee.email}</td><td><select className="department-select" value={employee.department_code} onChange={(event) => void assign(employee, Number(event.target.value))}><option value={0}>未分組</option>{departments.map((department) => <option key={department.code} value={department.code}>{department.name}</option>)}</select></td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="department-pagination"><button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>上一頁</button><span>第 {page} 頁</span><button className="btn-secondary btn-sm" disabled={page * 20 >= total} onClick={() => setPage((current) => current + 1)}>下一頁</button></div>
      </section>
    </>}
  </div>
}
