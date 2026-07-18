import { apiFetch } from './client'
import type { LoginRequest, LoginResponse, Member, RegisterRequest, UpdateMemberRequest } from '../types'

export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/members/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function register(data: RegisterRequest): Promise<Member> {
  return apiFetch<Member>('/api/members/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function logout(): Promise<void> {
  return apiFetch<void>('/api/members/logout', { method: 'POST' })
}

export function getCurrentMember(): Promise<Member> {
  return apiFetch<Member>('/api/members/me')
}

export function updateMember(data: UpdateMemberRequest): Promise<Member> {
  return apiFetch<Member>('/api/members/update', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
