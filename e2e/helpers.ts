import { expect, type Page } from '@playwright/test'
import { Pool } from 'pg'

export function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function uniqueEmail(): string {
  return `${unique('e2e')}@example.com`
}

function dbUrl(): string {
  return (
    process.env.E2E_DATABASE_URL ??
    'postgres://root:root123@localhost:5432/productdb_e2e?sslmode=disable'
  )
}

// freshCode inserts a one-time registration code directly into the e2e DB.
export async function freshCode(): Promise<string> {
  const pool = new Pool({ connectionString: dbUrl() })
  try {
    const code = unique('CODE').replace(/[^a-zA-Z0-9]/g, '')
    await pool.query(
      "INSERT INTO registration_codes (code) VALUES ($1)",
      [code],
    )
    return code
  } finally {
    await pool.end()
  }
}

// promoteToAdmin promotes an existing registered member to admin in the e2e DB.
export async function promoteToAdmin(email: string): Promise<void> {
  const pool = new Pool({ connectionString: dbUrl() })
  try {
    await pool.query(
      "UPDATE members SET member_type = 'employee', permission = 'admin' WHERE email = $1",
      [email],
    )
  } finally {
    await pool.end()
  }
}

// freshCategory inserts a new category directly into the e2e DB and returns it.
export async function freshCategory(): Promise<{ id: string; name: string }> {
  const pool = new Pool({ connectionString: dbUrl() })
  try {
    const name = unique('類別')
    const { rows } = await pool.query<{ id: string; name: string }>(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
      [name],
    )
    return rows[0]
  } finally {
    await pool.end()
  }
}

async function fillRegisterForm(
  page: Page,
  name: string,
  email: string,
  password: string,
  code: string,
) {
  await expect(page.getByLabel('姓名')).toBeVisible()
  await page.getByLabel('姓名').fill(name)
  await page.getByLabel('註冊代碼').fill(code)
  await page.getByLabel('電子郵件').fill(email)
  await page.getByLabel('密碼', { exact: true }).fill(password)
  await page.getByLabel('確認密碼').fill(password)
}

async function loginForm(
  page: Page,
  email: string,
  password: string,
) {
  await expect(page.getByLabel('電子郵件')).toBeVisible()
  await page.getByLabel('電子郵件').fill(email)
  await page.getByLabel('密碼').fill(password)
}

export async function registerAndLogin(
  page: Page,
  baseEmail?: string,
): Promise<{ name: string; email: string; password: string }> {
  const name = unique('測試使用者')
  const password = 'e2e-test-123'
  const email = baseEmail ?? uniqueEmail()
  const code = await freshCode()

  await page.goto('/login')
  await page.getByRole('button', { name: '註冊', exact: true }).click()
  await fillRegisterForm(page, name, email, password, code)
  await page.getByRole('button', { name: '註冊', exact: true }).last().click()

  await expect(page.getByText('註冊成功！請切換至登入頁面')).toBeVisible()
  await login(page, email, password)
  await expect(page).toHaveURL(/\/home/)

  return { name, email, password }
}

export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login')
  await page.getByRole('button', { name: '登入', exact: true }).first().click()
  await loginForm(page, email, password)
  await page.getByRole('button', { name: '登入', exact: true }).last().click()
  await expect(page).toHaveURL(/\/home/)
}
