import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Member, LoginRequest, RegisterRequest } from '../types'
import * as membersApi from '../api/members'

export interface AuthContextValue {
  member: Member | null
  loading: boolean
  login: (data: LoginRequest) => Promise<Member>
  register: (data: RegisterRequest) => Promise<Member>
  logout: () => Promise<void>
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
let sessionRequest: Promise<Member> | null = null

function getSessionOnce(): Promise<Member> {
  sessionRequest ??= membersApi.getCurrentMember().finally(() => { sessionRequest = null })
  return sessionRequest
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getSessionOnce().then(setMember).catch(() => {}).finally(() => setLoading(false))
  }, [])
  const login = useCallback(async (data: LoginRequest) => { const res = await membersApi.login(data); setMember(res.member); return res.member }, [])
  const register = useCallback(async (data: RegisterRequest) => membersApi.register(data), [])
  const logout = useCallback(async () => { await membersApi.logout(); setMember(null) }, [])
  const clearSession = useCallback(() => setMember(null), [])
  return <AuthContext.Provider value={{ member, loading, login, register, logout, clearSession }}>{children}</AuthContext.Provider>
}
