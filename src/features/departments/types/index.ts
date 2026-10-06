export interface Department { code: number; name: string }
export interface DepartmentListResponse { departments: Department[] }
export interface DepartmentRequest { name: string }
export interface Employee {
  id: string
  email: string
  name: string
  member_type: 'employee'
  permission: string
  department_code: number
}
export interface EmployeeListResponse { members: Employee[]; total: number }

export type EmployeeDirectorySortBy = 'id' | 'name' | 'email' | 'phone'
export type EmployeeDirectorySortOrder = 'asc' | 'desc'

export interface DepartmentEmployee {
  id: string
  name: string
  email: string
  department: Department
  phone: string
}

export interface DepartmentEmployeeListResponse {
  employees: DepartmentEmployee[]
  total: number
  page: number
  limit: number
}
