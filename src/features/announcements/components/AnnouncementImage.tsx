import { useEffect, useState } from 'react'
import { resolveAnnouncementImageUrl } from '../imageUrl'

interface AnnouncementImageProps {
  src: string
  alt: string
  className?: string
}

export function AnnouncementImage({ src, alt, className }: AnnouncementImageProps) {
  const [failed, setFailed] = useState(false)
  const resolvedSrc = resolveAnnouncementImageUrl(src)

  useEffect(() => {
    setFailed(false)
  }, [resolvedSrc])

  if (failed) {
    return (
      <div className={`${className ?? ''} announcement-image-fallback`.trim()} role="img" aria-label="公告圖片無法載入">
        <span aria-hidden="true">🖼️</span>
        <span>公告圖片無法載入</span>
      </div>
    )
  }

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      onError={() => setFailed(true)}
    />
  )
}
