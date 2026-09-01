import { expect, test } from '@playwright/test'
import { freshCode, login, registerAndLogin } from './helpers'

test('register a new user and land on the protected home page', async ({
  page,
}) => {
  const { name, email, password } = await registerAndLogin(page)

  await expect(page.getByRole('heading', { name: '產品管理系統' })).toBeVisible()
  await expect(page.getByRole('link', { name })).toBeVisible()

  await page.getByRole('button', { name: '登出' }).click()
  await expect(page.getByLabel('電子郵件')).toBeVisible()

  await login(page, email, password)
  await expect(page).toHaveURL(/\/home/)
  await expect(page.getByRole('link', { name })).toBeVisible()
})

test('visiting /home without a session redirects to login', async ({ page }) => {
  await page.goto('/home')
  await expect(page.getByLabel('電子郵件')).toBeVisible()
})

test('me profile name is shown in the navbar after login', async ({
  page,
}) => {
  const { name, email, password } = await registerAndLogin(page)
  await expect(page.getByRole('link', { name })).toBeVisible()

  await page.getByRole('button', { name: '登出' }).click()
  await expect(page.getByLabel('電子郵件')).toBeVisible()

  await login(page, email, password)
  await page.goto('/home')
  await expect(page.getByRole('link', { name })).toBeVisible()
})

test('registering with a mismatched password confirmation is rejected', async ({
  page,
}) => {
  const code = await freshCode()
  const email = `mismatch-${Date.now()}@example.com`

  await page.goto('/login')
  await page.getByRole('button', { name: '註冊', exact: true }).click()
  await page.getByLabel('姓名').fill('密碼不符測試')
  await page.getByLabel('註冊代碼').fill(code)
  await page.getByLabel('電子郵件').fill(email)
  await page.getByLabel('密碼', { exact: true }).fill('e2e-a-12345')
  await page.getByLabel('確認密碼').fill('different-99999')
  await page.getByRole('button', { name: '註冊', exact: true }).last().click()

  await expect(page.getByText('兩次輸入的密碼不一致')).toBeVisible()
  await expect(page.getByLabel('確認密碼')).toBeVisible()
})

test('changing password clears the session and returns to login', async ({ page }) => {
  const { password } = await registerAndLogin(page)

  await page.goto('/profile')
  await page.getByLabel('目前密碼').fill(password)
  await page.getByLabel('新密碼', { exact: true }).fill('e2e-new-123')
  await page.getByLabel('確認新密碼').fill('e2e-new-123')
  await page.getByRole('button', { name: '修改密碼' }).click()

  await expect(page.getByRole('status')).toHaveText(/密碼已更新，請重新登入/)
  await expect(page.getByLabel('電子郵件')).toBeVisible({ timeout: 2_000 })
  await expect(page).toHaveURL(/\/$/)
})
