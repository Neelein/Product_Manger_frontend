import { expect, test } from '@playwright/test'
import { registerAndLogin, unique } from './helpers'

test('create an announcement, see it in the list, and open the detail', async ({
  page,
}) => {
  await registerAndLogin(page)

  const title = unique('公告')
  const content = `這是 E2E 公告內容 - ${unique('內容')}`

  await page.goto('/announcements')
  await page.getByRole('link', { name: '建立佈告' }).click()
  await expect(page.getByRole('heading', { name: '建立公告' })).toBeVisible()
  await page.getByLabel('標題').fill(title)
  await page.getByLabel('內容').fill(content)
  await page.getByRole('button', { name: '發布公告' }).click()

  await expect(
    page.getByRole('heading', { name: title }),
  ).toBeVisible()
  await expect(page.getByText(content)).toBeVisible()

  await page.goto('/announcements')
  await expect(page.getByText(title)).toBeVisible()
  await page.getByText(title).click()
  await expect(page.getByText(content)).toBeVisible()
})