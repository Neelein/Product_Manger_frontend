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
