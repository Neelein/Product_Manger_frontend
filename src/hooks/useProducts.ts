import { useState, useEffect, useCallback } from 'react'
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types'
import * as productsApi from '../api/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await productsApi.listProducts()
      setProducts(res.products)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productsApi.getProduct(id)
      .then(res => setProduct(res.product))
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load product'))
      .finally(() => setLoading(false))
  }, [id])

  return { product, loading, error }
}

export function useCreateProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = useCallback(async (data: CreateProductRequest) => {
    setLoading(true)
    setError('')
    try {
      const res = await productsApi.createProduct(data)
      return res.product
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create product')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}

export function useUpdateProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = useCallback(async (id: string, data: UpdateProductRequest) => {
    setLoading(true)
    setError('')
    try {
      const res = await productsApi.updateProduct(id, data)
      return res.product
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update product')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading, error }
}

export function useDeleteProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError('')
    try {
      await productsApi.deleteProduct(id)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete product')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { remove, loading, error }
}
