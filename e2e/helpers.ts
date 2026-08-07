import { expect, type Page } from '@playwright/test'

export function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function uniqueEmail(): string {
  return `${unique('e2e')}@example.com`
}

async function fillRegisterForm(
  page: Page,
  name: string,
  email: string,
  password: string,
) {
  await expect(page.getByLabel('姓名')).toBeVisible()
  await page.getByLabel('姓名').fill(name)
  await page.getByLabel('電子郵件').fill(email)
  await page.getByLabel('密碼').fill(password)
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

  await page.goto('/login')
  await page.getByRole('button', { name: '註冊', exact: true }).click()
  await fillRegisterForm(page, name, email, password)
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