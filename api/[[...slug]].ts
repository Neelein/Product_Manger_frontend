// Vercel function: catch-all proxy for /api/*.
//
// Runtime: Node.js (default) using Vercel's recommended "fetch web handler"
// signature (`export default { fetch(request) { ... } }`) for non-framework
// (Vite) projects. Node's native fetch (undici) is used because the backend
// origin is plain HTTP (http://neeleindev.com:8090); Node's fetch handles
// http:// targets reliably, whereas the Edge runtime's fetch filters them.
//
// Every /api/* request lands here — the /api rewrite was removed from
// vercel.json so this function, not Vercel's CDN proxy, talks to the backend.
// We:
//   1. rebuild the upstream URL (origin + same pathname + same query),
//   2. forward the HTTP method, the client headers (cookie, content-type,
//      accept, ...) and the request body as a stream,
//   3. inject `Authorization: Bearer <API_GATEWAY_SECRET>` so the secret
//      never ships in the browser bundle,
//   4. stream the backend response (status, headers, body) straight back —
//      important for image/multipart responses.
//
// No npm dependencies are required: this uses only the Web-standard
// Request/Response globals and native fetch.

export const config = { runtime: 'nodejs' }

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'http://neeleindev.com:8090'

// Headers a forward proxy must not pass upstream unchanged: hop-by-hop
// headers are recomputed by fetch, and accept-encoding/content-encoding are
// dropped so the runtime manages compression transparently (avoids double
// compression corrupting the body).
const HEADERS_TO_STRIP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
  'proxy-connection',
  'trailer',
  'te',
  'accept-encoding',
])

export function createUpstreamRequest(
  request: Request,
  backendOrigin: string,
  gatewaySecret: string,
): { url: string; init: RequestInit } {
  const url = new URL(request.url)
  const upstreamUrl = `${backendOrigin.replace(/\/$/, '')}${url.pathname}${url.search}`

  const headers = new Headers(request.headers)
  for (const name of HEADERS_TO_STRIP) headers.delete(name)
  headers.set('authorization', `Bearer ${gatewaySecret}`)

  const init: RequestInit & { duplex: 'half' } = {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    duplex: 'half',
  }
  return { url: upstreamUrl, init }
}

export async function proxyRequest(
  request: Request,
  backendOrigin: string,
  gatewaySecret: string,
): Promise<Response> {
  if (!gatewaySecret) {
    return new Response('API_GATEWAY_SECRET is not configured', { status: 500 })
  }

  const upstreamRequest = createUpstreamRequest(request, backendOrigin, gatewaySecret)
  const upstreamResponse = await fetch(upstreamRequest.url, upstreamRequest.init)

  const responseHeaders = new Headers(upstreamResponse.headers)
  const getSetCookie = (upstreamResponse.headers as Headers & {
    getSetCookie?: () => string[]
  }).getSetCookie
  if (getSetCookie) {
    responseHeaders.delete('set-cookie')
    for (const cookie of getSetCookie.call(upstreamResponse.headers)) {
      responseHeaders.append('set-cookie', cookie)
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    return proxyRequest(
      request,
      BACKEND_ORIGIN,
      process.env.API_GATEWAY_SECRET ?? '',
    )
  },
}
