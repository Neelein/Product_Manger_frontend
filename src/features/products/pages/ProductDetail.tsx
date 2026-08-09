import { useState, type SubmitEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProduct, useDeleteProduct } from '../hooks/useProducts'
import { useAuth } from '../../auth/hooks/useAuth'
import { createDetail, createOption, createPrice, createVariant, deleteOption, deleteVariant, updateDetail, updateOption, updatePrice, updateVariant } from '../api'
import type { ProductOption, ProductPrice, ProductVariant } from '../types'
import { useProductDetailData } from '../hooks/useProductDetailData'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { product, loading, error } = useProduct(id!)
  const { remove } = useDeleteProduct()
  const { member } = useAuth()
  const navigate = useNavigate()
  const { detail, setDetail, prices, setPrices, options, setOptions, variants, setVariants, inventoryMap, loadingDetail, loadingPrices, loadingVariants, loadingInventory } = useProductDetailData(id)

  const [editingDetail, setEditingDetail] = useState(false)
  const [dIntro, setDIntro] = useState('')
  const [dUsage, setDUsage] = useState('')
  const [dReturn, setDReturn] = useState('')
  const [detailSubmitting, setDetailSubmitting] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [detailSuccess, setDetailSuccess] = useState('')

  const [pLabel, setPLabel] = useState('')
  const [pAmount, setPAmount] = useState('')
  const [pCurrency, setPCurrency] = useState('TWD')
  const [pSortOrder, setPSortOrder] = useState('0')
  const [priceSubmitting, setPriceSubmitting] = useState(false)
  const [priceError, setPriceError] = useState('')
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)

  const [optionName, setOptionName] = useState('')
  const [optionValue, setOptionValue] = useState('')
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null)
  const [optionError, setOptionError] = useState('')
  const [optionSubmitting, setOptionSubmitting] = useState(false)

  const [variantPriceId, setVariantPriceId] = useState('')
  const [variantSku, setVariantSku] = useState('')
  const [variantStatus, setVariantStatus] = useState('active')
  const [variantOptionIds, setVariantOptionIds] = useState<string[]>([])
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [variantError, setVariantError] = useState('')
  const [variantSubmitting, setVariantSubmitting] = useState(false)

  if (loading) return <div className="page-loading">載入中...</div>
  if (error || !product) return <div className="error-banner">⚠️ {error || '產品不存在'}</div>

  const handleDelete = async () => {
    if (!confirm('確定刪除此產品？')) return
    if (await remove(product.id)) navigate('/products', { replace: true })
  }

  const startEditDetail = () => {
    setDIntro(detail?.introduction || ''); setDUsage(detail?.usage_instructions || ''); setDReturn(detail?.return_policy || '')
    setEditingDetail(true); setDetailError(''); setDetailSuccess('')
  }

  const handleSubmitDetail = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault(); setDetailError(''); setDetailSuccess(''); setDetailSubmitting(true)
    try {
      const data = { introduction: dIntro, usage_instructions: dUsage, return_policy: dReturn }
      const res = detail ? await updateDetail(product.id, data) : await createDetail(product.id, data)
      setDetail(res.detail); setEditingDetail(false); setDetailSuccess(detail ? '詳細資訊已更新' : '詳細資訊已建立')
    } catch (e) { setDetailError(e instanceof Error ? e.message : '操作失敗') } finally { setDetailSubmitting(false) }
  }

  const resetPriceForm = () => { setPLabel(''); setPAmount(''); setPCurrency('TWD'); setPSortOrder('0'); setEditingPriceId(null) }
  const startEditPrice = (price: ProductPrice) => { setPLabel(price.label); setPAmount(String(price.amount)); setPCurrency(price.currency); setPSortOrder(String(price.sort_order)); setEditingPriceId(price.id); setPriceError('') }
  const handleSubmitPrice = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault(); if (!detail) return
    const amount = Number(pAmount); setPriceError('')
    if (!pLabel.trim() || isNaN(amount) || amount < 0) { setPriceError('請填寫有效標籤與金額'); return }
    setPriceSubmitting(true)
    try {
      const data = { label: pLabel, amount, currency: pCurrency, sort_order: Number(pSortOrder) }
      if (editingPriceId) { const res = await updatePrice(product.id, editingPriceId, data); setPrices(prev => prev.map(p => p.id === editingPriceId ? res.price : p)) }
      else { const res = await createPrice(product.id, detail.id, data); setPrices(prev => [...prev, res.price]) }
      resetPriceForm()
    } catch (e) { setPriceError(e instanceof Error ? e.message : '操作失敗') } finally { setPriceSubmitting(false) }
  }

  const resetOptionForm = () => { setOptionName(''); setOptionValue(''); setEditingOptionId(null) }
  const startEditOption = (option: ProductOption) => { setOptionName(option.name); setOptionValue(option.value); setEditingOptionId(option.id); setOptionError('') }
  const handleSubmitOption = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault(); setOptionError('')
    if (!optionName.trim() || !optionValue.trim()) { setOptionError('請填寫規格名稱與值'); return }
    setOptionSubmitting(true)
    try {
      const data = { name: optionName.trim(), value: optionValue.trim() }
      if (editingOptionId) { const res = await updateOption(product.id, editingOptionId, data); setOptions(prev => prev.map(o => o.id === editingOptionId ? res.option : o)) }
      else { const res = await createOption(product.id, data); setOptions(prev => [...prev, res.option]) }
      resetOptionForm()
    } catch (e) { setOptionError(e instanceof Error ? e.message : '操作失敗') } finally { setOptionSubmitting(false) }
  }
  const handleDeleteOption = async (option: ProductOption) => {
    if (!confirm(`確定刪除規格「${option.name}: ${option.value}」？`)) return
    try { await deleteOption(product.id, option.id); setOptions(prev => prev.filter(o => o.id !== option.id)); setVariantOptionIds(prev => prev.filter(id => id !== option.id)) }
    catch (e) { setOptionError(e instanceof Error ? e.message : '刪除失敗') }
  }

  const resetVariantForm = () => { setVariantPriceId(''); setVariantSku(''); setVariantStatus('active'); setVariantOptionIds([]); setEditingVariantId(null) }
  const startEditVariant = (variant: ProductVariant) => { setVariantPriceId(variant.product_price_id); setVariantSku(variant.sku || ''); setVariantStatus(variant.status); setVariantOptionIds(variant.option_ids || []); setEditingVariantId(variant.id); setVariantError('') }
  const handleSubmitVariant = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault(); setVariantError('')
    if (!variantPriceId) { setVariantError('請選擇價格'); return }
    setVariantSubmitting(true)
    try {
      const data = { product_price_id: variantPriceId, sku: variantSku.trim() || null, status: variantStatus, option_ids: variantOptionIds }
      if (editingVariantId) { const res = await updateVariant(product.id, editingVariantId, data); setVariants(prev => prev.map(v => v.id === editingVariantId ? res.variant : v)) }
      else { const res = await createVariant(product.id, data); setVariants(prev => [...prev, res.variant]) }
      resetVariantForm()
    } catch (e) { setVariantError(e instanceof Error ? e.message : '操作失敗') } finally { setVariantSubmitting(false) }
  }
  const handleDeleteVariant = async (variant: ProductVariant) => {
    if (!confirm('確定刪除此變體？')) return
    try { await deleteVariant(product.id, variant.id); setVariants(prev => prev.filter(v => v.id !== variant.id)) }
    catch (e) { setVariantError(e instanceof Error ? e.message : '刪除失敗') }
  }
  const optionLabel = (variant: ProductVariant) => (variant.option_ids || []).map(optionId => { const option = options.find(o => o.id === optionId); return option ? `${option.name}: ${option.value}` : optionId }).join(' / ') || '未指定規格'
  const priceForVariant = (variant: ProductVariant) => prices.find(price => price.id === variant.product_price_id)

  return (
    <div className="product-detail-page">
      <div className="page-header"><Link to="/products" className="back-link">← 返回列表</Link>{member && <div className="header-actions"><Link to={`/products/${product.id}/edit`} className="btn-secondary">編輯</Link><button className="btn-danger" onClick={handleDelete}>刪除</button></div>}</div>
      <div className="detail-card"><div className="detail-header"><div><h1>{product.name}</h1><span className={`status-badge status-${product.status}`} style={{ marginTop: 8 }}>{product.status === 'active' ? '上架' : product.status === 'inactive' ? '下架' : product.status === 'deprecated' ? '註銷' : product.status}</span></div><span className="detail-category">{product.category}</span></div><div className="detail-body"><div className="detail-section"><label>分類</label><p>{product.category}</p></div><div className="detail-meta"><span>建立時間：{new Date(product.created_at).toLocaleDateString()}</span><span>更新時間：{new Date(product.updated_at).toLocaleDateString()}</span></div></div></div>

      <div className="section-card"><div className="section-card-header"><h2 className="section-title">商品詳細資訊</h2>{member && detail && !editingDetail && <button className="btn-secondary" onClick={startEditDetail}>編輯</button>}</div>
        {loadingDetail ? <div className="page-loading" style={{ padding: '20px 0' }}>載入中...</div> : editingDetail ? <><form onSubmit={handleSubmitDetail}><div className="form-group"><label htmlFor="intro">介紹</label><textarea id="intro" rows={3} value={dIntro} onChange={e => setDIntro(e.target.value)} /></div><div className="form-group"><label htmlFor="usage">使用說明</label><textarea id="usage" rows={3} value={dUsage} onChange={e => setDUsage(e.target.value)} /></div><div className="form-group"><label htmlFor="return">退貨政策</label><textarea id="return" rows={3} value={dReturn} onChange={e => setDReturn(e.target.value)} /></div>{detailError && <div className="error-banner">⚠️ {detailError}</div>}<div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setEditingDetail(false)}>取消</button><button type="submit" className="btn-primary" disabled={detailSubmitting}>{detailSubmitting ? '儲存中...' : detail ? '更新' : '建立'}</button></div></form></> : detail ? <div className="detail-content">{detail.introduction && <div className="detail-section"><label>介紹</label><p>{detail.introduction}</p></div>}{detail.usage_instructions && <div className="detail-section"><label>使用說明</label><p>{detail.usage_instructions}</p></div>}{detail.return_policy && <div className="detail-section"><label>退貨政策</label><p>{detail.return_policy}</p></div>}{!detail.introduction && !detail.usage_instructions && !detail.return_policy && <p className="empty-field">尚無詳細內容</p>}{detailSuccess && <div className="success-banner" style={{ marginTop: 16 }}>✅ {detailSuccess}</div>}</div> : <div><p className="empty-field" style={{ marginBottom: 16 }}>尚無詳細資訊</p>{member && <button className="btn-primary" onClick={startEditDetail}>建立詳細資訊</button>}</div>}
      </div>

      <div className="section-card"><h2 className="section-title">價格設定</h2>{loadingPrices ? <div className="page-loading" style={{ padding: '20px 0' }}>載入中...</div> : prices.length ? <div className="price-list">{prices.map(price => <div key={price.id} className="price-item"><div className="price-item-top"><div className="price-item-info"><span className="price-item-label">{price.label}</span><span className="price-item-amount">{price.amount.toLocaleString()}</span><span className="price-item-currency">{price.currency}</span></div><div className="price-item-actions">{member && <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => startEditPrice(price)}>編輯</button>}</div></div></div>)}</div> : <p className="empty-field" style={{ marginBottom: 16 }}>尚無價格資料</p>}{detail && member && <><form onSubmit={handleSubmitPrice} className="price-form"><div className="form-row"><div className="form-group"><label htmlFor="priceLabel">{editingPriceId ? '標籤' : '新增 - 標籤'}</label><input id="priceLabel" value={pLabel} onChange={e => setPLabel(e.target.value)} /></div><div className="form-group"><label htmlFor="priceAmount">金額</label><input id="priceAmount" type="number" value={pAmount} onChange={e => setPAmount(e.target.value)} min="0" step="0.01" /></div></div><div className="form-row"><div className="form-group"><label htmlFor="priceCurrency">貨幣</label><input id="priceCurrency" value={pCurrency} onChange={e => setPCurrency(e.target.value)} /></div><div className="form-group"><label htmlFor="priceSort">排序</label><input id="priceSort" type="number" value={pSortOrder} onChange={e => setPSortOrder(e.target.value)} /></div></div>{priceError && <div className="error-banner">⚠️ {priceError}</div>}<div className="form-actions">{editingPriceId && <button type="button" className="btn-secondary" onClick={resetPriceForm}>取消</button>}<button type="submit" className="btn-primary" disabled={priceSubmitting}>{priceSubmitting ? '儲存中...' : editingPriceId ? '更新' : '新增'}</button></div></form></>}{!detail && member && <p className="empty-field" style={{ marginTop: 8, fontSize: 14 }}>請先建立商品詳細資訊後再設定價格</p>}</div>

      {detail && <>
        <div className="section-card"><div className="section-card-header"><h2 className="section-title">規格選項</h2></div>{options.length ? <div className="option-list">{options.map(option => <div className="option-item" key={option.id}><span><strong>{option.name}</strong><span className="option-value">{option.value}</span></span>{member && <span className="price-item-actions"><button className="btn-secondary" onClick={() => startEditOption(option)}>編輯</button><button className="btn-danger" onClick={() => handleDeleteOption(option)}>刪除</button></span>}</div>)}</div> : <p className="empty-field">尚無規格選項</p>}{member && <form onSubmit={handleSubmitOption} className="price-form"><div className="form-row"><div className="form-group"><label htmlFor="optionName">規格名稱</label><input id="optionName" value={optionName} onChange={e => setOptionName(e.target.value)} placeholder="如：顏色" /></div><div className="form-group"><label htmlFor="optionValue">規格值</label><input id="optionValue" value={optionValue} onChange={e => setOptionValue(e.target.value)} placeholder="如：藍色" /></div></div>{optionError && <div className="error-banner">⚠️ {optionError}</div>}<div className="form-actions">{editingOptionId && <button type="button" className="btn-secondary" onClick={resetOptionForm}>取消</button>}<button className="btn-primary" type="submit" disabled={optionSubmitting}>{optionSubmitting ? '儲存中...' : editingOptionId ? '更新規格' : '新增規格'}</button></div></form>}</div>

        <div className="section-card"><div className="section-card-header"><h2 className="section-title">產品變體</h2></div>{loadingVariants ? <div className="page-loading" style={{ padding: '20px 0' }}>載入中...</div> : variants.length ? <div className="variant-list">{variants.map(variant => { const price = priceForVariant(variant); const inventory = inventoryMap[variant.id]; return <div className="variant-item" key={variant.id}><div className="variant-main"><strong>{optionLabel(variant)}</strong><span>{price ? `${price.amount.toLocaleString()} ${price.currency}` : '價格已刪除'}</span><span>SKU: {variant.sku || '未設定'}</span><span>庫存: {inventory ? `${(inventory.total_quantity - inventory.sold_quantity).toLocaleString()} / ${inventory.total_quantity.toLocaleString()}` : '尚未建立'}</span></div><div className="price-item-actions">{member && <button className="btn-secondary" onClick={() => startEditVariant(variant)}>編輯</button>}{member && inventory ? <Link to={`/inventory/${inventory.id}`} className="btn-secondary">管理庫存</Link> : member && !loadingInventory ? <Link to={`/inventory/new/${variant.id}`} className="btn-primary">建立庫存</Link> : null}{member && <button className="btn-danger" onClick={() => handleDeleteVariant(variant)}>刪除</button>}</div></div>})}</div> : <p className="empty-field">尚無產品變體，請先新增規格與價格。</p>}{member && <form onSubmit={handleSubmitVariant} className="price-form"><div className="form-row"><div className="form-group"><label htmlFor="variantPrice">套用價格</label><select id="variantPrice" value={variantPriceId} onChange={e => setVariantPriceId(e.target.value)}><option value="">請選擇價格</option>{prices.map(price => <option key={price.id} value={price.id}>{price.label} - {price.amount.toLocaleString()} {price.currency}</option>)}</select></div><div className="form-group"><label htmlFor="variantSku">SKU（選填）</label><input id="variantSku" value={variantSku} onChange={e => setVariantSku(e.target.value)} placeholder="如：BLUE-M" /></div></div><div className="form-group"><label htmlFor="variantStatus">狀態</label><select id="variantStatus" value={variantStatus} onChange={e => setVariantStatus(e.target.value)}><option value="active">啟用</option><option value="inactive">停用</option></select></div>{options.length > 0 && <fieldset className="variant-options"><legend>勾選規格值</legend>{options.map(option => <label key={option.id}><input type="checkbox" checked={variantOptionIds.includes(option.id)} onChange={e => setVariantOptionIds(prev => e.target.checked ? [...prev, option.id] : prev.filter(optionId => optionId !== option.id))} />{option.name}: {option.value}</label>)}</fieldset>}{variantError && <div className="error-banner">⚠️ {variantError}</div>}<div className="form-actions">{editingVariantId && <button type="button" className="btn-secondary" onClick={resetVariantForm}>取消</button>}<button className="btn-primary" type="submit" disabled={variantSubmitting || !prices.length}>{variantSubmitting ? '儲存中...' : editingVariantId ? '更新變體' : '新增變體'}</button></div></form>}</div>
      </>}
    </div>
  )
}
