export const ANNOUNCEMENT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'
export const ANNOUNCEMENT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export function validateAnnouncementImage(file: File | null): string | null {
  if (!file) return null
  if (!ANNOUNCEMENT_IMAGE_TYPES.includes(file.type as typeof ANNOUNCEMENT_IMAGE_TYPES[number])) {
    return '圖片格式不支援，請選擇 JPEG、PNG 或 WebP 圖片'
  }
  return null
}
