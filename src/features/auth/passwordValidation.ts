export interface PasswordChangeValues {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export function validatePasswordChange(values: PasswordChangeValues): string {
  if (!values.currentPassword || !values.newPassword || !values.confirmNewPassword) {
    return '請填寫目前密碼、新密碼與確認新密碼'
  }
  const newPasswordRuneCount = [...values.newPassword].length
  if (newPasswordRuneCount < 8 || newPasswordRuneCount > 16) {
    return '新密碼長度須為 8–16 個字元'
  }
  if (values.newPassword !== values.confirmNewPassword) {
    return '兩次輸入的新密碼不一致'
  }
  return ''
}
