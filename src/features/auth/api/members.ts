import { apiFetch } from '../../../shared/api/client.ts'
import type { ChangePasswordRequest, LoginRequest, LoginResponse, Member, MembersListResponse, RegisterRequest, UpdateMemberRequest } from '../types/index.ts'

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

export function changePassword(data: ChangePasswordRequest): Promise<void> {
  return apiFetch<void>('/api/members/password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function listMembers(page = 1, limit = 50): Promise<MembersListResponse> {
  return apiFetch<MembersListResponse>('/api/members', {
    method: 'POST',
    body: JSON.stringify({ page, limit }),
  })
}
