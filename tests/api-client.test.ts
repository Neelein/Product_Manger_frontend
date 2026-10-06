import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError, apiFetch } from '../src/shared/api/client.ts'

test('apiFetch accepts an empty successful response', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(null, { status: 204 })

  try {
    assert.equal(await apiFetch<void>('/api/members/42/department', { method: 'PUT' }), undefined)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('apiFetch preserves JSON responses', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), { status: 200 })

  try {
    assert.deepEqual(await apiFetch<{ ok: boolean }>('/api/example'), { ok: true })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('apiFetch preserves invalid JSON errors for non-empty responses', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('not json', { status: 200 })

  try {
    await assert.rejects(apiFetch('/api/example'), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.message, 'invalid JSON response')
      assert.equal(error.status, 200)
      assert.equal(error.body, 'not json')
      return true
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('apiFetch reports HTTP errors for empty error responses', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(null, { status: 500 })

  try {
    await assert.rejects(apiFetch('/api/example'), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.message, 'HTTP 500')
      assert.equal(error.status, 500)
      assert.equal(error.body, '')
      return true
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
