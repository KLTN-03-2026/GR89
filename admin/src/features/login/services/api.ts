import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { User } from '@/features/user/types'

interface Response<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
    hasNext?: boolean
    hasPrev?: boolean
    next?: number | null
    prev?: number | null
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export async function login(data: LoginRequest): Promise<Response<User>> {
  const response = await AuthorizedAxios.post('/auth/login-admin', data)
  return response.data as Response<User>
}

export async function logout(role: string = 'admin'): Promise<Response<User>> {
  const response = await AuthorizedAxios.post<Response<User>>('/auth/logout', { role })
  return response.data as Response<User>
}

export async function getMyProfile(): Promise<Response<User>> {
  const response = await AuthorizedAxios.get('/user/me/admin')
  return response.data as Response<User>
}

