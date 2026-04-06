'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import { User } from '@/types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<User>> {
  const response = await authorizedAxios.post<ApiResponse<User>>('/auth/login', { ...credentials, role: 'user' })
  return response.data
}

export async function logout(): Promise<ApiResponse> {
  const response = await authorizedAxios.post<ApiResponse>('/auth/logout', { role: 'user' })
  return response.data
}

export async function register(credentials: RegisterRequest): Promise<ApiResponse<User>> {
  const response = await authorizedAxios.post<ApiResponse<User>>('/auth/register', credentials)
  return response.data
}

export async function requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
  const response = await authorizedAxios.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword(token: string, password: string, confirmPassword: string): Promise<ApiResponse<{ message: string }>> {
  const response = await authorizedAxios.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password, confirmPassword })
  return response.data
}

export async function loginGoogle(token: string) {
  const response = await authorizedAxios.post<ApiResponse<User>>('/auth/login/google', { token })
  return response.data
}
