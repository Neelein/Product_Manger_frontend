export const MAX_PRODUCT_IMAGES = 3
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export function validateProductImages(files: File[], existingCount = 0): string | null {
  if (existingCount + files.length > MAX_PRODUCT_IMAGES) return `每個產品最多 ${MAX_PRODUCT_IMAGES} 張圖片`
  const invalidType = files.find(file => !ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number]))
  if (invalidType) return '只支援 JPEG、PNG 或 WebP 圖片'
  const oversized = files.find(file => file.size > MAX_IMAGE_SIZE)
  if (oversized) return '每張圖片大小不可超過 10MB'
  return null
}

export function resolveProductImageUrl(url: string): string {
  const origin = (globalThis as unknown as { location?: { origin: string } }).location?.origin ?? ''
  return new URL(url, origin).toString()
}
