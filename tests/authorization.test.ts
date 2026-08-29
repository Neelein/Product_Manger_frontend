import assert from 'node:assert/strict'
import test from 'node:test'

import { isAdminMember } from '../src/features/auth/authorization.ts'
import type { Member } from '../src/features/auth/types/index.ts'

const member = (overrides: Partial<Member> = {}): Member => ({
  id: 'member-1',
  email: 'member@example.com',
  name: 'Member',
  member_type: 'customer',
  permission: '',
  ...overrides,
})

test('only employee members with admin permission are admins', () => {
  assert.equal(isAdminMember(member({ member_type: 'employee', permission: 'admin' })), true)
  assert.equal(isAdminMember(member({ member_type: 'customer', permission: 'admin' })), false)
  assert.equal(isAdminMember(member({ member_type: 'employee', permission: 'employee' })), false)
})

test('missing members are not admins', () => {
  assert.equal(isAdminMember(null), false)
  assert.equal(isAdminMember(undefined), false)
})
