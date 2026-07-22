import { useState, useEffect } from 'react'
import type { ChatRoom } from '../types'
import * as chatApi from '../api/chat'

export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    chatApi.listChatRooms()
      .then(res => { if (active) setRooms(res.rooms) })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : 'Failed to load chat rooms') })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  return { rooms, loading, error }
}
