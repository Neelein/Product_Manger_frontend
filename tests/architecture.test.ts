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
