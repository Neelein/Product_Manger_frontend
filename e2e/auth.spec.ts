import { expect, test } from '@playwright/test'
import { login, registerAndLogin } from './helpers'

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