import { expect, test } from '@playwright/test'
import { promoteToAdmin, registerAndLogin } from './helpers'

test('non-admin member is blocked from the registration codes admin page', async ({
  page,
}) => {
  await registerAndLogin(page)

  await page.goto('/admin/registration-codes')
  await expect(page).toHaveURL(/\/home/)
  await expect(page.getByRole('heading', { name: '產品管理系統' })).toBeVisible()
})

test('admin can create, list and delete registration codes', async ({
  page,
}) => {
  const { email } = await registerAndLogin(page)
  await promoteToAdmin(email)
  // Reload so the client re-fetches /me and reflects the admin role.
  await page.reload()

  await expect(page.getByRole('link', { name: '註冊代碼' })).toBeVisible()
  await page.getByRole('link', { name: '註冊代碼' }).click()
  await expect(page).toHaveURL(/\/admin\/registration-codes/)
  await expect(page.getByRole('heading', { name: '註冊代碼管理' })).toBeVisible()

  // Create with a custom code string.
  const customCode = 'ADMIN-CUSTOM-' + Date.now().toString(36).toUpperCase()
  await page.getByPlaceholder('留空將自動產生代碼').fill(customCode)
  await page.getByRole('button', { name: '建立代碼', exact: true }).click()
  await expect(page.getByText(customCode)).toBeVisible()

  // Auto-generate a code with a blank input.
  await page.getByRole('button', { name: '建立代碼', exact: true }).click()

  // Delete the custom code.
  page.once('dialog', (dialog) => dialog.accept())
  const row = page.locator('tr', { hasText: customCode })
  await row.getByRole('button', { name: '刪除' }).click()
  await expect(page.getByText(customCode)).toHaveCount(0)
})

test('registering with an invalid code is rejected', async ({ page }) => {
  const name = '無效代碼 ' + Date.now()
  const email = `invalid-${Date.now()}@example.com`

  await page.goto('/login')
  await page.getByRole('button', { name: '註冊', exact: true }).click()
  await page.getByLabel('姓名').fill(name)
  await page.getByLabel('註冊代碼').fill('NOPE-NOPE-NOPE')
  await page.getByLabel('電子郵件').fill(email)
  await page.getByLabel('密碼', { exact: true }).fill('e2e-test-123')
  await page.getByLabel('確認密碼').fill('e2e-test-123')
  await page.getByRole('button', { name: '註冊', exact: true }).last().click()

  await expect(page.getByLabel('電子郵件')).toBeVisible()
  await expect(page.getByText('invalid registration code')).toBeVisible()
})