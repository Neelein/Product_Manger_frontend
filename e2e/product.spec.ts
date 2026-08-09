import { expect, test } from '@playwright/test'
import { freshCategory, registerAndLogin, unique } from './helpers'

async function createProduct(
  page: import('@playwright/test').Page,
  name: string,
  category: { id: string; name: string },
) {
  await page.goto('/products')
  await page.getByRole('link', { name: '新增產品' }).click()
  await expect(page.getByRole('heading', { name: '新增產品' })).toBeVisible()
  await page.getByLabel('產品名稱 *').fill(name)
  await page.getByLabel('分類 *').selectOption(category.name)
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

  const category = await freshCategory()

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

  await expect(
    page.locator('.price-item-amount').filter({ hasText: /^900$/ }),
  ).toBeVisible()

  await page.getByRole('link', { name: '編輯' }).click()
  await expect(page.getByRole('heading', { name: '編輯產品' })).toBeVisible()
  await page.getByLabel('產品名稱 *').fill(newName)
  await page.getByLabel('分類 *').selectOption(category.name)
  await page.getByRole('button', { name: '更新產品' }).click()
  await expect(page.getByRole('heading', { name: newName })).toBeVisible()
})

test('creating a product requires name and category', async ({ page }) => {
  await registerAndLogin(page)
  await page.goto('/products/new')
  await page.getByRole('button', { name: '建立產品' }).click()
  await expect(page.getByText('請填寫所有必填欄位')).toBeVisible()
})

test('creates an option-backed variant with a shared price and variant inventory', async ({ page }) => {
  await registerAndLogin(page)
  const productName = unique('變體產品')
  const category = await freshCategory()

  await createProduct(page, productName, category)
  await createProductDetail(page, `${productName} 介紹`)
  const priceLabel = unique('標準票')
  await addPrice(page, priceLabel, '1200')

  const priceSection = page
    .locator('.section-card')
    .filter({ has: page.getByRole('heading', { name: '價格設定', exact: true }) })
  await expect(priceSection.getByRole('link', { name: '建立庫存' })).toHaveCount(0)
  await expect(priceSection.getByRole('link', { name: '管理庫存' })).toHaveCount(0)
  await expect(priceSection.getByText(/^庫存:/)).toHaveCount(0)

  await page.getByLabel('規格名稱').fill('顏色')
  await page.getByLabel('規格值').fill('藍色')
  await page.getByRole('button', { name: '新增規格' }).click()
  await expect(
    page
      .locator('.section-card')
      .filter({
        has: page.getByRole('heading', { name: '規格選項', exact: true }),
      })
      .locator('.option-item strong')
      .filter({ hasText: /^顏色$/ }),
  ).toBeVisible()

  const priceOption = page
    .getByLabel('套用價格')
    .locator('option')
    .filter({ hasText: priceLabel })
  await expect(priceOption).toHaveCount(1)
  const priceValue = await priceOption.getAttribute('value')
  expect(priceValue).toBeTruthy()
  await page.getByLabel('套用價格').selectOption(priceValue!)
  await page.getByLabel('SKU（選填）').fill('BLUE-001')
  await page.getByRole('checkbox', { name: '顏色: 藍色' }).check()
  await page.getByRole('button', { name: '新增變體' }).click()

  await expect(page.getByText('顏色: 藍色')).toBeVisible()
  await expect(page.getByText('BLUE-001')).toBeVisible()

  const inventoryRequest = page.waitForRequest(request =>
    request.url().endsWith('/api/inventories') && request.method() === 'POST',
  )
  await page.getByRole('link', { name: '建立庫存' }).click()
  await expect(page.getByRole('heading', { name: '建立庫存' })).toBeVisible()
  await page.getByRole('button', { name: '建立庫存' }).click()
  const requestBody = JSON.parse((await inventoryRequest).postData() || '{}') as Record<string, string>
  expect(requestBody.product_variant_id).toBeTruthy()
  expect(requestBody.product_price_id).toBeUndefined()
  await expect(page.getByRole('heading', { name: '庫存項目' })).toBeVisible()
})
