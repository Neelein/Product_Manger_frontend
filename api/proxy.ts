/// <reference types="node" />

// Fixed Vercel function for all /api/* requests. vercel.json supplies the
// original path in __path because filesystem catch-all matching is unreliable
// for this non-framework Vite project.

export const config = { runtime: 'nodejs' }

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'http://neeleindev.com:8090'

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

export function getOriginalApiUrl(request: Request): URL | null {
  const url = new URL(request.url)
  const path = url.searchParams.get('__path')

  if (!path || path.startsWith('/') || path.split('/').some((segment) => segment === '..')) {
    return null
  }

  url.pathname = `/api/${path}`
  url.searchParams.delete('__path')
  return url
}

export function createUpstreamRequest(
  request: Request,
  backendOrigin: string,
  gatewaySecret: string,
): { url: string; init: RequestInit } {
  const originalUrl = getOriginalApiUrl(request)
  if (!originalUrl) throw new Error('Invalid API proxy path')

  const upstreamUrl = `${backendOrigin.replace(/\/$/, '')}${originalUrl.pathname}${originalUrl.search}`
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

  if (!getOriginalApiUrl(request)) {
    return new Response('Invalid API proxy path', { status: 400 })
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
