import assert from 'node:assert/strict'
import test from 'node:test'

import { createUpstreamRequest, proxyRequest } from '../api/[[...slug]].ts'

test('createUpstreamRequest forwards request data and injects the gateway secret', async () => {
  const request = new Request('https://frontend.example/api/products?limit=10', {
    method: 'POST',
    headers: {
      cookie: 'session=abc',
      'content-type': 'application/json',
      authorization: 'Bearer browser-value',
    },
    body: '{"name":"chair"}',
  })

  const upstream = createUpstreamRequest(request, 'http://backend.example:8090/', 'server-secret')

  assert.equal(upstream.url, 'http://backend.example:8090/api/products?limit=10')
  assert.equal(upstream.init.method, 'POST')
  assert.equal(upstream.init.headers instanceof Headers, true)
  assert.equal((upstream.init.headers as Headers).get('cookie'), 'session=abc')
  assert.equal((upstream.init.headers as Headers).get('authorization'), 'Bearer server-secret')
  assert.equal(await new Response(upstream.init.body).text(), '{"name":"chair"}')
})

test('proxyRequest reports a missing gateway secret without contacting the backend', async () => {
  const response = await proxyRequest(
    new Request('https://frontend.example/api/health'),
    'http://backend.example:8090',
    '',
  )

  assert.equal(response.status, 500)
  assert.equal(await response.text(), 'API_GATEWAY_SECRET is not configured')
})
