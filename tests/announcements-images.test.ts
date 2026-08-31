import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

import { resolveAnnouncementImageUrl } from '../src/features/announcements/imageUrl.ts'
import { ANNOUNCEMENT_IMAGE_ACCEPT, validateAnnouncementImage } from '../src/features/announcements/imageValidation.ts'

const file = (name: string, type: string) => new File([new Uint8Array([1, 2, 3])], name, { type })

test('announcement upload accept contract excludes HEIC and wildcard image types', () => {
  assert.equal(ANNOUNCEMENT_IMAGE_ACCEPT, 'image/jpeg,image/png,image/webp')
  assert.equal(validateAnnouncementImage(file('notice.jpg', 'image/jpeg')), null)
  assert.equal(validateAnnouncementImage(file('notice.png', 'image/png')), null)
  assert.equal(validateAnnouncementImage(file('notice.webp', 'image/webp')), null)
  assert.match(validateAnnouncementImage(file('notice.heic', 'image/heic'))!, /JPEG、PNG 或 WebP/)
})

test('keeps relative media paths on the frontend origin for the Vite/media proxy', () => {
  assert.equal(
    resolveAnnouncementImageUrl('/media/images/announcements/notice.png', 'https://app.example'),
    '/media/images/announcements/notice.png',
  )
})

test('converts backend absolute media URLs to same-origin media paths', () => {
  assert.equal(
    resolveAnnouncementImageUrl(
      'http://localhost:8090/media/images/announcements/notice.png?download=1',
      'https://app.example',
    ),
    '/media/images/announcements/notice.png?download=1',
  )
})

test('announcement pages render an accessible image failure fallback', () => {
  const detail = readFileSync(join(process.cwd(), 'src/features/announcements/pages/AnnouncementDetailPage.tsx'), 'utf8')
  const list = readFileSync(join(process.cwd(), 'src/features/announcements/pages/AnnouncementListPage.tsx'), 'utf8')
  const image = readFileSync(join(process.cwd(), 'src/features/announcements/components/AnnouncementImage.tsx'), 'utf8')

  assert.match(detail, /AnnouncementImage/)
  assert.match(list, /AnnouncementImage/)
  assert.match(image, /公告圖片無法載入/)
  assert.match(image, /role="img"/)
})

test('announcement create page exposes client validation and backend error UX without replacing server validation', () => {
  const page = readFileSync(join(process.cwd(), 'src/features/announcements/pages/AnnouncementCreatePage.tsx'), 'utf8')

  assert.match(page, /ANNOUNCEMENT_IMAGE_ACCEPT/)
  assert.match(page, /validateAnnouncementImage/)
  assert.match(page, /error: apiError/)
  assert.match(page, /error \|\| apiError/)
  assert.match(page, /檔案內容仍由伺服器驗證/)
  assert.match(page, /disabled=\{loading \|\| Boolean\(error\)\}/)
})
