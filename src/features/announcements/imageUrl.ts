export function resolveAnnouncementImageUrl(imagePath: string, origin?: string): string {
  const value = imagePath.trim()
  if (!value) return ''

  const browserOrigin = (globalThis as typeof globalThis & { location?: { origin: string } }).location?.origin
  const baseOrigin = origin ?? browserOrigin ?? 'http://localhost'

  try {
    const url = new URL(value, baseOrigin)
    if (url.pathname.startsWith('/media/')) {
      return `${url.pathname}${url.search}${url.hash}`
    }
    return url.toString()
  } catch {
    return value
  }
}
