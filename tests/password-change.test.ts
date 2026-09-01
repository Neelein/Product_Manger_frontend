import assert from 'node:assert/strict'
import test from 'node:test'

import { changePassword } from '../src/features/auth/api/members.ts'
import { validatePasswordChange } from '../src/features/auth/passwordValidation.ts'

test('password validation accepts exactly 8 through 16 characters', () => {
  for (const length of [8, 16]) {
    const password = 'a'.repeat(length)
    assert.equal(validatePasswordChange({ currentPassword: 'current', newPassword: password, confirmNewPassword: password }), '')
  }
  for (const length of [7, 17]) {
    const password = 'a'.repeat(length)
    assert.equal(validatePasswordChange({ currentPassword: 'current', newPassword: password, confirmNewPassword: password }), '新密碼長度須為 8–16 個字元')
  }
})

test('password validation counts Unicode code points like the backend rune rule', () => {
  for (const runeCount of [8, 9, 16]) {
    const password = '😀'.repeat(runeCount)
    assert.equal(validatePasswordChange({ currentPassword: 'current', newPassword: password, confirmNewPassword: password }), '')
  }

  const password = '😀'.repeat(17)
  assert.equal(validatePasswordChange({ currentPassword: 'current', newPassword: password, confirmNewPassword: password }), '新密碼長度須為 8–16 個字元')
})

test('password validation reports mismatched confirmation', () => {
  assert.equal(validatePasswordChange({ currentPassword: 'current', newPassword: 'password', confirmNewPassword: 'different' }), '兩次輸入的新密碼不一致')
})

test('changePassword posts the backend payload with included credentials', async () => {
  const originalFetch = globalThis.fetch
  let request: RequestInit | undefined
  let url = ''
  globalThis.fetch = async (input, init) => {
    url = String(input)
    request = init
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  try {
    await changePassword({ current_password: 'current', new_password: 'password', confirm_new_password: 'password' })
    assert.equal(url, '/api/members/password')
    assert.equal(request?.method, 'POST')
    assert.equal(request?.credentials, 'include')
    assert.deepEqual(JSON.parse(String(request?.body)), {
      current_password: 'current', new_password: 'password', confirm_new_password: 'password',
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
