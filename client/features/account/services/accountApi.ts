'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import { StreakStatus } from '../types'
import { User } from '@/types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export interface UserPayment {
  _id: string
  amount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  createdAt?: string
  paymentDate?: string
}

export async function getStreakStatus(): Promise<ApiResponse<StreakStatus>> {
  const response = await authorizedAxios.get<ApiResponse<StreakStatus>>('/user/streak/status')
  return response.data
}

export async function getMyProfile(): Promise<ApiResponse<User>> {
  const response = await authorizedAxios.get<ApiResponse<User>>('/user/me/user')
  return response.data
}

export async function updateMyProfile(
  data: User
): Promise<ApiResponse<User>> {
  const response = await authorizedAxios.put<ApiResponse<User>>('/user/me', data)
  return response.data
}

export async function updateMyAvatar(file: File): Promise<ApiResponse<User>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await authorizedAxios.put<ApiResponse<User>>('/user/me/avatar', formData)
  return response.data
}

export async function getMyPayments(): Promise<ApiResponse<UserPayment[]>> {
  const response = await authorizedAxios.get<ApiResponse<UserPayment[]>>('/payment/user')
  return response.data
}

export async function changeMyPassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
  const response = await authorizedAxios.put<ApiResponse<void>>('/user/me/password', data)
  return response.data
}