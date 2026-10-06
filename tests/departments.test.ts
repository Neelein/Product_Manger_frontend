import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { isAdminMember } from '../src/features/auth/authorization.ts'
import { deleteDepartment, listDepartmentEmployees } from '../src/features/departments/api/departments.ts'

const departmentPage = readFileSync(new URL('../src/features/departments/pages/DepartmentManagementPage.tsx', import.meta.url), 'utf8')
const directoryPage = readFileSync(new URL('../src/features/departments/pages/DepartmentEmployeeDirectoryPage.tsx', import.meta.url), 'utf8')
const entryPage = readFileSync(new URL('../src/features/departments/pages/DepartmentEntryPage.tsx', import.meta.url), 'utf8')
const routes = readFileSync(new URL('../src/app/AppRoutes.tsx', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../src/app/layout/Layout.tsx', import.meta.url), 'utf8')
const appCss = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

test('department management remains admin-only', () => {
  assert.equal(isAdminMember({ id: '1', email: 'a', name: 'a', member_type: 'employee', permission: 'admin' }), true)
  assert.equal(isAdminMember({ id: '1', email: 'a', name: 'a', member_type: 'employee', permission: 'staff' }), false)
  assert.equal(isAdminMember({ id: '1', email: 'a', name: 'a', member_type: 'customer', permission: 'admin' }), false)
})

test('deleteDepartment uses DELETE and returns the JSON response', async () => {
  const originalFetch = globalThis.fetch
  let requestUrl = ''
  let requestMethod = ''

  globalThis.fetch = async (input, init) => {
    requestUrl = String(input)
    requestMethod = init?.method ?? 'GET'
    return new Response(JSON.stringify({ message: 'department deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const response = await deleteDepartment(42)

    assert.equal(requestUrl, '/api/departments/42')
    assert.equal(requestMethod, 'DELETE')
    assert.deepEqual(response, { message: 'department deleted' })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('department management uses inline rename controls and preserves employee controls', () => {
  assert.doesNotMatch(departmentPage, /window\.prompt/)
  assert.match(departmentPage, /department-rename-input/)
  assert.match(departmentPage, /className="department-select"/)
  assert.match(appCss, /\.departments-page \.department-select \{/)
  assert.match(appCss, /width: 100%; padding: 12px 16px;/)
  assert.match(appCss, /padding-right: 32px;/)
  assert.match(appCss, /border: 1\.5px solid #e2e8f0;/)
  assert.match(appCss, /border-radius: 12px; font-size: 15px;/)
  assert.match(appCss, /color: #0f172a; background: #f8fafc;/)
  assert.match(appCss, /transition: all 0\.2s ease; outline: none;/)
  assert.match(appCss, /box-sizing: border-box;/)
  assert.match(appCss, /\.departments-page \.department-select:focus \{[\s\S]*border-color: #3b82f6; background: #ffffff;[\s\S]*box-shadow: 0 0 0 4px rgba\(59, 130, 246, 0\.1\);/)
  assert.match(departmentPage, /儲存中\.\.\./)
  assert.match(departmentPage, /請輸入部門名稱/)
  assert.match(departmentPage, /搜尋員工/)
  assert.match(departmentPage, /上一頁/)
  assert.match(departmentPage, /updateMemberDepartment/)
})

test('department employee directory requests the scoped query contract', async () => {
  const originalFetch = globalThis.fetch
  let requestUrl = ''
  globalThis.fetch = async (input) => {
    requestUrl = String(input)
    return new Response(JSON.stringify({ employees: [], total: 0, page: 2, limit: 20 }), { status: 200 })
  }
  try {
    const response = await listDepartmentEmployees('sales west', { search: 'alice', page: 2, limit: 20, sort_by: 'email', sort_order: 'desc' })
    assert.deepEqual(response, { employees: [], total: 0, page: 2, limit: 20 })
    assert.equal(requestUrl, '/api/departments/sales%20west/employees?search=alice&page=2&limit=20&sort_by=email&sort_order=desc')
  } finally { globalThis.fetch = originalFetch }
})

test('directory is protected for every employee and remains read-only', () => {
  assert.match(routes, /path="\/admin\/departments\/:departmentCode\/employees" element={<ProtectedRoute><DepartmentEmployeeDirectoryPage \/><\/ProtectedRoute>} \/>/)
  assert.doesNotMatch(routes, /DepartmentEmployeeDirectoryPage<\/AdminRoute>/)
  assert.doesNotMatch(layout, /我的部門/)
  assert.match(directoryPage, /搜尋部門員工/)
  assert.match(directoryPage, /sortLabels/)
  assert.match(directoryPage, /上一頁/)
  assert.match(directoryPage, /電話/)
  assert.doesNotMatch(directoryPage, /\bID\b|employee\.id<\/td>/)
  assert.match(directoryPage, /\[['"]name['"], ['"]email['"]\]/)
  assert.match(directoryPage, /employee\.name/)
  assert.match(directoryPage, /employee\.email/)
  assert.match(directoryPage, /employee\.department\.name/)
  assert.match(directoryPage, /employee\.phone/)
  assert.doesNotMatch(directoryPage, /updateMemberDepartment|createDepartment|deleteDepartment/)
})

test('department entry exposes the exact navigation contract and role visibility', () => {
  assert.doesNotMatch(entryPage, /<h1>部門<\/h1>/)
  assert.doesNotMatch(entryPage, /選擇要使用的部門功能/)
  assert.match(entryPage, /to="\/home" className="back-link">← 返回首頁<\/Link>/)
  assert.match(layout, /className="nav-link">部門<\/Link>/)
  assert.match(layout, /to="\/admin\/departments\/entry"/)
  assert.match(layout, /to="\/home" className="nav-link">產品<\/Link>/)
  assert.match(layout, /to="\/messages" className="nav-link">訊息<\/Link>/)
  assert.match(layout, /to="\/events" className="nav-link">事件管理<\/Link>/)
  assert.match(layout, /to="\/admin\/registration-codes" className="nav-link">註冊代碼<\/Link>/)
  assert.doesNotMatch(layout, /to=\{`\/admin\/departments\/\$\{member\.department_code\}\/employees`\}/)
  assert.match(entryPage, /部門管理/)
  assert.match(entryPage, /部門瀏覽/)
  assert.match(entryPage, /to="\/admin\/departments\/1\/employees"/)
  assert.match(entryPage, /isAdminMember\(member\).*部門管理/s)
  assert.match(entryPage, /to="\/admin\/departments" className="dashboard-card"/)
  assert.match(routes, /path="\/admin\/departments\/entry" element={<ProtectedRoute><DepartmentEntryPage \/><\/ProtectedRoute>} \/>/)
  assert.match(routes, /path="\/admin\/departments" element={<AdminRoute><DepartmentManagementPage \/><\/AdminRoute>} \/>/)
})
