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

test('edit an event time and see the updated values in read-only detail', async ({ page }) => {
  await registerAndLogin(page)

  const title = unique('編輯活動')
  const eventDate = currentMonthFirstDay()
  const initialStart = `${eventDate}T08:00`
  const initialEnd = `${eventDate}T09:00`
  const updatedStart = `${eventDate}T14:30`
  const updatedEnd = `${eventDate}T16:45`

  await page.goto('/calendar')
  await page.getByRole('button', { name: '+ 新增事件' }).click()
  await expect(page.getByRole('heading', { name: '建立事件' })).toBeVisible()
  await page.getByLabel('標題').fill(title)
  await page.getByLabel('開始時間').fill(initialStart)
  await page.getByLabel('結束時間').fill(initialEnd)
  await page.getByRole('button', { name: '建立事件' }).click()

  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await page.getByRole('button', { name: '編輯' }).click()
  await expect(page.getByRole('heading', { name: '編輯事件' })).toBeVisible()
  await page.getByLabel('開始時間').fill(updatedStart)
  await page.getByLabel('結束時間').fill(updatedEnd)
  await page.getByRole('button', { name: '儲存' }).click()

  await expect(page.getByRole('heading', { name: '編輯事件' })).toBeHidden()
  const expectedStart = await page.evaluate(value => new Date(value).toLocaleString(), updatedStart)
  const expectedEnd = await page.evaluate(value => new Date(value).toLocaleString(), updatedEnd)
  await expect(page.getByText('開始時間', { exact: true }).locator('..').getByRole('paragraph'))
    .toHaveText(expectedStart)
  await expect(page.getByText('結束時間', { exact: true }).locator('..').getByRole('paragraph'))
    .toHaveText(expectedEnd)
})
