import { useEffect, useMemo, useState } from 'react'
import type { ProductImage } from '../types'
import { MAX_PRODUCT_IMAGES, resolveProductImageUrl, validateProductImages } from '../imageValidation'

interface ProductImagePickerProps {
  existingImages: ProductImage[]
  onFilesChange: (files: File[]) => void
}

export function ProductImagePicker({ existingImages, onFilesChange }: ProductImagePickerProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const previews = useMemo(() => files.map(file => ({ file, url: URL.createObjectURL(file) })), [files])

  useEffect(() => () => previews.forEach(preview => URL.revokeObjectURL(preview.url)), [previews])

  const handleChange = (selected: FileList | null) => {
    const nextFiles = Array.from(selected ?? [])
    const validationError = validateProductImages(nextFiles, existingImages.length)
    if (validationError) { setError(validationError); return }
    setError(''); setFiles(nextFiles); onFilesChange(nextFiles)
  }

  return <div className="form-group">
    <label htmlFor="product-images">產品圖片（最多 {MAX_PRODUCT_IMAGES} 張，每張 10MB）</label>
    <input id="product-images" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={existingImages.length + files.length >= MAX_PRODUCT_IMAGES} onChange={event => handleChange(event.target.files)} />
    {error && <div className="error-banner" role="alert">⚠️ {error}</div>}
    {(existingImages.length > 0 || previews.length > 0) && <div className="product-image-grid">
      {existingImages.map(image => <img key={image.id} src={resolveProductImageUrl(image.url)} alt={image.filename} className="product-image-preview" />)}
      {previews.map(preview => <img key={preview.url} src={preview.url} alt={preview.file.name} className="product-image-preview" />)}
    </div>}
  </div>
}
