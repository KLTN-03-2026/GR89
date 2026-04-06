'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import type {
  IUserLearningPathProgress,
  ILevelProgress
} from '@/types'
import type { StudySessionPayload } from '@/libs/apis/types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function getUserLearningProgress(
  userId: string,
  levelId?: string
): Promise<ApiResponse<IUserLearningPathProgress[]>> {
  const params = levelId ? `?levelId=${levelId}` : ''
  const response = await authorizedAxios.get<ApiResponse<IUserLearningPathProgress[]>>(
    `/user-learning-path/users/${userId}/progress${params}`
  )
  return response.data
}

export async function getLevelProgress(
  userId: string,
  levelId: string
): Promise<ApiResponse<ILevelProgress>> {
  const response = await authorizedAxios.get<ApiResponse<ILevelProgress>>(
    `/user-learning-path/users/${userId}/levels/${levelId}/progress`
  )
  return response.data
}

export async function startLesson(
  userId: string,
  lessonId: string
): Promise<ApiResponse<IUserLearningPathProgress>> {
  const response = await authorizedAxios.post<ApiResponse<IUserLearningPathProgress>>(
    `/user-learning-path/users/${userId}/lessons/${lessonId}/start`
  )
  return response.data
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  progressData: { progress?: number; score?: number; timeSpent?: number; notes?: string }
): Promise<ApiResponse<IUserLearningPathProgress>> {
  const response = await authorizedAxios.put<ApiResponse<IUserLearningPathProgress>>(
    `/user-learning-path/users/${userId}/lessons/${lessonId}/progress`,
    progressData
  )
  return response.data
}

export async function completeLesson(
  userId: string,
  lessonId: string,
  score?: number
): Promise<ApiResponse<IUserLearningPathProgress>> {
  const response = await authorizedAxios.post<ApiResponse<IUserLearningPathProgress>>(
    `/user-learning-path/users/${userId}/lessons/${lessonId}/complete`,
    { score }
  )
  return response.data
}
