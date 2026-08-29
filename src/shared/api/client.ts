export class ApiError extends Error {
  status: number
  body: string

  constructor(message: string, status: number, body: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers as Record<string, string> },
    ...options,
  })
  const body = await res.text()
  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    throw new ApiError('invalid JSON response', res.status, body)
  }
  if (!res.ok) {
    const message = (data as { error?: string })?.error ?? `HTTP ${res.status}`
    throw new ApiError(message, res.status, body)
  }
  return data as T
}

export async function apiFetchFormData<T>(url: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
  const res = await fetch(url, { method, credentials: 'include', body: formData })
  const body = await res.text()
  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    throw new ApiError('invalid JSON response', res.status, body)
  }
  if (!res.ok) {
    const message = (data as { error?: string })?.error ?? `HTTP ${res.status}`
    throw new ApiError(message, res.status, body)
  }
  return data as T
}

export function uploadFormDataWithProgress<T>(url: string, formData: FormData, onProgress?: (percent: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    type ProgressEventLike = { lengthComputable: boolean; loaded: number; total: number }
    type XhrLike = {
      status: number; responseText: string; withCredentials: boolean
      upload: { addEventListener: (type: string, listener: (event: ProgressEventLike) => void) => void }
      open: (method: string, requestUrl: string) => void
      addEventListener: (type: string, listener: () => void) => void
      send: (body: FormData) => void
    }
    const Xhr = (globalThis as unknown as { XMLHttpRequest: new () => XhrLike }).XMLHttpRequest
    const request = new Xhr()
    request.open('POST', url)
    request.withCredentials = true
    request.upload.addEventListener('progress', (event: ProgressEventLike) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    })
    request.addEventListener('load', () => {
      let data: unknown
      try { data = JSON.parse(request.responseText) } catch { reject(new ApiError('invalid JSON response', request.status, request.responseText)); return }
      if (request.status < 200 || request.status >= 300) {
        reject(new ApiError((data as { error?: string })?.error ?? `HTTP ${request.status}`, request.status, request.responseText))
        return
      }
      resolve(data as T)
    })
    request.addEventListener('error', () => reject(new ApiError('network error', 0, '')))
    request.send(formData)
  })
}
