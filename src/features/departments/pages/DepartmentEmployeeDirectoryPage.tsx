import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as departmentsApi from '../api'
import type { DepartmentEmployee, EmployeeDirectorySortBy, EmployeeDirectorySortOrder } from '../types'

const limit = 20
const sortLabels: Record<Exclude<EmployeeDirectorySortBy, 'id'>, string> = { name: '姓名', email: 'Email', phone: '電話' }

export function DepartmentEmployeeDirectoryPage() {
  const { departmentCode = '' } = useParams()
  const [employees, setEmployees] = useState<DepartmentEmployee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<EmployeeDirectorySortBy>('id')
  const [sortOrder, setSortOrder] = useState<EmployeeDirectorySortOrder>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await departmentsApi.listDepartmentEmployees(departmentCode, { search, page, limit, sort_by: sortBy, sort_order: sortOrder })
      setEmployees(response.employees)
      setTotal(response.total)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入員工失敗')
    } finally { setLoading(false) }
  }, [departmentCode, page, search, sortBy, sortOrder])

  useEffect(() => { void load() }, [load])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }
  const changeSort = (nextSortBy: EmployeeDirectorySortBy) => {
    if (sortBy === nextSortBy) setSortOrder((current) => current === 'asc' ? 'desc' : 'asc')
    else { setSortBy(nextSortBy); setSortOrder('asc') }
    setPage(1)
  }
  const pageCount = Math.max(1, Math.ceil(total / limit))

  return <div className="department-directory-page">
    <div className="page-header"><div><Link to="/home" className="back-link">← 返回首頁</Link><h1>部門員工</h1><p className="page-subtitle">部門代碼：{departmentCode}・共 {total} 人</p></div></div>
    {error && <div className="error-banner" role="alert">⚠️ {error}</div>}
    <form className="search-bar" onSubmit={submitSearch}><input aria-label="搜尋部門員工" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="搜尋姓名、Email 或電話" /><button className="btn-primary">搜尋</button></form>
    {loading ? <div className="page-loading">載入中...</div> : <>
      <div className="table-scroll"><table className="data-table directory-table"><thead><tr>{(['name', 'email'] as const).map((key) => <th key={key}><button className="sort-button" onClick={() => changeSort(key)}>{sortLabels[key]} {sortBy === key ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</button></th>)}<th>部門</th><th><button className="sort-button" onClick={() => changeSort('phone')}>{sortLabels.phone} {sortBy === 'phone' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</button></th></tr></thead>
         <tbody>{employees.map((employee) => <tr key={employee.id}><td>{employee.name}</td><td>{employee.email}</td><td>{employee.department.name}</td><td>{employee.phone || '—'}</td></tr>)}</tbody>
      </table></div>
      {employees.length === 0 && <div className="empty-state">目前沒有符合條件的員工</div>}
      <div className="department-pagination"><button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>上一頁</button><span>第 {page} / {pageCount} 頁</span><button className="btn-secondary btn-sm" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>下一頁</button></div>
    </>}
  </div>
}
