import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

const root = join(process.cwd(), 'src')
const features = ['auth', 'products', 'inventory', 'categories', 'announcements', 'chat', 'calendar', 'registration-codes']

test('feature boundaries expose pages and domain modules', () => {
  for (const feature of features) {
    const directory = join(root, 'features', feature)
    assert.ok(existsSync(directory), `${feature} feature directory is missing`)
    assert.ok(existsSync(join(directory, 'index.ts')), `${feature} public index is missing`)
    assert.ok(existsSync(join(directory, 'pages')), `${feature} pages boundary is missing`)
    assert.ok(existsSync(join(directory, 'api')), `${feature} API boundary is missing`)
  }
  for (const file of [
    'features/products/api/products.ts',
    'features/products/api/details.ts',
    'features/products/api/prices.ts',
    'features/products/api/options.ts',
    'features/products/api/variants.ts',
    'features/inventory/api/inventory.ts',
    'features/products/components/ProductCard.tsx',
    'features/auth/context/AuthContext.tsx',
  ]) {
    assert.ok(existsSync(join(root, file)), `${file} implementation is missing`)
  }
})

test('inventory contract is variant-owned and has no price-level inventory mapping', () => {
  const inventoryTypes = readFileSync(join(root, 'features/inventory/types/index.ts'), 'utf8')
  const inventoryCreatePage = readFileSync(join(root, 'features/inventory/pages/InventoryCreatePage.tsx'), 'utf8')
  const detailDataHook = readFileSync(join(root, 'features/products/hooks/useProductDetailData.ts'), 'utf8')
  const routes = readFileSync(join(root, 'app/AppRoutes.tsx'), 'utf8')

  assert.match(inventoryTypes, /product_variant_id: string/)
  assert.doesNotMatch(inventoryTypes, /product_price_id/)
  assert.doesNotMatch(inventoryCreatePage, /product_price_id|priceId|legacyPriceId/)
  assert.doesNotMatch(detailDataHook, /inventory\.product_price_id/)
  assert.doesNotMatch(routes, /\/inventory\/new\/price/)
})

test('inventory UI uses the backend name and exposes the authoritative variant name', () => {
  const inventoryTypes = readFileSync(join(root, 'features/inventory/types/index.ts'), 'utf8')
  const inventoryListPage = readFileSync(join(root, 'features/inventory/pages/InventoryListPage.tsx'), 'utf8')
  const inventoryDetailPage = readFileSync(join(root, 'features/inventory/pages/InventoryDetailPage.tsx'), 'utf8')

  assert.match(inventoryTypes, /variant_name: string/)
  assert.match(inventoryListPage, /\{i\.name\}/)
  assert.match(inventoryDetailPage, /\{inventory\.name\}/)
  assert.match(inventoryDetailPage, /\{inventory\.variant_name \|\| '未設定'\}/)
  assert.doesNotMatch(inventoryListPage, /product_price_id|product_variant_id\s*\+|optionLabel\s*\(/)
  assert.doesNotMatch(inventoryDetailPage, /product_price_id|product_variant_id\s*\+|optionLabel\s*\(/)
})

test('product price contract includes nullable variant mapping without inventory id', () => {
  const productTypes = readFileSync(join(root, 'features/products/types/index.ts'), 'utf8')
  const productPrice = productTypes.match(/export interface ProductPrice \{([\s\S]*?)\n\}/)?.[1]

  assert.ok(productPrice, 'ProductPrice interface is missing')
  assert.match(productPrice, /product_variant_id: string \| null/)
  assert.doesNotMatch(productPrice, /inventory_id/)
})

test('application wiring is owned by app and preserves route contracts', () => {
  const routes = readFileSync(join(root, 'app', 'AppRoutes.tsx'), 'utf8')
  for (const path of ['/products', '/products/:id', '/inventory', '/categories', '/announcements', '/chat/rooms', '/calendar', '/admin/registration-codes']) {
    assert.match(routes, new RegExp(`path="${path.replaceAll('/', '\\/')}"`))
  }
  assert.match(readFileSync(join(root, 'main.tsx'), 'utf8'), /\.\/app\/providers/)
})

test('legacy directories are removed and feature indexes contain no legacy imports', () => {
  for (const directory of ['pages', 'api', 'hooks', 'context', 'components', 'types']) {
    assert.equal(existsSync(join(root, directory)), false, `legacy directory ${directory} still exists`)
  }
  for (const feature of [...features, 'dashboard']) {
    const files = [join(root, 'features', feature, 'index.ts')]
    for (const file of files) {
      assert.doesNotMatch(readFileSync(file, 'utf8'), /src\/(pages|api|hooks|context|components|types)|\.\.\/\.\.\/\.\.\/(pages|api|hooks|context|components|types)/)
    }
  }
})

test('shared boundary does not depend on features', () => {
  const sharedFiles = [join(root, 'shared', 'index.ts'), join(root, 'shared', 'api', 'client.ts'), join(root, 'shared', 'types', 'index.ts')]
  for (const file of sharedFiles) assert.doesNotMatch(readFileSync(file, 'utf8'), /features/)
})

test('frontend authorization uses member_type and permission, never role', () => {
  const files = [
    join(root, 'features', 'auth', 'types', 'index.ts'),
    join(root, 'features', 'auth', 'authorization.ts'),
    join(root, 'app', 'layout', 'Layout.tsx'),
    join(root, 'app', 'guards', 'AdminRoute.tsx'),
  ]
  for (const file of files) assert.doesNotMatch(readFileSync(file, 'utf8'), /\brole\b/)
  assert.match(readFileSync(join(root, 'features', 'auth', 'types', 'index.ts'), 'utf8'), /member_type/)
  assert.match(readFileSync(join(root, 'features', 'auth', 'authorization.ts'), 'utf8'), /permission === 'admin'/)
})
