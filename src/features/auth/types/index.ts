export type MemberType = 'customer' | 'employee'

export interface Member {
  id: string
  email: string
  name: string
  member_type: MemberType
  permission: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  code: string
}

export interface LoginResponse {
  member: Member
}

export interface MembersListResponse {
  members: Member[]
  total: number
}

export interface UpdateMemberRequest {
  email: string
  name: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_new_password: string
}
