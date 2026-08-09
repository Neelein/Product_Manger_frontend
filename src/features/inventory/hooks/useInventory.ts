import { useState, useEffect, useCallback } from 'react'
import type { Inventory, InventoryItem, CreateInventoryRequest, UpdateInventoryRequest, CreateInventoryItemRequest, UpdateInventoryItemRequest } from '../types'
import * as inventoryApi from '../api'

export function useInventories() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInventories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await inventoryApi.listInventories()
      setInventories(res.inventories)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inventories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInventories() }, [fetchInventories])

  return { inventories, loading, error, refetch: fetchInventories }
}

export function useInventory(id: string) {
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    inventoryApi.getInventory(id)
      .then(res => setInventory(res.inventory))
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load inventory'))
      .finally(() => setLoading(false))
  }, [id])

  return { inventory, loading, error, setInventory }
}

export function useCreateInventory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = useCallback(async (data: CreateInventoryRequest) => {
    setLoading(true)
    setError('')
    try {
      const res = await inventoryApi.createInventory(data)
      return res.inventory
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create inventory')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}

export function useUpdateInventory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = useCallback(async (id: string, data: UpdateInventoryRequest) => {
    setLoading(true)
    setError('')
    try {
      const res = await inventoryApi.updateInventory(id, data)
      return res.inventory
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update inventory')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading, error }
}

export function useDeleteInventory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError('')
    try {
      await inventoryApi.deleteInventory(id)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete inventory')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { remove, loading, error }
}

export function useItems(inventoryId: string) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    if (!inventoryId) return
    setLoading(true)
    setError('')
    try {
      const res = await inventoryApi.listItems(inventoryId)
      setItems(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [inventoryId])

  useEffect(() => { fetchItems() }, [fetchItems])

  return { items, loading, error, refetch: fetchItems, setItems }
}

export function useCreateItem() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = useCallback(async (inventoryId: string, data: CreateInventoryItemRequest) => {
    setLoading(true)
    setError('')
    try {
      const res = await inventoryApi.createItem(inventoryId, data)
      return res.item
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create item')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}

export function useUpdateItem() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = useCallback(async (inventoryId: string, itemId: string, data: UpdateInventoryItemRequest) => {
    setLoading(true)
    setError('')
    try {
      const res = await inventoryApi.updateItem(inventoryId, itemId, data)
      return res.item
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update item')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading, error }
}

export function useDeleteItem() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remove = useCallback(async (inventoryId: string, itemId: string) => {
    setLoading(true)
    setError('')
    try {
      await inventoryApi.deleteItem(inventoryId, itemId)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete item')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { remove, loading, error }
}
