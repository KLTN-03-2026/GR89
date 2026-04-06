'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import type { StudySessionPayload } from '@/libs/apis/types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function submitSpeakingPractice(
  speakingId: string,
  sentenceId: string,
  audioData: FormData
): Promise<ApiResponse<{ score: number; message: string }>> {
  const response = await authorizedAxios.post<ApiResponse<{ score: number; message: string }>>(
    `/speaking/user/${speakingId}/${sentenceId}/practice`,
    audioData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data
}

export async function assessSpeakingPronunciation(
  referenceText: string,
  audioFile: File
): Promise<ApiResponse<unknown>> {
  const formData = new FormData()
  formData.append('audio', audioFile)
  formData.append('text', referenceText)

  const response = await authorizedAxios.post<ApiResponse<unknown>>(
    '/speaking/assess-pronunciation',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data
}

export async function saveHighestSpeakingScore(
  userId: string,
  lessonId: string,
  score: number,
  studySession?: StudySessionPayload
): Promise<ApiResponse<{
  isNewRecord: boolean
  currentScore: number
  previousBest?: number
  progress: {
    _id: string
    userId: string
    speakingId: string
    point: number
    progress: number
    isCompleted: boolean
    createdAt?: Date
    updatedAt?: Date
  }
}>> {
  const response = await authorizedAxios.post(
    `/speaking-scoring/users/${userId}/save-highest-score`,
    {
      lessonId,
      score,
      studySession
    }
  )
  return response.data
}
