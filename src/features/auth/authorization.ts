import type { Member } from './types/index.ts'

export function isAdminMember(member: Member | null | undefined): boolean {
  return member?.member_type === 'employee' && member.permission === 'admin'
}
