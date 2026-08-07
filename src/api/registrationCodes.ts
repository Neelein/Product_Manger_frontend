import { apiFetch } from './client'
import type {
  CreateRegistrationCodeRequest,
  RegistrationCodeListResponse,
  RegistrationCodeResponse,
} from '../types'

export function createRegistrationCode(data: CreateRegistrationCodeRequest): Promise<RegistrationCodeResponse> {
  return apiFetch<RegistrationCodeResponse>('/api/registration-codes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function listRegistrationCodes(): Promise<RegistrationCodeListResponse> {
  return apiFetch<RegistrationCodeListResponse>('/api/registration-codes')
}

export function deleteRegistrationCode(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/registration-codes/${id}`, {
    method: 'DELETE',
  })
}
