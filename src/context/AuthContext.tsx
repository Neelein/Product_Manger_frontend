import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Member, LoginRequest, RegisterRequest } from '../types'
import * as membersApi from '../api/members'

export interface AuthContextValue {
  member: Member | null
  loading: boolean
  login: (data: LoginRequest) => Promise<Member>
  register: (data: RegisterRequest) => Promise<Member>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

let sessionRequest: Promise<Member> | null = null

function getSessionOnce(): Promise<Member> {
  sessionRequest ??= membersApi
    .getCurrentMember()
    .finally(() => {
      sessionRequest = null
    })
  return sessionRequest
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessionOnce()
      .then(setMember)
      .catch(() => {
        // Do not clear an existing member on failure. member starts null and is
        // only cleared by logout(). This shields a valid session from a racing
        // 401 (e.g. StrictMode double effect against a rotating-session backend).
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (data: LoginRequest): Promise<Member> => {
    const res = await membersApi.login(data)
    setMember(res.member)
    return res.member
  }, [])

  const register = useCallback(async (data: RegisterRequest): Promise<Member> => {
    const m = await membersApi.register(data)
    return m
  }, [])

  const logout = useCallback(async () => {
    await membersApi.logout()
    setMember(null)
  }, [])

  return (
    <AuthContext.Provider value={{ member, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
