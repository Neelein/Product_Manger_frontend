import { expect, test } from '@playwright/test'
import { registerAndLogin, unique } from './helpers'

async function createProduct(
  page: import('@playwright/test').Page,
  name: string,
  category: string,
) {
  await page.goto('/products')
  await page.getByRole('link', { name: '新增產品' }).click()
  await expect(page.getByRole('heading', { name: '新增產品' })).toBeVisible()
  await page.getByLabel('產品名稱 *').fill(name)
  await page.getByLabel('分類 *').fill(category)
  await page.getByRole('button', { name: '建立產品' }).click()
}

async function createProductDetail(
  page: import('@playwright/test').Page,
  introduction: string,
) {
  await page.getByRole('button', { name: '建立詳細資訊' }).click()
  await page.getByLabel('介紹').fill(introduction)
  await page.getByRole('button', { name: '建立', exact: true }).last().click()
  await expect(page.getByText('詳細資訊已建立')).toBeVisible()
}

async function addPrice(
  page: import('@playwright/test').Page,
  label: string,
  amount: string,
) {
  await page.getByLabel('新增 - 標籤').fill(label)
  await page.getByLabel('金額').fill(amount)
  await page.getByRole('button', { name: '新增', exact: true }).click()
}

test('create a product, see it in the list, add a price, and update it', async ({
  page,
}) => {
  await registerAndLogin(page)

  const productName = unique('產品')
  const newName = `${productName}-已更新`
  const category = unique('電子產品')

  await createProduct(page, productName, category)

  await expect(
    page.getByRole('heading', { name: productName }),
  ).toBeVisible()

  await page.goto('/products')
  await expect(page.getByRole('link', { name: productName })).toBeVisible()

  await page.getByRole('link', { name: productName }).click()
  await expect(
    page.getByRole('heading', { name: productName }),
  ).toBeVisible()

  await createProductDetail(page, 'E2E 產品介紹')
  await addPrice(page, unique('成人票'), '900')

  await expect(page.getByText('900')).toBeVisible()

  await page.getByRole('link', { name: '編輯' }).click()
  await expect(page.getByRole('heading', { name: '編輯產品' })).toBeVisible()
  await page.getByLabel('產品名稱 *').fill(newName)
  await page.getByRole('button', { name: '更新產品' }).click()
  await expect(page.getByRole('heading', { name: newName })).toBeVisible()
})

test('creating a product requires name and category', async ({ page }) => {
  await registerAndLogin(page)
  await page.goto('/products/new')
  await page.getByRole('button', { name: '建立產品' }).click()
  await expect(page.getByText('請填寫所有必填欄位')).toBeVisible()
})