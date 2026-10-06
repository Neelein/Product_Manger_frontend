import { apiFetch } from '../../../shared/api/client.ts'
import type { Department, DepartmentEmployeeListResponse, EmployeeDirectorySortBy, EmployeeDirectorySortOrder, DepartmentListResponse, DepartmentRequest, EmployeeListResponse } from '../types/index.ts'

export function listDepartments(): Promise<DepartmentListResponse> { return apiFetch<DepartmentListResponse>('/api/departments') }
export function createDepartment(data: DepartmentRequest): Promise<Department> { return apiFetch<Department>('/api/departments', { method: 'POST', body: JSON.stringify(data) }) }
export function updateDepartment(code: number, data: DepartmentRequest): Promise<Department> { return apiFetch<Department>(`/api/departments/${code}`, { method: 'PATCH', body: JSON.stringify(data) }) }
export function deleteDepartment(code: number): Promise<{ message: string }> { return apiFetch<{ message: string }>(`/api/departments/${code}`, { method: 'DELETE' }) }
export function listEmployees(query = '', page = 1, limit = 20): Promise<EmployeeListResponse> {
  const params = new URLSearchParams({ query, page: String(page), limit: String(limit) })
  return apiFetch<EmployeeListResponse>(`/api/members?${params.toString()}`)
}
export function updateMemberDepartment(memberId: string, departmentCode: number): Promise<void> {
  return apiFetch<void>(`/api/members/${memberId}/department`, { method: 'PUT', body: JSON.stringify({ department_code: departmentCode }) })
}

export interface DepartmentEmployeeQuery {
  search?: string
  page?: number
  limit?: number
  sort_by?: EmployeeDirectorySortBy
  sort_order?: EmployeeDirectorySortOrder
}

export function listDepartmentEmployees(departmentCode: string, query: DepartmentEmployeeQuery = {}): Promise<DepartmentEmployeeListResponse> {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? 20))
  if (query.sort_by) params.set('sort_by', query.sort_by)
  if (query.sort_order) params.set('sort_order', query.sort_order)
  return apiFetch<DepartmentEmployeeListResponse>(`/api/departments/${encodeURIComponent(departmentCode)}/employees?${params.toString()}`)
}
