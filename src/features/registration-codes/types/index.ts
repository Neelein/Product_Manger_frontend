// ── Registration codes (admin) ──

export interface RegistrationCode {
  id: string
  code: string
  created_by: string
  created_by_email: string
  used_by: string
  used_by_email: string
  used_at: string | null
  created_at: string
  status: string
}

export interface CreateRegistrationCodeRequest {
  code?: string
}

export interface RegistrationCodeResponse {
  code: RegistrationCode
}

export interface RegistrationCodeListResponse {
  codes: RegistrationCode[]
}
