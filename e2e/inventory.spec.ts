import { expect, test } from '@playwright/test'
import { freshCategory, registerAndLogin, unique } from './helpers'

async function createProductAndPrice(
  page: import('@playwright/test').Page,
): Promise<string> {
  const name = unique('庫存產品')
  const category = await freshCategory()
  await page.goto('/products')
  await page.getByRole('link', { name: '新增產品' }).click()
  await page.getByLabel('產品名稱 *').fill(name)
  await page.getByLabel('分類 *').selectOption(category.name)
  await page.getByRole('button', { name: '建立產品' }).click()

  await page.getByRole('button', { name: '建立詳細資訊' }).click()
  await page.getByLabel('介紹').fill(`${name} 介紹`)
  await page.getByRole('button', { name: '建立', exact: true }).last().click()
  await expect(page.getByText('詳細資訊已建立')).toBeVisible()

  const priceLabel = unique('成人票')
  await page.getByLabel('新增 - 標籤').fill(priceLabel)
  await page.getByLabel('金額').fill('800')
  await page.getByRole('button', { name: '新增', exact: true }).click()
  await expect(page.getByText('800')).toBeVisible()

  return name
}

test('create a product with price, create an inventory, list it, add an item', async ({
  page,
}) => {
  await registerAndLogin(page)
  await createProductAndPrice(page)

  await page.getByRole('link', { name: '建立庫存' }).click()
  await expect(page.getByRole('heading', { name: '建立庫存' })).toBeVisible()
  await page.getByRole('button', { name: '建立庫存' }).click()

  await expect(page.getByRole('heading', { name: '庫存項目' })).toBeVisible()

  const itemCode = unique('SKU')
  await page.getByLabel('項目編號').fill(itemCode)
  await page.getByLabel('成本').fill('500')
  await page.getByRole('button', { name: '新增', exact: true }).click()
  await expect(page.getByText(itemCode)).toBeVisible()

  await page.goto('/inventory')
  await expect(page.getByRole('link', { name: /成人票/ })).toBeVisible()
})