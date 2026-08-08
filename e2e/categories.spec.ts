import { expect, test, type Page } from '@playwright/test'
import { freshCategory, registerAndLogin, unique } from './helpers'

// The category page renders one table row per category; the row actions are
// inline 編輯 / 儲存 / 取消 buttons plus a 刪除 button, and the create row is a
// text input next to a 建立類別 button.
function categoryRow(page: Page, name: string) {
  return page.locator('tbody tr').filter({ hasText: name })
}

async function createCategory(page: Page, name: string) {
  await page.goto('/categories')
  await page
    .getByPlaceholder(/類別/)
    .or(page.locator('form input').first())
    .fill(name)
  await page.getByRole('button', { name: '建立', exact: false }).click()
  await expect(categoryRow(page, name)).toBeVisible()
}

test('create and rename a category', async ({ page }) => {
  await registerAndLogin(page)

  const originalName = unique('原始類別')
  const renamedName = unique('新類別')

  await createCategory(page, originalName)

  const row = categoryRow(page, originalName)
  await row.getByRole('button', { name: '編輯' }).click()
  await page.locator('.category-rename-input').fill(renamedName)
  await page.getByRole('button', { name: '儲存', exact: true }).click()

  await expect(categoryRow(page, renamedName)).toBeVisible()
  await expect(categoryRow(page, originalName)).toHaveCount(0)
})

test('delete a category that is not in use', async ({ page }) => {
  await registerAndLogin(page)

  const name = unique('類別')
  await createCategory(page, name)

  page.on('dialog', (dialog) => dialog.accept())
  await categoryRow(page, name).getByRole('button', { name: '刪除' }).click()

  await expect(categoryRow(page, name)).toHaveCount(0)
})

test('deleting a category in use by a product is blocked', async ({ page }) => {
  await registerAndLogin(page)

  const categoryName = unique('使用中類別')
  const productName = unique('產品')

  await createCategory(page, categoryName)

  await page.goto('/products/new')
  await page.getByLabel('產品名稱 *').fill(productName)
  await page.getByLabel('分類 *').selectOption(categoryName)
  await page.getByRole('button', { name: '建立產品' }).click()
  await expect(page.getByRole('heading', { name: productName })).toBeVisible()

  await page.goto('/categories')
  page.on('dialog', (dialog) => dialog.accept())
  await categoryRow(page, categoryName)
    .getByRole('button', { name: '刪除' })
    .click()

  await expect(page.getByText(/in use/)).toBeVisible()
  await expect(categoryRow(page, categoryName)).toBeVisible()
})

test('product create form requires choosing an existing category', async ({
  page,
}) => {
  await registerAndLogin(page)

  const category = await freshCategory()

  await page.goto('/products/new')

  const categoryControl = page.getByLabel('分類 *')
  await expect(categoryControl).toBeVisible()
  // The free-text input must be gone: the control is a selected from the
  // categories API, not a text box.
  expect(
    await categoryControl.evaluate((el) => el.tagName.toLowerCase()),
  ).toBe('select')

  await categoryControl.selectOption(category.name)
  await expect(categoryControl.locator('option:checked')).toHaveText(
    category.name,
  )
})

test('row action buttons 編輯 and 刪除 are spaced apart', async ({ page }) => {
  await registerAndLogin(page)

  const name = unique('間距類別')
  await createCategory(page, name)

  const gap = await page.evaluate(() => {
    const row = document.querySelector('tbody tr:last-child')
    const btns = row ? row.querySelectorAll('td:last-child button') : []
    if (btns.length < 2) return -1
    const a = btns[0].getBoundingClientRect()
    const b = btns[1].getBoundingClientRect()
    return Math.round(b.left - a.right)
  })
  expect(gap).toBeGreaterThanOrEqual(8)
})

test('類 link is no longer in the navbar but categories stay reachable', async ({ page }) => {
  await registerAndLogin(page)

  await expect(page.getByRole('link', { name: '類', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: '產品列表' })).toBeVisible()

  await page.goto('/categories')
  await expect(page.getByRole('heading', { name: '類別管理' })).toBeVisible()
})