'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import { StreakStatus, UserProfile } from '../types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function getStreakStatus(): Promise<ApiResponse<StreakStatus>> {
  const response = await authorizedAxios.get<ApiResponse<StreakStatus>>('/user/streak/status')
  return response.data
}

export async function getMyProfile(): Promise<ApiResponse<UserProfile>> {
  const response = await authorizedAxios.get<ApiResponse<UserProfile>>('/user/me/user')
  return response.data
}

export async function updateMyProfile(data: { fullName?: string }): Promise<ApiResponse<UserProfile>> {
  const response = await authorizedAxios.put<ApiResponse<UserProfile>>('/user/me', data)
  return response.data
}

export async function updateMyAvatar(avatarMediaId: string): Promise<ApiResponse<UserProfile>> {
  const response = await authorizedAxios.put<ApiResponse<UserProfile>>('/user/me/avatar', { avatar: avatarMediaId })
  return response.data
}

export async function changeMyPassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
  const response = await authorizedAxios.put<ApiResponse<void>>('/user/me/password', data)
  return response.data
}

export async function uploadImage(file: File): Promise<ApiResponse<{ _id: string; url: string }>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await authorizedAxios.post<ApiResponse<{ _id: string; url: string }>>('/media/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}
