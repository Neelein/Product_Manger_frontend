import { expect, test } from '@playwright/test'
import { registerAndLogin, unique } from './helpers'

test('create a chat room, open it, and send a message', async ({ page }) => {
  await registerAndLogin(page)

  const roomName = unique('聊天室')
  const message = `E2E 訊息 - ${unique('msg')}`

  await page.goto('/chat/rooms')
  await page.getByRole('link', { name: '建立聊天室' }).click()
  await expect(page.getByRole('heading', { name: '建立聊天室' })).toBeVisible()
  await page.getByPlaceholder('輸入聊天室名稱').fill(roomName)
  await page.getByRole('button', { name: '建立聊天室' }).click()

  await expect(page).toHaveURL(/\/chat\/rooms$/)
  await expect(page.getByText(roomName)).toBeVisible()
  await page.getByText(roomName).click()

  await expect(
    page.getByRole('button', { name: '＋ 邀請成員' }),
  ).toBeVisible()

  await page.getByPlaceholder('輸入訊息...').fill(message)
  await page.getByRole('button', { name: '傳送' }).click()
  await expect(page.getByText(message)).toBeVisible()
})