import { expect, test } from '@playwright/test'
import { registerAndLogin, unique } from './helpers'

function currentMonthFirstDay(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

test('create an event and see it on the calendar', async ({ page }) => {
  await registerAndLogin(page)

  const title = unique('活動')
  const startDate = currentMonthFirstDay()

  await page.goto('/calendar')
  await page.getByRole('button', { name: '+ 新增事件' }).click()
  await expect(page.getByRole('heading', { name: '建立事件' })).toBeVisible()

  await page.getByLabel('標題').fill(title)
  await page.getByLabel('開始時間').fill(`${startDate}T10:00`)
  await page.getByLabel('結束時間').fill(`${startDate}T12:00`)
  await page.getByRole('button', { name: '建立事件' }).click()

  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.goto('/calendar')
  await expect(page.getByText(title)).toBeVisible()
})