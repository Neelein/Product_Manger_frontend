import { expect, test } from '@playwright/test'
import { freshCategory, registerAndLogin, unique } from './helpers'
import { validPngBytes } from './fixtures/valid-images'

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

test('uploads product images after creation and displays persisted images', async ({ page }) => {
  await registerAndLogin(page)
  const category = await freshCategory()
  const imageRequests: string[] = []
  await page.route('**/api/products/*/images', async route => {
    const request = route.request()
    imageRequests.push(request.method())
    if (request.method() === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ images: [{ id: 'image-1', product_id: 'product-1', filename: 'chair.png', url: '/media/images/products/product-1/chair.png', created_at: new Date().toISOString() }] }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ images: [{ id: 'image-1', product_id: 'product-1', filename: 'chair.png', url: '/media/images/products/product-1/chair.png', created_at: new Date().toISOString() }] }) })
    }
  })

  await page.goto('/products/new')
  await page.getByLabel('產品名稱 *').fill(unique('圖片產品'))
  await page.getByLabel('分類 *').selectOption(category.name)
  await page.getByLabel('產品圖片（最多 3 張，每張 10MB）').setInputFiles({ name: 'chair.png', mimeType: 'image/png', buffer: Buffer.from('png') })
  await expect(page.locator('.product-image-preview')).toHaveCount(1)
  await page.getByRole('button', { name: '建立產品' }).click()
  await expect(page.getByRole('heading', { name: /圖片產品/ })).toBeVisible()
  await expect(page.locator('.product-images-section .product-image-preview')).toHaveCount(1)
  expect(imageRequests).toContain('POST')
})

test('appends a product image from the edit page against productdb_e2e', async ({ page }) => {
  await registerAndLogin(page)
  const category = await freshCategory()
  const productName = unique('追加圖片產品')

  await page.goto('/products/new')
  await page.getByLabel('產品名稱 *').fill(productName)
  await page.getByLabel('分類 *').selectOption(category.name)
  await page.getByLabel('產品圖片（最多 3 張，每張 10MB）').setInputFiles({
    name: 'first.png',
    mimeType: 'image/png',
    buffer: validPngBytes(),
  })

  const createImagesRequest = page.waitForRequest(request =>
    request.url().match(/\/api\/products\/[^/]+\/images$/) !== null &&
    request.method() === 'POST',
  )
  await page.getByRole('button', { name: '建立產品' }).click()
  await expect(page.getByRole('heading', { name: productName })).toBeVisible()
  const createdImagesRequest = await createImagesRequest
  expect(createdImagesRequest.method()).toBe('POST')
  expect(createdImagesRequest.headers()['content-type']).toContain('multipart/form-data')
  await expect(page.locator('.product-images-section .product-image-preview')).toHaveCount(1)

  await page.getByRole('link', { name: '編輯' }).click()
  await expect(page.getByRole('heading', { name: '編輯產品' })).toBeVisible()
  await expect(page.locator('.product-image-grid .product-image-preview')).toHaveCount(1)
  await page.getByLabel('產品圖片（最多 3 張，每張 10MB）').setInputFiles({
    name: 'second.png',
    mimeType: 'image/png',
    buffer: validPngBytes(),
  })

  const updateRequest = page.waitForRequest(request =>
    request.url().endsWith('/update') && request.method() === 'POST',
  )
  const appendImagesRequest = page.waitForRequest(request =>
    request.url().match(/\/api\/products\/[^/]+\/images$/) !== null &&
    request.method() === 'POST',
  )
  await page.getByRole('button', { name: '更新產品' }).click()
  const updatedProductRequest = await updateRequest
  const appendedImagesRequest = await appendImagesRequest
  expect(updatedProductRequest.method()).toBe('POST')
  expect(updatedProductRequest.url()).toMatch(/\/api\/products\/[^/]+\/update$/)
  expect(appendedImagesRequest.method()).toBe('POST')
  expect(appendedImagesRequest.headers()['content-type']).toContain('multipart/form-data')
  await expect(page.getByRole('heading', { name: productName })).toBeVisible()
  await expect(page.locator('.product-images-section .product-image-preview')).toHaveCount(2)

  await page.once('dialog', dialog => dialog.accept())
  const deleteImageRequest = page.waitForRequest(request =>
    request.url().match(/\/api\/products\/[^/]+\/images\/[^/]+\/delete$/) !== null &&
    request.method() === 'POST',
  )
  await page.getByRole('button', { name: '刪除圖片 first.png' }).click()
  await deleteImageRequest
  await expect(page.locator('.product-image-grid .product-image-preview')).toHaveCount(1)

  await page.route('**/api/products/*/images/*/delete', route =>
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: '圖片刪除失敗' }) }),
  )
  await page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: '刪除圖片 second.png' }).click()
  await expect(page.getByRole('alert')).toContainText('圖片刪除失敗')
  await expect(page.locator('.product-image-grid .product-image-preview')).toHaveCount(1)
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

  const variantItem = page.locator('.variant-item').filter({
    has: page.locator('strong').filter({ hasText: /^顏色: 藍色$/ }),
  })
  await expect(variantItem).toHaveCount(1)
  await expect(variantItem.locator('strong')).toHaveText('顏色: 藍色')
  await expect(variantItem.getByText('SKU: BLUE-001', { exact: true })).toBeVisible()

  const inventoryRequest = page.waitForRequest(request =>
    request.url().endsWith('/api/inventories') && request.method() === 'POST',
  )
  await page.getByRole('link', { name: '建立庫存' }).click()
  await expect(page.getByRole('heading', { name: '建立庫存' })).toBeVisible()
  await page.getByRole('button', { name: '建立庫存' }).click()
  const requestBody = JSON.parse((await inventoryRequest).postData() || '{}') as Record<string, string>
  expect(requestBody.product_variant_id).toBeTruthy()
  expect(requestBody.product_price_id).toBeUndefined()
  const inventoryName = new RegExp(`${productName}-.*${priceLabel}-.*顏色: 藍色`)
  await expect(page.getByRole('heading', { name: inventoryName })).toBeVisible()
  await expect(page.getByText('產品變體').locator('..')).toContainText('顏色: 藍色')
  await expect(page.getByRole('heading', { name: '庫存項目' })).toBeVisible()
  await page.goto('/inventory')
  await expect(page.getByRole('link', { name: inventoryName })).toBeVisible()
})
