import assert from 'node:assert/strict'
import test from 'node:test'

import { deleteProductImage, uploadProductImages } from '../src/features/products/api/products.ts'
import { MAX_IMAGE_SIZE, resolveProductImageUrl, validateProductImages } from '../src/features/products/imageValidation.ts'

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type })

test('validates supported types, size, and total product image count', () => {
  assert.equal(validateProductImages([file('a.jpg', 'image/jpeg')]), null)
  assert.match(validateProductImages([file('a.gif', 'image/gif')])!, /JPEG/)
  assert.match(validateProductImages([file('large.png', 'image/png', MAX_IMAGE_SIZE + 1)])!, /10MB/)
  assert.equal(validateProductImages([file('a.png', 'image/png')], 2), null)
  assert.match(validateProductImages([file('a.png', 'image/png'), file('b.png', 'image/png')], 2)!, /最多 3/)
})

test('resolves relative image paths against the current frontend origin', () => {
  const previousOrigin = (globalThis as typeof globalThis & { location?: unknown }).location
  Object.defineProperty(globalThis, 'location', { value: { origin: 'https://admin.example' }, configurable: true })
  assert.equal(resolveProductImageUrl('/media/images/products/p/a.png'), 'https://admin.example/media/images/products/p/a.png')
  Object.defineProperty(globalThis, 'location', { value: previousOrigin, configurable: true })
})

test('uploads repeated images fields to the product image endpoint and reports progress', async () => {
  const previousXHR = (globalThis as typeof globalThis & { XMLHttpRequest?: unknown }).XMLHttpRequest
  const progress: number[] = []
  class FakeXHR {
    static instance: FakeXHR
    status = 201
    responseText = JSON.stringify({ images: [] })
    upload = { addEventListener: (_type: string, listener: (event: { lengthComputable: boolean; loaded: number; total: number }) => void) => { listener({ lengthComputable: true, loaded: 1, total: 2 }) } }
    listeners = new Map<string, () => void>()
    open(method: string, url: string) { assert.equal(method, 'POST'); assert.equal(url, '/api/products/product-1/images') }
    addEventListener(type: string, listener: () => void) { this.listeners.set(type, listener) }
    send(body: FormData) { assert.deepEqual(body.getAll('images').map(value => (value as File).name), ['a.png', 'b.webp']); this.listeners.get('load')?.() }
    set withCredentials(value: boolean) { assert.equal(value, true) }
    constructor() { FakeXHR.instance = this }
  }
  Object.defineProperty(globalThis, 'XMLHttpRequest', { value: FakeXHR, configurable: true })
  await uploadProductImages('product-1', [file('a.png', 'image/png'), file('b.webp', 'image/webp')], value => progress.push(value))
  assert.deepEqual(progress, [50])
  Object.defineProperty(globalThis, 'XMLHttpRequest', { value: previousXHR, configurable: true })
})

test('deletes one product image with the scoped POST endpoint and returns the success message', async () => {
  const previousFetch = globalThis.fetch
  let request: { url: string; method: string } | undefined
  globalThis.fetch = async (input, init) => {
    request = { url: String(input), method: init?.method ?? 'GET' }
    return new Response(JSON.stringify({ message: 'product image deleted' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  const response = await deleteProductImage('product-1', 'image-2')
  assert.equal(request?.url, '/api/products/product-1/images/image-2/delete')
  assert.equal(request?.method, 'POST')
  assert.equal(response.message, 'product image deleted')
  globalThis.fetch = previousFetch
})

test('surfaces delete API failures with their HTTP status and backend message', async () => {
  const previousFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ error: '圖片刪除失敗' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  await assert.rejects(
    () => deleteProductImage('product-1', 'image-2'),
    error => error instanceof Error && error.message === '圖片刪除失敗' && 'status' in error && error.status === 500,
  )
  globalThis.fetch = previousFetch
})
