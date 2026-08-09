import { useEffect, useState } from 'react'
import { getDetail, listOptions, listPrices, listVariants } from '../api'
import { listInventories } from '../../inventory/api'
import type { ProductDetailModel, ProductOption, ProductPrice, ProductVariant } from '../types'
import type { Inventory } from '../../inventory/types'

export function useProductDetailData(productId: string | undefined) {
  const [detail, setDetail] = useState<ProductDetailModel | null>(null)
  const [prices, setPrices] = useState<ProductPrice[]>([])
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [inventoryMap, setInventoryMap] = useState<Record<string, Inventory>>({})
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [loadingInventory, setLoadingInventory] = useState(false)

  useEffect(() => {
    if (!productId) return
    setLoadingDetail(true)
    getDetail(productId).then(res => setDetail(res.detail)).catch(() => setDetail(null)).finally(() => setLoadingDetail(false))
  }, [productId])

  useEffect(() => {
    if (!detail || !productId) return
    setLoadingPrices(true)
    setLoadingVariants(true)
    Promise.allSettled([listPrices(productId), listOptions(productId), listVariants(productId)])
      .then(([priceResult, optionResult, variantResult]) => {
        if (priceResult.status === 'fulfilled') setPrices(priceResult.value.prices)
        if (optionResult.status === 'fulfilled') setOptions(optionResult.value.options)
        if (variantResult.status === 'fulfilled') setVariants(variantResult.value.variants)
      })
      .finally(() => { setLoadingPrices(false); setLoadingVariants(false) })
  }, [detail, productId])

  useEffect(() => {
    if (!prices.length && !variants.length) return
    setLoadingInventory(true)
    listInventories().then(res => {
      const map: Record<string, Inventory> = {}
      for (const inventory of res.inventories) {
        if (inventory.product_variant_id) map[inventory.product_variant_id] = inventory
        if (inventory.product_price_id) map[inventory.product_price_id] = inventory
      }
      setInventoryMap(map)
    }).catch(() => setInventoryMap({})).finally(() => setLoadingInventory(false))
  }, [prices, variants])

  return { detail, setDetail, prices, setPrices, options, setOptions, variants, setVariants, inventoryMap, loadingDetail, loadingPrices, loadingVariants, loadingInventory }
}
