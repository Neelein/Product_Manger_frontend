import { useState, useEffect, type SubmitEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { useCategories } from '../../categories/hooks/useCategories'
import { deleteProductImage, listProductImages, uploadProductImages } from '../api'
import type { ProductImage } from '../types'
import { ProductImagePicker } from '../components/ProductImagePicker'

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { product, loading: loadingProduct } = useProduct(id || '')
  const { categories } = useCategories()
  const { create, loading: creating } = useCreateProduct()
  const { update, loading: updating } = useUpdateProduct()

  const [name, setName] = useState('')
  const [status, setStatus] = useState('active')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState('')
  const [images, setImages] = useState<ProductImage[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageProgress, setImageProgress] = useState<number | null>(null)
  const [imageError, setImageError] = useState('')
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && product) {
      setName(product.name)
      setStatus(product.status || 'active')
      setCategoryId(product.category_id || '')
    }
  }, [isEdit, product])

  useEffect(() => {
    if (!id) return
    listProductImages(id).then(response => setImages(response.images)).catch(e => setImageError(e instanceof Error ? e.message : '圖片載入失敗'))
  }, [id])

  const handleDeleteImage = async (image: ProductImage) => {
    if (!id || deletingImageId) return
    setImageError('')
    setDeletingImageId(image.id)
    try {
      await deleteProductImage(id, image.id)
      setImages(current => current.filter(currentImage => currentImage.id !== image.id))
    } catch (e) {
      setImageError(e instanceof Error ? e.message : '圖片刪除失敗')
    } finally {
      setDeletingImageId(null)
    }
  }

  if (isEdit && loadingProduct) return <div className="page-loading">載入中...</div>

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !categoryId.trim()) {
      setError('請填寫所有必填欄位')
      return
    }

    const data = { name, status, category_id: categoryId }

    if (isEdit) {
      const updated = await update(id!, data)
      if (updated) {
        if (imageFiles.length) {
          setImageProgress(0)
          try { await uploadProductImages(id!, imageFiles, setImageProgress) } catch (e) { setImageError(e instanceof Error ? e.message : '圖片上傳失敗'); return }
        }
        navigate(`/products/${id}`)
      }
    } else {
      const created = await create(data)
      if (created) {
        if (imageFiles.length) {
          setImageProgress(0)
          try { await uploadProductImages(created.id, imageFiles, setImageProgress) } catch (e) { navigate(`/products/${created.id}`, { state: { imageUploadError: e instanceof Error ? e.message : '圖片上傳失敗' } }); return }
        }
        navigate(`/products/${created.id}`)
      }
    }
  }

  return (
    <div className="product-form-page">
      <div className="page-header">
        <Link to={isEdit ? `/products/${id}` : '/products'} className="back-link">
          ← {isEdit ? '返回產品' : '返回列表'}
        </Link>
      </div>

      <div className="form-card">
        <h1>{isEdit ? '編輯產品' : '新增產品'}</h1>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">產品名稱 *</label>
            <input id="name" type="text" placeholder="請輸入產品名稱"
              value={name} onChange={e => setName(e.target.value)} />
          </div>

          <ProductImagePicker existingImages={images} onFilesChange={setImageFiles} onDeleteImage={isEdit ? handleDeleteImage : undefined} deletingImageId={deletingImageId} />
          {imageProgress !== null && <p className="upload-progress" role="status">圖片上傳中：{imageProgress}%</p>}
          {imageError && <div className="error-banner" role="alert">⚠️ {imageError}</div>}

          <div className="form-group">
            <label htmlFor="status">狀態</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="active">上架</option>
              <option value="inactive">下架</option>
              <option value="deprecated">註銷</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">分類 *</label>
            <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">請選擇分類</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="category-hint">尚未建立任何分類，請先到「類別管理」建立</p>
            )}
          </div>

          <div className="form-actions">
            <Link to={isEdit ? `/products/${id}` : '/products'} className="btn-secondary">取消</Link>
            <button type="submit" className="btn-primary" disabled={creating || updating || Boolean(deletingImageId)}>
              {creating || updating ? '儲存中...' : (isEdit ? '更新產品' : '建立產品')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
